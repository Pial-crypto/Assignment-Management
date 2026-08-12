using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Users;

public class UserResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public int? ClassId { get; set; }

    public string? ClassName { get; set; }
}