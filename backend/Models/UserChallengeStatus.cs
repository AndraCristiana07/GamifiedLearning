namespace Gamified_learning.Models
{
    public class UserChallengeStatus
    {
        public int UserChallengeStatusId { get; set; }
        public int UserId { get; set; }
        public int ChallengeId { get; set; }
        public bool Completed { get; set; } = false;
    }
}