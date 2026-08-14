"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { LoginResponse } from "@/types/auth";
import { clearAuth, getAuth, saveAuth } from "@/lib/auth";
import { login as loginApi } from "./api";

interface AuthContextValue {
  user: LoginResponse | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<LoginResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getAuth();

    setUser(storedAuth);
    setIsLoading(false);
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const result = await loginApi({
      email,
      password,
    });

    saveAuth(result);
    setUser(result);

    return result;
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}