using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        // Classes
        var class10 = await db.Classes
            .FirstOrDefaultAsync(x => x.Name == "Class 10");

        if (class10 is null)
        {
            class10 = new Class
            {
                Name = "Class 10"
            };

            db.Classes.Add(class10);
            await db.SaveChangesAsync();
        }

        // Subjects
        var mathematics = await db.Subjects
            .FirstOrDefaultAsync(x => x.Name == "Mathematics");

        if (mathematics is null)
        {
            mathematics = new Subject
            {
                Name = "Mathematics"
            };

            db.Subjects.Add(mathematics);
        }

        var physics = await db.Subjects
            .FirstOrDefaultAsync(x => x.Name == "Physics");

        if (physics is null)
        {
            physics = new Subject
            {
                Name = "Physics"
            };

            db.Subjects.Add(physics);
        }

        await db.SaveChangesAsync();

        // Admin
        var admin = await db.Users
            .FirstOrDefaultAsync(x => x.Email == "admin@example.com");

        if (admin is null)
        {
            admin = new User
            {
                Name = "System Admin",
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    "Admin@12345"),
                Role = UserRole.Admin
            };

            db.Users.Add(admin);
        }

        // Teacher
        var teacher = await db.Users
            .FirstOrDefaultAsync(x => x.Email == "teacher@example.com");

        if (teacher is null)
        {
            teacher = new User
            {
                Name = "John Teacher",
                Email = "teacher@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    "Teacher@12345"),
                Role = UserRole.Teacher
            };

            db.Users.Add(teacher);
        }

        await db.SaveChangesAsync();

        // Student
        var student = await db.Users
            .FirstOrDefaultAsync(x => x.Email == "student@example.com");

        if (student is null)
        {
            student = new User
            {
                Name = "Jane Student",
                Email = "student@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    "Student@12345"),
                Role = UserRole.Student,
                ClassId = class10.Id
            };

            db.Users.Add(student);
            await db.SaveChangesAsync();
        }

        // Teacher assignment
        var teacherAssignment = await db.TeacherAssignments
            .FirstOrDefaultAsync(x =>
                x.TeacherId == teacher.Id &&
                x.ClassId == class10.Id &&
                x.SubjectId == mathematics.Id);

        if (teacherAssignment is null)
        {
            teacherAssignment = new TeacherAssignment
            {
                TeacherId = teacher.Id,
                ClassId = class10.Id,
                SubjectId = mathematics.Id
            };

            db.TeacherAssignments.Add(teacherAssignment);
            await db.SaveChangesAsync();
        }

        // Sample assignment
        var sampleAssignment = await db.Assignments
            .FirstOrDefaultAsync(x =>
                x.Title == "Algebra Basics" &&
                x.TeacherAssignmentId == teacherAssignment.Id);

        if (sampleAssignment is null)
        {
            db.Assignments.Add(new Assignment
            {
                TeacherAssignmentId = teacherAssignment.Id,
                Title = "Algebra Basics",
                Description = "Solve the basic algebra problems.",
                Deadline = DateTime.UtcNow.AddDays(7),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            });

            await db.SaveChangesAsync();
        }
    }
}