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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return; // Do not proceed unless consent explicitly given
    // TODO (Phase 2): Insert into Supabase marketing_consents table
    // Only if consentChecked === true. Never store clinical data.
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:border-clinical-teal ${
            isDark
              ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
              : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
          }`}
        />
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:border-clinical-teal ${
            isDark
              ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
              : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
          }`}
        />

        {/* Consent checkbox — MUST remain unticked by default */}
        <div className="flex gap-2 items-start text-xs">
          <input
            type="checkbox"
            id="newsletter-consent"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <label
            htmlFor="newsletter-consent"
            className={`cursor-pointer leading-relaxed ${isDark ? "text-[#D7E0E5]/80" : "text-text-secondary"}`}
          >
            I agree to receive occasional email updates from Lincolnshire Knee Clinic about knee health,
            clinic services and patient education. I understand I can unsubscribe at any time.
          </label>
        </div>

        <button
          type="submit"
          disabled={!consentChecked || !name || !email}
          className={`w-full rounded-lg py-2.5 text-sm font-bold transition-all ${
            consentChecked && name && email
              ? "bg-clinical-teal text-white hover:bg-[#009DB5] cursor-pointer shadow-sm"
              : "bg-clinical-teal/30 text-white/50 cursor-not-allowed"
          }`}
        >
          Subscribe
        </button>

        <p className={`text-[10px] leading-relaxed ${isDark ? "text-[#D7E0E5]/50" : "text-text-muted"}`}>
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
