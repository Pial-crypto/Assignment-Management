"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  Send,
  Trophy,
} from "lucide-react";

import type {
  StudentAssignment,
  StudentSubmission,
} from "../types";

interface SubmissionFormProps {
  assignment: StudentAssignment;

  submission: StudentSubmission | null;

  onSubmit: (
    answer: string
  ) => Promise<void>;

  onCancel: () => void;
}

export function SubmissionForm({
  assignment,
  submission,
  onSubmit,
  onCancel,
}: SubmissionFormProps) {
  const [answer, setAnswer] = useState(
    submission?.answer ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnswer(
      submission?.answer ?? ""
    );

    setError("");
  }, [submission]);

  const deadline =
    new Date(assignment.deadline);

  const isExpired =
    deadline.getTime() < Date.now();

  const isReviewed =
    submission?.status === "Reviewed";

  const canEdit =
    !isExpired && !isReviewed;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!answer.trim()) {
      setError(
        "Please enter your answer."
      );
      return;
    }

    if (!canEdit) {
      setError(
        "This submission can no longer be changed."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSubmit(answer.trim());
    } catch {
      setError(
        "Failed to submit your answer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white">
        <div className="p-4 sm:p-6 lg:p-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                {submission ? (
                  <FileCheck2 className="h-6 w-6" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Student Submission
                </p>

                <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {submission
                    ? "Update Submission"
                    : "Submit Assignment"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {assignment.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Deadline Badge */}
            <div
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border px-3 py-2 ${
                isExpired
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-indigo-100 bg-indigo-50 text-indigo-700"
              }`}
            >
              {isExpired ? (
                <Clock3 className="h-4 w-4" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Deadline
                </p>

                <p className="mt-0.5 text-xs font-semibold">
                  {deadline.toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Assignment Information */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Assignment Details
              </h3>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {assignment.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  <Trophy className="h-3.5 w-3.5 text-indigo-500" />
                  Maximum Marks:{" "}
                  {assignment.maxMarks}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    isExpired
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  }`}
                >
                  {isExpired ? (
                    <Clock3 className="h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}

                  {isExpired
                    ? "Deadline passed"
                    : "Submission open"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Submission */}
        {submission && (
          <div
            className={`mt-5 overflow-hidden rounded-2xl border ${
              isReviewed
                ? "border-emerald-100 bg-emerald-50"
                : "border-blue-100 bg-blue-50"
            }`}
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isReviewed
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isReviewed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <FileCheck2 className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isReviewed
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }`}
                  >
                    Current Status
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold ${
                      isReviewed
                        ? "text-emerald-800"
                        : "text-blue-900"
                    }`}
                  >
                    {submission.status}
                  </p>

                  {submission.submittedAt && (
                    <p
                      className={`mt-1 text-xs ${
                        isReviewed
                          ? "text-emerald-700"
                          : "text-blue-700"
                      }`}
                    >
                      Submitted{" "}
                      {new Date(
                        submission.submittedAt
                      ).toLocaleString(
                        undefined,
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="student-answer"
              className="text-sm font-semibold text-slate-800"
            >
              Your Answer
            </label>

            <span className="text-xs text-slate-400">
              {answer.length.toLocaleString()} characters
            </span>
          </div>

          <div
            className={`overflow-hidden rounded-2xl border transition ${
              !canEdit
                ? "border-slate-200 bg-slate-100"
                : "border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
            }`}
          >
            <textarea
              id="student-answer"
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              disabled={!canEdit || saving}
              rows={14}
              placeholder="Write your answer here..."
              className="w-full resize-y border-0 bg-transparent px-4 py-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500 sm:px-5 sm:py-5"
            />

            {canEdit && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-400 sm:px-5">
                Make sure your answer is complete before submitting.
              </div>
            )}
          </div>

          {/* Locked State */}
          {!canEdit && (
            <div
              className={`mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                isReviewed
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {isReviewed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              )}

              <p>
                {isReviewed
                  ? "This submission has already been reviewed and can no longer be changed."
                  : "The submission deadline has passed, so this answer can no longer be changed."}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-semibold">
                  Submission error
                </p>

                <p className="mt-0.5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {canEdit && (
            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !answer.trim()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {submission
                      ? "Updating..."
                      : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {submission
                      ? "Update Submission"
                      : "Submit Assignment"}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}