"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SITE_URL } from "@/lib/site";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot — must stay empty; real users never see or fill this
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !message.trim() || !consent) {
      setErrorMessage("Please complete all required fields and confirm the consent checkbox.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
          marketingConsent,
          website,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Something went wrong. Please try again, or contact us by phone or email.");
      }
    } catch (err) {
      console.error("Contact form submission error:", err);
      setErrorMessage("Network error. Please try again, or contact us by phone or email.");
    } finally {
      setLoading(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact#webpage`,
        "url": `${SITE_URL}/contact`,
        "name": "Contact Us | Lincolnshire Knee Clinic",
        "description": "Get in touch with Lincolnshire Knee Clinic to ask a question, request information, or discuss your knee condition before booking a consultation."
      },
      {
        "@type": "MedicalOrganization",
        "@id": `${SITE_URL}#organization`,
        "name": "Lincolnshire Knee Clinic",
        "url": SITE_URL,
        "logo": `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+44-7770-473437",
            "contactType": "customer service",
            "email": "admin@lincsknee.com",
            "availableLanguage": "English"
          }
        ]
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <PageHeader
        category="Support & Contact"
        title="Contact Our Team"
        subtitle="For general enquiries, booking support, or billing questions, please use the contact routes below. Our administrative team typically responds within 24 to 48 business hours."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 my-8 items-start">
        {/* Contact details */}
        <div className="space-y-6">
          <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
            <h2 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-4 border-b border-border-clinical pb-2">
              Administrative & Booking Support
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary">
              <p>
                <strong className="text-text-primary block">Telephone:</strong>
                07770 473437
              </p>
              <p>
                <strong className="text-text-primary block">Email:</strong>
                admin@lincsknee.com
              </p>
              <p>
                <strong className="text-text-primary block">WhatsApp Business:</strong>
                <a
                  href="https://wa.me/447770473437?text=Hello%20I%20would%20like%20to%20enquire%20about%20a%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-1 text-[#25D366] font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#25D366]"
                  aria-label="Message us on WhatsApp — administrative enquiries only"
                >
                  {/* WhatsApp icon */}
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Message us on WhatsApp
                </a>
                <span className="block text-xs text-text-muted italic mt-1">
                  Administrative enquiries only. Please do not send confidential medical information or urgent clinical concerns via WhatsApp.
                </span>
              </p>
              <p>
                <strong className="text-text-primary block">Correspondence Address:</strong>
                Correspondence address available on request.
              </p>
            </div>
          </div>

          <div className="bg-status-error-bg border border-status-error/20 text-status-error p-5 rounded-xl">
            <h3 className="font-serif text-base font-bold mb-2">Urgent Clinical Problems</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Please do not use this contact form or email address for urgent medical problems.
              Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening
              symptoms call 999. For urgent non-life-threatening advice use NHS 111.
            </p>
          </div>
        </div>

        {/* Enquiry form placeholder */}
        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-4">
            General Enquiry Form
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Please use this form for non-clinical administrative questions only. Fields marked with * are required.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-lg font-bold mb-2 text-deep-navy">✓ Thank you for your enquiry</div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Our medical secretary will respond within 24 to 48 business hours. For urgent clinical problems,
                please do not wait for a reply — call 999 for emergencies or NHS 111 for urgent advice.
              </p>
            </div>
          ) : (
            <form className="space-y-4 text-sm" onSubmit={handleSubmit} noValidate>
              {errorMessage && (
                <div className="text-xs p-3 rounded-lg bg-status-error-bg text-status-error border border-status-error/20 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Honeypot — hidden from sighted/keyboard/screen-reader users, bots often fill every field */}
              <div aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden -z-10">
                <label htmlFor="website">Leave this field blank</label>
                <input
                  type="text"
                  id="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="name" className="block font-semibold text-text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border-clinical rounded-lg p-2.5 bg-white focus:bg-white focus:border-clinical-teal focus:outline-none"
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-semibold text-text-primary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border-clinical rounded-lg p-2.5 bg-white focus:bg-white focus:border-clinical-teal focus:outline-none"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block font-semibold text-text-primary mb-1">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border-clinical rounded-lg p-2.5 bg-white focus:bg-white focus:border-clinical-teal focus:outline-none"
                  placeholder="e.g. 07123 456789"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-semibold text-text-primary mb-1">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-border-clinical rounded-lg p-2.5 bg-white focus:bg-white focus:border-clinical-teal focus:outline-none"
                  placeholder="Please describe your general enquiry. Do not include sensitive clinical details."
                ></textarea>
              </div>

              <div className="text-xs text-text-secondary flex gap-2 items-start mt-2">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <label htmlFor="consent" className="cursor-pointer">
                  I understand that this form is for general enquiries only and must not be used to submit urgent clinical problems or sensitive health details. *
                </label>
              </div>

              <div className="text-xs text-text-secondary flex gap-2 items-start mt-3 border-t border-border-clinical/30 pt-3">
                <input
                  type="checkbox"
                  id="marketing-consent"
                  className="mt-0.5"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                />
                <label htmlFor="marketing-consent" className="cursor-pointer leading-relaxed">
                  I agree to receive occasional email updates from Lincolnshire Knee Clinic about knee health,
                  clinic services and patient education. I understand I can unsubscribe at any time.{" "}
                  <span className="text-text-muted font-normal">(Optional — not required to contact the clinic)</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Enquiry"}
              </Button>

              <p className="text-[11px] text-text-muted mt-4 leading-relaxed">
                We will use the information you provide to respond to your enquiry or manage your appointment.
                If you choose to receive email updates, we will use your email address for that purpose only.
                You can unsubscribe at any time. See our{" "}
                <a href="/privacy-policy" className="text-clinical-teal hover:underline font-semibold">Privacy Policy</a>{" "}
                for details.
              </p>
            </form>
          )}
        </div>
      </div>

      <MedicalDisclaimerBlock />

      {/* Newsletter sign-up */}
      <div className="my-10 bg-soft-blue border border-border-clinical/30 rounded-xl p-6 md:p-8">
        <NewsletterSignup variant="light" className="max-w-lg" />
      </div>
    </div>
  );
}
