namespace Order.API.Clients;

public interface ICartClient
{
    Task<CartDto?> GetCartAsync(string userId);
    Task ClearCartAsync(string userId);
}

public class CartDto
{
    public string UserId { get; set; } = string.Empty;
    public List<CartItemDto> Items { get; set; } = new();
}

public class CartItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}