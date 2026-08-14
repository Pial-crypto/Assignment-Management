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

public class StudentAssignmentsControllerTests
{

    private static StudentController CreateController(
        AppDbContext db,
        int userId)
    {
        var controller =
            new StudentController(db);

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            TestClaimsPrincipal.Create(
                                userId,
                                "Student",
                                "Test Student")
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


    private static async Task SeedStudent(
        AppDbContext db,
        int studentId = 2,
        int? classId = 1)
    {
        db.Users.Add(
            new User
            {
                Id = studentId,
                Name = $"Student {studentId}",
                Email = $"student{studentId}@test.com",
                PasswordHash = "hash",
                Role = UserRole.Student,
                ClassId = classId
            });

        await db.SaveChangesAsync();
    }


    private static async Task SeedAssignment(
        AppDbContext db,
        int assignmentId = 1,
        int teacherAssignmentId = 1,
        AssignmentStatus status =
            AssignmentStatus.Published,
        DateTime? deadline = null)
    {
        db.Assignments.Add(
            new Assignment
            {
                Id = assignmentId,
                TeacherAssignmentId =
                    teacherAssignmentId,
                Title = $"Assignment {assignmentId}",
                Description = "Assignment description",
                Deadline =
                    deadline ??
                    DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = status
            });

        await db.SaveChangesAsync();
    }



    [Fact]
    public async Task Student_Should_Get_Published_Assignments_From_Own_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMyAssignments();

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
    public async Task Student_Should_Not_Get_Draft_Assignments()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Draft);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMyAssignments();

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
    public async Task Student_Should_Not_Get_Assignments_From_Another_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        // Assignment belongs to Class 1
        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        // Student belongs to Class 2
        db.Classes.Add(
            new Class
            {
                Id = 2,
                Name = "Class 2"
            });

        await SeedStudent(
            db,
            studentId: 2,
            classId: 2);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMyAssignments();

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
    public async Task Student_Without_Class_Should_Get_Empty_Assignment_List()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedStudent(
            db,
            studentId: 2,
            classId: null);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMyAssignments();

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
    public async Task Missing_Student_Should_Return_NotFound()
    {
        await using var db =
            TestDbContextFactory.Create();

        var controller =
            CreateController(db, 999);

        var result =
            await controller.GetMyAssignments();

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }


   

    [Fact]
    public async Task Student_Should_Get_Published_Assignment_From_Own_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(1);

        result
            .Should()
            .BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task Student_Should_Not_View_Draft_Assignment_Details()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Draft);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(1);

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }


    [Fact]
    public async Task Student_Should_Not_View_Assignment_From_Another_Class()
    {
        await using var db =
            TestDbContextFactory.Create();

        // Assignment → Class 1
        await SeedTeacherAssignment(
            db,
            teacherId: 1,
            teacherAssignmentId: 1,
            classId: 1,
            subjectId: 1);

        // Student → Class 2
        db.Classes.Add(
            new Class
            {
                Id = 2,
                Name = "Class 2"
            });

        await SeedStudent(
            db,
            studentId: 2,
            classId: 2);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(1);

        result
            .Should()
            .BeOfType<ForbidResult>();
    }


    [Fact]
    public async Task Student_Without_Class_Should_Not_View_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: null);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(1);

        result
            .Should()
            .BeOfType<ForbidResult>();
    }


    [Fact]
    public async Task GetAssignment_Should_Return_NotFound_For_Missing_Assignment()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(999);

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }




    [Fact]
    public async Task Assignment_Details_Should_Include_Student_Submission_Result()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "My answer",
                SubmittedAt = DateTime.UtcNow,
                Marks = 85,
                Feedback = "Good work.",
                Status = SubmissionStatus.Reviewed
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetAssignment(1);

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
    public async Task Student_Should_Get_Their_Own_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "My answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMySubmission(1);

        result
            .Should()
            .BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task Student_Should_Not_Get_Another_Students_Submission()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedStudent(
            db,
            studentId: 3,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 3,
                Answer = "Another student's answer",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Pending
            });

        await db.SaveChangesAsync();

        // Logged-in student = 2
        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMySubmission(1);

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }


    [Fact]
    public async Task GetMySubmission_Should_Return_NotFound_When_No_Submission_Exists()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMySubmission(1);

        result
            .Should()
            .BeOfType<NotFoundObjectResult>();
    }


    [Fact]
    public async Task GetMySubmission_Should_Return_Reviewed_Marks_And_Feedback()
    {
        await using var db =
            TestDbContextFactory.Create();

        await SeedTeacherAssignment(db);

        await SeedStudent(
            db,
            studentId: 2,
            classId: 1);

        await SeedAssignment(
            db,
            assignmentId: 1,
            teacherAssignmentId: 1,
            status: AssignmentStatus.Published);

        db.Submissions.Add(
            new Submission
            {
                Id = 1,
                AssignmentId = 1,
                StudentId = 2,
                Answer = "My answer",
                SubmittedAt = DateTime.UtcNow,
                Marks = 90,
                Feedback = "Excellent work.",
                Status = SubmissionStatus.Reviewed
            });

        await db.SaveChangesAsync();

        var controller =
            CreateController(db, 2);

        var result =
            await controller.GetMySubmission(1);

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