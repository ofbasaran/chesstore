namespace Catalog.API.Models.DTOs;

public class StockChangeItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}