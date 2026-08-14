using Catalog.API.Models.DTOs;
using Catalog.API.Services;
using ECommerce.Shared.Events;
using MassTransit;

namespace Catalog.API.Consumers;

public class StockReservationRequestedConsumer : IConsumer<StockReservationRequested>
{
    private readonly IProductService _productService;
    private readonly IPublishEndpoint _publishEndpoint;

    public StockReservationRequestedConsumer(IProductService productService, IPublishEndpoint publishEndpoint)
    {
        _productService = productService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<StockReservationRequested> context)
    {
        var msg = context.Message;
        var items = msg.Items.Select(i => new StockChangeItemDto
        {
            ProductId = i.ProductId,
            Quantity = i.Quantity
        }).ToList();

        var success = await _productService.ReserveStockAsync(items);

        if (success)
            await _publishEndpoint.Publish(new StockReserved(msg.OrderId));
        else
            await _publishEndpoint.Publish(new StockReservationFailed(msg.OrderId, "Insufficient stock"));
    }
}