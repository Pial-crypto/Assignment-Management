"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export function TeacherHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    setLoggingOut(true);

    logout();
    router.replace("/login");
  }

  return (
   

<DashboardHeader
  title="Teacher Dashboard"
  role="Teacher"
  userName={user?.name}
  onLogout={handleLogout}
  icon={<GraduationCap className="h-5 w-5" />}
/>
  );
}