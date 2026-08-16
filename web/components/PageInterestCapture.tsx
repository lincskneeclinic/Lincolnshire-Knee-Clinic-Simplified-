"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NewsletterSignup } from "@/components/NewsletterSignup";

// Pages where a quiet email-capture card appears after a delay, tagged with
// the topic that page is about. No message is sent at signup time — see
// welcomeSeries.ts's deferStart handling for the next-day/follow-up schedule.
const PAGE_CAPTURE_CONFIG: Record<string, { primaryInterest: string; topicLabel: string }> = {
  "/treatments/total-knee-replacement": { primaryInterest: "Knee Replacement & Surgery", topicLabel: "Total Knee Replacement" },
  "/treatments/acl-reconstruction": { primaryInterest: "Sports Injuries & ACL", topicLabel: "ACL Reconstruction" },
  "/injections": { primaryInterest: "Injections & Preservation", topicLabel: "Knee Injections" },
};

const CAPTURE_DELAY_MS = 30000;
// One dismissal (of any capture card) quiets this for the rest of the
// browser tab's session. Separate from ProactivePagePrompt's own dismiss key
// so closing one doesn't suppress the other.
const SESSION_DISMISS_KEY = "lkc_interest_capture_dismissed";

export const PageInterestCapture: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true); // fails open — a settings-fetch hiccup shouldn't silently disable this
  const config = pathname ? PAGE_CAPTURE_CONFIG[pathname] : undefined;

  useEffect(() => {
    fetch("/api/site-settings/engagement")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings && typeof data.settings.emailCaptureEnabled === "boolean") {
          setEnabled(data.settings.emailCaptureEnabled);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setVisible(false);
    if (!config) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") return;

    const timer = setTimeout(() => setVisible(true), CAPTURE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, config]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  };

  if (!config || !visible || !enabled) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-[320px] bg-white rounded-2xl shadow-xl border border-border-clinical p-4 animate-fadeIn"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main rounded-full cursor-pointer text-lg leading-none"
      >
        ×
      </button>
      <NewsletterSignup
        variant="light"
        title={`Thinking about ${config.topicLabel}?`}
        subtitle="We'll send you a few helpful, no-pressure emails about it. Unsubscribe anytime."
        submitLabel="Yes, keep me updated"
        primaryInterest={config.primaryInterest}
        consentSource={`page-context-prompt:${pathname}`}
      />
    </div>
  );
};
