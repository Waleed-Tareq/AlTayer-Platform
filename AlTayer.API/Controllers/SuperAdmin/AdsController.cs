using AlTayer.API.Data;
using AlTayer.API.DTOs;
using AlTayer.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Controllers.SuperAdmin;

/// <summary>
/// Super Admin — Ads &amp; Promotions management.
/// Routes align with the frontend SPA: /api/superadmin/ads
/// </summary>
[ApiController]
[Route("api/superadmin/ads")]
public class AdsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>List all advertisements (active &amp; past).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdvertisementDto>>> GetAll(CancellationToken ct)
    {
        var ads = await _db.Advertisements
            .AsNoTracking()
            .Include(a => a.Campus)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return Ok(ads.Select(MapToDto));
    }

    /// <summary>
    /// Ads visible to a student on a given campus.
    /// Global ads (CampusId IS NULL) + campus-specific ads.
    /// </summary>
    [HttpGet("for-campus/{campusId:guid}")]
    public async Task<ActionResult<IEnumerable<AdvertisementDto>>> GetForCampus(Guid campusId, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var ads = await _db.Advertisements
            .AsNoTracking()
            .Include(a => a.Campus)
            .Where(a =>
                !a.IsPaused &&
                a.StartDate <= today &&
                a.EndDate >= today &&
                (a.CampusId == null || a.CampusId == campusId))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return Ok(ads.Select(MapToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdvertisementDto>> GetById(Guid id, CancellationToken ct)
    {
        var ad = await _db.Advertisements
            .AsNoTracking()
            .Include(a => a.Campus)
            .FirstOrDefaultAsync(a => a.AdvertisementId == id, ct);

        if (ad is null) return NotFound();
        return Ok(MapToDto(ad));
    }

    /// <summary>POST /api/superadmin/ads — publish a new advertisement.</summary>
    [HttpPost]
    public async Task<ActionResult<AdvertisementDto>> Create([FromBody] CreateAdvertisementRequest request, CancellationToken ct)
    {
        if (request.EndDate < request.StartDate)
            return BadRequest(new { message = "End date must be on or after start date." });

        if (request.CampusId.HasValue)
        {
            var campusExists = await _db.Campuses.AnyAsync(c => c.CampusId == request.CampusId.Value, ct);
            if (!campusExists)
                return BadRequest(new { message = "CampusId does not exist." });
        }

        var ad = new Advertisement
        {
            Title = request.Title.Trim(),
            CampusId = request.CampusId, // null => Global
            BannerUrl = request.BannerUrl,
            TargetUrl = string.IsNullOrWhiteSpace(request.TargetUrl) ? null : request.TargetUrl.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Impressions = 0,
            Clicks = 0,
            IsPaused = false
        };

        _db.Advertisements.Add(ad);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(ad).Reference(a => a.Campus).LoadAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = ad.AdvertisementId }, MapToDto(ad));
    }

    /// <summary>POST /api/superadmin/ads/{id}/pause — pause or resume.</summary>
    [HttpPost("{id:guid}/pause")]
    public async Task<ActionResult<AdvertisementDto>> Pause(Guid id, [FromBody] PauseAdvertisementRequest request, CancellationToken ct)
    {
        var ad = await _db.Advertisements.Include(a => a.Campus)
            .FirstOrDefaultAsync(a => a.AdvertisementId == id, ct);

        if (ad is null) return NotFound();

        ad.IsPaused = request.Paused;
        ad.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(MapToDto(ad));
    }

    /// <summary>DELETE /api/superadmin/ads/{id}</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var ad = await _db.Advertisements.FindAsync([id], ct);
        if (ad is null) return NotFound();

        _db.Advertisements.Remove(ad);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static AdvertisementDto MapToDto(Advertisement a) => new(
        a.AdvertisementId,
        a.Title,
        a.CampusId,
        a.Campus?.Name,
        a.IsGlobal,
        a.BannerUrl,
        a.TargetUrl,
        a.StartDate,
        a.EndDate,
        a.Impressions,
        a.Clicks,
        a.ClickThroughRate,
        a.IsPaused,
        a.DerivedStatus
    );
}
