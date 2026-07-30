"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";

export default function CommunityResetPasswordPage() {
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
        router.push("/community");
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
    <div className="max-w-md mx-auto">
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Reset Password" }]} />
      <PageHeader category="Patient Community" title="Set a New Password" />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm">
        {success ? (
          <p className="text-sm text-text-secondary">Password updated. Redirecting you to the community...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Saving..." : "Save New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
