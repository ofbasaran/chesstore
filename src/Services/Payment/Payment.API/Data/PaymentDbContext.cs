using Microsoft.EntityFrameworkCore;
using Payment.API.Models.Entities;

namespace Payment.API.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.IdempotencyKey).IsUnique();
            entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        });
    }
}