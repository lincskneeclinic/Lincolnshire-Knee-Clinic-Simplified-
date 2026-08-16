"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Same WhatsApp number/tracking pattern as components/WhatsAppButton.tsx —
// this prompt sits next to that button and hands off to the same channel.
const WHATSAPP_NUMBER = "447770473437";

// Pages where a proactive nudge appears after a delay, and what it says.
// Keyed by exact pathname — add more page-specific prompts here without
// touching anything else. Kept short: one sentence, one clear next step.
// delayMs defaults to DEFAULT_PROMPT_DELAY_MS if omitted — booking uses a
// shorter delay since it's already a decision point; general page browsing
// uses a longer one so it feels like "they've been reading a while".
const PAGE_PROMPTS: Record<string, { message: string; delayMs?: number }> = {
  "/book-appointment": { message: "Need any help booking your consultation? We're happy to help.", delayMs: 12000 },
  "/treatments/total-knee-replacement": { message: "Questions about knee replacement surgery? We're happy to help on WhatsApp." },
  "/treatments/acl-reconstruction": { message: "Questions about ACL reconstruction? We're happy to help on WhatsApp." },
  "/injections": { message: "Wondering if a knee injection could help you? Ask us on WhatsApp." },
};

const DEFAULT_PROMPT_DELAY_MS = 30000;
// One dismissal (of any prompt) quiets this for the rest of the browser tab's
// session — a visitor who's already said "no thanks" shouldn't get nudged
// again on every page they click through to.
const SESSION_DISMISS_KEY = "lkc_page_prompt_dismissed";

export const ProactivePagePrompt: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true); // fails open — a settings-fetch hiccup shouldn't silently disable this
  const config = pathname ? PAGE_PROMPTS[pathname] : undefined;
  const message = config?.message;

  useEffect(() => {
    fetch("/api/site-settings/engagement")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings && typeof data.settings.whatsappNudgeEnabled === "boolean") {
          setEnabled(data.settings.whatsappNudgeEnabled);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setVisible(false);
    if (!config) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") return;

    const timer = setTimeout(() => setVisible(true), config.delayMs ?? DEFAULT_PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, config]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  };

  const handleMessageClick = () => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "whatsapp_click", source: "page_prompt" }),
    }).catch(() => {});
    dismiss();
  };

  if (!message || !visible || !enabled) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello, I have a question about booking a consultation."
  )}`;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 right-5 z-50 max-w-[260px] bg-white rounded-2xl shadow-xl border border-border-clinical p-4 animate-fadeIn"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main rounded-full cursor-pointer text-lg leading-none"
      >
        ×
      </button>
      <p className="text-sm text-text-main font-medium pr-4 mb-3">{message}</p>
      <a
        href={whatsappUrl}
        onClick={handleMessageClick}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-lg hover:brightness-95 transition-all"
      >
        💬 Message us on WhatsApp
      </a>
      {/* Speech-bubble pointer, aimed down at the WhatsApp button */}
      <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-border-clinical rotate-45" />
    </div>
  );
};
