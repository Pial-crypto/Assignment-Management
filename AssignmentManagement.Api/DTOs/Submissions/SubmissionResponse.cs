using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Submissions;

public class SubmissionResponse
{
    public int Id { get; set; }

    public int AssignmentId { get; set; }

    public string AssignmentTitle { get; set; } = string.Empty;

    public int StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; }

    public decimal? Marks { get; set; }

    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; }

    public DateTime Deadline { get; set; }
}