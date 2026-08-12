using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.Models;

public class Submission
{
    public int Id { get; set; }

    public int AssignmentId { get; set; }

    public int StudentId { get; set; }

    public string Answer { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public decimal? Marks { get; set; }

    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;

    // Navigation
    public Assignment Assignment { get; set; } = null!;

    public User Student { get; set; } = null!;
}