using AssignmentManagement.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AssignmentManagement.Tests.Integration;

public class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(
            (_, config) =>
            {
                config.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["Jwt:Key"] =
                            "test-key-for-integration-tests-only-123456789",
                        ["Jwt:Issuer"] =
                            "AssignmentManagement.Tests",
                        ["Jwt:Audience"] =
                            "AssignmentManagement.Tests"
                    });
            });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<
                DbContextOptions<AppDbContext>>();

            services.RemoveAll<AppDbContext>();

            services.AddDbContext<AppDbContext>(
                options =>
                {
                    options.UseInMemoryDatabase(
                        "AssignmentManagementIntegrationDb");
                });

            services.AddAuthentication(
                options =>
                {
                    options.DefaultAuthenticateScheme =
                        "Test";

                    options.DefaultChallengeScheme =
                        "Test";

                    options.DefaultScheme =
                        "Test";
                })
                .AddScheme<
                    AuthenticationSchemeOptions,
                    TestAuthHandler>(
                    "Test",
                    _ =>
                    {
                    });
        });
    }
}