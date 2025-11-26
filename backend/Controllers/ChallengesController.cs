using Microsoft.AspNetCore.Mvc;

using Gamified_learning.Models;
using Gamified_learning.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
                return Ok(new { message = "Incorrect answer :( Try again!)" });
            }
        }

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
                return BadRequest(new { message = "Challenge ID mismatch." });

            var challenge = await _context.Challenges.FindAsync(id);
            var user = await _context.Users.FindAsync(request.UserId);

            if (challenge == null || user == null)
                return NotFound(new { message = "Challenge or user not found." });

            // answer is text
            if (challenge.Type == "Text")
            {
                if (challenge.CorrectAnswer.Trim().ToLower() != request.Answer.Trim().ToLower())
                    return BadRequest(new { message = "Incorrect answer." });

                return await HandleSuccess(user, challenge);
            }

            // answer is code
            if (challenge.Type == "Code")
            {
                if (string.IsNullOrWhiteSpace(challenge.TestCasesJson))
                    return BadRequest(new { message = "No test cases defined for this challenge." });

                if (string.IsNullOrWhiteSpace(request.Language))
                    return BadRequest(new { message = "Language is required." });

                var tests = JsonSerializer.Deserialize<List<TestCase>>(challenge.TestCasesJson)!;
                Console.WriteLine(tests);

                foreach (var test in tests)
                {
                    var run = await ExecuteCode(request.Language, request.Answer, test.Input);

                    if (run == null)
                        return BadRequest(new { message = "Code execution failed." });

                    if (run.Output.Trim() != test.Expected.Trim())
                    {
                        return BadRequest(new
                        {
                            message = "Wrong answer",
                            failedTest = new { test.Input, Expected = test.Expected, Got = run.Output }
                        });
                    }
                }

                return await HandleSuccess(user, challenge);
            }

            return BadRequest(new { message = "Unknown challenge type." });
        }
       
        private async Task<IActionResult> HandleSuccess(User user, Challenge challenge)
        {
            bool alreadyDone = await _context.UserChallengesStatus
                .AnyAsync(u => u.UserId == user.UserId && u.ChallengeId == challenge.ChallengeId);

            if (alreadyDone)
                return Ok(new { message = "Correct again!" });

            user.Xp += challenge.XpGained;

            _context.UserChallengesStatus.Add(new UserChallengeStatus
            {
                UserId = user.UserId,
                ChallengeId = challenge.ChallengeId,
                Completed = true,
                CompletedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Correct! XP awarded." });
        }

        private async Task<ExecutionResult?> ExecuteCode(string language, string code, string stdin = "")
        {
            using var http = new HttpClient();

             int languageId = language switch
            {
                "python" => 71,
                "javascript" => 63,
                "csharp" => 51,
                "cpp" => 76,
                _ => 51
            };

            var payload = new Dictionary<string, string>
            {
                { "language_id", languageId.ToString() },
                { "source_code", code },
                { "stdin", stdin }
            };

            var jsonContent = JsonContent.Create(payload);

            await jsonContent.LoadIntoBufferAsync(); // avoid chunked encoding

            string judge0Url = "http://localhost:2358/submissions?base64_encoded=false&wait=true";

            var response = await http.PostAsync(judge0Url, jsonContent);

            if (!response.IsSuccessStatusCode)
                return null;

            var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();

            return new ExecutionResult
            {
                Output = result?.Stdout ?? result?.Stderr ?? result?.Output ?? "No output"
            };
        }




        public class ExecutionResult
        {
            public string Output { get; set; } = "";
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

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkAddChallenges([FromBody] List<Challenge> challenges)
        {
            if (challenges == null || challenges.Count == 0)
                return BadRequest("No challenges provided.");

            _context.Challenges.AddRange(challenges);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{challenges.Count} challenges added successfully!" });
        }

    }

}