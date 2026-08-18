namespace ECommerce.Shared.Events;

public record StockReleaseRequested(Guid OrderId, List<StockItem> Items);