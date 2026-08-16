"use client";

import { useEffect } from "react";

// Mirrors ClarityAnalytics.tsx's pattern exactly (same env-var-gated,
// cookie-consent-gated, duplicate-injection-guarded approach) — the two are
// complementary, not competing: GA4 answers "how many people, which pages,
// where from, did they convert" with aggregate reports, Clarity answers "why"
// with session recordings and heatmaps of actual visitor behavior.
export const GoogleAnalytics: React.FC = () => {
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    const initGA = () => {
      const consent = localStorage.getItem("lkc_cookie_consent");
      if (consent !== "accepted") return;

      // Prevent duplicate script injection
      if ((window as any).gtag) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: unknown[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag("js", new Date());
      gtag("config", measurementId);
    };

    initGA();

    window.addEventListener("lkc_cookie_consent_change", initGA);
    return () => window.removeEventListener("lkc_cookie_consent_change", initGA);
  }, []);

  return null;
};
