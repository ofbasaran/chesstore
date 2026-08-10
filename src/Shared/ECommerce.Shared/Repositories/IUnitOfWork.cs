namespace ECommerce.Shared.Repositories;

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync();
}