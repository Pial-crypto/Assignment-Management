namespace AssignmentManagement.Api.DTOs.TeacherAssignments;

public class CreateTeacherAssignmentRequest
{
    public int TeacherId { get; set; }

    public int ClassId { get; set; }

    public int SubjectId { get; set; }
}