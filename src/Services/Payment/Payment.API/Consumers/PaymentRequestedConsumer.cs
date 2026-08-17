using ECommerce.Shared.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Payment.API.Data;
using Payment.API.Models.Entities;
using Payment.API.Services;

namespace Payment.API.Consumers;

public class PaymentRequestedConsumer : IConsumer<PaymentRequested>
{
    private readonly PaymentDbContext _dbContext;
    private readonly IMockPaymentGateway _gateway;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<PaymentRequestedConsumer> _logger;

    public PaymentRequestedConsumer(
        PaymentDbContext dbContext,
        IMockPaymentGateway gateway,
        IPublishEndpoint publishEndpoint,
        ILogger<PaymentRequestedConsumer> logger)
    {
        _dbContext = dbContext;
        _gateway = gateway;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentRequested> context)
    {
        var message = context.Message;
        var idempotencyKey = message.OrderId.ToString();

        var existing = await _dbContext.PaymentTransactions
            .FirstOrDefaultAsync(p => p.IdempotencyKey == idempotencyKey);

        if (existing is not null)
        {
            _logger.LogWarning("Payment already processed for OrderId {OrderId}, republishing result.", message.OrderId);

            if (existing.Status == PaymentStatus.Succeeded)
            {
                await _publishEndpoint.Publish(new PaymentCompleted(message.OrderId));
            }
            else
            {
                await _publishEndpoint.Publish(new PaymentFailed(
                    message.OrderId,
                    existing.FailureReason ?? "Payment previously failed"));
            }
            return;
        }

        var transaction = new PaymentTransaction
        {
            OrderId = message.OrderId,
            UserId = message.UserId,
            Amount = message.Amount,
            IdempotencyKey = idempotencyKey,
            Status = PaymentStatus.Pending
        };

        _dbContext.PaymentTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        var (success, failureReason) = await _gateway.ChargeAsync(message.Amount);

        transaction.Status = success ? PaymentStatus.Succeeded : PaymentStatus.Failed;
        transaction.FailureReason = failureReason;
        transaction.ProcessedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        if (success)
        {
            _logger.LogInformation("Payment succeeded for OrderId {OrderId}", message.OrderId);
            await _publishEndpoint.Publish(new PaymentCompleted(message.OrderId));
        }
        else
        {
            _logger.LogWarning("Payment failed for OrderId {OrderId}: {Reason}", message.OrderId, failureReason);
            await _publishEndpoint.Publish(new PaymentFailed(message.OrderId, failureReason ?? "Unknown error"));
        }
    }
}