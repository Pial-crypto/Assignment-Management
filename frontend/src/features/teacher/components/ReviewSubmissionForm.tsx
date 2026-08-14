"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquareText,
  Save,
  UserRound,
  X,
} from "lucide-react";

import type {
  Assignment,
  Submission,
} from "../types";

interface ReviewSubmissionFormProps {
  submission: Submission;
  assignment: Assignment;
  onSubmit: (data: {
    marks: number;
    feedback: string | null;
    status: "Pending" | "Reviewed";
  }) => Promise<void>;
  onCancel: () => void;
}

export function ReviewSubmissionForm({
  submission,
  assignment,
  onSubmit,
  onCancel,
}: ReviewSubmissionFormProps) {
  const [marks, setMarks] = useState(
    submission.marks !== null
      ? String(submission.marks)
      : ""
  );

  const [feedback, setFeedback] = useState(
    submission.feedback ?? ""
  );

  const [status, setStatus] =
    useState<"Pending" | "Reviewed">(
      submission.status === "Reviewed"
        ? "Reviewed"
        : "Pending"
    );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMarks(
      submission.marks !== null
        ? String(submission.marks)
        : ""
    );

    setFeedback(
      submission.feedback ?? ""
    );

    setStatus(
      submission.status === "Reviewed"
        ? "Reviewed"
        : "Pending"
    );

    setError("");
  }, [submission]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numericMarks = Number(marks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0
    ) {
      setError("Marks cannot be negative.");
      return;
    }

    if (numericMarks > assignment.maxMarks) {
      setError(
        `Marks cannot exceed ${assignment.maxMarks}.`
      );
      return;
    }

    if (feedback.length > 2000) {
      setError(
        "Feedback cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSubmit({
        marks: numericMarks,
        feedback: feedback.trim() || null,
        status,
      });

      onCancel();
    } catch {
      setError(
        "Failed to save review. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const percentage =
    assignment.maxMarks > 0 &&
    marks !== "" &&
    !Number.isNaN(Number(marks))
      ? Math.min(
          100,
          Math.max(
            0,
            (Number(marks) /
              assignment.maxMarks) *
              100
          )
        )
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Submission Review
              </p>

              <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900">
                {submission.studentName}
              </h2>

              <p className="mt-1 truncate text-sm text-slate-500">
                {assignment.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close review"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Student Answer */}
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Student Answer
              </h3>

              <p className="text-xs text-slate-500">
                Review the submitted response below.
              </p>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-white p-4 sm:p-5">
            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {submission.answer}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {/* Marks + Status */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Marks */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="review-marks"
                  className="text-sm font-medium text-slate-700"
                >
                  Marks
                </label>

                <span className="text-xs font-medium text-slate-400">
                  Max: {assignment.maxMarks}
                </span>
              </div>

              <input
                id="review-marks"
                type="number"
                min="0"
                max={assignment.maxMarks}
                step="0.01"
                value={marks}
                onChange={(e) =>
                  setMarks(e.target.value)
                }
                required
                disabled={saving}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* Score Preview */}
              {marks !== "" &&
                !Number.isNaN(Number(marks)) && (
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Score
                      </span>

                      <span className="font-semibold text-indigo-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="review-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Review Status
              </label>

              <select
                id="review-status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Pending"
                      | "Reviewed"
                  )
                }
                disabled={saving}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Reviewed">
                  Reviewed
                </option>
              </select>

              <div className="mt-3 flex items-center gap-2">
                {status === "Reviewed" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                    <span className="text-xs font-medium text-emerald-600">
                      This submission will be marked as reviewed.
                    </span>
                  </>
                ) : (
                  <>
                    <MessageSquareText className="h-4 w-4 text-amber-500" />

                    <span className="text-xs font-medium text-amber-600">
                      This submission will remain pending.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="review-feedback"
                className="text-sm font-medium text-slate-700"
              >
                Feedback
              </label>

              <span
                className={`text-xs ${
                  feedback.length >= 1900
                    ? "font-semibold text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {feedback.length}/2000
              </span>
            </div>

            <textarea
              id="review-feedback"
              value={feedback}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
              maxLength={2000}
              rows={6}
              disabled={saving}
              placeholder="Write constructive feedback for the student..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Keep feedback clear and constructive so the student understands
              how they can improve.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-medium">
                  Unable to save review
                </p>

                <p className="mt-0.5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}