using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Payment.API.Data;

namespace Payment.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly PaymentDbContext _dbContext;

    public PaymentController(PaymentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("order/{orderId:guid}")]
    public async Task<IActionResult> GetByOrderId(Guid orderId)
    {
        var transaction = await _dbContext.PaymentTransactions
            .FirstOrDefaultAsync(p => p.OrderId == orderId);

        if (transaction is null) return NotFound();

        return Ok(transaction);
    }
}