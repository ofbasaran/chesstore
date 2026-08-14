using Order.API.Models.Entities;

namespace Order.API.Clients;

public interface ICatalogClient
{
    Task<bool> ReserveStockAsync(List<OrderItem> items);
    Task ReleaseStockAsync(List<OrderItem> items);
}