"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function BusinessForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/portal/business/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSubmitted(true);
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
          <h1 className="text-2xl font-bold text-deep-navy">Reset Dashboard Password</h1>

          {submitted ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-text-secondary">
                If an authorised admin account exists for <strong>{email}</strong>, a reset link has
                been sent to that address.
              </p>
              <Link href="/portal/business/login" className="text-sm font-semibold text-clinical-teal underline hover:text-deep-navy">
                Back to login
              </Link>
            </div>
          ) : (
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <Link href="/portal/business/login" className="block text-center text-xs text-clinical-teal underline hover:text-deep-navy">
                Back to login
              </Link>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
