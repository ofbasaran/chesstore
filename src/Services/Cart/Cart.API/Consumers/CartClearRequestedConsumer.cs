using Cart.API.Services;
using ECommerce.Shared.Events;
using MassTransit;

namespace Cart.API.Consumers;

public class CartClearRequestedConsumer : IConsumer<CartClearRequested>
{
    private readonly ICartService _cartService;
    private readonly IPublishEndpoint _publishEndpoint;

    public CartClearRequestedConsumer(ICartService cartService, IPublishEndpoint publishEndpoint)
    {
        _cartService = cartService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<CartClearRequested> context)
    {
        var msg = context.Message;
        await _cartService.ClearCartAsync(msg.UserId);
        await _publishEndpoint.Publish(new CartCleared(msg.OrderId));
    }
}