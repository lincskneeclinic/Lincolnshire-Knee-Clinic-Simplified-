"use client";

import React, { useState } from "react";

interface NewsletterSignupProps {
  /** Variant changes background/colour treatment for light vs dark contexts */
  variant?: "light" | "dark";
  className?: string;
  title?: string;
  subtitle?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = "light",
  className = "",
  title = "Sign up for knee health updates",
  subtitle = "Receive occasional patient education updates from Lincolnshire Knee Clinic about knee health, clinic services and new educational resources.",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [consentChecked, setConsentChecked] = useState(false); // MUST default to false
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDark = variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!consentChecked) {
      setErrorMessage("Please confirm your consent by checking the box.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim() || undefined,
          consentChecked,
          consentSource: "newsletter-signup-component",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Contact signup submission error:", err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-6 rounded-xl text-center ${isDark ? "bg-white/5 border border-white/10" : "bg-pale-clinical-blue border border-clinical-teal/20"} ${className}`}>
        <div className={`text-lg font-bold mb-2 ${isDark ? "text-clinical-teal" : "text-deep-navy"}`}>
          ✓ Thank you for signing up!
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? "text-[#D7E0E5]/80" : "text-text-secondary"}`}>
          You are now subscribed to receive knee health blogs, newsletters, and clinic updates from Lincolnshire Knee Clinic. You can unsubscribe at any time.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? "text-clinical-teal" : "text-clinical-teal"}`}>
        Stay Informed
      </p>
      <h3 className={`font-serif text-lg md:text-xl font-bold mb-2 ${isDark ? "text-white" : "text-deep-navy"}`}>
        {title}
      </h3>
      <p className={`text-xs leading-relaxed mb-5 ${isDark ? "text-[#D7E0E5]/75" : "text-text-secondary"}`}>
        {subtitle}
      </p>

      {errorMessage && (
        <div className="mb-4 text-xs p-3 rounded-lg bg-status-error-bg text-status-error border border-status-error/20 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name (Required) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-name"
            className={`text-xs font-semibold ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            Full Name <span className="text-status-error">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="e.g. Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none focus:border-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
                : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
            }`}
          />
        </div>

        {/* Email (Required) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-email"
            className={`text-xs font-semibold ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            Email Address <span className="text-status-error">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none focus:border-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
                : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
            }`}
          />
        </div>

        {/* Mobile Number (Optional) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-mobile"
            className={`text-xs font-semibold ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            Mobile Number <span className={`font-normal ${isDark ? "text-[#8BA5B5]" : "text-text-muted"}`}>(optional)</span>
          </label>
          <input
            id="contact-mobile"
            type="tel"
            placeholder="e.g. 07700 900123"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            autoComplete="tel"
            className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none focus:border-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
              isDark
                ? "bg-white/10 border-white/20 text-white placeholder:text-[#D7E0E5]/50 focus:bg-white/15"
                : "bg-white border-border-clinical text-text-primary placeholder:text-text-muted"
            }`}
          />
        </div>

        {/* Consent Checkbox — MUST remain unchecked by default */}
        <div className="flex gap-3 items-start pt-1">
          <input
            type="checkbox"
            id="contact-consent"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            required
            className="mt-1 shrink-0 w-4 h-4 accent-clinical-teal cursor-pointer"
          />
          <label
            htmlFor="contact-consent"
            className={`cursor-pointer text-xs leading-relaxed ${isDark ? "text-[#BFD0DA]" : "text-text-secondary"}`}
          >
            I&apos;d like to receive knee health blogs, newsletters, and updates from Lincolnshire Knee Clinic
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !consentChecked || !name.trim() || !email.trim()}
          className={`w-full rounded-lg py-3 text-sm font-bold transition-all min-h-[44px] ${
            !loading && consentChecked && name.trim() && email.trim()
              ? "bg-clinical-teal text-white hover:bg-[#009DB5] cursor-pointer shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal"
              : "bg-clinical-teal/30 text-white/50 cursor-not-allowed"
          }`}
        >
          {loading ? "Submitting..." : "Subscribe to Updates"}
        </button>

        <p className={`text-xs leading-relaxed ${isDark ? "text-[#8BA5B5]" : "text-text-muted"}`}>
          We respect your privacy. You can unsubscribe at any time. Read our{" "}
          <a
            href="/privacy-policy"
            className="text-clinical-teal hover:underline font-semibold"
          >
            Privacy Policy
          </a>.
        </p>
      </form>
    </div>
  );
};
