using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Submissions;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Tests.Controllers;

public class TeacherSubmissionControllerTests
{
    private static TeacherSubmissionsController CreateController(
        AppDbContext db,
        int teacherId)
    {
        var controller =
            new TeacherSubmissionsController(db);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = TestUser.Create(
                    teacherId,
                    "Teacher",
                    "Teacher")
            }
        };

        return controller;
    }

    private static async Task SeedSubmission(
        AppDbContext db)
    {
        db.Users.Add(new User
        {
            Id = 1,
            Name = "Teacher",
            Email = "teacher@test.com",
            PasswordHash = "hash",
            Role = UserRole.Teacher
        });

        db.Users.Add(new User
        {
            Id = 2,
            Name = "Student",
            Email = "student@test.com",
            PasswordHash = "hash",
            Role = UserRole.Student,
            ClassId = 1
        });

        db.Classes.Add(new Class
        {
            Id = 1,
            Name = "Class 10"
        });

        db.Subjects.Add(new Subject
        {
            Id = 1,
            Name = "Math"
        });

        db.TeacherAssignments.Add(new TeacherAssignment
        {
            Id = 1,
            TeacherId = 1,
            ClassId = 1,
            SubjectId = 1
        });

        db.Assignments.Add(new Assignment
        {
            Id = 1,
            TeacherAssignmentId = 1,
            Title = "Algebra",
            Description = "Test",
            Deadline = DateTime.UtcNow.AddDays(1),
            MaxMarks = 100,
            Status = AssignmentStatus.Published
        });

        db.Submissions.Add(new Submission
        {
            Id = 1,
            AssignmentId = 1,
            StudentId = 2,
            Answer = "Student answer",
            SubmittedAt = DateTime.UtcNow,
            Status = SubmissionStatus.Pending
        });

        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task Teacher_Should_Review_Submission()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller = CreateController(db, 1);

        var request = new ReviewSubmissionRequest
        {
            Marks = 85,
            Feedback = "Good work.",
            Status = SubmissionStatus.Reviewed
        };

        var result = await controller.Review(1, request);

        result.Should().BeOfType<OkObjectResult>();

        var submission = await db.Submissions.FindAsync(1);

        submission!.Marks.Should().Be(85);
        submission.Feedback.Should().Be("Good work.");
        submission.Status.Should().Be(
            SubmissionStatus.Reviewed);
    }

    [Fact]
    public async Task Teacher_Should_Not_Give_More_Than_MaxMarks()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller = CreateController(db, 1);

        var request = new ReviewSubmissionRequest
        {
            Marks = 101,
            Feedback = "Invalid",
            Status = SubmissionStatus.Reviewed
        };

        var result = await controller.Review(1, request);

        result.Should().BeOfType<BadRequestObjectResult>();

        var submission = await db.Submissions.FindAsync(1);

        submission!.Marks.Should().BeNull();
    }

    [Fact]
    public async Task Teacher_Should_Not_Give_Negative_Marks()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller = CreateController(db, 1);

        var request = new ReviewSubmissionRequest
        {
            Marks = -5,
            Feedback = "Invalid",
            Status = SubmissionStatus.Reviewed
        };

        var result = await controller.Review(1, request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Another_Teacher_Should_Not_Review_Submission()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller = CreateController(db, 999);

        var request = new ReviewSubmissionRequest
        {
            Marks = 90,
            Feedback = "Unauthorized",
            Status = SubmissionStatus.Reviewed
        };

        var result = await controller.Review(1, request);

        result.Should().BeOfType<ForbidResult>();

        var submission = await db.Submissions.FindAsync(1);

        submission!.Marks.Should().BeNull();
        submission.Status.Should().Be(
            SubmissionStatus.Pending);
    }
}