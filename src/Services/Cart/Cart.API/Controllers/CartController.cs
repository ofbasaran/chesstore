using Cart.API.Models;
using Cart.API.Services;
using ECommerce.Shared.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Cart.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private string GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCartAsync(GetUserId());
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemDto dto)
    {
        try
        {
            var cart = await _cartService.AddItemAsync(GetUserId(), dto);
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.FailResponse(new List<string> { ex.Message }));
        }
    }

    [HttpPut("items/{productId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateCartItemDto dto)
    {
        try
        {
            var cart = await _cartService.UpdateItemAsync(GetUserId(), productId, dto);
            if (cart == null) return NotFound();
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.FailResponse(new List<string> { ex.Message }));
        }
    }

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId)
    {
        var cart = await _cartService.RemoveItemAsync(GetUserId(), productId);
        return Ok(cart);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync(GetUserId());
        return Ok(new { message = "Cart cleared successfully." });
    }
}