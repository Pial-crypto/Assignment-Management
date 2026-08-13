using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize(Roles = "Admin")]
public class ClassesController : ControllerBase
{
    private readonly AppDbContext _db;
    

    public ClassesController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/classes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassResponse>>> GetClasses()
    {
        var classes = await _db.Classes
            .AsNoTracking()
            .Select(c => new ClassResponse
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(classes);
    }

    // POST: api/classes
    [HttpPost]
    public async Task<ActionResult<ClassResponse>> CreateClass(
        [FromBody] CreateClassRequest request)
    {
        var name = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Class name is required."
            });
        }

        var exists = await _db.Classes
            .AnyAsync(c => c.Name == name);

        if (exists)
        {
            return Conflict(new
            {
                message = "A class with this name already exists."
            });
        }

        var schoolClass = new Class
        {
            Name = name
        };

        _db.Classes.Add(schoolClass);

        await _db.SaveChangesAsync();

        return Ok(new ClassResponse
        {
            Id = schoolClass.Id,
            Name = schoolClass.Name
        });
    }
    
    
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    try
    {
        var classEntity = await _db.Classes
            .FindAsync(id);

        if (classEntity is null)
        {
            return NotFound(new
            {
                message = "Class not found."
            });
        }

        var hasTeacherAssignments =
            await _db.TeacherAssignments
                .AnyAsync(x => x.ClassId == id);

        if (hasTeacherAssignments)
        {
            return Conflict(new
            {
                message =
                    "This class cannot be deleted because it is assigned to one or more teachers. Remove those teacher assignments first."
            });
        }

        var hasStudents =
            await _db.Users
                .AnyAsync(x =>
                    x.ClassId == id &&
                    x.Role == Models.Enums.UserRole.Student);

        if (hasStudents)
        {
            return Conflict(new
            {
                message =
                    "This class cannot be deleted because students are currently assigned to it."
            });
        }

        _db.Classes.Remove(classEntity);

        await _db.SaveChangesAsync();

        return NoContent();
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            $"Failed to delete class {id}: {ex}");

        return StatusCode(500, new
        {
            status = 500,
            message =
                "An unexpected error occurred. Please try again later."
        });
    }
}
}

public class CreateClassRequest
{
    public string Name { get; set; } = string.Empty;
}

public class ClassResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
}