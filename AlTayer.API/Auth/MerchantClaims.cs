using System.Security.Claims;

namespace AlTayer.API.Auth;

public static class MerchantClaimTypes
{
    public const string MerchantId = "merchant_id";
    public const string RoleMerchant = "Merchant";
}

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Reads MerchantID from JWT claims (merchant_id or NameIdentifier fallback).
    /// </summary>
    public static Guid? GetMerchantId(this ClaimsPrincipal user)
    {
        var raw =
            user.FindFirstValue(MerchantClaimTypes.MerchantId)
            ?? user.FindFirstValue("MerchantId")
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(raw, out var id) ? id : null;
    }
}
