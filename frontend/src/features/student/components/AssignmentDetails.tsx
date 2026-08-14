"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
  Send,
  Trophy,
} from "lucide-react";

import type {
  StudentAssignment,
} from "../types";

interface AssignmentDetailsProps {
  assignment: StudentAssignment;
  onSubmit: () => void;
  onBack: () => void;
}

export function AssignmentDetails({
  assignment,
  onSubmit,
  onBack,
}: AssignmentDetailsProps) {
  const deadline =
    new Date(assignment.deadline);

  const isExpired =
    deadline.getTime() < Date.now();

  const hasSubmission =
    assignment.submissionId !== null;

  const isReviewed =
    assignment.submissionStatus ===
    "Reviewed";

  const submissionStatus = isReviewed
    ? "Reviewed"
    : hasSubmission
      ? "Submitted"
      : "Not Submitted";

  const submissionStatusStyles =
    isReviewed
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : hasSubmission
        ? "bg-blue-50 text-blue-700 ring-blue-600/20"
        : "bg-amber-50 text-amber-700 ring-amber-600/20";

  const resultPercentage =
    assignment.marks !== null &&
    assignment.maxMarks > 0
      ? (
          (assignment.marks /
            assignment.maxMarks) *
          100
        ).toFixed(0)
      : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to assignments
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Assignment Identity */}
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 sm:h-14 sm:w-14">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Assignment
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Published
                  </span>
                </div>

                <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {assignment.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    {assignment.subjectName}
                  </span>

                  <span className="hidden text-slate-300 sm:inline">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {assignment.className}
                  </span>

                  <span className="hidden text-slate-300 sm:inline">
                    •
                  </span>

                  <span>
                    Teacher:{" "}
                    <span className="font-medium text-slate-700">
                      {assignment.teacherName}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Assignment Description */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileCheck2 className="h-4 w-4" />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              Assignment Description
            </h3>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {assignment.description}
            </p>
          </div>
        </div>

        {/* Assignment Information */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Deadline */}
          <div
            className={`rounded-xl border p-4 ${
              isExpired
                ? "border-red-100 bg-red-50/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
                isExpired
                  ? "text-red-500"
                  : "text-slate-400"
              }`}
            >
              {isExpired ? (
                <Clock3 className="h-4 w-4" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}

              Deadline
            </div>

            <p
              className={`mt-2 text-sm font-semibold ${
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

            {isExpired && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Deadline has passed
              </p>
            )}
          </div>

          {/* Maximum Marks */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Trophy className="h-4 w-4" />
              Maximum Marks
            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {assignment.maxMarks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total available marks
            </p>
          </div>

          {/* Submission Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Send className="h-4 w-4" />
              Submission
            </div>

            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${submissionStatusStyles}`}
              >
                {isReviewed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : hasSubmission ? (
                  <Send className="h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" />
                )}

                {submissionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Result */}
        {assignment.marks !== null && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Your Result
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {assignment.marks}
                    <span className="font-medium text-emerald-600">
                      {" "}
                      / {assignment.maxMarks}
                    </span>
                  </p>
                </div>
              </div>

              {resultPercentage !== null && (
                <div className="sm:text-right">
                  <p className="text-3xl font-bold text-emerald-700">
                    {resultPercentage}%
                  </p>

                  <p className="text-xs font-medium text-emerald-600">
                    Overall score
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {assignment.feedback && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
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
                    {assignment.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit / Update */}
        {!isReviewed && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {hasSubmission
                    ? "Your submission"
                    : "Ready to submit?"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {hasSubmission
                    ? "You can view or update your submitted answer."
                    : isExpired
                      ? "The deadline has passed, so a new submission cannot be made."
                      : "Submit your answer before the deadline."}
                </p>
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={
                  isExpired &&
                  !hasSubmission
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
              >
                {hasSubmission ? (
                  <>
                    <FileCheck2 className="h-4 w-4" />
                    View / Update Submission
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Reviewed Notice */}
        {isReviewed && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Assignment reviewed
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Your teacher has reviewed this submission. The result and
                feedback are shown above.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}