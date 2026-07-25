"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UrgentAdviceBanner } from "@/components/UrgentAdviceBanner";
import { WhatsAppButton } from "@/components/WhatsAppButton";

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
        <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
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
    </>
  );
};
