"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  X,
} from "lucide-react";

import type {
  Assignment,
  TeacherAssignment,
} from "../types";

interface AssignmentFormProps {
  teacherAssignments: TeacherAssignment[];
  assignment?: Assignment | null;
  onSubmit: (data: {
    teacherAssignmentId?: number;
    title: string;
    description: string;
    deadline: string;
    maxMarks: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function AssignmentForm({
  teacherAssignments,
  assignment,
  onSubmit,
  onCancel,
}: AssignmentFormProps) {
  const [teacherAssignmentId, setTeacherAssignmentId] =
    useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
const [deadlineError, setDeadlineError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description);

      setTeacherAssignmentId(
        String(assignment.teacherAssignmentId)
      );

      setMaxMarks(String(assignment.maxMarks));

      const date = new Date(assignment.deadline);

      const localDate = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setDeadline(localDate);
    } else {
      setTitle("");
      setDescription("");
      setTeacherAssignmentId("");
      setDeadline("");
      setMaxMarks("100");
    }

    setError("");
  }, [assignment]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const numericMarks = Number(maxMarks);

    if (numericMarks <= 0) {
      setError(
        "Maximum marks must be greater than zero."
      );
      return;
    }

    if (!assignment && !teacherAssignmentId) {
      setError(
        "Please select a class and subject."
      );
      return;
    }

    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Assignment description is required.");
      return;
    }

if (!deadline) {
  setDeadlineError("Deadline is required.");
  return;
}

const selectedDeadline = new Date(deadline);

if (Number.isNaN(selectedDeadline.getTime())) {
  setDeadlineError("Please enter a valid date and time.");
  return;
}

if (selectedDeadline.getTime() <= Date.now()) {
  setDeadlineError(
    "Deadline must be a future date and time."
  );
  return;
}
    try {
      setSaving(true);

      await onSubmit({
        teacherAssignmentId: assignment
          ? undefined
          : Number(teacherAssignmentId),

        title: title.trim(),
        description: description.trim(),
        deadline: selectedDeadline.toISOString(),
        maxMarks: numericMarks,
      });

      onCancel();
    } catch {
      setError("Failed to save assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isEditing = Boolean(assignment);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {isEditing
                  ? "Edit Assignment"
                  : "Create Assignment"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Update the assignment details and deadline."
                  : "Create a new assignment and save it as a draft."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close assignment form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-6"
      >
        <div className="space-y-5">
          {/* Class & Subject */}
          {!assignment && (
            <div>
              <label
                htmlFor="teacher-assignment"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Class & Subject
              </label>

              <div className="relative">
                <BookOpen className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="teacher-assignment"
                  value={teacherAssignmentId}
                  onChange={(e) =>
                    setTeacherAssignmentId(e.target.value)
                  }
                  required
                  disabled={saving}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select class and subject
                  </option>

                  {teacherAssignments.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.className} —{" "}
                      {item.subjectName}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ▼
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Choose the class and subject this assignment belongs to.
              </p>
            </div>
          )}

          {/* Editing Assignment Info */}
          {assignment && (
            <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                  Assigned To
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-indigo-900">
                  {assignment.className} —{" "}
                  {assignment.subjectName}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="assignment-title"
                className="text-sm font-medium text-slate-700"
              >
                Assignment Title
              </label>

              <span className="text-xs text-slate-400">
                {title.length}/200
              </span>
            </div>

            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <input
                id="assignment-title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
                maxLength={200}
                disabled={saving}
                placeholder="e.g. Chapter 5 Mathematics Exercise"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="assignment-description"
                className="text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <span className="text-xs text-slate-400">
                {description.length}/5000
              </span>
            </div>

            <textarea
              id="assignment-description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              rows={6}
              maxLength={5000}
              disabled={saving}
              placeholder="Describe the assignment, requirements, instructions, or questions..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Deadline + Marks */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Deadline */}
            <div>
              <label
                htmlFor="assignment-deadline"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Deadline
              </label>

              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

             <input
  id="assignment-deadline"
  type="datetime-local"
  value={deadline}
  onChange={(e) => {
    setDeadline(e.target.value);
    setDeadlineError("");
    setError("");
  }}
  required
  disabled={saving}
  className={`h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:bg-white focus:ring-4 ${
    deadlineError
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
  } disabled:cursor-not-allowed disabled:opacity-60`}
/>

{deadlineError && (
  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
    <AlertCircle className="h-4 w-4 shrink-0" />
    <span>{deadlineError}</span>
  </div>
)}
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Students will see this as the submission deadline.
              </p>
            </div>

            {/* Marks */}
            <div>
              <label
                htmlFor="assignment-marks"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Maximum Marks
              </label>

              <div className="relative">
                <input
                  id="assignment-marks"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={maxMarks}
                  onChange={(e) =>
                    setMaxMarks(e.target.value)
                  }
                  required
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Enter the maximum number of marks students can receive.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-medium">
                  Unable to save assignment
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
              <X className="h-4 w-4" />
              Cancel
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
                  {isEditing
                    ? "Update Assignment"
                    : "Save Draft"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}