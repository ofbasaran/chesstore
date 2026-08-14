using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Repositories;
using Order.API.Models.Entities;

namespace Order.API.Consumers;

public class StockReservationFailedConsumer : IConsumer<StockReservationFailed>
{
    private readonly IOrderRepository _orderRepository;

    public StockReservationFailedConsumer(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<StockReservationFailed> context)
    {
        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId);
        if (order == null) return;

        order.Status = OrderStatus.Cancelled;
        order.FailureReason = context.Message.Reason;
        await _orderRepository.UpdateAsync(order);
    }
}