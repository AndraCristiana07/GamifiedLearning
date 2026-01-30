using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Gamified_learning.Models;
using Gamified_learning.Data;

using Gamified_learning.Helpers;

[ApiController]
[Route("api/code")]
public class ExecuteCodeController : ControllerBase
{
    private readonly HttpClient _http;
    private readonly AppDbContext _context;

    public ExecuteCodeController(IHttpClientFactory factory, AppDbContext context)
    {
        Console.WriteLine("ExecuteCodeController initialized");
        _http = factory.CreateClient();
        _context = context;

    }

    [HttpPost("execute")]
    public async Task<IActionResult> Execute([FromBody] CodeExecutionRequest req)
    {
        Console.WriteLine("Execute endpoint called");

        int languageId = req.Language switch
        {
            "python" => 71,
            "javascript" => 63,
            "csharp" => 51,
            "cpp" => 76,
            _ => 51
        };

        var challenge = await _context.Challenges.FindAsync(req.ChallengeId);
        if (challenge == null)
        {
             return NotFound(new { message = "Challenge not found." });
        }
        string wrapper = req.Language switch
        {
            "python" => challenge.WrapperCodePython ?? "",
            "javascript" => challenge.WrapperCodeJavascript ?? "",
            "csharp" => challenge.WrapperCodeCsharp ?? "",
            "cpp" => challenge.WrapperCodeCpp ?? "",
            _ => ""
        };


        if (wrapper == null)
        {
            return BadRequest("Wrapper code not found for the specified language");
        }
        Console.WriteLine($"Wrapper code: {wrapper}");

        string finalAnswer = CodeAssemble.AssembleCode(req.Answer, wrapper);

        Console.WriteLine($"Final assembled code: {finalAnswer}");
        var payload = new Dictionary<string, string>
        {
            { "language_id", languageId.ToString() },
            { "source_code", finalAnswer },
            { "stdin", req.Stdin }
        };

        Console.WriteLine($"Language id: {languageId}");
        Console.WriteLine($"Source code: {req.Answer}");
        
        Console.WriteLine($"stdin: {req.Stdin}");
        
        var jsonContent = JsonContent.Create(payload);

        await jsonContent.LoadIntoBufferAsync(); // avoid chunked encoding

        string judge0Url = "http://localhost:2358/submissions?base64_encoded=false&wait=true";

        var response = await _http.PostAsync(judge0Url, jsonContent);

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Judge0 request failed");

        var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();

        Console.WriteLine($"Execution output: {result.Stdout}");
        Console.WriteLine($"Execution err: {result.Stderr}");

        return Ok(new
        {
            output = result?.Stdout
                ?? result?.Stderr
                ?? result?.Output
                ?? "No output"
        });
    }
}

