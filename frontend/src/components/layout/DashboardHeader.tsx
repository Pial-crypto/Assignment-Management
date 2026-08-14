"use client";

import { LogOut, ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  role: string;
  userName?: string;
  onLogout: () => void;
  icon?: React.ReactNode;
}

export function DashboardHeader({
  title,
  role,
  userName,
  onLogout,
  icon,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand / Welcome */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm sm:flex">
            {icon ?? <ShieldCheck className="h-5 w-5" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h1>

              <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 sm:inline-flex">
                {role.toUpperCase()}
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              Welcome back, {userName}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:px-4"
        >
          <LogOut className="h-4 w-4" />

          <span className="hidden sm:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}