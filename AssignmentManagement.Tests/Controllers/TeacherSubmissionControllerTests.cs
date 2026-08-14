using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Submissions;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class TeacherSubmissionControllerTests
{
    

    private static TeacherSubmissionsController CreateController(
        AppDbContext db,
        int teacherId)
    {
        var controller =
            new TeacherSubmissionsController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                     User = TestClaimsPrincipal.Create(
    teacherId,
    "Teacher",
    $"teacher{teacherId}")
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
            Name = "Teacher One",
            Email = "teacher@test.com",
            PasswordHash = "hash",
            Role = UserRole.Teacher
        });

        db.Users.Add(new User
        {
            Id = 2,
            Name = "Student One",
            Email = "student@test.com",
            PasswordHash = "hash",
            Role = UserRole.Student,
            ClassId = 1
        });

        db.Users.Add(new User
        {
            Id = 3,
            Name = "Student Two",
            Email = "student2@test.com",
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
            Name = "Mathematics"
        });

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            });

        db.Assignments.Add(
            new Assignment
            {
                Id = 1,
                TeacherAssignmentId = 1,
                Title = "Algebra Assignment",
                Description = "Solve algebra problems.",
                Deadline = DateTime.UtcNow.AddDays(1),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            });

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "My algebra answer.",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();
    }


    

    [Fact]
    public async Task Teacher_Should_Get_Assignment_Submissions()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetAssignmentSubmissions(1);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result.Result!;

        okResult.Value
            .Should()
            .NotBeNull();
    }


    [Fact]
    public async Task Teacher_Should_Not_Get_Another_Teachers_Assignment_Submissions()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        // Another teacher
        db.Users.Add(
            new User
            {
                Id = 99,
                Name = "Other Teacher",
                Email = "otherteacher@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 99);

        var result =
            await controller.GetAssignmentSubmissions(1);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();
    }


    [Fact]
    public async Task Teacher_Should_Get_NotFound_For_NonExisting_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetAssignmentSubmissions(999);

        result.Result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }



    [Fact]
    public async Task Teacher_Should_Get_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetSubmission(1);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result.Result!;

        okResult.Value
            .Should()
            .NotBeNull();
    }


    [Fact]
    public async Task Teacher_Should_Not_Get_Another_Teachers_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        db.Users.Add(
            new User
            {
                Id = 99,
                Name = "Other Teacher",
                Email = "otherteacher@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 99);

        var result =
            await controller.GetSubmission(1);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();
    }


    [Fact]
    public async Task Teacher_Should_Get_NotFound_For_NonExisting_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetSubmission(999);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }


    [Fact]
    public async Task Teacher_Should_Review_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 85,
                Feedback = "Good work.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .Be(85);

        submission!
            .Feedback
            .Should()
            .Be("Good work.");

        submission!
            .Status
            .Should()
            .Be(SubmissionStatus.Reviewed);
    }


    [Fact]
    public async Task Teacher_Should_Allow_Zero_Marks()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 0,
                Feedback = "No marks.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .Be(0);
    }


    [Fact]
    public async Task Teacher_Should_Not_Give_Negative_Marks()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = -1,
                Feedback = "Invalid marks.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .BeNull();

        submission!
            .Status
            .Should()
            .Be(SubmissionStatus.Pending);
    }


    [Fact]
    public async Task Teacher_Should_Not_Give_More_Than_MaxMarks()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 101,
                Feedback = "Invalid marks.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .BeNull();

        submission!
            .Status
            .Should()
            .Be(SubmissionStatus.Pending);
    }


    [Fact]
    public async Task Teacher_Should_Be_Able_To_Set_Pending_Status()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 50,
                Feedback = "Needs improvement.",
                Status = SubmissionStatus.Pending
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Status
            .Should()
            .Be(SubmissionStatus.Pending);

        submission!
            .Marks
            .Should()
            .Be(50);
    }


    [Fact]
    public async Task Teacher_Should_Not_Review_Another_Teachers_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        db.Users.Add(
            new User
            {
                Id = 99,
                Name = "Other Teacher",
                Email = "otherteacher@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 99);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 90,
                Feedback = "Unauthorized review.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<ForbidResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .BeNull();

        submission!
            .Status
            .Should()
            .Be(SubmissionStatus.Pending);
    }


    [Fact]
    public async Task Teacher_Should_Return_NotFound_For_NonExisting_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 80,
                Feedback = "Good.",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(999, request);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }


    [Fact]
    public async Task Teacher_Should_Reject_Feedback_Over_2000_Characters()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var longFeedback =
            new string('A', 2001);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 80,
                Feedback = longFeedback,
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Marks
            .Should()
            .BeNull();

        submission!
            .Feedback
            .Should()
            .BeNull();
    }


    [Fact]
    public async Task Teacher_Should_Accept_Feedback_Of_Exactly_2000_Characters()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var feedback =
            new string('A', 2000);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 80,
                Feedback = feedback,
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Feedback
            .Should()
            .HaveLength(2000);
    }


    [Fact]
    public async Task Teacher_Should_Trim_Feedback()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 90,
                Feedback = "   Excellent work.   ",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Feedback
            .Should()
            .Be("Excellent work.");
    }


    [Fact]
    public async Task Teacher_Should_Store_Null_When_Feedback_Is_Empty()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedSubmission(db);

        var controller =
            CreateController(db, 1);

        var request =
            new ReviewSubmissionRequest
            {
                Marks = 75,
                Feedback = "   ",
                Status = SubmissionStatus.Reviewed
            };

        var result =
            await controller.Review(1, request);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Feedback
            .Should()
            .BeNull();
    }
}