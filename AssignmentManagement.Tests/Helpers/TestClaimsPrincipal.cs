using System.Security.Claims;
using System.Security.Principal;

namespace AssignmentManagement.Tests.Helpers;

public static class TestClaimsPrincipal
{
    public static ClaimsPrincipal Create(
        int userId,
        string role,
        string? name = null)
    {
        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                userId.ToString()),

            new(
                ClaimTypes.Role,
                role)
        };

        if (!string.IsNullOrWhiteSpace(name))
        {
            claims.Add(
                new Claim(
                    ClaimTypes.Name,
                    name));
        }

        var identity = new ClaimsIdentity(
            claims,
            authenticationType: "TestAuthentication");

        return new ClaimsPrincipal(identity);
    }
}