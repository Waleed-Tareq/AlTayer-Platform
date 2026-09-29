using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Data;

/// <summary>
/// Creates Menu tables on existing LocalDB databases where EnsureCreated already ran
/// without the merchant menu schema.
/// </summary>
public static class MenuSchemaBootstrap
{
    public static async Task EnsureMenuTablesAsync(ApplicationDbContext db, CancellationToken ct = default)
    {
        const string sql = """
            IF OBJECT_ID(N'[dbo].[MenuCategories]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[MenuCategories] (
                    [CategoryId] uniqueidentifier NOT NULL,
                    [MerchantId] uniqueidentifier NOT NULL,
                    [CategoryName] nvarchar(120) NOT NULL,
                    [DisplayOrder] int NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_MenuCategories] PRIMARY KEY ([CategoryId]),
                    CONSTRAINT [FK_MenuCategories_Merchants_MerchantId]
                        FOREIGN KEY ([MerchantId]) REFERENCES [dbo].[Merchants] ([MerchantId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_MenuCategories_MerchantId_DisplayOrder]
                    ON [dbo].[MenuCategories] ([MerchantId], [DisplayOrder]);
            END

            IF OBJECT_ID(N'[dbo].[MenuItems]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[MenuItems] (
                    [ItemId] uniqueidentifier NOT NULL,
                    [CategoryId] uniqueidentifier NOT NULL,
                    [ItemName] nvarchar(200) NOT NULL,
                    [Description] nvarchar(1000) NULL,
                    [Price] decimal(18,2) NOT NULL,
                    [Calories] int NOT NULL,
                    [ImageUrl] nvarchar(1000) NULL,
                    [IsAvailable] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NULL,
                    CONSTRAINT [PK_MenuItems] PRIMARY KEY ([ItemId]),
                    CONSTRAINT [FK_MenuItems_MenuCategories_CategoryId]
                        FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[MenuCategories] ([CategoryId]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_MenuItems_CategoryId] ON [dbo].[MenuItems] ([CategoryId]);
                CREATE INDEX [IX_MenuItems_IsAvailable] ON [dbo].[MenuItems] ([IsAvailable]);
            END
            """;

        await db.Database.ExecuteSqlRawAsync(sql, ct);
    }
}
