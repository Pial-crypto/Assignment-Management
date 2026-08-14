"use client";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MessageSquareText,
  Send,
  Trophy,
} from "lucide-react";

import type {
  StudentAssignment,
  StudentSubmission,
} from "../types";

interface SubmissionResultProps {
  assignment: StudentAssignment;
  submission: StudentSubmission;
}

export function SubmissionResult({
  assignment,
  submission,
}: SubmissionResultProps) {
  const isReviewed =
    submission.status === "Reviewed";

  const hasMarks =
    submission.marks !== null;

  const percentage =
    hasMarks &&
    assignment.maxMarks > 0
      ? (
          (submission.marks! /
            assignment.maxMarks) *
          100
        ).toFixed(0)
      : null;

  const statusStyles = isReviewed
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 sm:p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 sm:h-14 sm:w-14">
            <FileCheck2 className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Submission Result
            </p>

            <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {assignment.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {assignment.subjectName}
              </span>

              <span className="hidden text-slate-300 sm:inline">
                •
              </span>

              <span>
                Maximum marks:{" "}
                <span className="font-semibold text-slate-700">
                  {assignment.maxMarks}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Result Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isReviewed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock3 className="h-4 w-4" />
              )}

              Status
            </div>

            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles}`}
              >
                {isReviewed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" />
                )}

                {submission.status}
              </span>
            </div>
          </div>

          {/* Marks */}
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              hasMarks
                ? "border-emerald-100 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                hasMarks
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Marks
            </div>

            {hasMarks ? (
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-bold text-emerald-800">
                  {submission.marks}
                  <span className="text-base font-medium text-emerald-600">
                    {" "}
                    / {assignment.maxMarks}
                  </span>
                </p>

                {percentage !== null && (
                  <span className="text-lg font-bold text-emerald-700">
                    {percentage}%
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-2 text-base font-semibold text-slate-700">
                Not graded
              </p>
            )}
          </div>

          {/* Submitted */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Send className="h-4 w-4" />
              Submitted
            </div>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
              {new Date(
                submission.submittedAt
              ).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        {/* Score Progress */}
        {hasMarks && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-emerald-700">
                Overall Score
              </span>

              <span className="text-xs font-bold text-emerald-700">
                {percentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(percentage)
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Teacher Feedback */}
        {submission.feedback && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-blue-900">
                    Teacher Feedback
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-blue-800">
                    {submission.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Answer */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Your Answer
              </h3>

              <p className="text-xs text-slate-500">
                Your submitted response
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="max-h-[500px] overflow-y-auto p-4 sm:p-5 lg:p-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {submission.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Reviewed Notice */}
        {isReviewed && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Your submission has been reviewed
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Your marks and teacher feedback are shown above.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}