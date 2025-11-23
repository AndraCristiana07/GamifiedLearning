namespace Gamified_learning.Models
{
    public class CodeExecutionResult
    {
        public string? Stdout { get; set; }
        public string? Stderr { get; set; }
        public string? Output { get; set; }

        public string? Compile_output { get; set; } 
        public string? Token { get; set; }
    }
}