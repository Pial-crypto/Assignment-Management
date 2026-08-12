using System.Security.Claims;
using System.Security.Principal;

namespace AssignmentManagement.Tests.Helpers;

public static class TestUser
{
    public static ClaimsPrincipal Create(
        int userId,
        string name,
        string role)
    {
        var identity = new ClaimsIdentity(
            new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    name),

                new Claim(
                    ClaimTypes.Role,
                    role)
            },
            "TestAuthentication");

        return new ClaimsPrincipal(identity);
    }
}