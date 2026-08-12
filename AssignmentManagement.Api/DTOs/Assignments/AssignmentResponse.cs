using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Assignments;

public class AssignmentResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime Deadline { get; set; }

    public decimal MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; }

    public int TeacherAssignmentId { get; set; }

    public int TeacherId { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public int ClassId { get; set; }

    public string ClassName { get; set; } = string.Empty;

    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}