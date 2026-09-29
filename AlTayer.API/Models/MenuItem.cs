using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlTayer.API.Models;

/// <summary>
/// Dish / menu item belonging to a <see cref="MenuCategory"/>.
/// </summary>
public class MenuItem
{
    [Key]
    public Guid ItemId { get; set; } = Guid.NewGuid();

    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public MenuCategory? Category { get; set; }

    [Required, MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public int Calories { get; set; }

    [MaxLength(1000)]
    public string? ImageUrl { get; set; }

    /// <summary>In-stock / available for ordering.</summary>
    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
