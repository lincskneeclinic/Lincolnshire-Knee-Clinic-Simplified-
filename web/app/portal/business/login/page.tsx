"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getInitialNextPath(): string {
  if (typeof window === "undefined") return "/portal/business";
  const requestedNext = new URLSearchParams(window.location.search).get("next");
  return requestedNext?.startsWith("/") ? requestedNext : "/portal/business";
}

function getInitialError(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("error") === "not-authorized"
    ? "This account is not authorised for the business dashboard."
    : "";
}

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPath] = useState(getInitialNextPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(getInitialError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : signInError.message
        );
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-off-white px-4 py-10 text-text-main">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="w-full rounded-2xl border border-border-clinical bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-clinical-teal">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-deep-navy">Business Dashboard Login</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Sign in with your authorised Lincolnshire Knee Clinic admin account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-email" className="text-xs font-semibold text-text-secondary">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-border-clinical bg-warm-off-white px-4 py-2.5 text-sm text-text-main focus:border-clinical-teal focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="admin-password" className="text-xs font-semibold text-text-secondary">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-border-clinical bg-warm-off-white px-4 py-2.5 text-sm text-text-main focus:border-clinical-teal focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-[#FAD8D8] bg-status-error-bg p-3 text-xs font-medium text-status-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-deep-navy px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#111827] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <Link href="/portal/business/forgot-password" className="text-clinical-teal underline hover:text-deep-navy">
                Forgot password?
              </Link>
              <Link href="/" className="text-text-muted underline hover:text-deep-navy">
                Return to website
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
