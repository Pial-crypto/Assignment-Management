"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { isTokenExpired } from "@/lib/auth";

export default function DashboardRouter() {
  const router = useRouter();

  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
if (user?.expiresAt && isTokenExpired(user.expiresAt)) {
  //console.log("expired");
    router.replace("/login");
}
    if (!user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "Admin":
        router.replace("/dashboard/admin");
        break;

      case "Teacher":
        router.replace("/dashboard/teacher");
        break;

      case "Student":
        router.replace("/dashboard/student");
        break;
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}