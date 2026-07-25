"use client";

import React, { useState } from "react";

interface NewsletterSignupProps {
  /** Variant changes background/colour treatment for light vs dark contexts */
  variant?: "light" | "dark";
  className?: string;
}

/**
 * FUTURE SUPABASE MARKETING TABLE ARCHITECTURE (Phase 2)
 * =======================================================
 * When Supabase is connected, submissions from this component should be
 * inserted into the `marketing_consents` table only if `consentChecked === true`.
 *
 * Schema (see /lib/futureMarketingSchema.ts for full detail):
 *   - id                   uuid
 *   - name                 text
 *   - email                text
 *   - consent_status       boolean  ← must be TRUE before inserting
 *   - consent_timestamp    timestamptz
 *   - consent_source       text     ← e.g. "footer", "contact-page", "homepage"
 *   - consent_text_version text     ← e.g. "v1.0-2024-07"
 *   - unsubscribe_status   boolean  DEFAULT false
 *
 * STRICTLY PROHIBITED in this table:
 *   - Symptoms, diagnoses, treatment interests
 *   - Clinical history or special category health data (UK GDPR Art. 9)
 *
 * Do NOT connect Supabase until explicitly instructed.
 */

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = "light",
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consentChecked, setConsentChecked] = useState(false); // MUST default to false
  const [submitted, setSubmitted] = useState(false);

  const isDark = variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked || !email) return;

    // Detect primary interest from current page URL
    let primaryInterest = "General Joint Health";
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("injection") || path.includes("arthrosamid") || path.includes("prp")) {
        primaryInterest = "Injections & Preservation";
      } else if (path.includes("replacement") || path.includes("arthroplasty") || path.includes("surgery")) {
        primaryInterest = "Knee Replacement & Surgery";
      } else if (path.includes("acl") || path.includes("sports") || path.includes("meniscus")) {
        primaryInterest = "Sports Injuries & ACL";
      }
    }

    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          primaryInterest,
          topics: ["Knee Health Updates", "Patient Education"],
          pagesVisited: [typeof window !== "undefined" ? window.location.pathname : "/"],
        }),
      });
    } catch (err) {
      console.error("Footer newsletter signup error:", err);
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className={`text-base font-bold mb-1 ${isDark ? "text-clinical-teal" : "text-clinical-teal"}`}>
          Thank you for signing up!
        </div>
        <p className={`text-xs ${isDark ? "text-[#D7E0E5]/70" : "text-text-muted"}`}>
          You can unsubscribe at any time using the link in any email we send.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? "text-clinical-teal" : "text-clinical-teal"}`}>
        Patient Education
      </p>
      <h3 className={`font-serif text-lg font-bold mb-2 ${isDark ? "text-white" : "text-deep-navy"}`}>
        Sign up for knee health updates
      </h3>
      <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-[#D7E0E5]/75" : "text-text-secondary"}`}>
        Receive occasional patient education updates from Lincolnshire Knee Clinic about knee health,
        clinic services and new educational resources.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="newsletter-name"
            className={`text-xs font-semibold ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            Your name
          </label>
          <input
            id="newsletter-name"
            type="text"
            placeholder="e.g. Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className={`w-full rounded-lg px-3 py-2.5 text-base border focus:outline-none focus:border-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
                : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
            }`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="newsletter-email"
            className={`text-xs font-semibold ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={`w-full rounded-lg px-3 py-2.5 text-base border focus:outline-none focus:border-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
                : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
            }`}
          />
        </div>

        {/* Consent checkbox — MUST remain unticked by default */}
        <div className="flex gap-3 items-start">
          <input
            type="checkbox"
            id="newsletter-consent"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 shrink-0 w-4 h-4 accent-clinical-teal"
          />
          <label
            htmlFor="newsletter-consent"
            className={`cursor-pointer text-sm leading-relaxed ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            I agree to receive occasional email updates from Lincolnshire Knee Clinic about knee health,
            clinic services and patient education. I understand I can unsubscribe at any time.
          </label>
        </div>

        <button
          type="submit"
          disabled={!consentChecked || !name || !email}
          aria-disabled={!consentChecked || !name || !email}
          className={`w-full rounded-lg py-3 text-base font-bold transition-all min-h-[48px] ${
            consentChecked && name && email
              ? "bg-clinical-teal text-white hover:bg-[#009DB5] cursor-pointer shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal"
              : "bg-clinical-teal/30 text-white/50 cursor-not-allowed"
          }`}
        >
          Subscribe
        </button>

        <p className={`text-xs leading-relaxed ${isDark ? "text-[#8BA5B5]" : "text-text-muted"}`}>
          We will only use your email for updates if you choose to opt in. You can unsubscribe at any
          time. See our{" "}
          <a
            href="/privacy-policy"
            className="text-clinical-teal hover:underline font-semibold"
          >
            Privacy Policy
          </a>{" "}
          for details. Newsletter sign-up is not required to book an appointment.
        </p>
      </form>
    </div>
  );
};
