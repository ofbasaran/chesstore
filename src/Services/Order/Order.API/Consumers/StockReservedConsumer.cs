using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Repositories;
using Order.API.Models.Entities;

namespace Order.API.Consumers;

public class StockReservedConsumer : IConsumer<StockReserved>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public StockReservedConsumer(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<StockReserved> context)
    {
        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId);
        if (order == null) return;

        order.Status = OrderStatus.StockReserved;
        await _orderRepository.UpdateAsync(order);

        await _publishEndpoint.Publish(new PaymentRequested(order.Id, order.UserId, order.TotalAmount));
    }
}