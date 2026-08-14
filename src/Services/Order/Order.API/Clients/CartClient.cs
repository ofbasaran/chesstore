namespace Order.API.Clients;

public class CartClient : ICartClient
{
    private readonly HttpClient _httpClient;

    public CartClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<CartDto?> GetCartAsync(string userId) =>
        await _httpClient.GetFromJsonAsync<CartDto>($"/api/cart?userId={userId}");

    public async Task ClearCartAsync(string userId) =>
        await _httpClient.DeleteAsync($"/api/cart?userId={userId}");
}