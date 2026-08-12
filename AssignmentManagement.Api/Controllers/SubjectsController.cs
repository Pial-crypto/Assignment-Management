using AssignmentManagement.Api.Data;
using AssignmentManagement.Api.DTOs.Subjects;
using AssignmentManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize(Roles = "Admin")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubjectsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubjectResponse>>> GetAll()
    {
        var subjects = await _db.Subjects
            .AsNoTracking()
            .Select(x => new SubjectResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync();

        return Ok(subjects);
    }

    [HttpPost]
    public async Task<ActionResult<SubjectResponse>> Create(
        CreateSubjectRequest request)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Subject name is required."
            });
        }

        if (await _db.Subjects.AnyAsync(x => x.Name == name))
        {
            return Conflict(new
            {
                message = "This subject already exists."
            });
        }

        var subject = new Subject
        {
            Name = name
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();

        return Ok(new SubjectResponse
        {
            Id = subject.Id,
            Name = subject.Name
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var subject = await _db.Subjects.FindAsync(id);

        if (subject is null)
            return NotFound();

        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}