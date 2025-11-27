namespace Gamified_learning.Models
{
    public class Challenge
    {
        public int ChallengeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public int XpGained { get; set; }
        public string? CorrectAnswer { get; set; } = string.Empty;

        public string Type { get; set; } = "Text";
        public string Category { get; set; } = "General";
        public string Difficulty { get; set; } = "Easy";

        public string? TestCasesJson { get; set; }

        public string? HintsJson { get; set; }
        public int HintPenalty { get; set; }
    }
}