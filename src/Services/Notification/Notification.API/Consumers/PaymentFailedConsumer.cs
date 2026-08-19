using ECommerce.Shared.Events;
using MassTransit;
using Notification.API.Models.Entities;
using Notification.API.Repositories;
using Notification.API.Services;

namespace Notification.API.Consumers;

public class PaymentFailedConsumer : IConsumer<PaymentFailed>
{
    private readonly INotificationRepository _repository;
    private readonly INotificationSender _sender;
    private readonly ILogger<PaymentFailedConsumer> _logger;

    public PaymentFailedConsumer(
        INotificationRepository repository,
        INotificationSender sender,
        ILogger<PaymentFailedConsumer> logger)
    {
        _repository = repository;
        _sender = sender;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentFailed> context)
    {
        var message = context.Message;
        var content = $"Your payment has failed. Order ID: {message.OrderId}. Reason: {message.Reason}";

        var success = await _sender.SendAsync("Email", message.UserId, content);

        await _repository.AddAsync(new NotificationLog
        {
            OrderId = message.OrderId,
            UserId = message.UserId,
            Type = "PaymentFailed",
            Channel = "Email",
            Content = content,
            IsSuccess = success
        });

        _logger.LogWarning("PaymentFailed notification sent for Order {OrderId}", message.OrderId);
    }
}