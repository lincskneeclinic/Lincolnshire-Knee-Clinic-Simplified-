"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { CommunityDisclaimerBlock } from "@/components/community/CommunityDisclaimerBlock";

export default function CommunityRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!disclaimerAccepted) {
      setError("You must accept the Community Guidelines & Disclaimer to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName,
          disclaimerAccepted,
          newsletterOptIn,
          website,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (data.requiresEmailConfirmation) {
        setSuccessMessage(data.message);
      } else {
        router.push("/community");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Join" }]} />
      <PageHeader
        category="Patient Community"
        title="Join the Community"
        subtitle="Create a free account to start discussing knee conditions, treatments and recovery with other patients."
      />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {successMessage ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl">
              ✓
            </div>
            <p className="text-sm text-text-secondary">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden -z-10">
              <label htmlFor="community-register-website">Leave this field blank</label>
              <input
                id="community-register-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="display-name" className="text-xs font-semibold text-text-secondary">
                Display Name <span className="text-status-error">*</span>
              </label>
              <input
                id="display-name"
                type="text"
                required
                minLength={2}
                maxLength={40}
                placeholder="e.g. Sarah K"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
              />
              <p className="text-xs text-text-muted">
                This is what other members will see. Your real name and email are never shown to other members.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                Email Address <span className="text-status-error">*</span>
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
                Password <span className="text-status-error">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <CommunityDisclaimerBlock />

            <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-main">
              <input
                type="checkbox"
                required
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
              />
              <span>
                I have read and accept the Community Guidelines &amp; Disclaimer above.{" "}
                <span className="text-status-error">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-main p-3.5 bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
              />
              <span>
                Also send me the Lincolnshire Knee Clinic newsletter (occasional clinical
                updates and education articles). Optional — you can change this anytime in
                your account settings.
              </span>
            </label>

            {error && (
              <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !disclaimerAccepted}
              className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm ${
                disclaimerAccepted
                  ? "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-xs text-text-muted text-center">
              Already have an account?{" "}
              <Link href="/community/login" className="text-clinical-teal underline hover:text-deep-navy">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
