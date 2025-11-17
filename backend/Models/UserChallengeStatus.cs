namespace Gamified_learning.Models
{
    public class UserChallengeStatus
    {
        public int UserChallengeStatusId { get; set; }
        public int UserId { get; set; }
        public int ChallengeId { get; set; }
        public bool Completed { get; set; } = false;

        public DateTime CompletedAt  { get; set; } = DateTime.UtcNow;
        public User User { get; set; }
        public Challenge Challenge { get; set; }
    }
}