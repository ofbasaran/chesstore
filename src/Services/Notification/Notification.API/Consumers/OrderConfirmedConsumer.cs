// Consumers/OrderConfirmedConsumer.cs
using ECommerce.Shared.Events;
using MassTransit;
using Notification.API.Models.Entities;
using Notification.API.Repositories;
using Notification.API.Services;

namespace Notification.API.Consumers;

public class OrderConfirmedConsumer : IConsumer<OrderConfirmed>
{
    private readonly INotificationRepository _repository;
    private readonly INotificationSender _sender;
    private readonly ILogger<OrderConfirmedConsumer> _logger;

    public OrderConfirmedConsumer(
        INotificationRepository repository,
        INotificationSender sender,
        ILogger<OrderConfirmedConsumer> logger)
    {
        _repository = repository;
        _sender = sender;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderConfirmed> context)
    {
        var message = context.Message;
        var content = $"Your order has been confirmed. Order ID: {message.OrderId}";

        var success = await _sender.SendAsync("Email", message.UserId, content);

        await _repository.AddAsync(new NotificationLog
        {
            OrderId = message.OrderId,
            UserId = message.UserId,
            Type = "OrderConfirmed",
            Channel = "Email",
            Content = content,
            IsSuccess = success
        });

        _logger.LogInformation("OrderConfirmed notification sent for Order {OrderId}", message.OrderId);
    }
}