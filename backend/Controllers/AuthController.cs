using Microsoft.AspNetCore.Mvc;

using Gamified_learning.Models;
using Gamified_learning.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System;
using System.Text.RegularExpressions;
using System.Security.Claims; // Claim and ClaimTypes
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using System.Text; // Encoding
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Gamified_learning.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IConfiguration _configuration;

       public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // check if user exists by email
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists");
            }

            // check if valid email
            if (!IsValidEmail(request.Email))
            {
                Console.WriteLine("Invalid email format");
                return BadRequest("Invalid email format");
            }
            
            // check if valid password
            if (!IsValidPassword(request.Password))
            {
                Console.WriteLine("Password must be at least 6 characters long, have at least one digit, have at least one special character and at least one uppercase letter");
                return BadRequest("Password must be at least 6 characters long, have at least one digit, have at least one special character and at least one uppercase letter");
            }
            
            //create new user
            var user = new User
            {
                Username = request.Username,
                //hashing password
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Email = request.Email,
                Xp = 0,
                Level = 1
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new {message = "User created successfully"});
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password))
            {
                Console.WriteLine("Invalid credentials");
                return Unauthorized("Invalid credentials");
            }
            Console.WriteLine("Logged in");

            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
            };
            var jwtToken = new JwtSecurityToken(
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["ApplicationSettings:JWT_Secret"])
                        ),
                    SecurityAlgorithms.HmacSha256Signature)
            );
            return Ok(new {message = "Logged in successfully", user.Username, user.Email,  user.Xp,  user.Level, token = new JwtSecurityTokenHandler().WriteToken(jwtToken)});
        }
        
        public static bool IsValidEmail(string email)
        {
            string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$";
		
            if (string.IsNullOrEmpty(email))
                return false;
		
            Regex regex = new Regex(emailPattern);
            return regex.IsMatch(email);
        }

        bool IsValidPassword(string password)
        {
            return password.Any(c => !char.IsLetterOrDigit(c)) && password.Length >= 6 && password.Any(c => !char.IsUpper(c)) && password.Any(c => char.IsDigit(c));
        }
        
    }
}
