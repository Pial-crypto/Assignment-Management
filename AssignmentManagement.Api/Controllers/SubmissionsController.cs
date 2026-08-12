using System.Security.Claims;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Submissions;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/submissions")]
[Authorize(Roles = "Student")]
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubmissionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult<SubmissionResponse>> Create(
        CreateSubmissionRequest request)
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Answer))
        {
            return BadRequest(new
            {
                message = "Answer is required."
            });
        }

        var student = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == studentId.Value &&
                x.Role == UserRole.Student);

        if (student is null)
            return Unauthorized();

        var assignment = await _db.Assignments
            .Include(x => x.TeacherAssignment)
            .FirstOrDefaultAsync(x =>
                x.Id == request.AssignmentId &&
                x.Status == AssignmentStatus.Published);

        if (assignment is null)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        // Student can only submit assignments
        // belonging to their own class.
        if (student.ClassId !=
            assignment.TeacherAssignment.ClassId)
        {
            return Forbid();
        }

        // Deadline enforcement.
        if (DateTime.UtcNow >= assignment.Deadline)
        {
            return BadRequest(new
            {
                message = "The submission deadline has passed."
            });
        }

        // One submission per student per assignment.
        var existingSubmission = await _db.Submissions
            .FirstOrDefaultAsync(x =>
                x.AssignmentId == assignment.Id &&
                x.StudentId == studentId.Value);

        if (existingSubmission is not null)
        {
            return Conflict(new
            {
                message = "You have already submitted this assignment."
            });
        }

        var submission = new Submission
        {
            AssignmentId = assignment.Id,
            StudentId = studentId.Value,
            Answer = request.Answer.Trim(),
            SubmittedAt = DateTime.UtcNow,
            Status = SubmissionStatus.Pending
        };

        _db.Submissions.Add(submission);

        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetMySubmission),
            new { assignmentId = assignment.Id },
            new SubmissionResponse
            {
                Id = submission.Id,
                AssignmentId = assignment.Id,
                AssignmentTitle = assignment.Title,
                StudentId = studentId.Value,
                StudentName = student.Name,
                Answer = submission.Answer,
                SubmittedAt = submission.SubmittedAt,
                Marks = null,
                Feedback = null,
                Status = submission.Status,
                Deadline = assignment.Deadline
            });
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<SubmissionResponse>>>
        GetMySubmissions()
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
            return Unauthorized();

        var submissions = await _db.Submissions
            .AsNoTracking()
            .Where(x => x.StudentId == studentId.Value)
            .Include(x => x.Assignment)
            .Include(x => x.Student)
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

    [HttpGet("assignment/{assignmentId:int}")]
    public async Task<ActionResult<SubmissionResponse>>
        GetMySubmission(int assignmentId)
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
            return Unauthorized();

        var submission = await _db.Submissions
            .AsNoTracking()
            .Include(x => x.Assignment)
            .Include(x => x.Student)
            .FirstOrDefaultAsync(x =>
                x.AssignmentId == assignmentId &&
                x.StudentId == studentId.Value);

        if (submission is null)
            return NotFound();

        return Ok(new SubmissionResponse
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
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateSubmissionRequest request)
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Answer))
        {
            return BadRequest(new
            {
                message = "Answer is required."
            });
        }

        var submission = await _db.Submissions
            .Include(x => x.Assignment)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.StudentId == studentId.Value);

        if (submission is null)
        {
            return NotFound();
        }

        if (submission.Assignment.Status !=
            AssignmentStatus.Published)
        {
            return BadRequest(new
            {
                message = "This assignment is not available."
            });
        }

        // Deadline enforcement for update.
        if (DateTime.UtcNow >=
            submission.Assignment.Deadline)
        {
            return BadRequest(new
            {
                message =
                    "The submission deadline has passed. " +
                    "You can no longer update your submission."
            });
        }

        submission.Answer = request.Answer.Trim();
        submission.SubmittedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return int.TryParse(claim, out var userId)
            ? userId
            : null;
    }
}