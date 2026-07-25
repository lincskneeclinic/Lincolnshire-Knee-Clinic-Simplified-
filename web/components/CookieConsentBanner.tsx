"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lkc_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (decision: "accepted" | "declined") => {
    localStorage.setItem("lkc_cookie_consent", decision);
    setShowBanner(false);
    // Dispatch custom event to notify ClarityAnalytics
    window.dispatchEvent(new Event("lkc_cookie_consent_change"));
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 bg-deep-navy/95 backdrop-blur-md border-t border-clinical-teal/30 text-white p-4 md:p-6 shadow-2xl transition-all font-sans"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 pr-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clinical-teal" />
            <h3 className="text-sm font-bold tracking-tight">Privacy &amp; Cookie Preferences</h3>
          </div>
          <p className="text-xs text-[#D7E0E5]/80 leading-relaxed max-w-4xl">
            Lincolnshire Knee Clinic uses essential cookies for website operation, and optional anonymous web analytics cookies (Microsoft Clarity) to understand visitor interest and improve knee health guides. Read our{" "}
            <Link href="/privacy-policy" className="text-clinical-teal hover:underline font-semibold">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => handleConsent("declined")}
            className="flex-1 md:flex-none text-xs font-semibold py-2.5 px-4 rounded-xl border border-[#D7E0E5]/30 text-[#D7E0E5] hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="flex-1 md:flex-none text-xs font-bold py-2.5 px-5 rounded-xl bg-clinical-teal hover:bg-clinical-teal-hover text-white transition-colors shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal cursor-pointer"
          >
            Accept Analytics Cookies
          </button>
        </div>
      </div>
    </div>
  );
};
