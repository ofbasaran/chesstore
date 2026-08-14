using Order.API.Clients;
using Order.API.Infrastructure.Handlers;
using Order.API.Repositories;
using Order.API.Sagas;

namespace Order.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddOrderServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddTransient<AuthHeaderPropagationHandler>();

        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderSagaOrchestrator, OrderSagaOrchestrator>();

        services.AddHttpClient<ICatalogClient, CatalogClient>(client =>
            client.BaseAddress = new Uri(configuration["Services:CatalogApiUrl"]!))
            .AddHttpMessageHandler<AuthHeaderPropagationHandler>();

        services.AddScoped<IPaymentClient, PaymentClient>();

        services.AddHttpClient<ICartClient, CartClient>(client =>
            client.BaseAddress = new Uri(configuration["Services:CartApiUrl"]!))
            .AddHttpMessageHandler<AuthHeaderPropagationHandler>();

        return services;
    }
}