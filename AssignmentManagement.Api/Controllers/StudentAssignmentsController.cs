using System.Security.Claims;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/student")]
[Authorize(Roles = "Student")]
public class StudentController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentController(AppDbContext db)
    {
        _db = db;
    }


    [HttpGet("assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
        {
            return Unauthorized();
        }

        var student = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == studentId.Value);

        if (student is null)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        if (student.ClassId is null)
        {
            return Ok(Array.Empty<object>());
        }

        var assignments = await _db.Assignments
            .AsNoTracking()
            .Where(x =>
                x.Status == AssignmentStatus.Published &&
                x.TeacherAssignment.ClassId ==
                student.ClassId.Value)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Class)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject)
            .OrderBy(x => x.Deadline)
            .ToListAsync();

        var assignmentIds =
            assignments.Select(x => x.Id).ToList();

        var submissions = await _db.Submissions
            .AsNoTracking()
            .Where(x =>
                x.StudentId == studentId.Value &&
                assignmentIds.Contains(x.AssignmentId))
            .ToListAsync();

        var result = assignments.Select(assignment =>
        {
            var submission = submissions
                .FirstOrDefault(
                    x => x.AssignmentId == assignment.Id);

            return new
            {
                id = assignment.Id,

                title = assignment.Title,

                description = assignment.Description,

                deadline = assignment.Deadline,

                maxMarks = assignment.MaxMarks,

                status = assignment.Status.ToString(),

                classId =
                    assignment.TeacherAssignment.ClassId,

                className =
                    assignment.TeacherAssignment.Class.Name,

                subjectId =
                    assignment.TeacherAssignment.SubjectId,

                subjectName =
                    assignment.TeacherAssignment.Subject.Name,

                teacherId =
                    assignment.TeacherAssignment.TeacherId,

                teacherName =
                    assignment.TeacherAssignment.Teacher.Name,

                submissionId =
                    submission?.Id,

                submissionStatus =
                    submission?.Status.ToString(),

                submittedAt =
                    submission?.SubmittedAt,

                marks =
                    submission?.Marks,

                feedback =
                    submission?.Feedback
            };
        });

        return Ok(result);
    }


    [HttpGet("assignments/{id:int}")]
    public async Task<IActionResult> GetAssignment(int id)
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
        {
            return Unauthorized();
        }

        var student = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == studentId.Value);

        if (student is null)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        if (student.ClassId is null)
        {
            return Forbid();
        }

        var assignment = await _db.Assignments
            .AsNoTracking()
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Class)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.Status == AssignmentStatus.Published);

        if (assignment is null)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        if (
            assignment.TeacherAssignment.ClassId !=
            student.ClassId.Value
        )
        {
            return Forbid();
        }

        var submission = await _db.Submissions
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.AssignmentId == id &&
                x.StudentId == studentId.Value);

        return Ok(new
        {
            id = assignment.Id,

            title = assignment.Title,

            description = assignment.Description,

            deadline = assignment.Deadline,

            maxMarks = assignment.MaxMarks,

            status = assignment.Status.ToString(),

            classId =
                assignment.TeacherAssignment.ClassId,

            className =
                assignment.TeacherAssignment.Class.Name,

            subjectId =
                assignment.TeacherAssignment.SubjectId,

            subjectName =
                assignment.TeacherAssignment.Subject.Name,

            teacherId =
                assignment.TeacherAssignment.TeacherId,

            teacherName =
                assignment.TeacherAssignment.Teacher.Name,

            submissionId =
                submission?.Id,

            submissionStatus =
                submission?.Status.ToString(),

            submittedAt =
                submission?.SubmittedAt,

            marks =
                submission?.Marks,

            feedback =
                submission?.Feedback
        });
    }


    [HttpGet("submissions/{assignmentId:int}")]
    public async Task<IActionResult> GetMySubmission(
        int assignmentId)
    {
        var studentId = GetCurrentUserId();

        if (studentId is null)
        {
            return Unauthorized();
        }

        var submission = await _db.Submissions
            .AsNoTracking()
            .Include(x => x.Assignment)
            .FirstOrDefaultAsync(x =>
                x.AssignmentId == assignmentId &&
                x.StudentId == studentId.Value);

        if (submission is null)
        {
            return NotFound(new
            {
                message = "Submission not found."
            });
        }

        return Ok(new
        {
            id = submission.Id,

            assignmentId =
                submission.AssignmentId,

            assignmentTitle =
                submission.Assignment.Title,

            answer = submission.Answer,

            submittedAt =
                submission.SubmittedAt,

            marks =
                submission.Marks,

            feedback =
                submission.Feedback,

            status =
                submission.Status.ToString(),

            deadline =
                submission.Assignment.Deadline,

            maxMarks =
                submission.Assignment.MaxMarks
        });
    }


 
    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (int.TryParse(value, out var id))
        {
            return id;
        }

        return null;
    }
}