using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlTayer.API.Models;

/// <summary>
/// Banner ad shown in the student mobile app.
/// <para>
/// <see cref="CampusId"/> is nullable:
/// <list type="bullet">
///   <item><c>null</c> → Global (all campuses)</item>
///   <item>has value → only students registered under that CampusId</item>
/// </list>
/// </para>
/// </summary>
public class Advertisement
{
    [Key]
    public Guid AdvertisementId { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Nullable CampusID. Null = Global targeting.
    /// </summary>
    public Guid? CampusId { get; set; }

    [ForeignKey(nameof(CampusId))]
    public Campus? Campus { get; set; }

    /// <summary>Banner image URL or stored path.</summary>
    [Required, MaxLength(1000)]
    public string BannerUrl { get; set; } = string.Empty;

    /// <summary>Optional deep link into merchant / menu item.</summary>
    [MaxLength(500)]
    public string? TargetUrl { get; set; }

    [Column(TypeName = "date")]
    public DateOnly StartDate { get; set; }

    [Column(TypeName = "date")]
    public DateOnly EndDate { get; set; }

    public long Impressions { get; set; }

    public long Clicks { get; set; }

    /// <summary>Admin pause override (separate from date-based expiry).</summary>
    public bool IsPaused { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [NotMapped]
    public double ClickThroughRate =>
        Impressions == 0 ? 0 : Math.Round((double)Clicks / Impressions * 100, 2);

    [NotMapped]
    public string DerivedStatus
    {
        get
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (EndDate < today) return "Expired";
            if (IsPaused) return "Paused";
            if (StartDate > today) return "Scheduled";
            return "Active";
        }
    }

    [NotMapped]
    public bool IsGlobal => CampusId == null;
}
