namespace Notification.API.Services;

public class MockNotificationSender : INotificationSender
{
    private readonly ILogger<MockNotificationSender> _logger;
    private static readonly Random _random = new();

    public MockNotificationSender(ILogger<MockNotificationSender> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendAsync(string channel, string recipient, string content)
    {
        // Simulate realistic network/delivery delay
        await Task.Delay(_random.Next(200, 800));

        _logger.LogInformation("[MOCK {Channel}] To: {Recipient} | Message: {Content}", channel, recipient, content);

        return true; // Mock always succeeds; may extend with failure simulation if needed
    }
}