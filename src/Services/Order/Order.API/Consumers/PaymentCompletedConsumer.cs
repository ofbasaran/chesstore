using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Repositories;
using Order.API.Models.Entities;

namespace Order.API.Consumers;

public class PaymentCompletedConsumer : IConsumer<PaymentCompleted>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public PaymentCompletedConsumer(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<PaymentCompleted> context)
    {
        var order = await _orderRepository.GetByIdAsync(context.Message.OrderId);
        if (order == null) return;

        order.Status = OrderStatus.PaymentCompleted;
        await _orderRepository.UpdateAsync(order);

        await _publishEndpoint.Publish(new CartClearRequested(order.Id, order.UserId));
    }
}