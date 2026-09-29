using AlTayer.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AlTayer.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Campus> Campuses => Set<Campus>();
    public DbSet<Merchant> Merchants => Set<Merchant>();
    public DbSet<Advertisement> Advertisements => Set<Advertisement>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Campus>(entity =>
        {
            entity.ToTable("Campuses");
            entity.HasIndex(c => c.Code).IsUnique().HasFilter("[Code] IS NOT NULL");
            entity.Property(c => c.Name).IsRequired();
        });

        modelBuilder.Entity<Merchant>(entity =>
        {
            entity.ToTable("Merchants");
            entity.HasOne(m => m.Campus)
                  .WithMany(c => c.Merchants)
                  .HasForeignKey(m => m.CampusId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.Property(m => m.PendingBalance).HasPrecision(18, 2);
            entity.Property(m => m.SettledThisWeek).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Advertisement>(entity =>
        {
            entity.ToTable("Advertisements");

            entity.HasOne(a => a.Campus)
                  .WithMany(c => c.Advertisements)
                  .HasForeignKey(a => a.CampusId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(a => a.CampusId);
            entity.HasIndex(a => new { a.StartDate, a.EndDate });
            entity.Property(a => a.Title).IsRequired();
            entity.Property(a => a.BannerUrl).IsRequired();
        });

        modelBuilder.Entity<MenuCategory>(entity =>
        {
            entity.ToTable("MenuCategories");
            entity.HasOne(c => c.Merchant)
                  .WithMany(m => m.MenuCategories)
                  .HasForeignKey(c => c.MerchantId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(c => new { c.MerchantId, c.DisplayOrder });
            entity.Property(c => c.CategoryName).IsRequired();
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.ToTable("MenuItems");
            entity.HasOne(i => i.Category)
                  .WithMany(c => c.Items)
                  .HasForeignKey(i => i.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(i => i.ItemName).IsRequired();
            entity.Property(i => i.Price).HasPrecision(18, 2);
            entity.HasIndex(i => i.CategoryId);
            entity.HasIndex(i => i.IsAvailable);
        });
    }
}
