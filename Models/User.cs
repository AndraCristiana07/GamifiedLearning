namespace Gamified_learning.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } =  string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Xp { get; set; } = 0;
        public int Level { get; set; } = 1;
    }
};

