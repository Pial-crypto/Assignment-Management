using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Users;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class UsersControllerTests
{    private static UsersController CreateController(
        AppDbContext db,
        int userId = 1,
        string role = "Admin")
    {
        var controller =
            new UsersController(db);

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


   
    private static async Task SeedClass(
        AppDbContext db)
    {
        db.Classes.Add(
            new Class
            {
                Id = 1,
                Name = "Class 10"
            });

        await db.SaveChangesAsync();
    }


    private static async Task SeedUsers(
        AppDbContext db)
    {
        db.Users.AddRange(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@test.com",
                PasswordHash = "hash",
                Role = UserRole.Admin
            },
            new User
            {
                Id = 2,
                Name = "Teacher",
                Email = "teacher@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            },
            new User
            {
                Id = 3,
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        await db.SaveChangesAsync();
    }




    [Fact]
    public async Task Admin_Should_Get_All_Users()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

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
    public async Task GetAll_Should_Return_Empty_List_When_No_Users_Exist()
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
    public async Task Admin_Should_Get_User_By_Id()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var result =
            await controller.GetById(3);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task GetById_Should_Return_NotFound_For_Missing_User()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var result =
            await controller.GetById(999);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }


  
    [Fact]
    public async Task Admin_Should_Create_Student_With_Valid_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "New Student",
                Email = "newstudent@test.com",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        var user =
            db.Users.Single();

        user.Name
            .Should()
            .Be("New Student");

        user.Email
            .Should()
            .Be("newstudent@test.com");

        user.Role
            .Should()
            .Be(UserRole.Student);

        user.ClassId
            .Should()
            .Be(1);

        user.PasswordHash
            .Should()
            .NotBe("Password123!");

        user.PasswordHash
            .Should()
            .NotBeNullOrWhiteSpace();
    }


    [Fact]
    public async Task Admin_Should_Create_Teacher_Without_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "New Teacher",
                Email = "newteacher@test.com",
                Password = "Password123!",
                Role = UserRole.Teacher,
                ClassId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        var user =
            db.Users.Single();

        user.Role
            .Should()
            .Be(UserRole.Teacher);

        // Controller must clear ClassId
        user.ClassId
            .Should()
            .BeNull();
    }


    [Fact]
    public async Task Admin_Should_Create_Admin_Without_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "Another Admin",
                Email = "anotheradmin@test.com",
                Password = "Password123!",
                Role = UserRole.Admin,
                ClassId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        var user =
            db.Users.Single();

        user.Role
            .Should()
            .Be(UserRole.Admin);

        user.ClassId
            .Should()
            .BeNull();
    }


    [Fact]
    public async Task Student_Should_Not_Be_Created_Without_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "Student Without Class",
                Email = "noclass@test.com",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = null
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Users
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Student_Should_Not_Be_Created_With_Invalid_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "Invalid Class Student",
                Email = "invalidclass@test.com",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = 999
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Users
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Admin_Should_Not_Create_Duplicate_Email()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "Duplicate",
                Email = "student@test.com",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = 1
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ConflictObjectResult>();

        db.Users
            .Should()
            .HaveCount(3);
    }


    [Fact]
    public async Task Create_Should_Normalize_Email()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "New Student",
                Email = "  NEWSTUDENT@TEST.COM  ",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = 1
            };

        await SeedClass(db);

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        var user =
            db.Users.Single();

        user.Email
            .Should()
            .Be("newstudent@test.com");
    }


    [Fact]
    public async Task Create_Should_Trim_User_Name()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);

        var controller =
            CreateController(db);

        var request =
            new CreateUserRequest
            {
                Name = "   John Doe   ",
                Email = "john@test.com",
                Password = "Password123!",
                Role = UserRole.Student,
                ClassId = 1
            };

        await controller.Create(request);

        var user =
            db.Users.Single();

        user.Name
            .Should()
            .Be("John Doe");
    }


    [Fact]
    public async Task Admin_Should_Update_User()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Updated Student",
                Email = "updated@test.com",
                Role = UserRole.Student,
                ClassId = 1
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var user =
            await db.Users.FindAsync(3);

        user!
            .Name
            .Should()
            .Be("Updated Student");

        user.Email
            .Should()
            .Be("updated@test.com");

        user.Role
            .Should()
            .Be(UserRole.Student);

        user.ClassId
            .Should()
            .Be(1);
    }


    [Fact]
    public async Task Update_Should_Return_NotFound_For_Missing_User()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Updated",
                Email = "updated@test.com",
                Role = UserRole.Teacher,
                ClassId = null
            };

        var result =
            await controller.Update(999, request);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }


    [Fact]
    public async Task Admin_Should_Not_Update_To_Duplicate_Email()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Updated Student",
                Email = "teacher@test.com",
                Role = UserRole.Student,
                ClassId = 1
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<ConflictObjectResult>();

        var user =
            await db.Users.FindAsync(3);

        user!
            .Email
            .Should()
            .Be("student@test.com");
    }


    [Fact]
    public async Task Student_Should_Not_Be_Updated_Without_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Student Updated",
                Email = "studentupdated@test.com",
                Role = UserRole.Student,
                ClassId = null
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var user =
            await db.Users.FindAsync(3);

        user!
            .ClassId
            .Should()
            .Be(1);
    }


    [Fact]
    public async Task Student_Should_Not_Be_Updated_To_Invalid_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Student Updated",
                Email = "studentupdated@test.com",
                Role = UserRole.Student,
                ClassId = 999
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();
    }


    [Fact]
    public async Task Updating_Teacher_Should_Clear_ClassId()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Student Now Teacher",
                Email = "student@test.com",
                Role = UserRole.Teacher,
                ClassId = 1
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var user =
            await db.Users.FindAsync(3);

        user!
            .Role
            .Should()
            .Be(UserRole.Teacher);

        user.ClassId
            .Should()
            .BeNull();
    }


    [Fact]
    public async Task Update_Should_Normalize_Email()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var request =
            new UpdateUserRequest
            {
                Name = "Updated Student",
                Email = "  UPDATED@TEST.COM  ",
                Role = UserRole.Student,
                ClassId = 1
            };

        var result =
            await controller.Update(3, request);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var user =
            await db.Users.FindAsync(3);

        user!
            .Email
            .Should()
            .Be("updated@test.com");
    }


 

    [Fact]
    public async Task Admin_Should_Delete_User()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedClass(db);
        await SeedUsers(db);

        var controller =
            CreateController(db);

        var result =
            await controller.Delete(3);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var user =
            await db.Users.FindAsync(3);

        user
            .Should()
            .BeNull();
    }


    [Fact]
    public async Task Delete_Should_Return_NotFound_For_Missing_User()
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
}