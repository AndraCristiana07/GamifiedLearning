namespace Gamified_learning.Models
{
    public class ChallengeWithStatus
    {
        public int ChallengeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public int XpGained { get; set; }
        public string Difficulty { get; set; } = "Easy";
        public string Completed {get; set;}
    }
}