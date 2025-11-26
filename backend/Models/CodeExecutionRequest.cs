namespace Gamified_learning.Models
{
    public class CodeExecutionRequest
    {
        public string Language { get; set; }
        public string Answer { get; set; }

        public string Stdin { get; set; }
    }
};