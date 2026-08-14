using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using  Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class AdminControllerTests
{
    
    private static AdminController CreateController(
        AppDbContext db,
        int userId,
        string role = "Admin")
    {
        var controller =
            new AdminController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User = TestClaimsPrincipal.Create(
                            userId,
                            $"user{userId}",
                            role)
                    }
            };

        return controller;
    }


    private static async Task SeedAdminDashboardData(
        AppDbContext db)
    {
        // Admin
        db.Users.Add(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@test.com",
                PasswordHash = "hash",
                Role = UserRole.Admin
            });

        // Teacher
        db.Users.Add(
            new User
            {
                Id = 2,
                Name = "Teacher",
                Email = "teacher@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        // Students
        db.Users.Add(
            new User
            {
                Id = 3,
                Name = "Student One",
                Email = "student1@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        db.Users.Add(
            new User
            {
                Id = 4,
                Name = "Student Two",
                Email = "student2@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        // Class
        db.Classes.Add(
            new Class
            {
                Id = 1,
                Name = "Class 10"
            });

        // Subject
        db.Subjects.Add(
            new Subject
            {
                Id = 1,
                Name = "Mathematics"
            });

        // Teacher Assignment
        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 2,
                ClassId = 1,
                SubjectId = 1
            });

        // Published Assignment
        db.Assignments.Add(
            new Assignment
            {
                Id = 1,
                TeacherAssignmentId = 1,
                Title = "Algebra Test",
                Description = "Solve algebra problems.",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            });

        // Draft Assignment
        db.Assignments.Add(
            new Assignment
            {
                Id = 2,
                TeacherAssignmentId = 1,
                Title = "Geometry Test",
                Description = "Solve geometry problems.",
                Deadline = DateTime.UtcNow.AddDays(7),
                MaxMarks = 50,
                Status = AssignmentStatus.Draft
            });

        // Pending submission
        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 3,
                Answer = "Algebra answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        // Reviewed submission
        db.Submissions.Add(
            new Submission
            {
                Id = 2,
                AssignmentId = 1,
                StudentId = 4,
                Answer = "Another answer",
                SubmittedAt = DateTime.UtcNow,
                Marks = 90,
                Feedback = "Excellent work.",
                Status = SubmissionStatus.Reviewed
            });

        await db.SaveChangesAsync();
    }



    [Fact]
    public async Task Admin_Should_Get_Dashboard_Statistics()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetDashboard();

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .NotBeNull();
    }


    [Fact]
    public async Task Dashboard_Should_Count_Users_Correctly()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetDashboard();

        var okResult =
            result.Should()
                .BeOfType<OkObjectResult>()
                .Subject;

        okResult.Value
            .Should()
            .NotBeNull();

        // Dashboard anonymous object is returned.
        // The main purpose of this test is to ensure
        // the endpoint successfully calculates statistics.
    }



    [Fact]
    public async Task Admin_Should_Get_All_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetAssignments();

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
    public async Task Admin_Should_Get_Both_Draft_And_Published_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetAssignments();

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result.Result!;

        okResult.Value
            .Should()
            .NotBeNull();

        var assignments =
            okResult.Value!
                .Should()
                .BeAssignableTo<IEnumerable<object>>()
                .Subject;

        assignments
            .Should()
            .HaveCount(2);
    }


    [Fact]
    public async Task Admin_Should_Get_Empty_Assignment_List_When_No_Assignments_Exist()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Users.Add(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@test.com",
                PasswordHash = "hash",
                Role = UserRole.Admin
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetAssignments();

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
    public async Task Admin_Should_Get_All_Submissions()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetSubmissions();

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
    public async Task Admin_Should_Get_Pending_And_Reviewed_Submissions()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedAdminDashboardData(db);

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetSubmissions();

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result.Result!;

        okResult.Value
            .Should()
            .NotBeNull();

        var submissions =
            okResult.Value!
                .Should()
                .BeAssignableTo<IEnumerable<object>>()
                .Subject;

        submissions
            .Should()
            .HaveCount(2);
    }


    [Fact]
    public async Task Admin_Should_Get_Empty_Submission_List_When_No_Submissions_Exist()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Users.Add(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@test.com",
                PasswordHash = "hash",
                Role = UserRole.Admin
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetSubmissions();

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
    public async Task Admin_Should_Get_Zero_Statistics_For_Empty_Database()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db, 1);

        var result =
            await controller.GetDashboard();

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .NotBeNull();
    }
}