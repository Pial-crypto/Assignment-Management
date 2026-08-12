using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Submissions;

public class ReviewSubmissionRequest
{
    [Range(0, 1000000)]
    public decimal Marks { get; set; }

    [StringLength(2000)]
    public string? Feedback { get; set; }

    [Required]
    public SubmissionStatus Status { get; set; }
}