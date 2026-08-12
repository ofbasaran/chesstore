using Catalog.API.Infrastructure.Data;
using Catalog.API.Models.Entities;
using ECommerce.Shared.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Catalog.API.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId) =>
        await DbSet.Where(p => p.CategoryId == categoryId).ToListAsync();
}