using System.Text.Json;
using Catalog.API.Infrastructure.Data;
using Catalog.API.Models.DTOs;
using Catalog.API.Models.Entities;
using Catalog.API.Repositories;
using ECommerce.Shared.Repositories;
using ECommerce.Shared.Wrappers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Catalog.API.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;
    private readonly IDistributedCache _cache;

    private const string ProductListCacheKeyPrefix = "products:list:";
    private const int CacheExpiryMinutes = 5;

    public ProductService(
        IProductRepository productRepository,
        IUnitOfWork unitOfWork,
        AppDbContext context,
        IDistributedCache cache)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _context = context;
        _cache = cache;
    }

    public async Task<PagedResult<ProductDto>> GetAllAsync(ProductQueryParameters q)
    {
        // Only cache the default, unfiltered query (most frequently accessed)
        var isDefaultQuery = q.CategoryId == null && string.IsNullOrWhiteSpace(q.Search)
            && q.MinPrice == null && q.MaxPrice == null;

        var cacheKey = $"{ProductListCacheKeyPrefix}{q.PageNumber}:{q.PageSize}:{q.SortBy}:{q.SortDirection}";

        if (isDefaultQuery)
        {
            var cached = await _cache.GetStringAsync(cacheKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<PagedResult<ProductDto>>(cached)!;
            }
        }

        var query = _context.Products.Include(p => p.Category).Where(p => p.IsActive).AsQueryable();

        if (q.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == q.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(p => p.Name.Contains(q.Search) || (p.Description != null && p.Description.Contains(q.Search)));

        if (q.MinPrice.HasValue)
            query = query.Where(p => p.Price >= q.MinPrice.Value);

        if (q.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= q.MaxPrice.Value);

        query = (q.SortBy?.ToLower(), q.SortDirection?.ToLower()) switch
        {
            ("price", "desc") => query.OrderByDescending(p => p.Price),
            ("price", _) => query.OrderBy(p => p.Price),
            ("name", "desc") => query.OrderByDescending(p => p.Name),
            _ => query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((q.PageNumber - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        var result = new PagedResult<ProductDto>
        {
            Items = items.Select(MapToDto),
            PageNumber = q.PageNumber,
            PageSize = q.PageSize,
            TotalCount = totalCount
        };

        if (isDefaultQuery)
        {
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpiryMinutes)
                });
        }

        return result;
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        return product == null ? null : MapToDto(product);
    }

    public async Task<IEnumerable<ProductDto>> GetByCategoryIdAsync(Guid categoryId)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId && p.IsActive)
            .ToListAsync();

        return products.Select(MapToDto);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };

        await _productRepository.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();
        await InvalidateProductListCacheAsync();

        var created = await _context.Products.Include(p => p.Category).FirstAsync(p => p.Id == product.Id);
        return MapToDto(created);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null) return false;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.ImageUrl = dto.ImageUrl;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        _productRepository.Update(product);
        await _unitOfWork.SaveChangesAsync();
        await InvalidateProductListCacheAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null) return false;

        // Soft delete
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        _productRepository.Update(product);

        await _unitOfWork.SaveChangesAsync();
        await InvalidateProductListCacheAsync();
        return true;
    }

    private async Task InvalidateProductListCacheAsync()
    {
        // Simple approach: remove a small set of commonly used cache keys.
        // For a more robust solution, cache keys could be tracked in a Redis set.
        for (int page = 1; page <= 5; page++)
        {
            foreach (var sortBy in new[] { "name", "price" })
            {
                foreach (var dir in new[] { "asc", "desc" })
                {
                    await _cache.RemoveAsync($"{ProductListCacheKeyPrefix}{page}:10:{sortBy}:{dir}");
                }
            }
        }
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsActive = p.IsActive,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name
    };

    public async Task<bool> ReserveStockAsync(List<StockChangeItemDto> items)
{
    foreach (var item in items)
    {
        var affectedRows = await _context.Products
            .Where(p => p.Id == item.ProductId
                        && p.IsActive
                        && p.StockQuantity >= item.Quantity)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.StockQuantity, p => p.StockQuantity - item.Quantity)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));

        if (affectedRows == 0)
        {
            await RollbackPartialReservationAsync(items, item);
            return false;
        }
    }

    await InvalidateProductListCacheAsync();
    return true;
}

private async Task RollbackPartialReservationAsync(List<StockChangeItemDto> allItems, StockChangeItemDto failedItem)
{
    var itemsToRollback = allItems.TakeWhile(i => i.ProductId != failedItem.ProductId).ToList();

    foreach (var item in itemsToRollback)
    {
        await _context.Products
            .Where(p => p.Id == item.ProductId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.StockQuantity, p => p.StockQuantity + item.Quantity)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));
    }
}

public async Task ReleaseStockAsync(List<StockChangeItemDto> items)
{
    foreach (var item in items)
    {
        await _context.Products
            .Where(p => p.Id == item.ProductId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.StockQuantity, p => p.StockQuantity + item.Quantity)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));
    }

    await InvalidateProductListCacheAsync();
}
    
}