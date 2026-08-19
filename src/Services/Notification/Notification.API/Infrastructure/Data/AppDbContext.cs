using Microsoft.EntityFrameworkCore;
using Notification.API.Models.Entities;

namespace Notification.API.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<NotificationLog>(entity =>
        {
            entity.Property(n => n.Type).IsRequired().HasMaxLength(50);
            entity.Property(n => n.Channel).IsRequired().HasMaxLength(20);
            entity.Property(n => n.Content).IsRequired();
        });
    }
}