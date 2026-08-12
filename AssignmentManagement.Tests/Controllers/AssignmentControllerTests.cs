using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Assignments;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Tests.Controllers;

public class AssignmentControllerTests
{
    private static AssignmentsController CreateController(
        AppDbContext db,
        int userId,
        string role)
    {
        var controller = new AssignmentsController(db);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = TestUser.Create(
                    userId,
                    $"user{userId}",
                    role)
            }
        };

        return controller;
    }

    private static async Task SeedTeacherAssignment(
        AppDbContext db)
    {
        var teacher = new User
        {
            Id = 1,
            Name = "Teacher",
            Email = "teacher@test.com",
            PasswordHash = "hash",
            Role = UserRole.Teacher
        };

        var classEntity = new Class
        {
            Id = 1,
            Name = "Class 10"
        };

        var subject = new Subject
        {
            Id = 1,
            Name = "Mathematics"
        };

        db.Users.Add(teacher);
        db.Classes.Add(classEntity);
        db.Subjects.Add(subject);

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 1,
                TeacherId = 1,
                ClassId = 1,
                SubjectId = 1
            });

        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task Teacher_Should_Create_Draft_Assignment()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller = CreateController(
            db,
            1,
            "Teacher");

        var request = new CreateAssignmentRequest
        {
            TeacherAssignmentId = 1,
            Title = "Algebra Test",
            Description = "Solve algebra problems.",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100
        };

        var result = await controller.Create(request);

        result.Result.Should().BeOfType<
            CreatedAtActionResult>();

        var assignment = db.Assignments.Single();

        assignment.Title.Should().Be("Algebra Test");
        assignment.Status.Should().Be(
            AssignmentStatus.Draft);
    }

    [Fact]
    public async Task Teacher_Should_Not_Create_Assignment_For_Another_Teacher()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller = CreateController(
            db,
            999,
            "Teacher");

        var request = new CreateAssignmentRequest
        {
            TeacherAssignmentId = 1,
            Title = "Unauthorized Assignment",
            Description = "Should fail.",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100
        };

        var result = await controller.Create(request);

        result.Result.Should().BeOfType<ForbidResult>();

        db.Assignments.Should().BeEmpty();
    }

    [Fact]
    public async Task Teacher_Should_Not_Update_Another_Teacher_Assignment()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        db.Assignments.Add(new Assignment
        {
            Id = 1,
            TeacherAssignmentId = 1,
            Title = "Original",
            Description = "Original description",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft
        });

        await db.SaveChangesAsync();

        var controller = CreateController(
            db,
            999,
            "Teacher");

        var request = new UpdateAssignmentRequest
        {
            Title = "Hacked",
            Description = "Changed",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100
        };

        var result = await controller.Update(1, request);

        result.Should().BeOfType<ForbidResult>();

        var assignment = await db.Assignments.FindAsync(1);

        assignment!.Title.Should().Be("Original");
    }

    [Fact]
    public async Task Published_Assignment_Should_Not_Be_Deleted()
    {
        await using var db = TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        db.Assignments.Add(new Assignment
        {
            Id = 1,
            TeacherAssignmentId = 1,
            Title = "Published Assignment",
            Description = "Test",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100,
            Status = AssignmentStatus.Published
        });

        await db.SaveChangesAsync();

        var controller = CreateController(
            db,
            1,
            "Teacher");

        var result = await controller.Delete(1);

        result.Should().BeOfType<BadRequestObjectResult>();

        db.Assignments.Should().ContainSingle();
    }
}