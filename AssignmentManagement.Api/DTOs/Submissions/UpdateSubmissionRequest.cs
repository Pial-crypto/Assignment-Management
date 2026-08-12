using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Api.DTOs.Submissions;

public class UpdateSubmissionRequest
{
    [Required]
    [StringLength(10000, MinimumLength = 1)]
    public string Answer { get; set; } = string.Empty;
}