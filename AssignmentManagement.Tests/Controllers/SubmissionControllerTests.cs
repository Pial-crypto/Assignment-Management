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

public class SubmissionControllerTests
{
    private static SubmissionsController CreateController(
        AppDbContext db,
        int studentId)
    {
        var controller = new SubmissionsController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User = TestClaimsPrincipal.Create(
    studentId,
    "Student",
    "Student")
                    }
            };

        return controller;
    }

    private static async Task SeedPublishedAssignment(
        AppDbContext db,
        DateTime deadline)
    {
        db.Users.Add(new User
        {
            Id = 1,
            Name = "Student One",
            Email = "student@test.com",
            PasswordHash = "hash",
            Role = UserRole.Student,
            ClassId = 1
        });

        db.Users.Add(new User
        {
            Id = 2,
            Name = "Other Student",
            Email = "other@test.com",
            PasswordHash = "hash",
            Role = UserRole.Student,
            ClassId = 1
        });

        db.Users.Add(new User
        {
            Id = 10,
            Name = "Teacher",
            Email = "teacher@test.com",
            PasswordHash = "hash",
            Role = UserRole.Teacher
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
                TeacherId = 10,
                ClassId = 1,
                SubjectId = 1
            });

        db.Assignments.Add(
            new Assignment
            {
                Id = 1,
                TeacherAssignmentId = 1,
                Title = "Algebra Assignment",
                Description = "Solve the algebra problems.",
                Deadline = deadline,
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            });

        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task Student_Should_Submit_Before_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 1,
                Answer = "My answer"
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        db.Submissions
            .Should()
            .ContainSingle();

        var submission =
            db.Submissions.Single();

        submission.StudentId
            .Should()
            .Be(1);

        submission.AssignmentId
            .Should()
            .Be(1);

        submission.Answer
            .Should()
            .Be("My answer");

        submission.Status
            .Should()
            .Be(SubmissionStatus.Pending);
    }

    [Fact]
    public async Task Student_Should_Not_Submit_After_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddMinutes(-10));

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 1,
                Answer = "Late answer"
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Submissions
            .Should()
            .BeEmpty();
    }

    [Fact]
    public async Task Student_Should_Not_Submit_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!.Status =
            AssignmentStatus.Draft;

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 1,
                Answer = "Should not be accepted."
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<NotFoundObjectResult>();

        db.Submissions
            .Should()
            .BeEmpty();
    }

    [Fact]
    public async Task Student_Should_Not_Submit_Twice()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "First answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 1,
                Answer = "Second answer"
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Submissions
            .Should()
            .ContainSingle();

        var submission =
            db.Submissions.Single();

        submission.Answer
            .Should()
            .Be("First answer");
    }

    [Fact]
    public async Task Student_Should_Not_Submit_Assignment_From_Another_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Classes.Add(
            new Class
            {
                Id = 2,
                Name = "Class 9"
            });

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 2,
                TeacherId = 10,
                ClassId = 2,
                SubjectId = 1
            });

        db.Assignments.Add(
            new Assignment
            {
                Id = 2,
                TeacherAssignmentId = 2,
                Title = "Class 9 Assignment",
                Description = "Other class assignment.",
                Deadline = DateTime.UtcNow.AddDays(1),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 2,
                Answer = "Unauthorized submission."
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();

        db.Submissions
            .Should()
            .BeEmpty();
    }

    [Fact]
    public async Task Student_Should_Not_Submit_With_Empty_Answer()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 1,
                Answer = "   "
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Submissions
            .Should()
            .BeEmpty();
    }

    [Fact]
    public async Task Student_Should_Not_Submit_NonExisting_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var controller =
            CreateController(db, 1);

        var request =
            new CreateSubmissionRequest
            {
                AssignmentId = 999,
                Answer = "Answer"
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<NotFoundObjectResult>();

        db.Submissions
            .Should()
            .BeEmpty();
    }

    [Fact]
    public async Task Student_Should_Get_Only_Their_Own_Submissions()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.AddRange(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "Student 1 answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            },
            new Submission
            {
                Id = 2,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "Student 2 answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetMySubmissions();

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
    public async Task Student_Should_Get_Their_Submission_By_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "My answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetMySubmission(1);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Student_Should_Not_Get_Another_Students_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "Other student's answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetMySubmission(1);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetMySubmission_Should_Return_NotFound_When_No_Submission_Exists()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetMySubmission(1);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Student_Should_Update_Before_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "Old answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "Updated answer"
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Answer
            .Should()
            .Be("Updated answer");
    }

    [Fact]
    public async Task Student_Should_Not_Update_After_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddMinutes(-10));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "Original answer",
                SubmittedAt =
                    DateTime.UtcNow.AddHours(-1),
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "Should not update"
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Answer
            .Should()
            .Be("Original answer");
    }

    [Fact]
    public async Task Student_Should_Not_Update_Another_Students_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "Student 2 answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "Hacked answer"
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<NotFoundResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Answer
            .Should()
            .Be("Student 2 answer");
    }

    [Fact]
    public async Task Student_Should_Not_Update_With_Empty_Answer()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "Original",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "   "
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Answer
            .Should()
            .Be("Original");
    }

    [Fact]
    public async Task Student_Should_Not_Update_Submission_For_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!.Status =
            AssignmentStatus.Draft;

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 1,
                Answer = "Original",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "Should not update"
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var submission =
            await db.Submissions.FindAsync(1);

        submission!
            .Answer
            .Should()
            .Be("Original");
    }

    [Fact]
    public async Task Student_Should_Not_Update_NonExisting_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedPublishedAssignment(
            db,
            DateTime.UtcNow.AddDays(1));

        var controller =
            CreateController(db, 1);

        var request =
            new UpdateSubmissionRequest
            {
                Answer = "Updated answer"
            };

        var result =
            await controller.Update(999, request);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }
}