namespace ECommerce.Shared.Events;

public record StockReservationRequested(Guid OrderId, string UserId, List<StockItem> Items);
public record StockReserved(Guid OrderId);
public record StockReservationFailed(Guid OrderId, string Reason);

public record PaymentRequested(Guid OrderId, string UserId, decimal Amount);
public record PaymentCompleted(Guid OrderId);
public record PaymentFailed(Guid OrderId, string UserId, string Reason);

public record CartClearRequested(Guid OrderId, string UserId);
public record CartCleared(Guid OrderId);

public record StockItem(Guid ProductId, int Quantity);
public record OrderConfirmed(Guid OrderId, string UserId);