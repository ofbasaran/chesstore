using Cart.API.Models;

namespace Cart.API.Clients;

public interface ICatalogClient
{
    Task<ProductInfoDto?> GetProductByIdAsync(Guid productId);
}