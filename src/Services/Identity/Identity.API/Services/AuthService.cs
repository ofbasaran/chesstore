using Identity.API.Models.DTOs;
using Identity.API.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Identity.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _config;

    public AuthService(UserManager<AppUser> userManager, ITokenService tokenService, IConfiguration config)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _config = config;
    }

    public async Task<(bool, string[], AuthResponseDto?)> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            // Email enumeration riskini azaltmak için generic hata mesajı
            return (false, new[] { "Registration failed." }, null);
        }

        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return (false, result.Errors.Select(e => e.Description).ToArray(), null);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<(bool, string[], AuthResponseDto?)> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Timing attack / email enumeration korumasu: kullanıcı yoksa da
        // password check'e benzer bir gecikme oluştur.
        if (user == null)
        {
            await _userManager.CheckPasswordAsync(new AppUser(), request.Password);
            return (false, new[] { "Invalid email or password." }, null);
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return (false, new[] { "Account locked. Try again later." }, null);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(user);
            return (false, new[] { "Invalid email or password." }, null);
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<(bool, string[], AuthResponseDto?)> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        ClaimsPrincipal principal;
        try
        {
            principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken)!;
        }
        catch
        {
            return (false, new[] { "Invalid access token." }, null);
        }

        var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null || user.RefreshToken != request.RefreshToken ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return (false, new[] { "Invalid or expired refresh token." }, null);
        }

        return await GenerateAuthResponseAsync(user);
    }

    private async Task<(bool, string[], AuthResponseDto?)> GenerateAuthResponseAsync(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = int.Parse(_config["JwtSettings:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        var accessExpiryMinutes = int.Parse(_config["JwtSettings:AccessTokenExpiryMinutes"] ?? "15");

        return (true, Array.Empty<string>(), new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email!,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(accessExpiryMinutes)
        });
    }
}