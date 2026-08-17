namespace Payment.API.Services;

public interface IMockPaymentGateway
{
    Task<(bool Success, string? FailureReason)> ChargeAsync(decimal amount);
}