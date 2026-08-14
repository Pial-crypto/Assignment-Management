"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Plus,
  School,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import {
  createTeacherAssignment,
  deleteTeacherAssignment,
  getClasses,
  getSubjects,
  getTeacherAssignments,
  getUsers,
} from "../api";

import type {
  TeacherAssignment,
  SchoolClass,
  Subject,
  User,
} from "../types";

export function TeacherAssignmentManagement() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadData() {
    try {
      setError("");
      setLoading(true);

      const [
        assignmentData,
        userData,
        classData,
        subjectData,
      ] = await Promise.all([
        getTeacherAssignments(),
        getUsers(),
        getClasses(),
        getSubjects(),
      ]);

      setAssignments(assignmentData);

      setTeachers(
        userData.filter(
          (user) => user.role === "Teacher"
        )
      );

      setClasses(classData);
      setSubjects(subjectData);
    } catch {
      setError(
        "Failed to load teacher assignments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!teacherId || !classId || !subjectId) {
      return;
    }

    try {
      setError("");
      setCreating(true);

      await createTeacherAssignment({
        teacherId: Number(teacherId),
        classId: Number(classId),
        subjectId: Number(subjectId),
      });

      setTeacherId("");
      setClassId("");
      setSubjectId("");

      await loadData();
    } catch {
      setError(
        "Failed to create teacher assignment. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Are you sure you want to remove this teacher assignment?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);

      await deleteTeacherAssignment(id);
      await loadData();
    } catch {
      setError(
        "Failed to remove assignment. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Teacher Assignments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assign teachers to specific classes and subjects.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            <span>
              {assignments.length}{" "}
              {assignments.length === 1
                ? "assignment"
                : "assignments"}
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="border-b border-slate-100 p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Create Assignment
          </h3>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Select a teacher, class, and subject to create a teaching assignment.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          {/* Teacher */}
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              disabled={creating}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select Teacher
              </option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {teacher.name}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>

          {/* Class */}
          <div className="relative">
            <School className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              disabled={creating}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select Class
              </option>

              {classes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>

          {/* Subject */}
          <div className="relative">
            <BookOpen className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              disabled={creating}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              creating ||
              !teacherId ||
              !classId ||
              !subjectId
            }
            className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 " />
                Assign Teacher
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-0.5 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Assignments */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />

            <p className="text-sm">
              Loading assignments...
            </p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No teacher assignments
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Create an assignment above to connect a teacher with a class
              and subject.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {/* Desktop Header */}
            <div className="hidden grid-cols-[1.3fr_1fr_1fr_auto] items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
              <span>Teacher</span>
              <span>Class</span>
              <span>Subject</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {assignments.map((assignment) => {
                const isDeleting =
                  deletingId === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className="group p-4 transition hover:bg-slate-50"
                  >
                    {/* Desktop */}
                    <div className="hidden grid-cols-[1.3fr_1fr_1fr_auto] items-center gap-4 lg:grid">
                      {/* Teacher */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {assignment.teacherName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Teacher
                          </p>
                        </div>
                      </div>

                      {/* Class */}
                      <div className="flex min-w-0 items-center gap-2">
                        <School className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate text-sm text-slate-700">
                          {assignment.className}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate text-sm text-slate-700">
                          {assignment.subjectName}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(assignment.id)
                        }
                        disabled={isDeleting}
                        className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        <span>
                          {isDeleting
                            ? "Removing..."
                            : "Remove"}
                        </span>
                      </button>
                    </div>

                    {/* Mobile / Tablet */}
                    <div className="lg:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <UserRound className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {assignment.teacherName}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              Active assignment
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(assignment.id)
                          }
                          disabled={isDeleting}
                          aria-label={`Remove assignment for ${assignment.teacherName}`}
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                          <School className="h-4 w-4 shrink-0 text-slate-400" />

                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Class
                            </p>

                            <p className="truncate text-sm font-medium text-slate-700">
                              {assignment.className}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                          <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />

                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Subject
                            </p>

                            <p className="truncate text-sm font-medium text-slate-700">
                              {assignment.subjectName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}