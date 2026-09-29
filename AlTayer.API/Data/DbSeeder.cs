using AlTayer.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Data;

public static class DbSeeder
{
    public static readonly Guid EngineeringMerchantId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid ArtsMerchantId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid MedicalMerchantId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

    public static async Task SeedAsync(ApplicationDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        await MenuSchemaBootstrap.EnsureMenuTablesAsync(db);

        if (!await db.Campuses.AnyAsync())
        {
            await SeedCampusesMerchantsAdsAsync(db);
        }

        if (!await db.MenuCategories.AnyAsync())
        {
            await SeedMenuAsync(db);
        }
    }

    private static async Task SeedCampusesMerchantsAdsAsync(ApplicationDbContext db)
    {
        var uj = new Campus
        {
            CampusId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "University of Jordan",
            Code = "UJ",
            Status = "Active"
        };
        var just = new Campus
        {
            CampusId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "JUST",
            Code = "JUST",
            Status = "Active"
        };
        var yarmouk = new Campus
        {
            CampusId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Yarmouk",
            Code = "YU",
            Status = "Active"
        };
        var hashemite = new Campus
        {
            CampusId = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "Hashemite",
            Code = "HU",
            Status = "Pilot"
        };

        db.Campuses.AddRange(uj, just, yarmouk, hashemite);

        db.Merchants.AddRange(
            new Merchant
            {
                MerchantId = EngineeringMerchantId,
                Name = "Cafeteria Engineering",
                CampusId = uj.CampusId,
                Status = "Open",
                PendingBalance = 680.00m
            },
            new Merchant
            {
                MerchantId = ArtsMerchantId,
                Name = "Cafeteria Arts",
                CampusId = uj.CampusId,
                Status = "Open",
                PendingBalance = 420.00m
            },
            new Merchant
            {
                MerchantId = MedicalMerchantId,
                Name = "Medical Café",
                CampusId = just.CampusId,
                Status = "Open",
                PendingBalance = 310.50m
            }
        );

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        db.Advertisements.AddRange(
            new Advertisement
            {
                Title = "McDonald's Campus Offer",
                CampusId = null,
                BannerUrl = "/uploads/ads/mcdonalds-global.png",
                TargetUrl = "altayer://merchant/mcdonalds",
                StartDate = today.AddDays(-10),
                EndDate = today.AddDays(20),
                Impressions = 12480,
                Clicks = 892,
                IsPaused = false
            },
            new Advertisement
            {
                Title = "Engineering Café Lunch Deal",
                CampusId = uj.CampusId,
                BannerUrl = "/uploads/ads/eng-cafe.png",
                TargetUrl = "altayer://merchant/cafeteria-engineering",
                StartDate = today.AddDays(-5),
                EndDate = today.AddDays(30),
                Impressions = 4320,
                Clicks = 318,
                IsPaused = false
            },
            new Advertisement
            {
                Title = "JUST Welcome Week",
                CampusId = just.CampusId,
                BannerUrl = "/uploads/ads/just-welcome.png",
                StartDate = today.AddDays(-40),
                EndDate = today.AddDays(-20),
                Impressions = 9800,
                Clicks = 410,
                IsPaused = false
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task SeedMenuAsync(ApplicationDbContext db)
    {
        // Prefer fixed Engineering merchant; fall back to first merchant if seed IDs differ (old DB).
        var merchantId = await db.Merchants
            .Where(m => m.MerchantId == EngineeringMerchantId)
            .Select(m => (Guid?)m.MerchantId)
            .FirstOrDefaultAsync()
            ?? await db.Merchants.Select(m => (Guid?)m.MerchantId).FirstOrDefaultAsync();

        if (merchantId is null)
            return;

        var sandwiches = new MenuCategory
        {
            MerchantId = merchantId.Value,
            CategoryName = "Sandwiches",
            DisplayOrder = 1
        };
        var coldDrinks = new MenuCategory
        {
            MerchantId = merchantId.Value,
            CategoryName = "Cold Drinks",
            DisplayOrder = 2
        };
        var hotMeals = new MenuCategory
        {
            MerchantId = merchantId.Value,
            CategoryName = "Hot Meals",
            DisplayOrder = 3
        };
        var pastries = new MenuCategory
        {
            MerchantId = merchantId.Value,
            CategoryName = "Pastries",
            DisplayOrder = 4
        };

        db.MenuCategories.AddRange(sandwiches, coldDrinks, hotMeals, pastries);
        await db.SaveChangesAsync();

        db.MenuItems.AddRange(
            new MenuItem
            {
                CategoryId = sandwiches.CategoryId,
                ItemName = "Zinger Wrap",
                Description = "Crispy chicken with lettuce and special sauce",
                Price = 2.25m,
                Calories = 450,
                ImageUrl = null,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = sandwiches.CategoryId,
                ItemName = "Falafel Sandwich",
                Description = "Fresh falafel, tahini, pickles & tomato in pita",
                Price = 1.50m,
                Calories = 380,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = coldDrinks.CategoryId,
                ItemName = "Iced Latte",
                Description = "Espresso over ice with chilled milk",
                Price = 1.75m,
                Calories = 120,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = coldDrinks.CategoryId,
                ItemName = "Fresh Orange Juice",
                Description = "Freshly squeezed orange juice, no sugar added",
                Price = 1.25m,
                Calories = 110,
                IsAvailable = false
            },
            new MenuItem
            {
                CategoryId = hotMeals.CategoryId,
                ItemName = "Chicken Meal Box",
                Description = "Grilled chicken, rice, salad & hummus",
                Price = 3.50m,
                Calories = 620,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = hotMeals.CategoryId,
                ItemName = "Mansaf Plate",
                Description = "Traditional lamb mansaf with jameed & rice",
                Price = 4.75m,
                Calories = 780,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = pastries.CategoryId,
                ItemName = "Cheese Croissant",
                Description = "Buttery croissant filled with melted cheese",
                Price = 1.10m,
                Calories = 290,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = pastries.CategoryId,
                ItemName = "Chocolate Muffin",
                Description = "Rich cocoa muffin with chocolate chips",
                Price = 1.00m,
                Calories = 340,
                IsAvailable = true
            }
        );

        await db.SaveChangesAsync();
    }
}
