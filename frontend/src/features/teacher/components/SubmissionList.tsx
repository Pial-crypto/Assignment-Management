"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  UserRound,
} from "lucide-react";

import type { Submission } from "../types";

interface SubmissionListProps {
  submissions: Submission[];
  onReview: (submission: Submission) => void;
  onBack: () => void;
}

export function SubmissionList({
  submissions,
  onReview,
  onBack,
}: SubmissionListProps) {
  function getStatusStyles(status: string) {
    switch (status) {
      case "Reviewed":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

      case "Pending":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";

      default:
        return "bg-slate-100 text-slate-600 ring-slate-500/20";
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Student Submissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and grade submitted assignments.
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                <FileCheck2 className="h-3.5 w-3.5" />

                {submissions.length}{" "}
                {submissions.length === 1
                  ? "submission"
                  : "submissions"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="p-4 sm:p-6">
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <FileCheck2 className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No submissions yet
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Students have not submitted their work for this assignment yet.
            </p>
          </div>
        </div>
      ) : (
        /* Submission List */
        <div className="divide-y divide-slate-100">
          {submissions.map((submission) => {
            const isReviewed =
              submission.status === "Reviewed";

            return (
              <div
                key={submission.id}
                className="group p-4 transition hover:bg-slate-50 sm:p-5 lg:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Student Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isReviewed
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                          {submission.studentName}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                            Submitted{" "}
                            {new Date(
                              submission.submittedAt
                            ).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status + Marks */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyles(
                          submission.status
                        )}`}
                      >
                        {isReviewed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock3 className="h-3.5 w-3.5" />
                        )}

                        {submission.status}
                      </span>

                      {submission.marks !== null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                          <FileCheck2 className="h-3.5 w-3.5" />

                          {submission.marks} marks
                        </span>
                      )}

                      {submission.marks === null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Not graded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Button */}
                  <div className="w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        onReview(submission)
                      }
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 lg:w-auto"
                    >
                      {isReviewed ? (
                        <>
                          <FileCheck2 className="h-4 w-4" />
                          Review Again
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Review Submission
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}