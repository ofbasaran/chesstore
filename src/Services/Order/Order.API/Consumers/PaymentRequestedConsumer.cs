using ECommerce.Shared.Events;
using MassTransit;

namespace Order.API.Consumers;

public class PaymentRequestedConsumer : IConsumer<PaymentRequested>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public PaymentRequestedConsumer(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<PaymentRequested> context)
    {
        // Simulate payment processing logic here. In a real-world scenario, you would integrate with a payment gateway.
        await _publishEndpoint.Publish(new PaymentCompleted(context.Message.OrderId));
    }
}