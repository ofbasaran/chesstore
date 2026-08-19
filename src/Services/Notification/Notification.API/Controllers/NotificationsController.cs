
using Microsoft.AspNetCore.Mvc;
using Notification.API.Repositories;

namespace Notification.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _repository;

    public NotificationsController(INotificationRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetByOrderId(Guid orderId)
    {
        var logs = await _repository.GetByOrderIdAsync(orderId);
        return Ok(logs);
    }
}