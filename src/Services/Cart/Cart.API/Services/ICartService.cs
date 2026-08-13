using Cart.API.Models;

namespace Cart.API.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(string userId);
    Task<CartDto> AddItemAsync(string userId, AddCartItemDto dto);
    Task<CartDto?> UpdateItemAsync(string userId, Guid productId, UpdateCartItemDto dto);
    Task<CartDto> RemoveItemAsync(string userId, Guid productId);
    Task ClearCartAsync(string userId);
}