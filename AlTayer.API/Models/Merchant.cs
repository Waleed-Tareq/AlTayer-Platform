using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlTayer.API.Models;

/// <summary>
/// Cafeteria / merchant belonging to a campus.
/// </summary>
public class Merchant
{
    [Key]
    public Guid MerchantId { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>FK to Campus — required for multi-tenancy.</summary>
    public Guid CampusId { get; set; }

    [ForeignKey(nameof(CampusId))]
    public Campus? Campus { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Open";

    /// <summary>Outstanding payout balance in JD awaiting settlement.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PendingBalance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SettledThisWeek { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastSettledAt { get; set; }

    public ICollection<MenuCategory> MenuCategories { get; set; } = new List<MenuCategory>();
}
