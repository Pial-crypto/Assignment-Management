import type { LoginResponse } from "@/types/auth";

const AUTH_KEY = "assignment_management_auth";

export function saveAuth(data: LoginResponse) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify(data)
  );
}

export function getAuth(): LoginResponse | null {
  const value = localStorage.getItem(AUTH_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as LoginResponse;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}