using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class ClassesControllerTests
{
    private static ClassesController CreateController(
        AppDbContext db)
    {
        var controller = new ClassesController(db);

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
    public async Task Admin_Should_Get_All_Classes()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Classes.AddRange(
            new Class
            {
                Id = 1,
                Name = "Class 10"
            },
            new Class
            {
                Id = 2,
                Name = "Class 9"
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.GetClasses();

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
    public async Task GetClasses_Should_Return_Empty_List_When_No_Classes_Exist()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var result =
            await controller.GetClasses();

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
    public async Task Admin_Should_Create_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateClassRequest
            {
                Name = "  Class 10  "
            };

        var result =
            await controller.CreateClass(request);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();

        var createdClass =
            db.Classes.Single();

        createdClass.Name
            .Should()
            .Be("Class 10");
    }


    [Fact]
    public async Task CreateClass_Should_Reject_Empty_Name()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateClassRequest
            {
                Name = "   "
            };

        var result =
            await controller.CreateClass(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Classes
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task CreateClass_Should_Reject_Duplicate_Name()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Classes.Add(
            new Class
            {
                Id = 1,
                Name = "Class 10"
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var request =
            new CreateClassRequest
            {
                Name = "Class 10"
            };

        var result =
            await controller.CreateClass(request);

        result.Result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Classes
            .Should()
            .ContainSingle();
    }


    [Fact]
    public async Task Admin_Should_Delete_Empty_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        db.Classes.Add(
            new Class
            {
                Id = 1,
                Name = "Class 10"
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<NoContentResult>();

        db.Classes
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Delete_Should_Return_NotFound_For_Missing_Class()
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
    public async Task Class_With_Teacher_Assignment_Should_Not_Be_Deleted()
    {
        await using var db =
            TestDbContextFactory.Create();

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

        db.Subjects.Add(
            new Subject
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

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Classes
            .Should()
            .ContainSingle();
    }


    [Fact]
    public async Task Class_With_Students_Should_Not_Be_Deleted()
    {
        await using var db =
            TestDbContextFactory.Create();

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
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Classes
            .Should()
            .ContainSingle();
    }
}