namespace Notification.API.Services;

public interface INotificationSender
{
    Task<bool> SendAsync(string channel, string recipient, string content);
}