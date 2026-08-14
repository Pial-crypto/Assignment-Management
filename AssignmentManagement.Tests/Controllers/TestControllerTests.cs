using AssignmentManagement.Api.Controllers;
using AssignmentManagement.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests.Controllers;

public class TestControllerTests
{
    private static TestController CreateController(
        int? userId = null,
        string? role = null,
        string? name = null)
    {
        var controller = new TestController();

        if (userId.HasValue && !string.IsNullOrWhiteSpace(role))
        {
            controller.ControllerContext =
                new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = TestClaimsPrincipal.Create(
                            userId.Value,
                            role,
                            name)
                    }
                };
        }

        return controller;
    }


    [Fact]
    public void Public_Should_Return_Ok()
    {
        // Arrange
        var controller = CreateController();

        // Act
        var result = controller.Public();

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result;

        okResult.Value.Should().NotBeNull();
    }


   

    [Fact]
    public void Authenticated_Should_Return_Ok_For_Authenticated_User()
    {
        // Arrange
        var controller = CreateController(
            userId: 1,
            role: "Student",
            name: "Test Student");

        // Act
        var result = controller.Authenticated();

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result;

        okResult.Value.Should().NotBeNull();
    }


    [Fact]
    public void Authenticated_Should_Return_User_And_Role()
    {
        // Arrange
        var controller = CreateController(
            userId: 1,
            role: "Student",
            name: "Test Student");

        // Act
        var result = controller.Authenticated();

        // Assert
        var okResult = result.Should()
            .BeOfType<OkObjectResult>()
            .Subject;

        okResult.Value.Should().NotBeNull();

        var value = okResult.Value!;

        var userProperty =
            value.GetType().GetProperty("user");

        var roleProperty =
            value.GetType().GetProperty("role");

        userProperty.Should().NotBeNull();
        roleProperty.Should().NotBeNull();

        userProperty!.GetValue(value)
            .Should()
            .Be("Test Student");

        roleProperty!.GetValue(value)
            .Should()
            .Be("Student");
    }




    [Fact]
    public void AdminOnly_Should_Return_Ok()
    {
        // Arrange
        var controller = CreateController(
            userId: 1,
            role: "Admin",
            name: "System Admin");

        // Act
        var result = controller.AdminOnly();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }


    

    [Fact]
    public void TeacherOnly_Should_Return_Ok()
    {
        // Arrange
        var controller = CreateController(
            userId: 10,
            role: "Teacher",
            name: "John Teacher");

        // Act
        var result = controller.TeacherOnly();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }


    [Fact]
    public void StudentOnly_Should_Return_Ok()
    {
        // Arrange
        var controller = CreateController(
            userId: 1,
            role: "Student",
            name: "Jane Student");

        // Act
        var result = controller.StudentOnly();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }
}