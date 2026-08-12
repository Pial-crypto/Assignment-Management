namespace AssignmentManagement.Api.Models;

public class Subject
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // Navigation
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; }
        = new List<TeacherAssignment>();
}