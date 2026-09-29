using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlTayer.API.Models;

/// <summary>
/// University campus (tenant) in the Al-Tayer multi-tenant platform.
/// </summary>
public class Campus
{
    [Key]
    public Guid CampusId { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Code { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Merchant> Merchants { get; set; } = new List<Merchant>();
    public ICollection<Advertisement> Advertisements { get; set; } = new List<Advertisement>();
}
