using AssignmentManagement.Api.Configuration;
using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Auth;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Models.Enums;
using AssignmentManagement.Api.Services;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Xunit;

namespace AssignmentManagement.Tests.Auth;

public class AuthServiceTests
{
    [Fact]
    public async Task Login_Should_Return_Jwt_For_Valid_Credentials()
    {
        await using var db = TestDbContextFactory.Create();

        db.Users.Add(new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@test.com",
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.Admin
        });

        await db.SaveChangesAsync();

        var jwtSettings = Options.Create(
            new JwtSettings
            {
                Key = "This-Is-A-Test-Secret-Key-123456789",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpirationMinutes = 60
            });

        var service = new AuthService(
            db,
            jwtSettings);

        var result = await service.LoginAsync(
            new LoginRequest
            {
                Email = "admin@test.com",
                Password = "Password123"
            });

        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrWhiteSpace();
        result.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Login_Should_Fail_For_Wrong_Password()
    {
        await using var db = TestDbContextFactory.Create();

        db.Users.Add(new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@test.com",
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
            Role = UserRole.Admin
        });

        await db.SaveChangesAsync();

        var jwtSettings = Options.Create(
            new JwtSettings
            {
                Key = "This-Is-A-Test-Secret-Key-123456789",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpirationMinutes = 60
            });

        var service = new AuthService(
            db,
            jwtSettings);

        var result = await service.LoginAsync(
            new LoginRequest
            {
                Email = "admin@test.com",
                Password = "WrongPassword"
            });

        result.Should().BeNull();
    }
}