using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok(new
        {
            message = "Public endpoint works."
        });
    }

    [Authorize]
    [HttpGet("authenticated")]
    public IActionResult Authenticated()
    {
        return Ok(new
        {
            message = "You are authenticated.",
            user = User.Identity?.Name,
            role = User.FindFirst(
                System.Security.Claims.ClaimTypes.Role)?.Value
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new
        {
            message = "Admin access granted."
        });
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("teacher")]
    public IActionResult TeacherOnly()
    {
        return Ok(new
        {
            message = "Teacher access granted."
        });
    }

    [Authorize(Roles = "Student")]
    [HttpGet("student")]
    public IActionResult StudentOnly()
    {
        return Ok(new
        {
            message = "Student access granted."
        });
    }
}