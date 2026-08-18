using Catalog.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.API.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);
   

    builder.Entity<Product>(entity =>
    {
        entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
        entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
        entity.HasOne(p => p.Category)
              .WithMany(c => c.Products)
              .HasForeignKey(p => p.CategoryId)
              .OnDelete(DeleteBehavior.Restrict);

        entity.ToTable(t => t.HasCheckConstraint(
            "CK_Product_StockQuantity_NonNegative",
            "\"StockQuantity\" >= 0"));
    });

    builder.Entity<Category>(entity =>
    {
        entity.Property(c => c.Name).IsRequired().HasMaxLength(150);
        entity.HasIndex(c => c.Name).IsUnique();
    });
}
}