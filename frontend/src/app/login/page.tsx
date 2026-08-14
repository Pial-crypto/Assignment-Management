"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import { isTokenExpired } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
 
const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
// console.log(user,"What an user i am")
  const [showPassword, setShowPassword] =
    useState(false);

    useEffect(() => {
  if (isLoading) {
    return;
  }
if (user?.expiresAt && isTokenExpired(user.expiresAt)) {
  //console.log("expired");
  return
}

  if (!user) {
    return;
  }

redirect(user?.role)
 
}, [user, isLoading, router]);


const redirect=(role:String)=>{
   if (role === "Admin") {
    router.replace("/dashboard/admin");
  } else if (role === "Teacher") {
    router.replace("/dashboard/teacher");
  } else {
    router.replace("/dashboard/student");
  }
}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(
        email,
        password
      );

     redirect(user?.role)
    } catch {
      setError(
        "Invalid email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-50">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30 lg:grid-cols-2">
          {/* Left Branding Panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            {/* Decorative Circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                <GraduationCap className="h-7 w-7" />
              </div>

              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart Learning Platform
                </div>

                <h2 className="mt-5 max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                  Manage learning.
                  <br />
                  Simplify assignments.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-indigo-100 xl:text-base">
                  A centralized platform for administrators,
                  teachers, and students to manage assignments,
                  submissions, reviews, and results.
                </p>
              </div>
            </div>

            {/* Feature List */}
            <div className="relative z-10 mt-10 space-y-4">
              <Feature
                icon={ShieldCheck}
                title="Secure access"
                description="Role-based access for every user."
              />

              <Feature
                icon={GraduationCap}
                title="Built for education"
                description="Everything your classroom needs in one place."
              />

              <Feature
                icon={LockKeyhole}
                title="Protected data"
                description="Your account and submissions stay protected."
              />
            </div>
          </div>

          {/* Login Panel */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Assignment Management
                </p>

                <p className="text-xs text-slate-500">
                  Smart Learning Platform
                </p>
              </div>
            </div>

            {/* Heading */}
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                Welcome back
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sign in to your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your credentials to continue to your dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <div>
                  <p className="font-semibold">
                    Sign in failed
                  </p>

                  <p className="mt-0.5 text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !email.trim() ||
                  !password
                }
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <p className="text-xs leading-5 text-slate-500">
                Your login is protected by role-based authentication.
                You will automatically be redirected to the appropriate
                dashboard after signing in.
              </p>
            </div>

            {/* Footer */}
            <p className="mt-7 text-center text-xs text-slate-400">
              Assignment Management System
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * Feature Item
 */

interface FeatureProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}

function Feature({
  icon: Icon,
  title,
  description,
}: FeatureProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/10">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-indigo-100">
          {description}
        </p>
      </div>
    </div>
  );
}