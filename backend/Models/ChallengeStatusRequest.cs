namespace Gamified_learning.Models
{
    public class ChallengeStatusRequest
    {
        public int UserId { get; set; }
        public int ChallengeId { get; set; }
        public string Answer { get; set; } = string.Empty;

        public string? Language { get; set; }
    }
}