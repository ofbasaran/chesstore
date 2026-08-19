// Repositories/NotificationRepository.cs
using Microsoft.EntityFrameworkCore;
using Notification.API.Infrastructure.Data;
using Notification.API.Models.Entities;

namespace Notification.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(NotificationLog log)
    {
        _context.NotificationLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<List<NotificationLog>> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.NotificationLogs
            .Where(n => n.OrderId == orderId)
            .ToListAsync();
    }
}