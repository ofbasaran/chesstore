using Order.API.Models.Entities;

namespace Order.API.Clients;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CatalogClient> _logger;

    public CatalogClient(HttpClient httpClient, ILogger<CatalogClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> ReserveStockAsync(List<OrderItem> items)
    {
        var payload = items.Select(i => new { productId = i.ProductId, quantity = i.Quantity });
        var response = await _httpClient.PostAsJsonAsync("/api/products/reserve-stock", payload);
        return response.IsSuccessStatusCode;
    }

    public async Task ReleaseStockAsync(List<OrderItem> items)
    {
        var payload = items.Select(i => new { productId = i.ProductId, quantity = i.Quantity });
        await _httpClient.PostAsJsonAsync("/api/products/release-stock", payload);
    }
}