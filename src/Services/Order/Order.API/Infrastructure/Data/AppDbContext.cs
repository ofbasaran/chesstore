using Microsoft.EntityFrameworkCore;
using Order.API.Models.Entities;

namespace Order.API.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<CustomerOrder> Orders => Set<CustomerOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomerOrder>(entity =>
        {
            entity.ToTable("Orders");
            entity.HasKey(o => o.Id);
            entity.Property(o => o.UserId).IsRequired().HasMaxLength(450);
            entity.Property(o => o.Status).HasConversion<string>().IsRequired();
            entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(o => o.ShippingAddress).HasMaxLength(500);
            entity.Property(o => o.CurrentSagaStep).HasMaxLength(100);
            entity.Property(o => o.FailureReason).HasMaxLength(500);

            entity.HasMany(o => o.Items)
                  .WithOne()
                  .HasForeignKey(i => i.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(o => o.UserId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("OrderItems");
            entity.HasKey(i => i.Id);
            entity.Property(i => i.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        });

        base.OnModelCreating(modelBuilder);
    }
}