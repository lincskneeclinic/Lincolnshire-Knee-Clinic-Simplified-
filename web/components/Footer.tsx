"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NewsletterSignup } from "@/components/NewsletterSignup";

// Social media placeholder links.
// Replace href="#" with real URLs when social accounts are created.
// Do NOT invent URLs.
const socialLinks = [
  {
    label: "WhatsApp (administrative enquiries only)",
    href: "https://wa.me/447770473437?text=Hello%20I%20would%20like%20to%20enquire%20about%20a%20consultation.",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lincolnshirekneeclinic/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/lincsknee",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/lincolnshire-knee-clinic/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export const Footer: React.FC = () => {
  const [logoError, setLogoError] = useState(false);

  const linksHelp = [
    { name: "Meet Your Consultant", href: "/about" },
    { name: "Clinical Knowledge Hub", href: "/clinical-knowledge-hub" },
    { name: "Patient Newsletter", href: "/newsletter" },
    { name: "Symptoms Hub", href: "/symptoms" },
    { name: "Conditions Hub", href: "/conditions" },
    { name: "Treatments Hub", href: "/treatments" },
    { name: "Recovery Hub", href: "/recovery" },
    { name: "Injections Hub", href: "/injections" },
    { name: "Clinics", href: "/clinics" },
    { name: "Book Appointment", href: "/book-appointment" },
    { name: "Patient Reviews", href: "/patient-reviews" },
    { name: "Research & Publications", href: "/research" },
  ];

  const linksLegal = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Accessibility Statement", href: "/accessibility-statement" },
    { name: "Medical Disclaimer", href: "/medical-disclaimer" },
    { name: "Patient Newsletter", href: "/newsletter" },
    { name: "Terms of Use", href: "/terms-of-use" },
    { name: "Professional Registrations", href: "/professional-registrations" },
    { name: "Hospital Affiliations", href: "/hospital-affiliations" },
  ];

  return (
    <footer className="bg-deep-navy text-[#FAF8F5] font-sans border-t-4 border-clinical-teal mt-auto shadow-inner">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-18 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

        {/* Column 1: Clinic Overview & Credentials */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
              {logoError ? (
                <svg className="w-9 h-9 text-clinical-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v18" />
                  <path d="M18 4l-10 8 10 8" />
                </svg>
              ) : (
                <img
                  src="/brand/lkc-logo-k-transparent.png"
                  alt="Lincolnshire Knee Clinic"
                  className="w-10 h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-white leading-tight whitespace-nowrap">
              Lincolnshire Knee Clinic
            </span>
          </div>
          <p className="text-sm text-[#BFD0DA] leading-relaxed">
            Consultant-led specialist orthopaedic service offering evidence-aware assessment and
            treatments for knee pain, arthritis, meniscal pathology, and sports knee injuries.
          </p>

          {/* Social Icons */}
          <div>
            <span className="block text-xs font-bold text-clinical-teal uppercase tracking-wider mb-2.5">
              Follow Us
            </span>
            <div className="flex gap-2 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-clinical-teal/30 text-[#A8C0CC] hover:text-clinical-teal flex items-center justify-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-[#D7E0E5]/20 pt-4">
            <span className="block text-xs font-bold text-clinical-teal uppercase tracking-wider mb-2">
              Clinical Registrations
            </span>
            <div className="text-sm text-[#BFD0DA] flex flex-col gap-1.5 font-medium">
              <div>Lead Consultant:</div>
              <div className="text-white font-semibold">Mr Ricardo J Pacheco</div>
              <div className="text-white font-semibold">FRCS (Tr &amp; Orth)</div>
              <div>GMC Ref: <span className="text-white font-semibold">4145976</span></div>
              <div className="mt-1">Practising Privileges:</div>
              <ul className="list-disc list-inside text-white font-semibold space-y-1 pl-1">
                <li>St. Hugh&apos;s Hospital</li>
                <li>Parkhill Hospital</li>
                <li>Lincoln Private Hospital</li>
                <li>Inspire Health Clinic</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Column 2: Patient Resources Navigation */}
        <div>
          <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#D7E0E5]/20 pb-2">
            Patient Resources
          </h4>
          <ul className="grid grid-cols-1 gap-y-2.5 text-sm text-[#BFD0DA] font-medium">
            {linksHelp.map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className={`hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal ${link.name === "Book Appointment" ? "text-clinical-teal font-bold" : ""}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider border-b border-[#D7E0E5]/20 pb-2">
            Clinic Contact
          </h4>
          <div className="text-sm text-[#BFD0DA] flex flex-col gap-3 font-medium">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-[#F0F6F8] font-semibold">Correspondence address available on request.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-[#F0F6F8] font-semibold">07770 473437</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-[#F0F6F8] font-semibold">admin@lincsknee.com</span>
            </div>
          </div>
          <div className="text-xs text-status-error bg-status-error-bg border border-status-error/10 p-3 rounded-lg mt-1">
            <span className="font-bold block text-status-error">Emergency Notice:</span>
            Lincolnshire Knee Clinic does not provide emergency care. In an emergency dial 999; for urgent concerns, call 111.
          </div>
        </div>

        {/* Column 4: Newsletter Sign-up */}
        <div>
          <NewsletterSignup variant="dark" />
        </div>
      </div>

      {/* Bottom bar: Legal and copyright */}
      <div className="bg-deep-navy border-t border-[#D7E0E5]/10 py-6 text-xs text-[#D7E0E5]/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div>
            <p>&copy; {new Date().getFullYear()} Lincolnshire Knee Clinic. All rights reserved.</p>
            <div className="mt-1.5 flex items-center justify-center lg:justify-start gap-3">
              <Link
                href="/portal/clinician-intake"
                className="text-xs text-[#8BA5B5] hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
              >
                Clinician Portal
              </Link>
              <span className="text-xs text-[#8BA5B5]" aria-hidden="true">•</span>
              <Link
                href="/portal/business"
                className="text-xs text-[#8BA5B5] hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
              >
                Business Portal
              </Link>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-medium" aria-label="Legal navigation">
            {linksLegal.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
