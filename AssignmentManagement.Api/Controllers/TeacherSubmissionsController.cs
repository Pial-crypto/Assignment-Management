using System.Security.Claims;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Submissions;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/teacher/submissions")]
[Authorize(Roles = "Teacher")]
public class TeacherSubmissionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeacherSubmissionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("assignment/{assignmentId:int}")]
    public async Task<ActionResult<IEnumerable<SubmissionResponse>>>
        GetAssignmentSubmissions(int assignmentId)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
            return Unauthorized();

        var assignment = await _db.Assignments
            .AsNoTracking()
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == assignmentId);

        if (assignment is null)
            return NotFound(new
            {
                message = "Assignment not found."
            });

        // Ownership check
        if (assignment.TeacherAssignment.TeacherId != teacherId.Value)
        {
            return Forbid();
        }

        var submissions = await _db.Submissions
            .AsNoTracking()
            .Where(x => x.AssignmentId == assignmentId)
            .Include(x => x.Student)
            .Include(x => x.Assignment)
            .Select(x => new SubmissionResponse
            {
                Id = x.Id,
                AssignmentId = x.AssignmentId,
                AssignmentTitle = x.Assignment.Title,
                StudentId = x.StudentId,
                StudentName = x.Student.Name,
                Answer = x.Answer,
                SubmittedAt = x.SubmittedAt,
                Marks = x.Marks,
                Feedback = x.Feedback,
                Status = x.Status,
                Deadline = x.Assignment.Deadline
            })
            .ToListAsync();

        return Ok(submissions);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SubmissionResponse>>
        GetSubmission(int id)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
            return Unauthorized();

        var submission = await _db.Submissions
            .AsNoTracking()
            .Include(x => x.Student)
            .Include(x => x.Assignment)
                .ThenInclude(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (submission is null)
            return NotFound();

        if (submission.Assignment.TeacherAssignment.TeacherId
            != teacherId.Value)
        {
            return Forbid();
        }

        return Ok(MapToResponse(submission));
    }

    [HttpPatch("{id:int}/review")]
    public async Task<IActionResult> Review(
        int id,
        ReviewSubmissionRequest request)
    {
        var teacherId = GetCurrentUserId();

        if (teacherId is null)
            return Unauthorized();

        var submission = await _db.Submissions
            .Include(x => x.Assignment)
                .ThenInclude(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (submission is null)
            return NotFound();

        // Teacher ownership
        if (submission.Assignment.TeacherAssignment.TeacherId
            != teacherId.Value)
        {
            return Forbid();
        }

        // Validate marks
        if (request.Marks < 0)
        {
            return BadRequest(new
            {
                message = "Marks cannot be negative."
            });
        }

        if (request.Marks >
            submission.Assignment.MaxMarks)
        {
            return BadRequest(new
            {
                message =
                    $"Marks cannot exceed the maximum marks " +
                    $"({submission.Assignment.MaxMarks})."
            });
        }

        // Feedback validation
        if (request.Feedback is not null &&
            request.Feedback.Length > 2000)
        {
            return BadRequest(new
            {
                message =
                    "Feedback cannot exceed 2000 characters."
            });
        }

        // Teacher can only set valid review states.
        if (request.Status != SubmissionStatus.Reviewed &&
            request.Status != SubmissionStatus.Pending)
        {
            return BadRequest(new
            {
                message =
                    "Teacher can only set Pending or Reviewed status."
            });
        }

        submission.Marks = request.Marks;
        submission.Feedback =
            string.IsNullOrWhiteSpace(request.Feedback)
                ? null
                : request.Feedback.Trim();

        submission.Status = request.Status;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Submission reviewed successfully."
        });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return int.TryParse(claim, out var userId)
            ? userId
            : null;
    }

    private static SubmissionResponse MapToResponse(
        Models.Submission submission)
    {
        return new SubmissionResponse
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            AssignmentTitle = submission.Assignment.Title,
            StudentId = submission.StudentId,
            StudentName = submission.Student.Name,
            Answer = submission.Answer,
            SubmittedAt = submission.SubmittedAt,
            Marks = submission.Marks,
            Feedback = submission.Feedback,
            Status = submission.Status,
            Deadline = submission.Assignment.Deadline
        };
    }
}