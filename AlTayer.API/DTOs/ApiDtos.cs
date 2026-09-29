using System.ComponentModel.DataAnnotations;

namespace AlTayer.API.DTOs;

public record AdvertisementDto(
    Guid AdvertisementId,
    string Title,
    Guid? CampusId,
    string? CampusName,
    bool IsGlobal,
    string BannerUrl,
    string? TargetUrl,
    DateOnly StartDate,
    DateOnly EndDate,
    long Impressions,
    long Clicks,
    double Ctr,
    bool IsPaused,
    string Status
);

public class CreateAdvertisementRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Null = Global. Set to target a specific campus.</summary>
    public Guid? CampusId { get; set; }

    [Required, MaxLength(1000)]
    public string BannerUrl { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? TargetUrl { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }
}

public class PauseAdvertisementRequest
{
    public bool Paused { get; set; }
}

public record DashboardMetricsDto(
    decimal TotalGmv,
    decimal PlatformEarnings,
    int ActiveStudentsToday,
    int ActiveOrdersCount,
    decimal PendingPayouts,
    decimal CommissionMtd,
    decimal SettledThisWeek
);

public record DailySalesPointDto(
    string Day,
    decimal EngineeringSales,
    decimal ArtsSales,
    int EngineeringOrders,
    int ArtsOrders
);

public record LiveOrderDto(
    string OrderId,
    Guid? StudentId,
    string Student,
    string Merchant,
    string Status,
    string Time
);

public record SettlePayoutResultDto(
    bool Ok,
    Guid MerchantId,
    string MerchantName,
    decimal PendingBalance,
    DateTime SettledAt
);

public record MerchantSettlementDto(
    Guid MerchantId,
    string Merchant,
    decimal PendingBalance,
    bool Settled,
    DateTime? LastSettledAt
);
