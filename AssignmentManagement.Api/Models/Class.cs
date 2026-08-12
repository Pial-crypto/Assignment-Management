namespace AssignmentManagement.Api.Models;

public class Class
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // Navigation
    public ICollection<User> Students { get; set; }
        = new List<User>();

    public ICollection<TeacherAssignment> TeacherAssignments { get; set; }
        = new List<TeacherAssignment>();
}