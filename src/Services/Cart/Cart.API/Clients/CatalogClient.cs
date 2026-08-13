using System.Net.Http.Json;
using Cart.API.Models;

namespace Cart.API.Clients;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _httpClient;

    public CatalogClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ProductInfoDto?> GetProductByIdAsync(Guid productId)
    {
        var response = await _httpClient.GetAsync($"/api/products/{productId}");
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<ProductInfoDto>();
    }
}