"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import {
  createUser,
  deleteUser,
  getClasses,
  getUsers,
} from "../api";

import type {
  User,
  SchoolClass,
} from "../types";

import { useAuth } from "@/features/auth/AuthContext";

type UserRole = "Admin" | "Teacher" | "Student";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    classId: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: "Student",
    classId: "",
  });

  async function loadData() {
    try {
      setError("");
      setLoading(true);

      const [usersData, classesData] = await Promise.all([
        getUsers(),
        getClasses(),
      ]);

      setUsers(usersData);
      setClasses(classesData);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  console.log(users,"All the users ")

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    try {
      setCreating(true);

      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        classId:
          form.role === "Student" && form.classId
            ? Number(form.classId)
            : null,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        role: "Student",
        classId: "",
      });

      setShowPassword(false);

      await loadData();
    } catch {
      setError("Failed to create user. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);

      await deleteUser(id);
      await loadData();
    } catch {
      setError("Failed to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function getRoleStyles(role: UserRole) {
    switch (role) {
      case "Admin":
        return "bg-purple-50 text-purple-700 ring-purple-600/10";

      case "Teacher":
        return "bg-blue-50 text-blue-700 ring-blue-600/10";

      case "Student":
      default:
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    }
  }

  function getRoleIcon(role: UserRole) {
    switch (role) {
      case "Admin":
        return ShieldCheck;

      case "Teacher":
        return GraduationCap;

      case "Student":
      default:
        return UserRound;
    }
  }

  return (
    <section className="space-y-6">
      {/* Global Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      {/* Create User */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Create User
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create administrators, teachers, and students.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleCreate}
          className="p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="user-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="user-name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                  disabled={creating}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="user-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="user-email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                  disabled={creating}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="user-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter temporary password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                  disabled={creating}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="user-role"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Role
              </label>

              <select
                id="user-role"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as UserRole,
                    classId: "",
                  })
                }
                disabled={creating}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="Admin">
                  Admin
                </option>

                <option value="Teacher">
                  Teacher
                </option>

                <option value="Student">
                  Student
                </option>
              </select>
            </div>

            {/* Class */}
            {form.role === "Student" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="user-class"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Class
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    id="user-class"
                    value={form.classId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        classId: e.target.value,
                      })
                    }
                    required
                    disabled={creating}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select student class
                    </option>

                    {classes.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="mt-5 flex justify-end ">
            <button
              type="submit"
              
              disabled={
                creating ||
                !form.name.trim() ||
                !form.email.trim() ||
                !form.password ||
                (form.role === "Student" && !form.classId)
              }
              className="cursor-pointer inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 cursor-pointer" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Users */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Users
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage all users in the system.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              <Users className="h-4 w-4" />
              {users.length}{" "}
              {users.length === 1 ? "user" : "users"}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />

            <p className="text-sm">
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          /* Empty */
          <div className="m-4 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center sm:m-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first user using the form above.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(
                      user.role as UserRole
                    );

                    const isCurrentUser =
                      user.id === currentUser?.userId;

                    const isDeleting =
                      deletingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="group transition hover:bg-slate-50"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <RoleIcon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {user.name}
                              </p>

                              {isCurrentUser && (
                                <span className="text-xs text-indigo-600">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="h-4 w-4 text-slate-400" />

                            <span className="truncate">
                              {user.email}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getRoleStyles(
                              user.role as UserRole
                            )}`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />

                            {user.role}
                          </span>
                        </td>

                        {/* Class */}
                        <td className="px-5 py-4">
                          {user.className ? (
                            <div className="flex items-center gap-2 text-slate-700">
                              <BookOpen className="h-4 w-4 text-slate-400" />

                              {user.className}
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(user.id)
                              }
                              disabled={isDeleting}
                              className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}

                          {isCurrentUser && (
                            <span className="text-xs font-medium text-slate-400">
                              Current account
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {users.map((user) => {
                const RoleIcon = getRoleIcon(
                  user.role as UserRole
                );

                const isCurrentUser =
                  user.id === currentUser?.userId;

                const isDeleting =
                  deletingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <RoleIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                          disabled={isDeleting}
                          aria-label={`Delete ${user.name}`}
                          className="cursor-pointer inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getRoleStyles(
                          user.role as UserRole
                        )}`}
                      >
                        <RoleIcon className="h-3.5 w-3.5" />

                        {user.role}
                      </span>

                      {user.className && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <BookOpen className="h-3.5 w-3.5" />

                          {user.className}
                        </span>
                      )}

                      {isCurrentUser && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}