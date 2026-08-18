using Catalog.API.Models.DTOs;
using Catalog.API.Services;
using ECommerce.Shared.Events;
using MassTransit;

namespace Catalog.API.Consumers;

public class StockReleaseRequestedConsumer : IConsumer<StockReleaseRequested>
{
    private readonly IProductService _productService;
    private readonly ILogger<StockReleaseRequestedConsumer> _logger;

    public StockReleaseRequestedConsumer(IProductService productService, ILogger<StockReleaseRequestedConsumer> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<StockReleaseRequested> context)
    {
        var msg = context.Message;
        var items = msg.Items.Select(i => new StockChangeItemDto
        {
            ProductId = i.ProductId,
            Quantity = i.Quantity
        }).ToList();

        await _productService.ReleaseStockAsync(items);

        _logger.LogInformation("Stock released for order {OrderId} due to payment failure.", msg.OrderId);
    }
}