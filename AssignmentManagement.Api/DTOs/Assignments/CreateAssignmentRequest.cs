using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Api.DTOs.Assignments;

public class CreateAssignmentRequest
{
    [Required]
    public int TeacherAssignmentId { get; set; }

    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(5000, MinimumLength = 3)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Deadline { get; set; }

    [Range(0.01, 1000000)]
    public decimal MaxMarks { get; set; }
}