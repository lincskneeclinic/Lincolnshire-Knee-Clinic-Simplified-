"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UrgentAdviceBanner } from "@/components/UrgentAdviceBanner";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProactivePagePrompt } from "@/components/ProactivePagePrompt";
import { PageInterestCapture } from "@/components/PageInterestCapture";
import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

// Routes that should render fullscreen without the global header/footer/banner
const FULLSCREEN_ROUTES = ["/portal/clinician-intake", "/portal/business"];

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isFullscreen) {
    return (
      <>
        <ClarityAnalytics />
        <GoogleAnalytics />
        <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <ClarityAnalytics />
      <GoogleAnalytics />
      {/* WCAG 2.1 AA Keyboard Access skip link */}
      <a href="#main-content" className="skip-link">
        Skip to Main Content
      </a>

      {/* Global Urgent Advice Banner */}
      <UrgentAdviceBanner />

      {/* Global Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        {children}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global floating WhatsApp Business button */}
      <WhatsAppButton />

      {/* Proactive "need help?" nudge on specific pages (e.g. booking) */}
      <ProactivePagePrompt />

      {/* Quiet, dismissible email-interest capture on specific pages (e.g. treatments) */}
      <PageInterestCapture />

      {/* UK GDPR Cookie Consent Banner */}
      <CookieConsentBanner />
    </>
  );
};
