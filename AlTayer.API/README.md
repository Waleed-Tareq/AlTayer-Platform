# AlTayer.API

ASP.NET Core 8 Web API for the Al-Tayer Super Admin + Merchant portals.

## Run

```bash
cd AlTayer.API
dotnet restore
dotnet run
```

Swagger UI: `http://localhost:5280/swagger`

> If you already had `AlTayerDb` without menu tables, delete the LocalDB database once so `EnsureCreated` can rebuild schema, or add an EF migration.

## Merchant Menu API

| Method | Route | Auth |
|--------|--------|------|
| GET | `/api/merchant/menu` | Merchant JWT |
| POST | `/api/merchant/menu/item` | Merchant JWT (multipart) |
| PUT | `/api/merchant/menu/item/{id}/toggle-availability` | Merchant JWT |
| POST | `/api/merchant/auth/dev-token` | Anonymous (dev only) |

### Get a test token

```http
POST /api/merchant/auth/dev-token
Content-Type: application/json

{}
```

Use `Authorization: Bearer <accessToken>` on menu endpoints. Claim `merchant_id` = Engineering Cafeteria (`aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`).

### Create item (multipart)

Fields: `CategoryId`, `ItemName`, `Description`, `Price`, `Calories`, `Image` (file).  
Images saved to `wwwroot/uploads/menu/`.

## Schema notes

| Entity | Notes |
|--------|--------|
| `Advertisement.CampusId` | `null` = Global |
| `MenuCategory.MerchantId` | Tenant ownership |
| `MenuItem.IsAvailable` | Stock toggle |
