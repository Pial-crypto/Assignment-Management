"use client";

import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  School,
} from "lucide-react";

import type { TeacherAssignment } from "../types";

interface TeacherAssignmentListProps {
  assignments: TeacherAssignment[];
}

export function TeacherAssignmentList({
  assignments,
}: TeacherAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                My Classes & Subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Classes and subjects assigned to you.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-4 sm:p-6">
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <School className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No assignments found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              You currently don't have any class or subject assignments.
            </p>

            <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
              Please contact an administrator if you believe this is incorrect.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                My Classes & Subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Classes and subjects assigned to you by the administrator.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />

            {assignments.length}{" "}
            {assignments.length === 1
              ? "assignment"
              : "assignments"}
          </div>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <BookOpen className="h-4 w-4" />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {assignment.className}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                    <p className="truncate text-sm text-slate-500">
                      {assignment.subjectName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active assignment
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}