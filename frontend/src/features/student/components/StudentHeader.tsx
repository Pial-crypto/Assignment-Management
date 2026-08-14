"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export function StudentHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  function handleLogout() {
    setLoggingOut(true);

    logout();
    router.replace("/login");
  }

  return (
  

<DashboardHeader
  title="Student Dashboard"
  role="Student"
  userName={user?.name}
  onLogout={handleLogout}
  icon={<GraduationCap className="h-5 w-5" />}
/>
  );
}