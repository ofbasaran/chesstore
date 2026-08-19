// Repositories/INotificationRepository.cs
using Notification.API.Models.Entities;

namespace Notification.API.Repositories;

public interface INotificationRepository
{
    Task AddAsync(NotificationLog log);
    Task<List<NotificationLog>> GetByOrderIdAsync(Guid orderId);
}