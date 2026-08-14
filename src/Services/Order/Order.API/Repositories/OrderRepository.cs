using Microsoft.EntityFrameworkCore;
using Order.API.Infrastructure.Data;
using Order.API.Models.Entities;

namespace Order.API.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerOrder?> GetByIdAsync(Guid id) =>
        await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);

    public async Task<List<CustomerOrder>> GetByUserIdAsync(string userId) =>
        await _context.Orders.Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(CustomerOrder order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CustomerOrder order)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }
}