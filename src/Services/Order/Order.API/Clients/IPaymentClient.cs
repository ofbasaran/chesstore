namespace Order.API.Clients;

public interface IPaymentClient
{
    Task<bool> ProcessPaymentAsync(Guid orderId, decimal amount);
}