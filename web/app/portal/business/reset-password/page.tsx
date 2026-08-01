"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BusinessResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.replace("/portal/business");
        router.refresh();
      }, 1500);
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
          <h1 className="text-2xl font-bold text-deep-navy">Set a New Password</h1>

          {success ? (
            <p className="mt-6 text-sm text-text-secondary">
              Password updated. Redirecting you to the dashboard...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="new-password" className="text-xs font-semibold text-text-secondary">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-border-clinical bg-warm-off-white px-4 py-2.5 text-sm text-text-main focus:border-clinical-teal focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirm-password" className="text-xs font-semibold text-text-secondary">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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
                {loading ? "Saving..." : "Save New Password"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
