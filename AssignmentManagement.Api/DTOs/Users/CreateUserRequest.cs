using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Users;

public class CreateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    public int? ClassId { get; set; }
}