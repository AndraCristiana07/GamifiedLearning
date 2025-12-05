public class UserChallengeHint
{
    public int UserChallengeHintId { get; set; }
    public int UserId { get; set; }
    public int ChallengeId { get; set; }
    public int HintsUsed { get; set; } = 0;
}