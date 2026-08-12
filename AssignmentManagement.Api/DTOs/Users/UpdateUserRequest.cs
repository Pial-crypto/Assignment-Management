using AssignmentManagement.Api.Models.Enums;

namespace AssignmentManagement.Api.DTOs.Users;

public class UpdateUserRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public int? ClassId { get; set; }
}