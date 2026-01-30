using Microsoft.EntityFrameworkCore;

using Gamified_learning.Models;

namespace Gamified_learning.Data 
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Challenge> Challenges { get; set; }
        public DbSet<UserChallengeStatus> UserChallengesStatus { get; set; }
        public DbSet<UserChallengeHint> UserChallengeHints { get; set; }
    }
}