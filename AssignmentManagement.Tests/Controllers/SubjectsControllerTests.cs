using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Subjects;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class SubjectsControllerTests
{
    private static SubjectsController CreateController(
        AppDbContext db)
    {
        var controller = new SubjectsController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            TestClaimsPrincipal.Create(
                                1,
                                "Admin",
                                "System Admin")
                    }
            };

        return controller;
    }


    

    [Fact]
    public async Task Admin_Should_Get_All_Subjects()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Subjects.AddRange(
            new Subject
            {
                Id = 1,
                Name = "Mathematics"
            },
            new Subject
            {
                Id = 2,
                Name = "Physics"
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
    public async Task GetAll_Should_Return_Empty_List_When_No_Subjects_Exist()
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
    public async Task Admin_Should_Create_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateSubjectRequest
            {
                Name = "  Mathematics  "
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var subject =
            db.Subjects.Single();

        subject.Name
            .Should()
            .Be("Mathematics");
    }


    [Fact]
    public async Task Create_Should_Reject_Empty_Subject_Name()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateSubjectRequest
            {
                Name = "   "
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Subjects
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_Duplicate_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Subjects.Add(
            new Subject
            {
                Id = 1,
                Name = "Mathematics"
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var request =
            new CreateSubjectRequest
            {
                Name = "Mathematics"
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Subjects
            .Should()
            .ContainSingle();
    }




    [Fact]
    public async Task Admin_Should_Delete_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Subjects.Add(
            new Subject
            {
                Id = 1,
                Name = "Mathematics"
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<NoContentResult>();

        db.Subjects
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Delete_Should_Return_NotFound_For_Missing_Subject()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(999);

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }


    [Fact]


    

public async Task Subject_Assigned_To_Teacher_Should_Not_Be_Deleted()
{
    await using var connection =
        new Microsoft.Data.Sqlite.SqliteConnection(
            "DataSource=:memory:");

    await connection.OpenAsync();

    await using (var command = connection.CreateCommand())
    {
        command.CommandText =
            "PRAGMA foreign_keys = ON;";

        await command.ExecuteNonQueryAsync();
    }

    var options =
        new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

    await using var db =
        new AppDbContext(options);

    await db.Database.EnsureCreatedAsync();

    db.Subjects.Add(
        new Subject
        {
            Id = 1,
            Name = "Mathematics"
        });

    db.Classes.Add(
        new Class
        {
            Id = 1,
            Name = "Class 10"
        });

    db.Users.Add(
        new User
        {
            Id = 1,
            Name = "Teacher",
            Email = "teacher@test.com",
            PasswordHash = "hash",
            Role = UserRole.Teacher
        });

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
        .BeOfType<ObjectResult>();

    var objectResult =
        (ObjectResult)result;

    objectResult.StatusCode
        .Should()
        .Be(500);

    db.Subjects
        .Should()
        .ContainSingle();

    db.Subjects
        .Single()
        .Name
        .Should()
        .Be("Mathematics");
}
}