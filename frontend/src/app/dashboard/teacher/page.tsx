"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Loader2,
  Plus,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import {
  createAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getMyAssignments,
  getMyTeacherAssignments,
  publishAssignment,
  reviewSubmission,
  unpublishAssignment,
  updateAssignment,
} from "@/features/teacher/api";

import type {
  Assignment,
  Submission,
  TeacherAssignment,
} from "@/features/teacher/types";

import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { TeacherStatCard } from "@/features/teacher/components/TeacherStatCard";
import { TeacherAssignmentList } from "@/features/teacher/components/TeacherAssignmentList";
import { AssignmentCard } from "@/features/teacher/components/AssignmentCard";
import { AssignmentForm } from "@/features/teacher/components/AssignmentForm";
import { SubmissionList } from "@/features/teacher/components/SubmissionList";
import { ReviewSubmissionForm } from "@/features/teacher/components/ReviewSubmissionForm";

export default function TeacherDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <TeacherDashboardContent />
    </ProtectedRoute>
  );
}

function TeacherDashboardContent() {
  const [teacherAssignments, setTeacherAssignments] =
    useState<TeacherAssignment[]>([]);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [showAssignmentForm, setShowAssignmentForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        teacherAssignmentData,
        assignmentData,
      ] = await Promise.all([
        getMyTeacherAssignments(),
        getMyAssignments(),
      ]);

      setTeacherAssignments(
        teacherAssignmentData
      );

      setAssignments(
        assignmentData
      );
    } catch {
      setError(
        "Failed to load teacher data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  

  const draftCount = useMemo(
    () =>
      assignments.filter(
        (item) =>
          item.status === "Draft"
      ).length,
    [assignments]
  );

  const publishedCount = useMemo(
    () =>
      assignments.filter(
        (item) =>
          item.status === "Published"
      ).length,
    [assignments]
  );



  async function handleCreateOrUpdate(
    data: {
      teacherAssignmentId?: number;
      title: string;
      description: string;
      deadline: string;
      maxMarks: number;
    }
  ) {
    try {
      setError("");

      if (selectedAssignment) {
        await updateAssignment(
          selectedAssignment.id,
          {
            title: data.title,
            description: data.description,
            deadline: data.deadline,
            maxMarks: data.maxMarks,
          }
        );
      } else {
        await createAssignment({
          teacherAssignmentId:
            data.teacherAssignmentId!,
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          maxMarks: data.maxMarks,
        });
      }

      setSelectedAssignment(null);
      setSelectedSubmission(null);
      setSubmissions([]);
      setShowAssignmentForm(false);

      await loadData();
    } catch {
      setError(
        selectedAssignment
          ? "Failed to update assignment."
          : "Failed to create assignment."
      );

      throw new Error(
        selectedAssignment
          ? "Failed to update assignment."
          : "Failed to create assignment."
      );
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Delete this draft assignment?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteAssignment(id);

      await loadData();
    } catch {
      setError(
        "Failed to delete assignment."
      );
    }
  }


  async function handlePublish(id: number) {
    try {
      setError("");

      await publishAssignment(id);

      await loadData();
    } catch {
      setError(
        "Failed to publish assignment."
      );
    }
  }



  async function handleUnpublish(id: number) {
    try {
      setError("");

      await unpublishAssignment(id);

      await loadData();
    } catch {
      setError(
        "Failed to unpublish assignment."
      );
    }
  }


  async function handleViewSubmissions(
    assignmentId: number
  ) {
    try {
      setError("");

      const data =
        await getAssignmentSubmissions(
          assignmentId
        );

      const assignment =
        assignments.find(
          (item) =>
            item.id === assignmentId
        ) ?? null;

      setSubmissions(data);
      setSelectedAssignment(assignment);

      // Make sure we are NOT in edit mode
      setShowAssignmentForm(false);

      // Close any previously opened review
      setSelectedSubmission(null);
    } catch {
      setError(
        "Failed to load submissions."
      );
    }
  }



  function handleReview(
    submission: Submission
  ) {
    setSelectedSubmission(
      submission
    );
  }



  async function handleReviewSubmit(
    data: {
      marks: number;
      feedback: string | null;
      status: "Pending" | "Reviewed";
    }
  ) {
    if (!selectedSubmission) {
      return;
    }

    try {
      setError("");

      await reviewSubmission(
        selectedSubmission.id,
        data
      );

      if (selectedAssignment) {
        const updated =
          await getAssignmentSubmissions(
            selectedAssignment.id
          );

        setSubmissions(updated);

        const current =
          updated.find(
            (item) =>
              item.id ===
              selectedSubmission.id
          );

        setSelectedSubmission(
          current ?? null
        );
      }
    } catch {
      setError(
        "Failed to save review."
      );

      throw new Error(
        "Failed to save review."
      );
    }
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <TeacherHeader />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Loading teacher dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preparing your assignments and classes...
            </p>
          </div>
        </div>
      </main>
    );
  }



  if (
    selectedSubmission &&
    selectedAssignment
  ) {
    return (
      <main className="min-h-screen bg-slate-100">
        <TeacherHeader />

        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <ReviewSubmissionForm
            submission={
              selectedSubmission
            }
            assignment={
              selectedAssignment
            }
            onSubmit={
              handleReviewSubmit
            }
            onCancel={() =>
              setSelectedSubmission(
                null
              )
            }
          />
        </div>
      </main>
    );
  }


  if (showAssignmentForm) {
    return (
      <main className="min-h-screen bg-slate-100">
        <TeacherHeader />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          <AssignmentForm
            teacherAssignments={
              teacherAssignments
            }
            assignment={
              selectedAssignment
            }
            onSubmit={
              handleCreateOrUpdate
            }
            onCancel={() => {
              setShowAssignmentForm(
                false
              );

              setSelectedAssignment(
                null
              );

              setError("");
            }}
          />
        </div>
      </main>
    );
  }


  // Submission List View
  //
  // IMPORTANT:
  // We check submissions.length instead of
  // `selectedAssignment && submissions`
  // because [] is truthy in JavaScript.

  if (
    selectedAssignment &&
    submissions.length >= 0 &&
    !showAssignmentForm
  ) {
    /*
     * We only want to show SubmissionList when the user
     * explicitly clicked "View Submissions".
     *
     * Therefore we need a reliable signal.
     *
     * The cleanest signal here is:
     * selectedAssignment + submissions loaded.
     *
     * Since an empty submissions array is valid, we use
     * selectedAssignment together with the fact that this
     * state is only set by handleViewSubmissions.
     */

    return (
      <main className="min-h-screen bg-slate-100">
        <TeacherHeader />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          <SubmissionList
            submissions={
              submissions
            }
            onReview={
              handleReview
            }
            onBack={() => {
              setSelectedAssignment(
                null
              );

              setSelectedSubmission(
                null
              );

              setSubmissions([]);

              setError("");
            }}
          />
        </div>
      </main>
    );
  }

  // =========================================================
  // Main Dashboard
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-100">
      <TeacherHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-0.5 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Intro */}
        <section className="mb-7">
          <p className="text-sm font-semibold text-indigo-600">
            Teacher Workspace
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage Your Classroom
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your assigned classes, create
            assignments, publish work, and review
            student submissions.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TeacherStatCard
            title="Assigned Classes / Subjects"
            value={
              teacherAssignments.length
            }
            description="Your active teaching assignments"
            icon={BookOpen}
          />

          <TeacherStatCard
            title="Draft Assignments"
            value={draftCount}
            description="Assignments waiting to be published"
            icon={ClipboardList}
          />

          <TeacherStatCard
            title="Published Assignments"
            value={publishedCount}
            description="Assignments visible to students"
            icon={FileCheck2}
          />
        </section>

        {/* Classes & Subjects */}
        <section className="mt-8">
          <TeacherAssignmentList
            assignments={
              teacherAssignments
            }
          />
        </section>

        {/* Assignments */}
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <ClipboardList className="h-4 w-4" />
                </div>

                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  My Assignments
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Create, edit, publish, and manage your
                assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedAssignment(
                  null
                );

                setSelectedSubmission(
                  null
                );

                setSubmissions([]);

                setError("");

                setShowAssignmentForm(
                  true
                );
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </button>
          </div>

          {/* Empty Assignments */}
          {assignments.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <ClipboardList className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No assignments yet
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                Create your first assignment for one
                of your assigned classes and subjects.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedAssignment(
                    null
                  );

                  setSelectedSubmission(
                    null
                  );

                  setSubmissions([]);

                  setError("");

                  setShowAssignmentForm(
                    true
                  );
                }}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </button>
            </div>
          ) : (
            /* Assignment Cards */
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {assignments.map(
                (assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={
                      assignment
                    }
                    onEdit={(item) => {
                      setSelectedAssignment(
                        item
                      );

                      setSelectedSubmission(
                        null
                      );

                      setSubmissions([]);

                      setError("");

                      setShowAssignmentForm(
                        true
                      );
                    }}
                    onDelete={
                      handleDelete
                    }
                    onPublish={
                      handlePublish
                    }
                    onUnpublish={
                      handleUnpublish
                    }
                    onViewSubmissions={
                      handleViewSubmissions
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}