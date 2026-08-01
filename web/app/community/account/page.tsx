"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";

interface AccountProfile {
  display_name: string;
  newsletter_opt_in: boolean;
  status: string;
  created_at: string;
}

export default function CommunityAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/community/account");
      if (res.status === 401) {
        router.push("/community/login?next=/community/account");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setEmail(data.email);
        setProfile(data.profile);
        setDisplayName(data.profile?.display_name || "");
        setNewsletterOptIn(Boolean(data.profile?.newsletter_opt_in));
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch("/api/community/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, newsletterOptIn }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save changes.");
        return;
      }
      setMessage("Your account has been updated.");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/community/account", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/community");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/community");
    router.refresh();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage("Your password has been updated.");
    } catch (err) {
      console.error(err);
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading your account...</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Account" }]} />
      <PageHeader category="Patient Community" title="Account Settings" />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <p className="text-xs text-text-muted">
          Logged in as <strong>{email}</strong> (never shown to other members).
          {profile?.created_at && (
            <> Member since {new Date(profile.created_at).toLocaleDateString("en-GB")}.</>
          )}
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="display-name" className="text-xs font-semibold text-text-secondary">
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              required
              minLength={2}
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-main p-3.5 bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl">
            <input
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
            />
            <span>Also send me the Lincolnshire Knee Clinic newsletter.</span>
          </label>

          {message && (
            <div className="bg-pale-clinical-blue border border-clinical-teal/30 text-deep-navy text-xs p-3 rounded-xl font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="pt-4 border-t border-border-clinical">
          <h3 className="text-sm font-bold text-deep-navy mb-3">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-xs font-semibold text-text-secondary">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-new-password" className="text-xs font-semibold text-text-secondary">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                minLength={8}
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
              />
            </div>

            {passwordMessage && (
              <div className="bg-pale-clinical-blue border border-clinical-teal/30 text-deep-navy text-xs p-3 rounded-xl font-medium">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm bg-deep-navy hover:bg-[#111827] text-white cursor-pointer disabled:opacity-60"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-sm font-semibold text-deep-navy border border-border-clinical rounded-xl py-2.5 hover:bg-warm-off-white cursor-pointer"
        >
          Log Out
        </button>

        <div className="pt-4 border-t border-border-clinical">
          <h3 className="text-sm font-bold text-status-error mb-2">Deactivate Account</h3>
          <p className="text-xs text-text-muted mb-3">
            This blocks you from logging in or posting, but keeps your existing posts and
            replies attributed to your display name. To have your data fully erased, please
            contact the clinic directly.
          </p>
          {confirmingDeactivate ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={saving}
                className="text-xs font-bold text-white bg-status-error hover:opacity-90 rounded-lg px-4 py-2 cursor-pointer disabled:opacity-60"
              >
                Yes, deactivate my account
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeactivate(false)}
                className="text-xs font-semibold border border-border-clinical rounded-lg px-4 py-2 cursor-pointer hover:bg-warm-off-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDeactivate(true)}
              className="text-xs font-bold text-status-error hover:underline cursor-pointer"
            >
              Deactivate my account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
