namespace Order.API.Models.Entities;

public enum OrderStatus
{
    Pending,        // The order was placed, and the process began.
    StockReserved,  // Catalog.API stock reservation confirmed
    PaymentProcessing,
    PaymentCompleted,
    Confirmed,      // The order was completed successfully.
    Cancelled,      // The order was cancelled, and compensating actions were taken.
    Failed
}