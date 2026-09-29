using System.ComponentModel.DataAnnotations;

namespace AlTayer.API.DTOs;

public record MenuItemDto(
    Guid ItemId,
    Guid CategoryId,
    string ItemName,
    string? Description,
    decimal Price,
    int Calories,
    string? ImageUrl,
    bool IsAvailable
);

public record MenuCategoryDto(
    Guid CategoryId,
    string CategoryName,
    int DisplayOrder,
    IReadOnlyList<MenuItemDto> Items
);

public record MerchantMenuResponseDto(
    Guid MerchantId,
    string MerchantName,
    IReadOnlyList<MenuCategoryDto> Categories
);

/// <summary>Multipart form fields for POST /api/merchant/menu/item</summary>
public class CreateMenuItemForm
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required, MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public decimal Price { get; set; }

    [Required]
    public int Calories { get; set; }

    public IFormFile? Image { get; set; }
}

public class ToggleAvailabilityResponse
{
    public Guid ItemId { get; set; }
    public bool IsAvailable { get; set; }
}
