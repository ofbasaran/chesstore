namespace Payment.API.Services;

public class MockPaymentGateway : IMockPaymentGateway
{
    public async Task<(bool Success, string? FailureReason)> ChargeAsync(decimal amount)
    {
        await Task.Delay(300);

        if (amount <= 0)
            return (false, "Invalid amount");

        var random = Random.Shared.NextDouble();
        return random < 0.9
            ? (true, null)
            : (false, "Gateway declined the transaction");
    }
}