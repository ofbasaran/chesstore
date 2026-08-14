namespace Order.API.Sagas;

public interface IOrderSagaOrchestrator
{
    Task ExecuteAsync(Guid orderId);
}