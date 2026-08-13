using System.Security.Claims;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Assignments;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AssignmentsController(AppDbContext db)
    {
        _db = db;
    }


    [HttpGet("my")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<IEnumerable<AssignmentResponse>>>
        GetMyAssignments()
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }

        var assignments = await _db.Assignments
            .AsNoTracking()
            .Where(x =>
                x.TeacherAssignment.TeacherId ==
                teacherId.Value)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Class)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject)
            .Select(x => MapToResponse(x))
            .ToListAsync();

        return Ok(assignments);
    }



    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<AssignmentResponse>>
        GetById(int id)
    {
        var assignment = await GetAssignment(id);

        if (assignment is null)
        {
            return NotFound();
        }

        var userRole =
            User.FindFirstValue(ClaimTypes.Role);

        
        if (userRole == nameof(UserRole.Teacher))
        {
            var teacherId = GetCurrentUserId();

            if (teacherId is null ||
                assignment.TeacherAssignment.TeacherId !=
                teacherId.Value)
            {
                return Forbid();
            }
        }


  
        if (userRole == nameof(UserRole.Student))
        {
            var studentId = GetCurrentUserId();

            if (studentId is null)
            {
                return Unauthorized();
            }

            if (assignment.Status !=
                AssignmentStatus.Published)
            {
                return NotFound();
            }

            var student = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == studentId.Value);

            if (student is null ||
                student.ClassId !=
                assignment.TeacherAssignment.ClassId)
            {
                return Forbid();
            }
        }

        return Ok(MapToResponse(assignment));
    }


 
    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult<AssignmentResponse>> Create(
        CreateAssignmentRequest request)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }


        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }


        if (string.IsNullOrWhiteSpace(
                request.Description))
        {
            return BadRequest(new
            {
                message = "Description is required."
            });
        }


        if (request.MaxMarks <= 0)
        {
            return BadRequest(new
            {
                message =
                    "Maximum marks must be greater than zero."
            });
        }


        if (request.Deadline <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message =
                    "Deadline must be in the future."
            });
        }


        // Make sure the teacher assignment actually
        // belongs to the logged-in teacher.
        var teacherAssignment =
            await _db.TeacherAssignments
                .Include(x => x.Teacher)
                .Include(x => x.Class)
                .Include(x => x.Subject)
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    request.TeacherAssignmentId &&
                    x.TeacherId ==
                    teacherId.Value);

        if (teacherAssignment is null)
        {
            return Forbid();
        }


        var assignment = new Assignment
        {
            TeacherAssignmentId =
                request.TeacherAssignmentId,

            Title = request.Title.Trim(),

            Description =
                request.Description.Trim(),

            Deadline = request.Deadline,

            MaxMarks = request.MaxMarks,

            Status = AssignmentStatus.Draft
        };

        _db.Assignments.Add(assignment);

        await _db.SaveChangesAsync();

        assignment.TeacherAssignment =
            teacherAssignment;

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = assignment.Id
            },
            MapToResponse(assignment));
    }


    // =========================================================
    // TEACHER: Update assignment
    // =========================================================
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(
        int id,
        UpdateAssignmentRequest request)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }


        var assignment = await _db.Assignments
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
        {
            return NotFound();
        }


        if (assignment.TeacherAssignment.TeacherId !=
            teacherId.Value)
        {
            return Forbid();
        }


        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }


        if (string.IsNullOrWhiteSpace(
                request.Description))
        {
            return BadRequest(new
            {
                message =
                    "Description is required."
            });
        }


        if (request.MaxMarks <= 0)
        {
            return BadRequest(new
            {
                message =
                    "Maximum marks must be greater than zero."
            });
        }


        if (request.Deadline <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message =
                    "Deadline must be in the future."
            });
        }


        assignment.Title =
            request.Title.Trim();

        assignment.Description =
            request.Description.Trim();

        assignment.Deadline =
            request.Deadline;

        assignment.MaxMarks =
            request.MaxMarks;

        assignment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }


    // =========================================================
    // TEACHER: Delete assignment
    // =========================================================
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }


        var assignment = await _db.Assignments
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
        {
            return NotFound();
        }


        if (assignment.TeacherAssignment.TeacherId !=
            teacherId.Value)
        {
            return Forbid();
        }


        if (assignment.Status ==
            AssignmentStatus.Published)
        {
            return BadRequest(new
            {
                message =
                    "Published assignments cannot be deleted."
            });
        }


        _db.Assignments.Remove(assignment);

        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpPatch("{id:int}/publish")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Publish(int id)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }


        var assignment = await _db.Assignments
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
        {
            return NotFound();
        }


        if (assignment.TeacherAssignment.TeacherId !=
            teacherId.Value)
        {
            return Forbid();
        }


        if (assignment.Status ==
            AssignmentStatus.Published)
        {
            return BadRequest(new
            {
                message =
                    "Assignment is already published."
            });
        }


        if (assignment.Deadline <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message =
                    "An assignment with a past deadline cannot be published."
            });
        }


        assignment.Status =
            AssignmentStatus.Published;

        assignment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Assignment published successfully."
        });
    }


  
    [HttpPatch("{id:int}/unpublish")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Unpublish(int id)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
        {
            return Unauthorized();
        }


        var assignment = await _db.Assignments
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
        {
            return NotFound();
        }


        if (assignment.TeacherAssignment.TeacherId !=
            teacherId.Value)
        {
            return Forbid();
        }


        assignment.Status =
            AssignmentStatus.Draft;

        assignment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Assignment moved back to draft."
        });
    }



    private async Task<Assignment?> GetAssignment(
        int id)
    {
        return await _db.Assignments
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Class)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject)
            .FirstOrDefaultAsync(x => x.Id == id);
    }


 
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return int.TryParse(
            claim,
            out var userId)
                ? userId
                : null;
    }



    private static AssignmentResponse MapToResponse(
        Assignment assignment)
    {
        return new AssignmentResponse
        {
            Id = assignment.Id,

            Title = assignment.Title,

            Description = assignment.Description,

            Deadline = assignment.Deadline,

            MaxMarks = assignment.MaxMarks,

            Status = assignment.Status,

            TeacherAssignmentId =
                assignment.TeacherAssignmentId,

            TeacherId =
                assignment.TeacherAssignment.TeacherId,

            TeacherName =
                assignment.TeacherAssignment.Teacher.Name,

            ClassId =
                assignment.TeacherAssignment.ClassId,

            ClassName =
                assignment.TeacherAssignment.Class.Name,

            SubjectId =
                assignment.TeacherAssignment.SubjectId,

            SubjectName =
                assignment.TeacherAssignment.Subject.Name,

            CreatedAt =
                assignment.CreatedAt,

            UpdatedAt =
                assignment.UpdatedAt
        };
    }
}