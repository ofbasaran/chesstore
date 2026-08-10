using Identity.API.Models.DTOs;

namespace Identity.API.Services;

public interface IAuthService
{
    Task<(bool Succeeded, string[] Errors, AuthResponseDto? Response)> RegisterAsync(RegisterRequestDto request);
    Task<(bool Succeeded, string[] Errors, AuthResponseDto? Response)> LoginAsync(LoginRequestDto request);
    Task<(bool Succeeded, string[] Errors, AuthResponseDto? Response)> RefreshTokenAsync(RefreshTokenRequestDto request);
}