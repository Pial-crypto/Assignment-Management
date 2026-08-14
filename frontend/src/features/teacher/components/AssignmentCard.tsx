"use client";

import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";

import type { Assignment } from "../types";

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onUnpublish: (id: number) => void;
  onViewSubmissions: (id: number) => void;
}

export function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onViewSubmissions,
}: AssignmentCardProps) {
  const isDraft = assignment.status === "Draft";

  const formattedDeadline = new Date(
    assignment.deadline
  ).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Top Accent */}
      <div
        className={`h-1 w-full ${
          isDraft
            ? "bg-amber-400"
            : "bg-emerald-500"
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isDraft
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {assignment.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {assignment.className}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span>
                  {assignment.subjectName}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
              isDraft
                ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
            }`}
          >
            {isDraft ? (
              <FileText className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}

            {assignment.status}
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

        {/* Metadata */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <CalendarClock className="h-4 w-4" />
              Deadline
            </div>

            <p className="mt-1.5 text-sm font-semibold text-slate-800">
              {formattedDeadline}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <CheckCircle2 className="h-4 w-4" />
              Maximum Marks
            </div>

            <p className="mt-1.5 text-sm font-semibold text-slate-800">
              {assignment.maxMarks}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(assignment)}
            className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          {/* Draft */}
          {isDraft ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onPublish(assignment.id)
                }
                className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                <Send className="h-4 w-4" />
                Publish
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(assignment.id)
                }
                className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:ml-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : (
            <>
              {/* Published */}
              <button
                type="button"
                onClick={() =>
                  onUnpublish(assignment.id)
                }
                className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
              >
                <Undo2 className="h-4 w-4" />
                Unpublish
              </button>

              <button
                type="button"
                onClick={() =>
                  onViewSubmissions(
                    assignment.id
                  )
                }
                className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                <FileText className="h-4 w-4" />
                View Submissions
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}