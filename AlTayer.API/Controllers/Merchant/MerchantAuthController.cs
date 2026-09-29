using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AlTayer.API.Auth;
using AlTayer.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AlTayer.API.Controllers.Merchant;

/// <summary>
/// Issues a development JWT for Merchant Portal testing.
/// Replace with real auth (Identity / OAuth) before production.
/// </summary>
[ApiController]
[Route("api/merchant/auth")]
public class MerchantAuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public MerchantAuthController(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public record DevTokenRequest(Guid? MerchantId);

    public record DevTokenResponse(string AccessToken, Guid MerchantId, string MerchantName, DateTime ExpiresAt);

    /// <summary>
    /// POST /api/merchant/auth/dev-token
    /// Defaults to Engineering Cafeteria seed merchant when MerchantId is omitted.
    /// </summary>
    [HttpPost("dev-token")]
    [AllowAnonymous]
    public async Task<ActionResult<DevTokenResponse>> IssueDevToken([FromBody] DevTokenRequest? request, CancellationToken ct)
    {
        if (!_config.GetValue("Jwt:AllowDevToken", true))
            return NotFound();

        var merchantId = request?.MerchantId
            ?? Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        var merchant = await _db.Merchants.AsNoTracking()
            .FirstOrDefaultAsync(m => m.MerchantId == merchantId, ct);

        if (merchant is null)
            return NotFound(new { message = "Merchant not found. Seed the database first." });

        var key = _config["Jwt:Key"] ?? "AlTayer_Dev_Signing_Key_Change_Me_32chars!";
        var issuer = _config["Jwt:Issuer"] ?? "AlTayer.API";
        var audience = _config["Jwt:Audience"] ?? "AlTayer.Merchant";
        var expiresMinutes = _config.GetValue("Jwt:ExpiresMinutes", 480);

        var expires = DateTime.UtcNow.AddMinutes(expiresMinutes);
        var claims = new List<Claim>
        {
            new(MerchantClaimTypes.MerchantId, merchant.MerchantId.ToString()),
            new(ClaimTypes.NameIdentifier, merchant.MerchantId.ToString()),
            new(ClaimTypes.Name, merchant.Name),
            new(ClaimTypes.Role, MerchantClaimTypes.RoleMerchant),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new DevTokenResponse(jwt, merchant.MerchantId, merchant.Name, expires));
    }
}
