using Catalog.API.Models.Entities;
using ECommerce.Shared.Repositories;

namespace Catalog.API.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId);
}