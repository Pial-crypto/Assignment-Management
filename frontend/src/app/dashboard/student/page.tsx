"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import {
  createSubmission,
  getAssignment,
  getMyAssignments,
  getMySubmission,
  updateSubmission,
} from "@/features/student/api";

import type {
  StudentAssignment,
  StudentSubmission,
} from "@/features/student/types";

import { StudentHeader } from "@/features/student/components/StudentHeader";
import { StudentStatCard } from "@/features/student/components/StudentStatCard";
import { AssignmentList } from "@/features/student/components/AssignmentList";
import { AssignmentDetails } from "@/features/student/components/AssignmentDetails";
import { SubmissionForm } from "@/features/student/components/SubmissionForm";
import { SubmissionResult } from "@/features/student/components/SubmissionResult";

import {
  BookOpen as BookOpenIcon,
  CheckCircle2 as CheckCircleIcon,
  Clock3 as ClockIcon,
  ClipboardList as ClipboardIcon,
} from "lucide-react";

type StudentView =
  | "dashboard"
  | "details"
  | "submission"
  | "result";

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}

function StudentDashboardContent() {
  const [assignments, setAssignments] =
    useState<StudentAssignment[]>([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState<StudentAssignment | null>(null);

  const [selectedSubmission, setSelectedSubmission] =
    useState<StudentSubmission | null>(null);

  const [view, setView] =
    useState<StudentView>("dashboard");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyAssignments();

      setAssignments(data);
    } catch {
      setError(
        "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  const submittedCount = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.submissionId !== null
      ).length,
    [assignments]
  );

  const reviewedCount = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.submissionStatus ===
          "Reviewed"
      ).length,
    [assignments]
  );

  const pendingCount =
    assignments.length -
    submittedCount;

  /*
   * Loading State
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <StudentHeader />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Skeleton Header */}
          <div className="animate-pulse">
            <div className="h-7 w-48 rounded-lg bg-slate-200" />

            <div className="mt-2 h-4 w-72 rounded bg-slate-200" />

            {/* Stat Skeletons */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>

            {/* Assignment Skeletons */}
            <div className="mt-8">
              <div className="h-6 w-40 rounded bg-slate-200" />

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length: 3,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 rounded-2xl border border-slate-200 bg-white"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Assignment Details
   */
  if (
    view === "details" &&
    selectedAssignment
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <StudentHeader />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <ErrorBanner
              message={error}
              onClose={() => setError("")}
            />
          )}

          <AssignmentDetails
            assignment={
              selectedAssignment
            }
            onSubmit={
              handleOpenSubmission
            }
            onBack={
              handleBackToDashboard
            }
          />
        </div>
      </main>
    );
  }

  /*
   * Submission Form
   */
  if (
    view === "submission" &&
    selectedAssignment
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <StudentHeader />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <ErrorBanner
              message={error}
              onClose={() => setError("")}
            />
          )}

          <SubmissionForm
            assignment={
              selectedAssignment
            }
            submission={
              selectedSubmission
            }
            onSubmit={handleSubmission}
            onCancel={
              handleBackToDetails
            }
          />
        </div>
      </main>
    );
  }

  /*
   * Submission Result
   */
  if (
    view === "result" &&
    selectedAssignment &&
    selectedSubmission
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <StudentHeader />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <ErrorBanner
              message={error}
              onClose={() => setError("")}
            />
          )}

          <SubmissionResult
            assignment={
              selectedAssignment
            }
            submission={
              selectedSubmission
            }
          />

          <button
            type="button"
            onClick={
              handleBackToDashboard
            }
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <ClipboardIcon className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  /*
   * Dashboard
   */
  return (
    <main className="min-h-screen bg-slate-50">
      <StudentHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Dashboard Intro */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-500" />

          <div className="relative p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpenIcon className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    My Learning Dashboard
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    View your assignments, track submissions,
                    and check your results.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadAssignments}
                disabled={loading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5">
            <ErrorBanner
              message={error}
              onClose={() => setError("")}
            />
          </div>
        )}

        {/* Statistics */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StudentStatCard
            title="Total Assignments"
            value={assignments.length}
            description="Assignments available for your class"
            icon={ClipboardIcon}
          />

          <StudentStatCard
            title="Pending Submission"
            value={pendingCount}
            description="Assignments you have not submitted"
            icon={ClockIcon}
          />

          <StudentStatCard
            title="Reviewed"
            value={reviewedCount}
            description="Assignments reviewed by teachers"
            icon={CheckCircleIcon}
          />
        </section>

        {/* Assignment List */}
        <section className="mt-8">
          <AssignmentList
            assignments={assignments}
            onView={
              handleViewAssignment
            }
          />
        </section>
      </div>
    </main>
  );

  /*
   * View Assignment
   */
  async function handleViewAssignment(
    assignment: StudentAssignment
  ) {
    try {
      setError("");

      const data =
        await getAssignment(
          assignment.id
        );

      setSelectedAssignment(data);
      setSelectedSubmission(null);
      setView("details");
    } catch {
      setError(
        "Failed to load assignment."
      );
    }
  }

  /*
   * Open Submission
   */
  async function handleOpenSubmission() {
    if (!selectedAssignment) {
      return;
    }

    try {
      setError("");

      let submission:
        | StudentSubmission
        | null = null;

      if (
        selectedAssignment.submissionId !==
        null
      ) {
        try {
          submission =
            await getMySubmission(
              selectedAssignment.id
            );
        } catch {
          submission = null;
        }
      }

      setSelectedSubmission(
        submission
      );

      setView("submission");
    } catch {
      setError(
        "Failed to load submission."
      );
    }
  }

  /*
   * Create / Update Submission
   */
  async function handleSubmission(
    answer: string
  ) {
    if (!selectedAssignment) {
      return;
    }

    try {
      setError("");

      if (selectedSubmission) {
        await updateSubmission(
          selectedSubmission.id,
          {
            answer,
          }
        );
      } else {
        await createSubmission({
          assignmentId:
            selectedAssignment.id,
          answer,
        });
      }

      const updatedAssignment =
        await getAssignment(
          selectedAssignment.id
        );

      setSelectedAssignment(
        updatedAssignment
      );

      await loadAssignments();

      const updatedSubmission =
        await getMySubmission(
          selectedAssignment.id
        );

      setSelectedSubmission(
        updatedSubmission
      );

      setView("result");
    } catch {
      setError(
        "Failed to save submission."
      );
    }
  }

  /*
   * Navigation
   */
  function handleBackToDashboard() {
    setSelectedAssignment(null);
    setSelectedSubmission(null);
    setView("dashboard");
    setError("");
  }

  function handleBackToDetails() {
    setSelectedSubmission(null);
    setView("details");
    setError("");
  }
}

/*
 * Error Banner
 */
interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

function ErrorBanner({
  message,
  onClose,
}: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          Something went wrong
        </p>

        <p className="mt-0.5 text-red-600">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
      >
        Dismiss
      </button>
    </div>
  );
}