using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Assignments;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class AssignmentsControllerTests
{
   

    private static AssignmentsController CreateController(
        AppDbContext db,
        int userId,
        string role)
    {
        var controller =
            new AssignmentsController(db);

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




    private static async Task SeedTeacherAssignment(
        AppDbContext db,
        int teacherId = 1,
        int teacherAssignmentId = 1,
        int classId = 1,
        int subjectId = 1)
    {
        db.Users.Add(
            new User
            {
                Id = teacherId,
                Name = $"Teacher {teacherId}",
                Email = $"teacher{teacherId}@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        db.Classes.Add(
            new Class
            {
                Id = classId,
                Name = $"Class {classId}"
            });

        db.Subjects.Add(
            new Subject
            {
                Id = subjectId,
                Name = $"Subject {subjectId}"
            });

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = teacherAssignmentId,
                TeacherId = teacherId,
                ClassId = classId,
                SubjectId = subjectId
            });

        await db.SaveChangesAsync();
    }


    private static async Task SeedAssignment(
        AppDbContext db,
        int assignmentId = 1,
        int teacherAssignmentId = 1,
        AssignmentStatus status = AssignmentStatus.Draft,
        DateTime? deadline = null)
    {
        db.Assignments.Add(
            new Assignment
            {
                Id = assignmentId,
                TeacherAssignmentId =
                    teacherAssignmentId,
                Title = "Algebra Test",
                Description =
                    "Solve the following algebra problems.",
                Deadline =
                    deadline ??
                    DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = status
            });

        await db.SaveChangesAsync();
    }


    // =========================================================
    // GET MY ASSIGNMENTS
    // =========================================================

    [Fact]
    public async Task Teacher_Should_Get_Only_Their_Own_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        // Teacher 1
        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        // Teacher 2
        db.Users.Add(
            new User
            {
                Id = 2,
                Name = "Teacher 2",
                Email = "teacher2@test.com",
                PasswordHash = "hash",
                Role = UserRole.Teacher
            });

        db.Classes.Add(
            new Class
            {
                Id = 2,
                Name = "Class 2"
            });

        db.Subjects.Add(
            new Subject
            {
                Id = 2,
                Name = "Subject 2"
            });

        db.TeacherAssignments.Add(
            new TeacherAssignment
            {
                Id = 2,
                TeacherId = 2,
                ClassId = 2,
                SubjectId = 2
            });

        db.Assignments.AddRange(
            new Assignment
            {
                Id = 1,
                TeacherAssignmentId = 1,
                Title = "Teacher 1 Assignment",
                Description = "Test",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Draft
            },
            new Assignment
            {
                Id = 2,
                TeacherAssignmentId = 2,
                Title = "Teacher 2 Assignment",
                Description = "Test",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Draft
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
    }




    [Fact]
    public async Task Teacher_Should_Get_Own_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.GetById(1);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task Teacher_Should_Not_Get_Another_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var result =
            await controller.GetById(1);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();
    }


    [Fact]
    public async Task GetById_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.GetById(999);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }


  

    [Fact]
    public async Task Student_Should_View_Published_Assignment_From_Own_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        db.Users.Add(
            new User
            {
                Id = 2,
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        await db.SaveChangesAsync();

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 2,
                role: "Student");

        var result =
            await controller.GetById(1);

        result.Result
            .Should()
            .BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task Student_Should_Not_View_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        db.Users.Add(
            new User
            {
                Id = 2,
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 1
            });

        await db.SaveChangesAsync();

        await SeedAssignment(
            db,
            status: AssignmentStatus.Draft);

        var controller =
            CreateController(
                db,
                userId: 2,
                role: "Student");

        var result =
            await controller.GetById(1);

        result.Result
            .Should()
            .BeOfType<NotFoundResult>();
    }


    [Fact]
    public async Task Student_Should_Not_View_Assignment_From_Another_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        db.Classes.Add(
            new Class
            {
                Id = 2,
                Name = "Class 2"
            });

        db.Users.Add(
            new User
            {
                Id = 2,
                Name = "Student",
                Email = "student@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = 2
            });

        await db.SaveChangesAsync();

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 2,
                role: "Student");

        var result =
            await controller.GetById(1);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();
    }




    [Fact]
    public async Task Teacher_Should_Create_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "  Algebra Test  ",
                Description = "  Solve algebra problems.  ",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<CreatedAtActionResult>();

        var assignment =
            db.Assignments.Single();

        assignment.Title
            .Should()
            .Be("Algebra Test");

        assignment.Description
            .Should()
            .Be("Solve algebra problems.");

        assignment.Status
            .Should()
            .Be(AssignmentStatus.Draft);
    }


    [Fact]
    public async Task Create_Should_Reject_Empty_Title()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "   ",
                Description = "Description",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_Empty_Description()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "Algebra",
                Description = "   ",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_Invalid_MaxMarks()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "Algebra",
                Description = "Test",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 0
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Create_Should_Reject_Past_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "Algebra",
                Description = "Test",
                Deadline = DateTime.UtcNow.AddMinutes(-5),
                MaxMarks = 100
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Teacher_Should_Not_Create_Assignment_For_Another_Teacher()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var request =
            new CreateAssignmentRequest
            {
                TeacherAssignmentId = 1,
                Title = "Unauthorized",
                Description = "Should fail",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Create(request);

        result.Result
            .Should()
            .BeOfType<ForbidResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }



    [Fact]
    public async Task Teacher_Should_Update_Own_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "Updated Algebra",
                Description = "Updated description",
                Deadline = DateTime.UtcNow.AddDays(10),
                MaxMarks = 80
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<NoContentResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Title
            .Should()
            .Be("Updated Algebra");

        assignment.Description
            .Should()
            .Be("Updated description");

        assignment.MaxMarks
            .Should()
            .Be(80);
    }


    [Fact]
    public async Task Teacher_Should_Not_Update_Another_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "Hacked",
                Description = "Hacked",
                Deadline = DateTime.UtcNow.AddDays(10),
                MaxMarks = 100
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<ForbidResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Title
            .Should()
            .Be("Algebra Test");
    }


    [Fact]
    public async Task Update_Should_Reject_Empty_Title()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "   ",
                Description = "Valid",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();
    }


    [Fact]
    public async Task Update_Should_Reject_Invalid_MaxMarks()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "Updated",
                Description = "Valid",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 0
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();
    }


    [Fact]
    public async Task Update_Should_Reject_Past_Deadline()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "Updated",
                Description = "Valid",
                Deadline = DateTime.UtcNow.AddMinutes(-5),
                MaxMarks = 100
            };

        var result =
            await controller.Update(1, request);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();
    }


    [Fact]
    public async Task Update_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var request =
            new UpdateAssignmentRequest
            {
                Title = "Updated",
                Description = "Valid",
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100
            };

        var result =
            await controller.Update(999, request);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }



    [Fact]
    public async Task Teacher_Should_Delete_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Draft);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<NoContentResult>();

        db.Assignments
            .Should()
            .BeEmpty();
    }


    [Fact]
    public async Task Published_Assignment_Should_Not_Be_Deleted()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        db.Assignments
            .Should()
            .ContainSingle();
    }


    [Fact]
    public async Task Teacher_Should_Not_Delete_Another_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var result =
            await controller.Delete(1);

        result
            .Should()
            .BeOfType<ForbidResult>();

        db.Assignments
            .Should()
            .ContainSingle();
    }


    [Fact]
    public async Task Delete_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Delete(999);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }




    [Fact]
    public async Task Teacher_Should_Publish_Draft_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Draft);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Publish(1);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Status
            .Should()
            .Be(AssignmentStatus.Published);
    }


    [Fact]
    public async Task Published_Assignment_Should_Not_Be_Published_Again()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Publish(1);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();
    }


    [Fact]
    public async Task Assignment_With_Past_Deadline_Should_Not_Be_Published()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Draft,
            deadline: DateTime.UtcNow.AddMinutes(-5));

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Publish(1);

        result
            .Should()
            .BeOfType<BadRequestObjectResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Status
            .Should()
            .Be(AssignmentStatus.Draft);
    }


    [Fact]
    public async Task Teacher_Should_Not_Publish_Another_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(db);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var result =
            await controller.Publish(1);

        result
            .Should()
            .BeOfType<ForbidResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Status
            .Should()
            .Be(AssignmentStatus.Draft);
    }


   

    [Fact]
    public async Task Teacher_Should_Unpublish_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Unpublish(1);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Status
            .Should()
            .Be(AssignmentStatus.Draft);
    }


    [Fact]
    public async Task Teacher_Should_Not_Unpublish_Another_Teacher_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedAssignment(
            db,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(
                db,
                userId: 999,
                role: "Teacher");

        var result =
            await controller.Unpublish(1);

        result
            .Should()
            .BeOfType<ForbidResult>();

        var assignment =
            await db.Assignments.FindAsync(1);

        assignment!
            .Status
            .Should()
            .Be(AssignmentStatus.Published);
    }


    [Fact]
    public async Task Publish_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(
                db,
                userId: 1,
                role: "Teacher");

        var result =
            await controller.Publish(999);

        result
            .Should()
            .BeOfType<NotFoundResult>();
    }
}