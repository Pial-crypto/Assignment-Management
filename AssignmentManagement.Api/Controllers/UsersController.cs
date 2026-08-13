using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Users;
using AssignmentManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

   

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
       
        // Console.WriteLine("Fetching all the users ");
        var users = await _db.Users
            .AsNoTracking()
            .Include(x => x.Class)
            .Select(x => new UserResponse
            {
                Id = x.Id,
                Name = x.Name,
                Email = x.Email,
                Role = x.Role,
                ClassId = x.ClassId,
                ClassName = x.Class != null
                    ? x.Class.Name
                    : null
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(x => x.Class)
            .Where(x => x.Id == id)
            .Select(x => new UserResponse
            {
                Id = x.Id,
                Name = x.Name,
                Email = x.Email,
                Role = x.Role,
                ClassId = x.ClassId,
                ClassName = x.Class != null
                    ? x.Class.Name
                    : null
            })
            .FirstOrDefaultAsync();

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(
        CreateUserRequest request)
    {
          Console.WriteLine("Line One creating user");
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(x => x.Email == email))
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }

        if (request.Role == Models.Enums.UserRole.Student)
        {
            if (request.ClassId is null)
            {
                return BadRequest(new
                {
                    message = "Student must be assigned to a class."
                });
            }

            if (!await _db.Classes.AnyAsync(x => x.Id == request.ClassId))
            {
                return BadRequest(new
                {
                    message = "The specified class does not exist."
                });
            }
        }
        else
        {
            request.ClassId = null;
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password),
            Role = request.Role,
            ClassId = request.ClassId
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.Id },
            new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ClassId = user.ClassId
            });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);

        if (user is null)
            return NotFound();

        var email = request.Email.Trim().ToLowerInvariant();

        var duplicateEmail = await _db.Users
            .AnyAsync(x => x.Email == email && x.Id != id);

        if (duplicateEmail)
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }

        if (request.Role == Models.Enums.UserRole.Student)
        {
            if (request.ClassId is null)
            {
                return BadRequest(new
                {
                    message = "Student must be assigned to a class."
                });
            }

            if (!await _db.Classes.AnyAsync(x => x.Id == request.ClassId))
            {
                return BadRequest(new
                {
                    message = "The specified class does not exist."
                });
            }
        }
        else
        {
            request.ClassId = null;
        }

        user.Name = request.Name.Trim();
        user.Email = email;
        user.Role = request.Role;
        user.ClassId = request.ClassId;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);

        if (user is null)
            return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}