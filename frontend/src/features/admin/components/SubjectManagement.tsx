"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createSubject,
  deleteSubject,
  getSubjects,
} from "../api";

import type { Subject } from "../types";
import axios from "axios";

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadSubjects() {
    try {
      setError("");
      setLoading(true);

      const data = await getSubjects();
      setSubjects(data);
    } catch {
      setError("Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setError("");
      setCreating(true);

      await createSubject({
        name: trimmedName,
      });

      setName("");
      await loadSubjects();
    } catch {
      setError("Failed to create subject. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);

      await deleteSubject(id);
      await loadSubjects();
    } catch (error) {
  if (axios.isAxiosError(error)) {
    setError(
      error.response?.data?.message ??
      "Failed to delete subject."
    );
  } else {
    setError(
      "Failed to delete subject."
    );
  }
 } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the subjects available across your classes.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            <BookOpen className="h-4 w-4" />
            <span>
              {subjects.length}{" "}
              {subjects.length === 1 ? "subject" : "subjects"}
            </span>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="border-b border-slate-100 p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <FlaskConical className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subject name..."
              disabled={creating}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className=" cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 " />
                Add Subject
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Subject List */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />

            <p className="text-sm">
              Loading subjects...
            </p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <BookOpen className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No subjects yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first subject using the form above to start building
              your academic structure.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {/* List Header */}
            <div className="hidden grid-cols-[1fr_auto] items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid">
              <span>Subject</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {subjects.map((item) => {
                const isDeleting = deletingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Active subject
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      aria-label={`Delete ${item.name}`}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      <span className="hidden sm:inline">
                        {isDeleting ? "Deleting..." : "Delete"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}