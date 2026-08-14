using Order.API.Models.Entities;

namespace Order.API.Repositories;

public interface IOrderRepository
{
    Task<CustomerOrder?> GetByIdAsync(Guid id);
    Task<List<CustomerOrder>> GetByUserIdAsync(string userId);
    Task AddAsync(CustomerOrder order);
    Task UpdateAsync(CustomerOrder order);
}