using Microsoft.EntityFrameworkCore;

using Gamified_learning.Models;

namespace Gamified_learning.Data 
{
    public class AppDbContext : DbContext
    {
        public AppDbContext (DbContextOptions<AppDbContext> options) : base(options){}
        
        public DbSet<User> Users { get; set; }
    }
}