namespace AssignmentManagement.Api.Models;

public class TeacherAssignment
{
    public int Id { get; set; }

    public int TeacherId { get; set; }

    public int ClassId { get; set; }

    public int SubjectId { get; set; }

    // Navigation
    public User Teacher { get; set; } = null!;

    public Class Class { get; set; } = null!;

    public Subject Subject { get; set; } = null!;

    public ICollection<Assignment> Assignments { get; set; }
        = new List<Assignment>();
}