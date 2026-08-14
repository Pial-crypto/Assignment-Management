"use client";

import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Send,
} from "lucide-react";

import type {
  StudentAssignment,
} from "../types";

interface AssignmentCardProps {
  assignment: StudentAssignment;
  onView: (
    assignment: StudentAssignment
  ) => void;
}

export function AssignmentCard({
  assignment,
  onView,
}: AssignmentCardProps) {
  const deadline =
    new Date(assignment.deadline);

  const isExpired =
    deadline.getTime() < Date.now();

  const hasSubmission =
    assignment.submissionId !== null;

  const isReviewed =
    assignment.submissionStatus ===
    "Reviewed";

  const status = isReviewed
    ? "Reviewed"
    : hasSubmission
      ? "Submitted"
      : "Not Submitted";

  const statusStyles = isReviewed
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : hasSubmission
      ? "bg-blue-50 text-blue-700 ring-blue-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  const statusIcon = isReviewed ? (
    <CheckCircle2 className="h-3.5 w-3.5" />
  ) : hasSubmission ? (
    <Send className="h-3.5 w-3.5" />
  ) : (
    <Clock3 className="h-3.5 w-3.5" />
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Top Accent */}
      <div
        className={`h-1 w-full ${
          isReviewed
            ? "bg-emerald-500"
            : hasSubmission
              ? "bg-blue-500"
              : isExpired
                ? "bg-red-500"
                : "bg-amber-400"
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isReviewed
                  ? "bg-emerald-50 text-emerald-600"
                  : hasSubmission
                    ? "bg-blue-50 text-blue-600"
                    : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {assignment.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {assignment.subjectName}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {assignment.teacherName}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles}`}
          >
            {statusIcon}
            <span className="hidden xs:inline sm:inline">
              {status}
            </span>
          </span>
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">
              {assignment.description}
            </p>
          </div>
        )}

        {/* Assignment Details */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Deadline */}
          <div
            className={`rounded-xl border p-3.5 ${
              isExpired
                ? "border-red-100 bg-red-50/50"
                : "border-slate-100 bg-slate-50/50"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide ${
                isExpired
                  ? "text-red-500"
                  : "text-slate-400"
              }`}
            >
              <CalendarClock className="h-4 w-4" />
              Deadline
            </div>

            <p
              className={`mt-1.5 text-sm font-semibold ${
                isExpired
                  ? "text-red-700"
                  : "text-slate-800"
              }`}
            >
              {deadline.toLocaleString(
                undefined,
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                }
              )}
            </p>

            {isExpired && !hasSubmission && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Deadline passed
              </p>
            )}
          </div>

          {/* Maximum Marks */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <FileCheck2 className="h-4 w-4" />
              Maximum Marks
            </div>

            <p className="mt-1.5 text-sm font-semibold text-slate-800">
              {assignment.maxMarks}
            </p>
          </div>
        </div>

        {/* Result */}
        {assignment.marks !== null && (
          <div className="mt-4 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Result
                  </p>

                  <p className="mt-0.5 text-base font-bold text-emerald-800">
                    {assignment.marks}{" "}
                    <span className="font-medium text-emerald-600">
                      / {assignment.maxMarks}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-emerald-700">
                  {assignment.maxMarks > 0
                    ? (
                        (assignment.marks /
                          assignment.maxMarks) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Button */}
        <button
          type="button"
          onClick={() => onView(assignment)}
          className=" cursor-pointer mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <BookOpen className="h-4 w-4" />
          View Assignment
        </button>
      </div>
    </article>
  );
}