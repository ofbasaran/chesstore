using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Repositories;
using Order.API.Models.Entities;

namespace Order.API.Consumers;

public class CartClearedConsumer : IConsumer<CartCleared>
{
    private readonly IOrderRepository _orderRepository;

    public CartClearedConsumer(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<CartCleared> context)
    {
        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId);
        if (order == null) return;

        order.Status = OrderStatus.Confirmed;
        await _orderRepository.UpdateAsync(order);
    }
}