"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();

  const mainNavigation = [
    { name: "Home", href: "/" },
    { name: "Symptoms", href: "/symptoms" },
    { name: "Conditions", href: "/conditions" },
    { name: "Treatments", href: "/treatments" },
    { name: "Injections", href: "/injections" },
    { name: "Diagnostics", href: "/diagnostics" },
    { name: "Education & Blog", href: "/education" },
    { name: "Clinics", href: "/clinics" },
    { name: "Contact", href: "/contact" },
  ];

  const utilityNavigation = [
    { name: "Urgent Advice", href: "/urgent-advice", urgent: true },
    { name: "Patient Portal", href: "/portal" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="relative w-full z-40 bg-white border-b border-border-clinical shadow-[0_2px_15px_rgba(0,43,69,0.03)]">
      {/* Utility Navigation Bar (Desktop Only) */}
      <div className="hidden md:block bg-soft-blue-grey border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-2 flex justify-end gap-6 text-sm font-sans text-text-secondary">
          {utilityNavigation.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className={`hover:text-deep-navy font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal ${
                link.urgent ? "text-status-error font-bold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo Lockup - Left Side */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0 shrink xl:shrink-0 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal"
          aria-label="Lincolnshire Knee Clinic — home"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden shrink-0">
            {logoError ? (
              // Clean fall-back abstract teal K SVG if image has error
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-clinical-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3v18" />
                <path d="M18 4l-10 8 10 8" />
              </svg>
            ) : (
              <img
                src="/brand/lkc-logo-k-transparent.png"
                alt=""
                aria-hidden="true"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <span className="font-serif text-sm min-[380px]:text-base sm:text-lg md:text-xl font-bold text-deep-navy tracking-tight leading-none truncate xl:truncate-none xl:whitespace-nowrap">
            Lincolnshire Knee Clinic
          </span>
        </Link>

        {/* Main Navigation Links - Horizontally Aligned in the Middle (Desktop Only) */}
        <nav className="hidden xl:flex items-center justify-center flex-1 gap-1.5 xl:gap-2.5 2xl:gap-5 px-1" aria-label="Main navigation">
          {mainNavigation.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className={`font-sans text-[11px] xl:text-xs 2xl:text-sm font-semibold py-1.5 transition-colors relative whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal ${
                isActive(link.href)
                  ? "text-deep-navy font-bold border-b-2 border-clinical-teal"
                  : "text-text-secondary hover:text-deep-navy"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Button & Hamburger Toggle - Far Right */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            href="/book-appointment"
            className="hidden xl:inline-flex text-xs 2xl:text-sm py-2 px-3.5 2xl:px-5 min-h-[40px] shadow-[0_2px_4px_rgba(0,175,200,0.08)] whitespace-nowrap"
            variant="teal"
          >
            Book Appointment
          </Button>

          {/* Mobile Menu Hamburger Button - collapses at xl:block to avoid text crowding */}
          <button
            type="button"
            className="xl:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-deep-navy rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Collapsed Layout) */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="xl:hidden absolute top-full left-0 right-0 w-full bg-white border-b border-border-clinical shadow-2xl py-5 px-5 flex flex-col gap-4 z-50 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-2.5" aria-label="Mobile navigation">
            {mainNavigation.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-sans text-base font-semibold py-3 px-3.5 rounded-lg transition-colors min-h-[44px] flex items-center ${
                  isActive(link.href)
                    ? "bg-soft-blue text-deep-navy font-bold"
                    : "text-text-secondary hover:bg-warm-off-white hover:text-deep-navy"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <hr className="border-border-clinical my-1" />

          {/* Mobile Utility Navigation */}
          <div className="flex flex-col gap-3 px-3.5">
            {utilityNavigation.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-sans text-sm font-semibold transition-colors ${
                  link.urgent ? "text-status-error font-bold" : "text-text-secondary hover:text-deep-navy"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Button
              href="/book-appointment"
              className="w-full justify-center py-3 text-base shadow-md"
              variant="teal"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
