"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";

export default function CommunityLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message);
        return;
      }

      router.push("/community");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Log In" }]} />
      <PageHeader category="Patient Community" title="Log In to Community" />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="flex justify-between text-xs">
            <Link href="/community/forgot-password" className="text-clinical-teal underline hover:text-deep-navy">
              Forgot password?
            </Link>
            <Link href="/community/register" className="text-clinical-teal underline hover:text-deep-navy">
              Join the community
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
