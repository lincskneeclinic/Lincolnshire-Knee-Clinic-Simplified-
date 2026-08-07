"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();

  // Lock page scroll behind the drawer while it's open — standard off-canvas
  // nav behaviour, and also means the backdrop can't reveal a scrolled-away
  // page underneath.
  useEffect(() => {
    if (mobileMenuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close on route change — otherwise the drawer stays open behind the new page.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLElement>(null);
  const linkMapRef = useRef<Map<number, HTMLAnchorElement>>(new Map());

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

  const desktopNavigation = [
    { name: "Symptoms", href: "/symptoms" },
    { name: "Conditions", href: "/conditions" },
    { name: "Treatments", href: "/treatments" },
    { name: "Injections", href: "/injections" },
    { name: "Diagnostics", href: "/diagnostics" },
    { name: "Education & Blog", href: "/education" },
    { name: "Clinics", href: "/clinics" },
  ];

  const utilityNavigation = [
    { name: "Urgent Advice", href: "/urgent-advice", urgent: true },
    { name: "Community", href: "/community" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const activeIndex = desktopNavigation.findIndex((link) => isActive(link.href));

  const updateIndicator = useCallback(
    (targetIndex: number | null) => {
      const targetIdx =
        targetIndex !== null
          ? targetIndex
          : activeIndex >= 0
          ? activeIndex
          : null;

      if (targetIdx !== null) {
        const el = linkMapRef.current.get(targetIdx);
        if (el) {
          setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1,
          });
          return;
        }
      }
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    },
    [activeIndex]
  );

  useEffect(() => {
    updateIndicator(hoveredIndex);
    const handleResize = () => updateIndicator(hoveredIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname, hoveredIndex, activeIndex, updateIndicator]);

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
          className="flex items-center gap-2 sm:gap-3 shrink-0 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal"
          aria-label="Lincolnshire Knee Clinic — home"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden shrink-0">
            {logoError ? (
              // Clean fall-back abstract teal K SVG if image has error
              <svg
                className="w-8 h-8 sm:w-9 sm:h-9 text-clinical-teal"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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
          <span className="font-serif text-[11px] min-[380px]:text-sm sm:text-base md:text-lg lg:text-base xl:text-lg 2xl:text-xl font-bold text-deep-navy tracking-tight leading-none whitespace-nowrap">
            Lincolnshire Knee Clinic
          </span>
        </Link>

        {/* Main Navigation Links with Mouse-Following Sliding Underscore Indicator */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHoveredIndex(null)}
          className="hidden lg:flex items-center justify-center flex-1 gap-1 lg:gap-1.5 xl:gap-2.5 2xl:gap-5 px-1 relative py-1.5 min-w-0"
          aria-label="Main navigation"
        >
          {desktopNavigation.map((link, idx) => {
            const active = isActive(link.href);
            const isHighlighted =
              hoveredIndex === idx || (hoveredIndex === null && active);
            return (
              <Link
                key={idx}
                ref={(el) => {
                  if (el) {
                    linkMapRef.current.set(idx, el);
                  } else {
                    linkMapRef.current.delete(idx);
                  }
                }}
                href={link.href}
                onMouseEnter={() => {
                  setHoveredIndex(idx);
                  updateIndicator(idx);
                }}
                className={`font-sans text-[10px] xl:text-xs 2xl:text-sm font-semibold py-1.5 transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal ${
                  isHighlighted
                    ? "text-deep-navy font-bold"
                    : "text-text-secondary hover:text-deep-navy"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Smooth Mouse-Following Sliding Underscore */}
          <span
            className="absolute bottom-0 h-[2.5px] bg-clinical-teal rounded-full transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />
        </nav>

        {/* Action Button & Hamburger Toggle - Far Right */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Visibility is controlled by this wrapper, not a "hidden" class on
              Button itself — Button's baseStyle hardcodes "inline-flex"
              unconditionally, which wins the same-specificity conflict over
              a "hidden" override passed via className regardless of source
              order, silently keeping the button visible at every width. */}
          <div className="hidden xl:block">
            <Button
              href="/book-appointment"
              onClick={() => {
                fetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ eventType: "book_appointment" }),
                }).catch(() => {});
              }}
              className="text-[11px] 2xl:text-sm py-1.5 px-3 2xl:px-5 min-h-[36px] 2xl:min-h-[40px] shadow-[0_2px_4px_rgba(0,175,200,0.08)] whitespace-nowrap"
              variant="teal"
            >
              Book Appointment
            </Button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-deep-navy rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal"
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

      {/* Backdrop — dims the rest of the page instead of covering it solid,
          so the page is still visible behind the drawer. Clicking it closes
          the menu. Always rendered (not conditionally mounted) so the
          opacity transition can actually animate; pointer-events disabled
          while hidden so it doesn't block clicks on the page underneath. */}
      <div
        className={`lg:hidden fixed inset-0 bg-deep-navy/50 transition-opacity duration-300 z-[45] ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile/Tablet Drawer — a left-side box over a dimmed page, not a
          full-width opaque panel, so the rest of the page stays visible
          behind it. Always rendered (off-screen via translate-x when
          closed) so the slide-in/out can transition smoothly. */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed top-0 left-0 w-[35%] min-w-[165px] h-[66.67vh] max-h-[66.67vh] rounded-br-2xl bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-clinical shrink-0">
          <span className="font-serif text-sm font-bold text-deep-navy">Menu</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-text-secondary hover:text-deep-navy rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2.5 px-3 flex flex-col gap-2">
          <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
            {mainNavigation.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-sans text-[11px] sm:text-xs font-semibold py-1 px-2 rounded-md transition-colors flex items-center ${
                  isActive(link.href)
                    ? "bg-soft-blue text-deep-navy font-bold"
                    : "text-text-secondary hover:bg-warm-off-white hover:text-deep-navy"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <hr className="border-border-clinical my-0.5" />

          {/* Mobile Utility Navigation */}
          <div className="flex flex-col gap-1.5 items-center">
            <Link
              href="/urgent-advice"
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-[10px] font-bold text-status-error transition-colors"
            >
              Urgent Advice
            </Link>
            <div className="flex flex-row gap-3 text-[10px] font-bold text-text-secondary">
              <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="hover:text-deep-navy">
                Community
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-deep-navy">
                Contact
              </Link>
            </div>
          </div>

          <div className="pt-1">
            <Button
              href="/book-appointment"
              className="w-full justify-center py-1.5 text-[11px] sm:text-xs shadow-md"
              variant="teal"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
