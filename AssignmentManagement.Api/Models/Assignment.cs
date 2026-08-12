using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.Models;

public class Assignment
{
    public int Id { get; set; }

    public int TeacherAssignmentId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime Deadline { get; set; }

    public decimal MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TeacherAssignment TeacherAssignment { get; set; } = null!;

    public ICollection<Submission> Submissions { get; set; }
        = new List<Submission>();
}