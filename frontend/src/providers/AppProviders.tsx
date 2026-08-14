"use client";

import { AuthProvider } from "@/features/auth/AuthContext";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}