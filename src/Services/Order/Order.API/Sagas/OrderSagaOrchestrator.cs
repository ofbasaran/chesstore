using ECommerce.Shared.Events;
using MassTransit;
using Order.API.Models.Entities;
using Order.API.Repositories;

namespace Order.API.Sagas;

public class OrderSagaOrchestrator : IOrderSagaOrchestrator
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderSagaOrchestrator(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task ExecuteAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order is null) return;

        order.Status = OrderStatus.Pending;
        order.CurrentSagaStep = nameof(StockReservationRequested);
        await _orderRepository.UpdateAsync(order);

        var items = order.Items
            .Select(i => new StockItem(i.ProductId, i.Quantity))
            .ToList();

        await _publishEndpoint.Publish(new StockReservationRequested(order.Id, order.UserId, items));
    }
}