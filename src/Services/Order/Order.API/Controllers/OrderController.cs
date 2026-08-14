using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Order.API.Clients;
using Order.API.Models.DTOs;
using Order.API.Models.Entities;
using Order.API.Repositories;
using Order.API.Sagas;
using System.Security.Claims;

namespace Order.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartClient _cartClient;
    private readonly IOrderSagaOrchestrator _sagaOrchestrator;
    private readonly ILogger<OrderController> _logger;

    public OrderController(
        IOrderRepository orderRepository,
        ICartClient cartClient,
        IOrderSagaOrchestrator sagaOrchestrator,
        ILogger<OrderController> logger)
    {
        _orderRepository = orderRepository;
        _cartClient = cartClient;
        _sagaOrchestrator = sagaOrchestrator;
        _logger = logger;
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User id not found in token.");

     [HttpPost("checkout")]
public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
{
    var userId = GetUserId();

    var cart = await _cartClient.GetCartAsync(userId);
    if (cart is null || !cart.Items.Any())
        return BadRequest(new { message = "Cart is empty." });

    var order = new CustomerOrder
    {
        UserId = userId,
        ShippingAddress = request.ShippingAddress,
        TotalAmount = cart.Items.Sum(i => i.UnitPrice * i.Quantity),
        Items = cart.Items.Select(i => new OrderItem
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity
        }).ToList()
    };

    await _orderRepository.AddAsync(order);
    await _sagaOrchestrator.ExecuteAsync(order.Id);

    return Accepted(MapToDto(order));
}

    

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order is null) return NotFound();

        if (order.UserId != GetUserId()) return Forbid();

        return Ok(MapToDto(order));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        var orders = await _orderRepository.GetByUserIdAsync(userId);
        return Ok(orders.Select(MapToDto).ToList());
    }

    private static OrderResponseDto MapToDto(CustomerOrder order) => new()
{
    Id = order.Id,
    UserId = order.UserId,
    Status = order.Status,
    TotalAmount = order.TotalAmount,
    ShippingAddress = order.ShippingAddress,
    CreatedAt = order.CreatedAt,
    FailureReason = order.FailureReason,
    Items = order.Items.Select(i => new OrderItemDto
    {
        ProductId = i.ProductId,
        ProductName = i.ProductName,
        UnitPrice = i.UnitPrice,
        Quantity = i.Quantity,
        Subtotal = i.Subtotal
    }).ToList()
};
}