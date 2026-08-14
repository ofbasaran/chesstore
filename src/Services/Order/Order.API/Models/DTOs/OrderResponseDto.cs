using Order.API.Models.Entities;

namespace Order.API.Models.DTOs;

public class OrderResponseDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string? FailureReason { get; set; }
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}