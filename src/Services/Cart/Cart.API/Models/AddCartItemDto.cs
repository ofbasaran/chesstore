namespace Cart.API.Models;

public class AddCartItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}