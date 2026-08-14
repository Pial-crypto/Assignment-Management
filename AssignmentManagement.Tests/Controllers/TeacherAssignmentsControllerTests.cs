using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.TeacherAssignments;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class TeacherAssignmentsControllerTests
{
    private static TeacherAssignmentsController CreateController(
        AppDbContext db,
        int userId = 1,
        string role = "Admin")
    {
        var controller =
            new TeacherAssignmentsController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            TestClaimsPrincipal.Create(
                                userId,
                                role,
                                $"Test {role}")
                    }
            };

        return controller;
    }

    private static async Task SeedTeacher(
        AppDbContext db,
        int id = 1,
        string email = "teacher@test.com")
    {
        db.Users.Add(
            new User
            {
                Id = id,
                Name = $"Teacher {id}",
                Email = email,
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        await db.SaveChangesAsync();
    }

    private static async Task SeedClass(
        AppDbContext db,
        int id = 1)
    {
        db.Classes.Add(
            new Class
            {
                Id = id,
                Name = $"Class {id}"
            });

        await db.SaveChangesAsync();
    }

    private static async Task SeedSubject(
        AppDbContext db,
        int id = 1)
    {
        db.Subjects.Add(
            new Subject
            {
                Id = id,
                Name = id == 1
                    ? "Mathematics"
                    : $"Subject {id}"
            });

        await db.SaveChangesAsync();
    }


    

    [Fact]
    public async Task Admin_Should_Get_All_Teacher_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.GetAll();

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
    public async Task GetAll_Should_Return_Empty_List_When_No_Assignments_Exist()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var result =
            await controller.GetAll();

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
    public async Task Admin_Should_Assign_Teacher_To_Class_And_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        db.TeacherAssignments
            .Should()
            .ContainSingle();

        var assignment =
            db.TeacherAssignments.Single();

        assignment.TeacherId
            .Should()
            .Be(1);

        assignment.ClassId
            .Should()
            .Be(1);

        assignment.SubjectId
            .Should()
            .Be(1);
    }


    [Fact]
    public async Task Create_Should_Reject_User_Who_Is_Not_Teacher()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Users.Add(
            new User
            {
                Id = 1,
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.TeacherAssignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_NonExisting_Teacher()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 999,
                ClassId = 1,
                SubjectId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.TeacherAssignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_NonExisting_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedSubject(db, 1);

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 1,
                ClassId = 999,
                SubjectId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.TeacherAssignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_NonExisting_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedClass(db, 1);

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 999
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.TeacherAssignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Duplicate_Teacher_Assignment_Should_Be_Rejected()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var request =
            new CreateTeacherAssignmentRequest
            {
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.TeacherAssignments
            .Should()
            .ContainSingle();
    }




    [Fact]
    public async Task Admin_Should_Delete_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(db, 1);
        await SeedClass(db, 1);
        await SeedSubject(db, 1);

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<NoContentResult>();

        db.TeacherAssignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Delete_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(999);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }




    [Fact]
    public async Task Teacher_Should_Get_Only_Their_Own_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacher(
            db,
            1,
            "teacher1@test.com");

        await SeedTeacher(
            db,
            2,
            "teacher2@test.com");

        await SeedClass(db, 1);
        await SeedSubject(db, 1);
        await SeedSubject(db, 2);

        db.TeacherAssignments.AddRange(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            },
            new TeacherAssignment
            {
                Id = 2,
                TeacherId = 2,
                ClassId = 1,
                SubjectId = 2
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.GetMyAssignments();

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result.Result!;

        okResult.Value
            .Should()
            .NotBeNull();

        var assignments =
            ((IEnumerable<TeacherAssignmentResponse>)
                okResult.Value!)
            .ToList();

        assignments
            .Should()
            .ContainSingle();

        assignments[0]
            .TeacherId
            .Should()
            .Be(1);
    }


    [Fact]
    public async Task Teacher_Should_Return_Unauthorized_When_TeacherId_Claim_Is_Missing()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            new TeacherAssignmentsController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext()
            };

        var result =
            await controller.GetMyAssignments();

        result.Result
            .Should()
            .BeOfType<UnauthorizedResult>();
    }
}