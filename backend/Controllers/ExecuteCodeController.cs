using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Gamified_learning.Models;

[ApiController]
[Route("api/code")]
public class ExecuteCodeController : ControllerBase
{
    private readonly HttpClient _http;

    public ExecuteCodeController(IHttpClientFactory factory)
    {
        _http = factory.CreateClient();
    }

    [HttpPost("execute")]
    public async Task<IActionResult> Execute([FromBody] CodeExecutionRequest req)
    {
        int languageId = req.Language switch
        {
            "python" => 71,
            "javascript" => 63,
            "csharp" => 51,
            "cpp" => 76,
            _ => 51
        };

        var payload = new
        {
            language_id = languageId,
            source_code = req.Answer,
            stdin = ""
        };

        string judge0Url = "http://localhost:2358/submissions?base64_encoded=false&wait=true";

        var response = await _http.PostAsJsonAsync(judge0Url, payload);

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Judge0 request failed");

        var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();

        return Ok(new
        {
            output = result?.Stdout
                ?? result?.Stderr
                ?? result?.Output
                ?? "No output"
        });
    }
}