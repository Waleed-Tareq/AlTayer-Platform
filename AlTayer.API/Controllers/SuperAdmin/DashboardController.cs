using AlTayer.API.Data;
using AlTayer.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Controllers.SuperAdmin;

/// <summary>
/// Super Admin — dashboard metrics, live orders snapshot, and finance settlements.
/// </summary>
[ApiController]
[Route("api/superadmin")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public DashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>GET /api/superadmin/dashboard — key metrics for the main dashboard.</summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetrics(CancellationToken ct)
    {
        var pendingPayouts = await _db.Merchants.SumAsync(m => m.PendingBalance, ct);
        var settledWeek = await _db.Merchants.SumAsync(m => m.SettledThisWeek, ct);

        // Demo / placeholder operational metrics until Orders & Students tables are wired
        var metrics = new DashboardMetricsDto(
            TotalGmv: 12500.50m,
            PlatformEarnings: 625.00m,
            ActiveStudentsToday: 450,
            ActiveOrdersCount: 18,
            PendingPayouts: pendingPayouts,
            CommissionMtd: 8240.50m,
            SettledThisWeek: settledWeek
        );

        return Ok(metrics);
    }

    /// <summary>GET /api/superadmin/dashboard/sales-weekly — chart series.</summary>
    [HttpGet("dashboard/sales-weekly")]
    public ActionResult<IEnumerable<DailySalesPointDto>> GetWeeklySales()
    {
        // Realistic cafeteria-scale volumes (JD) — matches frontend chart scale 0–1500
        var days = new[] { "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri" };
        var engSales = new decimal[] { 620, 710, 680, 850, 920, 780, 1100 };
        var artsSales = new decimal[] { 480, 540, 510, 640, 700, 590, 820 };
        var engOrders = new[] { 42, 48, 45, 55, 61, 52, 68 };
        var artsOrders = new[] { 31, 38, 35, 42, 47, 40, 51 };

        var series = days.Select((d, i) => new DailySalesPointDto(
            d, engSales[i], artsSales[i], engOrders[i], artsOrders[i]));

        return Ok(series);
    }

    /// <summary>GET /api/superadmin/dashboard/live-orders</summary>
    [HttpGet("dashboard/live-orders")]
    public ActionResult<IEnumerable<LiveOrderDto>> GetLiveOrders()
    {
        // Placeholder until Order entity is added
        var orders = new List<LiveOrderDto>
        {
            new("AT-4821", null, "Layla Hassan", "Cafeteria Engineering", "Preparing", "2 min ago"),
            new("AT-4820", null, "Omar Khalil", "Cafeteria Arts", "Accepted", "4 min ago"),
            new("AT-4819", null, "Nour Al-Din", "Cafeteria Engineering", "Ready", "6 min ago"),
            new("AT-4818", null, "Sara Mahmoud", "Cafeteria Arts", "Preparing", "9 min ago"),
            new("AT-4817", null, "Yousef Amari", "Cafeteria Engineering", "Picked Up", "14 min ago"),
        };
        return Ok(orders);
    }

    /// <summary>GET /api/superadmin/finance/settlements — pending / recent merchant payouts.</summary>
    [HttpGet("finance/settlements")]
    public async Task<ActionResult<IEnumerable<MerchantSettlementDto>>> GetSettlements(CancellationToken ct)
    {
        var rows = await _db.Merchants
            .AsNoTracking()
            .OrderByDescending(m => m.PendingBalance)
            .Select(m => new MerchantSettlementDto(
                m.MerchantId,
                m.Name,
                m.PendingBalance,
                m.PendingBalance <= 0,
                m.LastSettledAt
            ))
            .ToListAsync(ct);

        return Ok(rows);
    }

    /// <summary>
    /// POST /api/superadmin/finance/settle/{merchantId}
    /// Marks payout processed and resets PendingBalance to zero.
    /// </summary>
    [HttpPost("finance/settle/{merchantId:guid}")]
    public async Task<ActionResult<SettlePayoutResultDto>> SettlePayout(Guid merchantId, CancellationToken ct)
    {
        var merchant = await _db.Merchants.FirstOrDefaultAsync(m => m.MerchantId == merchantId, ct);
        if (merchant is null)
            return NotFound(new { message = "Merchant not found." });

        if (merchant.PendingBalance <= 0)
            return BadRequest(new { message = "No pending balance to settle." });

        var amount = merchant.PendingBalance;
        merchant.SettledThisWeek += amount;
        merchant.PendingBalance = 0;
        merchant.LastSettledAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Ok(new SettlePayoutResultDto(
            Ok: true,
            MerchantId: merchant.MerchantId,
            MerchantName: merchant.Name,
            PendingBalance: 0,
            SettledAt: merchant.LastSettledAt.Value
        ));
    }

    /// <summary>GET /api/superadmin/campuses</summary>
    [HttpGet("campuses")]
    public async Task<IActionResult> GetCampuses(CancellationToken ct)
    {
        var campuses = await _db.Campuses
            .AsNoTracking()
            .Select(c => new
            {
                c.CampusId,
                c.Name,
                c.Code,
                c.Status,
                MerchantCount = c.Merchants.Count
            })
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

        return Ok(campuses);
    }

    /// <summary>GET /api/superadmin/merchants</summary>
    [HttpGet("merchants")]
    public async Task<IActionResult> GetMerchants(CancellationToken ct)
    {
        var merchants = await _db.Merchants
            .AsNoTracking()
            .Include(m => m.Campus)
            .Select(m => new
            {
                m.MerchantId,
                m.Name,
                m.CampusId,
                CampusName = m.Campus!.Name,
                m.Status,
                m.PendingBalance
            })
            .OrderBy(m => m.Name)
            .ToListAsync(ct);

        return Ok(merchants);
    }
}
