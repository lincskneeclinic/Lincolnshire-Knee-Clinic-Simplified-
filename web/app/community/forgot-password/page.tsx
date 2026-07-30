"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";

export default function CommunityForgotPasswordPage() {
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
      const redirectTo = `${window.location.origin}/community/reset-password`;
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
    <div className="max-w-md mx-auto">
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Forgot Password" }]} />
      <PageHeader category="Patient Community" title="Reset Your Password" />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm">
        {submitted ? (
          <p className="text-sm text-text-secondary">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset
            link to that address.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
              />
            </div>

            {error && (
              <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
