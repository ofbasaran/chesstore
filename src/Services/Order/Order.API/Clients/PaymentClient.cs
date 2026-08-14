namespace Order.API.Clients;

public class PaymentClient : IPaymentClient
{
    private readonly ILogger<PaymentClient> _logger;

    public PaymentClient(ILogger<PaymentClient> logger)
    {
        _logger = logger;
    }

    public Task<bool> ProcessPaymentAsync(Guid orderId, decimal amount)
    {
        // TODO: Payment.API hasn't been implemented yet. This is a stub for demonstration purposes.
        _logger.LogWarning("PaymentClient is a stub. Order {OrderId} for {Amount} auto-approved.", orderId, amount);
        return Task.FromResult(true);
    }
}