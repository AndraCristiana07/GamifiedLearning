using Microsoft.AspNetCore.Mvc;

using Gamified_learning.Models;
using Gamified_learning.Data;
using Microsoft.EntityFrameworkCore;

namespace Gamified_learning.Controllers
{
    [ApiController]
    [Route("api/[controller]")]


    public class ChallengesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChallengesController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Challenge>>> GetChallenges()
        {
            return await _context.Challenges.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Challenge>> AddChalange(Challenge challenge)
        {
            _context.Challenges.Add(challenge);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Challenge added" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Challenge>> GetChallenge(int id)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null)
            {
                return NotFound();
            }
            return challenge;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChallenge(int id, Challenge challenge)
        {
            if (id == challenge.ChallengeId)
            {
                // update challenge content
                _context.Entry(challenge).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChallenge(int id)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null)
            {
                return NotFound();
            }

            _context.Challenges.Remove(challenge);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteChallenge([FromBody] ChallengeStatusRequest request)
        {
            // check if user exists
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            //check if challenge exists
            var challenge = await _context.Challenges.FindAsync(request.ChallengeId);
            if (challenge == null)
            {
                return NotFound("Challenge does not exist");
            }

            // check if challene is completed
            if (await _context.UserChallengesStatus.AnyAsync(u => u.UserId == request.UserId && u.ChallengeId == request.ChallengeId && u.Completed))
            {
                return BadRequest("Challenge was already completed :)");
            }

            bool correctAnswer = challenge.CorrectAnswer == request.Answer;
            if (correctAnswer)
            {
                // update user Xp
                user.Xp += challenge.XpGained;

                //check level
                int newLevel = (user.Xp / 100) + 1;

                // level up 
                if (newLevel > user.Level)
                {
                    user.Level = newLevel;
                }
                // make user challange status challenge status and mark it as completed
                var userChallengeStatus = new UserChallengeStatus
                {
                    UserId = user.UserId,
                    ChallengeId = challenge.ChallengeId,
                    Completed = true
                };

                _context.UserChallengesStatus.Add(userChallengeStatus);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Correct answer!", user.Xp, user.Level });
            }
            else
            {
                // TODO: maybe make user challange status and set complete to false? 
                return Ok(new { message = "Incorrect answer :( Try again!)" });
            }
        }


        // [HttpGet("category/{category}")]
        // public async Task<ActionResult<IEnumerable<Challenge>>> GetByCategory(string category)
        // {
        //     return await _context.Challenges.Where(c => c.Category == category).ToListAsync();
        // }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<ChallengeWithStatus>>> GetChallengesByCategory(string category, [FromQuery] int userId)
        {
            var decodedCategory = Uri.UnescapeDataString(category);
            var challenges = await _context.Challenges
                .Where(c => c.Category.ToLower() == decodedCategory.ToLower())
                .Select(c => new {
                    c.ChallengeId,
                    c.Title,
                    c.Question,
                    c.XpGained,
                    c.Difficulty,
                    Completed = _context.UserChallengesStatus.Any(uc => uc.ChallengeId == c.ChallengeId && uc.UserId == userId)
                })
                .ToListAsync();

            if (challenges.Count == 0)
                return NotFound("No challenges found for this category.");

            return Ok(challenges);
        }

        [HttpGet("difficulty/{difficulty}")]
          public async Task<ActionResult<IEnumerable<Challenge>>> GetByDifficulty(string difficulty)
        {
            return await _context.Challenges.Where(c => c.Difficulty == difficulty).ToListAsync();
        }


        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            return await _context.Challenges.Select(c => c.Category).Distinct().ToListAsync();

        }


        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitChallenge(int id, [FromBody] ChallengeStatusRequest request)
        {
            if (id != request.ChallengeId)
                return BadRequest("Challenge ID mismatch.");

            var challenge = await _context.Challenges.FindAsync(id);
            var user = await _context.Users.FindAsync(request.UserId);

            if (challenge == null || user == null)
                return NotFound("Challenge or user not found.");

            if (challenge.CorrectAnswer.Trim().ToLower() == request.Answer.Trim().ToLower())
            {
                // check if user completed challenge
                var alreadyDone = await _context.UserChallengesStatus
                    .AnyAsync(uc => uc.UserId == user.UserId && uc.ChallengeId == id);
                if (alreadyDone)
                    return BadRequest(new { message = "You already completed this challenge." });

            
                user.Xp += challenge.XpGained;
                _context.UserChallengesStatus.Add(new UserChallengeStatus
                {
                    UserId = user.UserId,
                    ChallengeId = id,
                    Completed = true,
                    CompletedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return Ok(new { message = "Correct! XP awarded." });
            }

            return BadRequest(new { message = "Incorrect answer." });
        }

        [HttpGet("{userId}/recent")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentChallenges(int userId)
        {
            var recent = await _context.UserChallengesStatus
                .Where(uc => uc.UserId == userId && uc.Completed)
                .OrderByDescending(uc => uc.CompletedAt)
                .Take(10)
                .Select(uc => new {
                    uc.CompletedAt,
                    uc.Challenge.Title,
                    uc.Challenge.Category,
                    uc.Challenge.Difficulty,
                    uc.Challenge.XpGained
                })
                .ToListAsync();

            return Ok(recent);
        }

    }

}