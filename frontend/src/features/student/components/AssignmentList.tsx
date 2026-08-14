"use client";

import {
  BookOpen,
  ClipboardList,
  FileQuestion,
} from "lucide-react";

import type {
  StudentAssignment,
} from "../types";

import { AssignmentCard } from "./AssignmentCard";

interface AssignmentListProps {
  assignments: StudentAssignment[];

  onView: (
    assignment: StudentAssignment
  ) => void;
}

export function AssignmentList({
  assignments,
  onView,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Empty State Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Assignments
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Your available assignments will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-4 sm:p-6">
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <FileQuestion className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No assignments available
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are currently no published assignments for your
              classes and subjects.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
              <BookOpen className="h-3.5 w-3.5" />
              Check back later
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              My Assignments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View your assignments, deadlines, submissions, and results.
            </p>
          </div>
        </div>

        {/* Assignment Count */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
          <BookOpen className="h-3.5 w-3.5" />

          {assignments.length}{" "}
          {assignments.length === 1
            ? "assignment"
            : "assignments"}
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
}