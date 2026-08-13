using System.Security.Claims;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.TeacherAssignments;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/teacher-assignments")]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeacherAssignmentsController(AppDbContext db)
    {
        _db = db;
    }

    
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<TeacherAssignmentResponse>>> GetAll()
    {
        var assignments = await _db.TeacherAssignments
            .AsNoTracking()
            .Include(x => x.Teacher)
            .Include(x => x.Class)
            .Include(x => x.Subject)
            .Select(x => new TeacherAssignmentResponse
            {
                Id = x.Id,

                TeacherId = x.TeacherId,
                TeacherName = x.Teacher.Name,

                ClassId = x.ClassId,
                ClassName = x.Class.Name,

                SubjectId = x.SubjectId,
                SubjectName = x.Subject.Name
            })
            .ToListAsync();

        return Ok(assignments);
    }



    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeacherAssignmentResponse>> Create(
        CreateTeacherAssignmentRequest request)
    {
        var teacher = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.Id == request.TeacherId &&
                x.Role == UserRole.Teacher);

        if (teacher is null)
        {
            return BadRequest(new
            {
                message = "The specified user is not a teacher."
            });
        }

        var classExists = await _db.Classes
            .AnyAsync(x => x.Id == request.ClassId);

        if (!classExists)
        {
            return BadRequest(new
            {
                message = "The specified class does not exist."
            });
        }

        var subjectExists = await _db.Subjects
            .AnyAsync(x => x.Id == request.SubjectId);

        if (!subjectExists)
        {
            return BadRequest(new
            {
                message = "The specified subject does not exist."
            });
        }

        var duplicate = await _db.TeacherAssignments
            .AnyAsync(x =>
                x.TeacherId == request.TeacherId &&
                x.ClassId == request.ClassId &&
                x.SubjectId == request.SubjectId);

        if (duplicate)
        {
            return Conflict(new
            {
                message =
                    "This teacher is already assigned to this class and subject."
            });
        }

        var assignment = new Models.TeacherAssignment
        {
            TeacherId = request.TeacherId,
            ClassId = request.ClassId,
            SubjectId = request.SubjectId
        };

        _db.TeacherAssignments.Add(assignment);

        await _db.SaveChangesAsync();

        await _db.Entry(assignment)
            .Reference(x => x.Teacher)
            .LoadAsync();

        await _db.Entry(assignment)
            .Reference(x => x.Class)
            .LoadAsync();

        await _db.Entry(assignment)
            .Reference(x => x.Subject)
            .LoadAsync();

        return Ok(new TeacherAssignmentResponse
        {
            Id = assignment.Id,

            TeacherId = assignment.TeacherId,
            TeacherName = assignment.Teacher.Name,

            ClassId = assignment.ClassId,
            ClassName = assignment.Class.Name,

            SubjectId = assignment.SubjectId,
            SubjectName = assignment.Subject.Name
        });
    }



    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var assignment = await _db.TeacherAssignments
            .FindAsync(id);

        if (assignment is null)
        {
            return NotFound();
        }

        _db.TeacherAssignments.Remove(assignment);

        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("my")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<IEnumerable<TeacherAssignmentResponse>>>
        GetMyAssignments()
    {
        var teacherIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier);

        if (teacherIdClaim is null ||
            !int.TryParse(
                teacherIdClaim.Value,
                out var teacherId))
        {
            return Unauthorized();
        }

        var assignments = await _db.TeacherAssignments
            .AsNoTracking()
            .Where(x => x.TeacherId == teacherId)
            .Include(x => x.Teacher)
            .Include(x => x.Class)
            .Include(x => x.Subject)
            .Select(x => new TeacherAssignmentResponse
            {
                Id = x.Id,

                TeacherId = x.TeacherId,
                TeacherName = x.Teacher.Name,

                ClassId = x.ClassId,
                ClassName = x.Class.Name,

                SubjectId = x.SubjectId,
                SubjectName = x.Subject.Name
            })
            .ToListAsync();

        return Ok(assignments);
    }
}