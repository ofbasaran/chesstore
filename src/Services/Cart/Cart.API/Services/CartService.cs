using System.Text.Json;
using Cart.API.Clients;
using Cart.API.Models;
using Microsoft.Extensions.Caching.Distributed;

namespace Cart.API.Services;

public class CartService : ICartService
{
    private readonly IDistributedCache _cache;
    private readonly ICatalogClient _catalogClient;
    private static readonly TimeSpan CartTtl = TimeSpan.FromDays(7);

    public CartService(IDistributedCache cache, ICatalogClient catalogClient)
    {
        _cache = cache;
        _catalogClient = catalogClient;
    }

    private static string GetCartKey(string userId) => $"cart:{userId}";

    public async Task<CartDto> GetCartAsync(string userId)
    {
        var cart = await LoadCartAsync(userId);
        return cart;
    }

    public async Task<CartDto> AddItemAsync(string userId, AddCartItemDto dto)
    {
        var product = await _catalogClient.GetProductByIdAsync(dto.ProductId);
        if (product == null || !product.IsActive)
            throw new InvalidOperationException("Product not found or unavailable.");

        if (dto.Quantity < 1)
            throw new InvalidOperationException("Quantity must be at least 1.");

        if (product.StockQuantity < dto.Quantity)
            throw new InvalidOperationException("Insufficient stock for the requested quantity.");

        var cart = await LoadCartAsync(userId);
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItemDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = dto.Quantity
            });
        }

        await SaveCartAsync(userId, cart);
        return cart;
    }

    public async Task<CartDto?> UpdateItemAsync(string userId, Guid productId, UpdateCartItemDto dto)
    {
        var cart = await LoadCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null) return null;

        if (dto.Quantity < 1)
            throw new InvalidOperationException("Quantity must be at least 1.");

        item.Quantity = dto.Quantity;
        await SaveCartAsync(userId, cart);
        return cart;
    }

    public async Task<CartDto> RemoveItemAsync(string userId, Guid productId)
    {
        var cart = await LoadCartAsync(userId);
        cart.Items.RemoveAll(i => i.ProductId == productId);
        await SaveCartAsync(userId, cart);
        return cart;
    }

    public async Task ClearCartAsync(string userId)
    {
        await _cache.RemoveAsync(GetCartKey(userId));
    }

    private async Task<CartDto> LoadCartAsync(string userId)
    {
        var data = await _cache.GetStringAsync(GetCartKey(userId));
        if (string.IsNullOrEmpty(data))
        {
            return new CartDto { UserId = userId };
        }

        return JsonSerializer.Deserialize<CartDto>(data) ?? new CartDto { UserId = userId };
    }

    private async Task SaveCartAsync(string userId, CartDto cart)
    {
        var data = JsonSerializer.Serialize(cart);
        await _cache.SetStringAsync(GetCartKey(userId), data,
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = CartTtl });
    }
}