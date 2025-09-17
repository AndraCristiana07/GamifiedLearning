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
    }

}