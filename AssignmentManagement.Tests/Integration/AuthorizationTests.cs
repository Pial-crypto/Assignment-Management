using System.Net;
using FluentAssertions;
using Xunit;

namespace AssignmentManagement.Tests.Integration;

public class AuthorizationTests
{
    
    private static CustomWebApplicationFactory CreateFactory()
    {
        return new CustomWebApplicationFactory();
    }



    [Fact]
    public async Task Unauthenticated_User_Should_Get_401()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        var response =
            await client.GetAsync(
                "/api/users");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Unauthorized);
    }


  

    [Fact]
    public async Task Admin_Should_Access_Admin_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "1");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Admin");

        var response =
            await client.GetAsync(
                "/api/users");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.OK);
    }


    [Fact]
    public async Task Teacher_Should_Not_Access_Admin_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "2");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Teacher");

        var response =
            await client.GetAsync(
                "/api/users");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Student_Should_Not_Access_Admin_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "3");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Student");

        var response =
            await client.GetAsync(
                "/api/users");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Teacher_Should_Access_Teacher_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "2");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Teacher");

        var response =
            await client.GetAsync(
                "/api/teacher-submissions");

        response.StatusCode
            .Should()
            .NotBe(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Student_Should_Not_Access_Teacher_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "3");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Student");

        var response =
    await client.GetAsync(
        "/api/test/teacher");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Admin_Should_Not_Access_Teacher_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "1");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Admin");

       var response =
    await client.GetAsync(
        "/api/test/teacher");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }



    [Fact]
    public async Task Student_Should_Access_Student_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "3");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Student");

        var response =
            await client.GetAsync(
                "/api/student");

        response.StatusCode
            .Should()
            .NotBe(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Teacher_Should_Not_Access_Student_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "2");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Teacher");

        var response =
    await client.GetAsync(
        "/api/test/student");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }


    [Fact]
    public async Task Admin_Should_Not_Access_Student_Endpoint()
    {
        using var factory =
            CreateFactory();

        using var client =
            factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            "1");

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            "Admin");

        var response =
    await client.GetAsync(
        "/api/test/student");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }
}