"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileCheck2,
  LogOut,
  Users,
  UserRoundCheck,
  School,
  Clock3,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";

import {
  getDashboardStats,
} from "@/features/admin/api";

import type {
  DashboardStats,
} from "@/features/admin/types";

import { StatCard } from "@/features/admin/components/StatCard";
import { UserManagement } from "@/features/admin/components/UserManagement";
import { ClassManagement } from "@/features/admin/components/ClassManagement";
import { SubjectManagement } from "@/features/admin/components/SubjectManagement";
import { TeacherAssignmentManagement } from "@/features/admin/components/TeacherAssignmentManagement";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AdminHeader } from "@/features/admin/components/AdminHeader";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user, logout } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setError("");

        const data =
          await getDashboardStats();

        setStats(data);
      } catch(error) {
        setError(
          "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Loading dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preparing your admin overview...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {error || "Dashboard data is unavailable."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
  
<AdminHeader onLogout={logout} userName={user?.name}/>
      {/* Main Content */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Intro */}
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-medium text-indigo-600">
            Overview
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            School Administration
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Monitor your school system and manage users, classes,
            subjects, and teacher assignments from one place.
          </p>
        </div>

        {/* Statistics */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                System Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current platform statistics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              description="All registered users"
              icon={Users}
            />

            <StatCard
              title="Teachers"
              value={stats.users.teachers}
              description="Active teaching staff"
              icon={GraduationCap}
            />

            <StatCard
              title="Students"
              value={stats.users.students}
              description="Enrolled students"
              icon={UserRoundCheck}
            />

            <StatCard
              title="Classes"
              value={stats.classes}
              description="Active school classes"
              icon={School}
            />

            <StatCard
              title="Subjects"
              value={stats.subjects}
              description="Available subjects"
              icon={BookOpen}
            />

            <StatCard
              title="Assignments"
              value={stats.assignments.total}
              description="Total assignments"
              icon={ClipboardList}
            />

            <StatCard
              title="Published"
              value={stats.assignments.published}
              description="Published assignments"
              icon={FileCheck2}
            />

            <StatCard
              title="Pending Submissions"
              value={stats.submissions.pending}
              description="Awaiting review"
              icon={Clock3}
            />
          </div>
        </section>

        {/* Management */}
        <section className="mt-8 space-y-8 sm:mt-10">
          {/* Users */}
          <UserManagement />

          {/* Classes + Subjects */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <ClassManagement />
            <SubjectManagement />
          </div>

          {/* Teacher Assignments */}
          <TeacherAssignmentManagement />
        </section>
      </div>
    </main>
  );
}