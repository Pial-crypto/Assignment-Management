using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Assignments;
using AssignmentManagement.Api.DTOs.Submissions;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalUsers = await _db.Users.CountAsync();

        var totalTeachers = await _db.Users
            .CountAsync(x => x.Role == UserRole.Teacher);

        var totalStudents = await _db.Users
            .CountAsync(x => x.Role == UserRole.Student);

        var totalClasses = await _db.Classes.CountAsync();

        var totalSubjects = await _db.Subjects.CountAsync();

        var totalAssignments = await _db.Assignments.CountAsync();

        var publishedAssignments = await _db.Assignments
            .CountAsync(x => x.Status == AssignmentStatus.Published);

        var draftAssignments = await _db.Assignments
            .CountAsync(x => x.Status == AssignmentStatus.Draft);

        var totalSubmissions = await _db.Submissions.CountAsync();

        var pendingSubmissions = await _db.Submissions
            .CountAsync(x => x.Status == SubmissionStatus.Pending);

        var reviewedSubmissions = await _db.Submissions
            .CountAsync(x => x.Status == SubmissionStatus.Reviewed);

        return Ok(new
        {
            users = new
            {
                total = totalUsers,
                teachers = totalTeachers,
                students = totalStudents
            },

            classes = totalClasses,

            subjects = totalSubjects,

            assignments = new
            {
                total = totalAssignments,
                published = publishedAssignments,
                draft = draftAssignments
            },

            submissions = new
            {
                total = totalSubmissions,
                pending = pendingSubmissions,
                reviewed = reviewedSubmissions
            }
        });
    }

    [HttpGet("assignments")]
    public async Task<ActionResult<IEnumerable<AssignmentResponse>>>
        GetAssignments()
    {
        var assignments = await _db.Assignments
            .AsNoTracking()
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Teacher)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Class)
            .Include(x => x.TeacherAssignment)
                .ThenInclude(x => x.Subject)
            .Select(x => new AssignmentResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Deadline = x.Deadline,
                MaxMarks = x.MaxMarks,
                Status = x.Status,
                TeacherAssignmentId = x.TeacherAssignmentId,
                TeacherId = x.TeacherAssignment.TeacherId,
                TeacherName = x.TeacherAssignment.Teacher.Name,
                ClassId = x.TeacherAssignment.ClassId,
                ClassName = x.TeacherAssignment.Class.Name,
                SubjectId = x.TeacherAssignment.SubjectId,
                SubjectName = x.TeacherAssignment.Subject.Name,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();

        return Ok(assignments);
    }

    [HttpGet("submissions")]
    public async Task<ActionResult<IEnumerable<SubmissionResponse>>>
        GetSubmissions()
    {
        var submissions = await _db.Submissions
            .AsNoTracking()
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
}