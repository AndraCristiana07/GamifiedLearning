using Microsoft.AspNetCore.Mvc;

using Gamified_learning.Models;
using Gamified_learning.Data;
using Microsoft.EntityFrameworkCore;

namespace Gamified_learning.Controllers 
{
    [ApiController]
    [Route("api/[controller]")]

    // // test API
    // public class TestController : ControllerBase
    // {
    //     [HttpGet]
    //     public string Hello() => "Hello World";
    // }

    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public UsersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _dbContext.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id == user.UserId)
            {
                // update user info
                _dbContext.Entry(user).State = EntityState.Modified;
                await _dbContext.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("ordered")]
        public async Task<ActionResult<IEnumerable<User>>> GetLeaderboard()
        {
            return await _dbContext.Users.OrderByDescending(u => u.Xp).Take(10).ToListAsync();
        }

        [HttpGet("{id}/profile")]
        public async Task<ActionResult> GetUserProfile(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return NotFound();

            var completed = await _dbContext.UserChallengesStatus
                .Where(u => u.UserId == id)
                .Include(u => u.Challenge)
                .ToListAsync();

            var profile = new 
            {
                user.UserId,
                user.Username,
                user.Email,
                user.Level,
                user.Xp,
                TotalCompleted = completed.Count,
                CategoryStats = completed
                    .GroupBy(c => c.Challenge.Category)
                    .Select(g => new {
                        Category = g.Key,
                        Count = g.Count()
                    })
            };

            return Ok(profile);
        }
    }
    
}