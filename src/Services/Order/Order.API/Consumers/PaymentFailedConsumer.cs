using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Repositories;
using Order.API.Models.Entities;

namespace Order.API.Consumers;

public class PaymentFailedConsumer : IConsumer<PaymentFailed>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public PaymentFailedConsumer(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<PaymentFailed> context)
    {
        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId);
        if (order is null) return;

        order.Status = OrderStatus.Failed;
        order.FailureReason = context.Message.Reason;
        await _orderRepository.UpdateAsync(order);

        var items = order.Items
            .Select(i => new StockItem(i.ProductId, i.Quantity))
            .ToList();

        await _publishEndpoint.Publish(new StockReleaseRequested(order.Id, items));
    }
}