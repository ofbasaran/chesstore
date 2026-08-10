using Identity.API.Models.DTOs;
using Identity.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var (succeeded, errors, response) = await _authService.RegisterAsync(request);
        if (!succeeded)
            return BadRequest(new { errors });

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var (succeeded, errors, response) = await _authService.LoginAsync(request);
        if (!succeeded)
            return Unauthorized(new { errors });

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var (succeeded, errors, response) = await _authService.RefreshTokenAsync(request);
        if (!succeeded)
            return Unauthorized(new { errors });

        return Ok(response);
    }
}