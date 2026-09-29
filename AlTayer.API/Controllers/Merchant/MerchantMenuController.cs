using System.Security.Claims;
using AlTayer.API.Auth;
using AlTayer.API.Data;
using AlTayer.API.DTOs;
using AlTayer.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Controllers.Merchant;

/// <summary>
/// Merchant Portal — Menu Management endpoints.
/// Requires JWT with role <c>Merchant</c> and claim <c>merchant_id</c>.
/// </summary>
[ApiController]
[Route("api/merchant/menu")]
[Authorize(Roles = MerchantClaimTypes.RoleMerchant)]
public class MerchantMenuController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<MerchantMenuController> _logger;

    private static readonly HashSet<string> AllowedImageExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    public MerchantMenuController(
        ApplicationDbContext db,
        IWebHostEnvironment env,
        ILogger<MerchantMenuController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/merchant/menu — categories + items for the authenticated merchant.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<MerchantMenuResponseDto>> GetMenu(CancellationToken ct)
    {
        var merchantId = User.GetMerchantId();
        if (merchantId is null)
            return Unauthorized(new { message = "MerchantID claim is missing from the token." });

        var merchant = await _db.Merchants
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MerchantId == merchantId.Value, ct);

        if (merchant is null)
            return NotFound(new { message = "Merchant not found." });

        var categories = await _db.MenuCategories
            .AsNoTracking()
            .Where(c => c.MerchantId == merchantId.Value)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.CategoryName)
            .Select(c => new MenuCategoryDto(
                c.CategoryId,
                c.CategoryName,
                c.DisplayOrder,
                c.Items
                    .OrderBy(i => i.ItemName)
                    .Select(i => new MenuItemDto(
                        i.ItemId,
                        i.CategoryId,
                        i.ItemName,
                        i.Description,
                        i.Price,
                        i.Calories,
                        i.ImageUrl,
                        i.IsAvailable
                    ))
                    .ToList()
            ))
            .ToListAsync(ct);

        return Ok(new MerchantMenuResponseDto(merchant.MerchantId, merchant.Name, categories));
    }

    /// <summary>
    /// POST /api/merchant/menu/item — multipart form (item fields + optional image).
    /// Saves image under wwwroot/uploads/menu/.
    /// </summary>
    [HttpPost("item")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<MenuItemDto>> CreateItem([FromForm] CreateMenuItemForm form, CancellationToken ct)
    {
        var merchantId = User.GetMerchantId();
        if (merchantId is null)
            return Unauthorized(new { message = "MerchantID claim is missing from the token." });

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (form.Price < 0)
            return BadRequest(new { message = "Price cannot be negative." });

        if (form.Calories < 0)
            return BadRequest(new { message = "Calories cannot be negative." });

        var category = await _db.MenuCategories
            .FirstOrDefaultAsync(c => c.CategoryId == form.CategoryId && c.MerchantId == merchantId.Value, ct);

        if (category is null)
            return BadRequest(new { message = "Category not found for this merchant." });

        string? imageUrl = null;
        if (form.Image is { Length: > 0 })
        {
            imageUrl = await SaveMenuImageAsync(form.Image, ct);
            if (imageUrl is null)
                return BadRequest(new { message = "Invalid image. Allowed: jpg, jpeg, png, webp, gif." });
        }

        var item = new MenuItem
        {
            CategoryId = category.CategoryId,
            ItemName = form.ItemName.Trim(),
            Description = string.IsNullOrWhiteSpace(form.Description) ? null : form.Description.Trim(),
            Price = form.Price,
            Calories = form.Calories,
            ImageUrl = imageUrl,
            IsAvailable = true
        };

        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Menu item {ItemId} created for merchant {MerchantId}", item.ItemId, merchantId);

        var dto = new MenuItemDto(
            item.ItemId,
            item.CategoryId,
            item.ItemName,
            item.Description,
            item.Price,
            item.Calories,
            item.ImageUrl,
            item.IsAvailable
        );

        return CreatedAtAction(nameof(GetMenu), null, dto);
    }

    /// <summary>
    /// PUT /api/merchant/menu/item/{id}/toggle-availability
    /// Flips IsAvailable after verifying ownership via category → merchant.
    /// </summary>
    [HttpPut("item/{id:guid}/toggle-availability")]
    public async Task<ActionResult<ToggleAvailabilityResponse>> ToggleAvailability(Guid id, CancellationToken ct)
    {
        var merchantId = User.GetMerchantId();
        if (merchantId is null)
            return Unauthorized(new { message = "MerchantID claim is missing from the token." });

        var item = await _db.MenuItems
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.ItemId == id, ct);

        if (item is null)
            return NotFound(new { message = "Menu item not found." });

        if (item.Category is null || item.Category.MerchantId != merchantId.Value)
            return Forbid();

        item.IsAvailable = !item.IsAvailable;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(new ToggleAvailabilityResponse
        {
            ItemId = item.ItemId,
            IsAvailable = item.IsAvailable
        });
    }

    private async Task<string?> SaveMenuImageAsync(IFormFile file, CancellationToken ct)
    {
        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedImageExtensions.Contains(ext))
            return null;

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", "menu");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var physicalPath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(physicalPath);
        await file.CopyToAsync(stream, ct);

        return $"/uploads/menu/{fileName}";
    }
}
