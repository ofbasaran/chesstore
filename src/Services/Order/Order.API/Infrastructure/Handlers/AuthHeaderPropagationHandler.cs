using System.Net.Http.Headers;

namespace Order.API.Infrastructure.Handlers;

public class AuthHeaderPropagationHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthHeaderPropagationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var authHeader = _httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();

        if (!string.IsNullOrEmpty(authHeader) && AuthenticationHeaderValue.TryParse(authHeader, out var parsedHeader))
        {
            request.Headers.Authorization = parsedHeader;
        }

        return base.SendAsync(request, cancellationToken);
    }
}