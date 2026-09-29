using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlTayer.API.Models;

/// <summary>
/// Menu category owned by a merchant (e.g. Sandwiches, Cold Drinks).
/// </summary>
public class MenuCategory
{
    [Key]
    public Guid CategoryId { get; set; } = Guid.NewGuid();

    /// <summary>Owning merchant (cafeteria).</summary>
    public Guid MerchantId { get; set; }

    [ForeignKey(nameof(MerchantId))]
    public Merchant? Merchant { get; set; }

    [Required, MaxLength(120)]
    public string CategoryName { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MenuItem> Items { get; set; } = new List<MenuItem>();
}
