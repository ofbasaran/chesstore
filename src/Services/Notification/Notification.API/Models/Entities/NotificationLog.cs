namespace Notification.API.Models.Entities;

public class NotificationLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string UserId { get; set; } = default!;
    public string Type { get; set; } = default!;      // e.g. "OrderConfirmed", "PaymentFailed"
    public string Channel { get; set; } = default!;    // "Email" or "Sms"
    public string Content { get; set; } = default!;
    public bool IsSuccess { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}