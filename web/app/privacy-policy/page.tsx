import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | Lincolnshire Knee Clinic",
  description: "How Lincolnshire Knee Clinic collects, uses, stores and protects your personal data, and your rights under UK GDPR.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm font-semibold">
        ⚠️ Draft / Template Content — Requiring Legal Review Before Publication.
        This document is a working template and must be reviewed by a qualified solicitor or data
        protection officer before it is published for patients.
      </div>

      <PageHeader
        category="Legal & Privacy"
        title="Privacy Policy"
        subtitle="How Lincolnshire Knee Clinic collects, stores, and uses your personal information — in compliance with UK GDPR and the Data Protection Act 2018."
      />

      <div className="space-y-8 text-sm md:text-base text-text-secondary leading-relaxed mt-6">

        <p>
          At <strong className="text-text-primary">Lincolnshire Knee Clinic</strong>, we are committed to protecting and
          respecting your privacy. This policy explains how we collect, store, process, and protect your
          personal data, particularly in relation to health and medical information (special category data).
        </p>

        {/* 1. Data Controller */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            1. Data Controller &amp; Contact Details
          </h2>
          <p>
            The data controller responsible for your personal data is{" "}
            <strong>Lincolnshire Knee Clinic</strong> (correspondence address available on request).
          </p>
          <p className="mt-2">
            If you have any questions about this privacy policy, wish to exercise your data rights, or would
            like to contact our Data Protection Officer, please contact us at:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email: <strong>info@lincsknee.com</strong></li>
            <li>Telephone: <strong>07770 473437</strong></li>
            <li>Data Protection Officer: <strong>Data Protection Officer (info@lincsknee.com)</strong></li>
          </ul>
        </div>

        {/* 2. Information We Collect */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            2. What Information We Collect
          </h2>

          <h3 className="font-bold text-text-primary mb-1">Enquiry Information</h3>
          <p>
            When you use our general contact form, we collect your name, email address, telephone number
            (optional), and the content of your general enquiry message. We do not use this information
            for marketing unless you have separately provided explicit consent.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">Booking Information</h3>
          <p>
            For face-to-face consultations, appointments are arranged directly with the local reception team at your preferred clinic location by telephone. No patient details, contact details, or clinical information are collected or stored through this website for face-to-face bookings.
          </p>
          <p className="mt-2">
            For video consultations, bookings are scheduled online using Google Calendar, and any required payments are processed securely through Stripe. Google Calendar collects your name, contact details, and appointment preferences, while Google Meet handles video consultation connectivity. We do not receive, store, or process payment card details on this website.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">Clinical Information</h3>
          <p>
            During clinical consultations, we may collect symptoms, medical histories, diagnoses, medications,
            imaging reports (MRI/X-Ray/CT), and treatment histories. This is special category data under
            UK GDPR and is handled with strict security controls.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">Optional Marketing Consent</h3>
          <p>
            If you choose to tick the optional email updates checkbox on our contact or booking pages, or
            sign up via our newsletter form, we will collect your name and email address for the sole purpose
            of sending occasional patient education updates about knee health and clinic services.
          </p>
          <p className="text-xs text-text-muted italic mt-1">
            This consent is entirely optional. It is not required to book an appointment or to contact the
            clinic. The checkbox is unticked by default and can only be activated by you.
            We do not collect or store any clinical symptoms, diagnoses, or health history for marketing
            purposes. If you sign up through a specific page of our website (for example, a page about a
            particular treatment), we record the general topic area you appeared interested in — such as
            &quot;knee replacement&quot; or &quot;injections&quot; — purely so we can send you more relevant
            follow-up information. This is a broad marketing category, not clinical or medical data, and is
            used solely to tailor which educational emails you receive.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">WhatsApp Business</h3>
          <p>
            Lincolnshire Knee Clinic uses WhatsApp Business as an administrative contact channel. If you contact us via WhatsApp, we may receive your name, telephone number, and the content of any messages you send. This information is used solely to respond to your administrative enquiry.
          </p>
          <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl mt-3 text-sm font-medium">
            ⚠️ Please do not send confidential medical information or urgent medical concerns via WhatsApp. This service is intended for administrative enquiries only. For urgent clinical concerns, call 999 (emergency) or NHS 111 (non-emergency urgent advice).
          </div>
          <p className="mt-2">
            WhatsApp messages are processed and stored on WhatsApp servers in accordance with Meta&apos;s privacy policy. We recommend you review WhatsApp&apos;s own privacy policy before using this channel. We do not use WhatsApp as a clinical record system.
          </p>
        </div>

        {/* 3. Why We Collect It */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            3. Why We Collect It &amp; How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To respond to general administrative enquiries.</li>
            <li>To schedule and manage video consultations through Google Calendar and Google Meet.</li>
            <li>To coordinate clinical assessments, diagnoses, and treatment plans.</li>
            <li>To communicate with referrers (GPs, physiotherapists) regarding your care.</li>
            <li>To coordinate clinical referrals with selected third-party diagnostic imaging providers (MRI, X-ray, ultrasound).</li>
            <li>To process invoices and health insurance claims (Billing/Financial Data).</li>
            <li>
              To send patient education newsletters and service updates to patients who have explicitly
              opted in (marketing email only).
            </li>
          </ul>
        </div>

        {/* 4. Google Calendar */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            4. Google Calendar Appointment Scheduling
          </h2>
          <p>
            We use Google Calendar appointment schedules (part of Google Workspace Business Standard)
            to manage and confirm patient video bookings. When you book an appointment, you will be directed
            to a Google-hosted scheduling page. Your booking details are stored within our Google Workspace
            account and are subject to Google's data processing terms and our clinical confidentiality obligations.
          </p>
        </div>

        {/* 5. Google Meet */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            5. Google Meet Video Appointments (Where Available)
          </h2>
          <p>
            Where video consultations are offered, they may be conducted via Google Meet. Google Meet
            links are generated and shared with you after your appointment is confirmed. These sessions
            are subject to Google's data processing terms. We do not record video consultations without
            explicit patient consent.
          </p>
        </div>

        {/* 6. Stripe */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            6. Stripe Payment Processing
          </h2>
          <p>
            Online payment for appointments is processed securely through Stripe, an approved payment
            services provider. Stripe handles all card data directly and is certified to PCI DSS Level 1
            security standards. Lincolnshire Knee Clinic does not receive, process, or store any card
            payment details on this website.
          </p>
        </div>

        {/* 7. External Links */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            7. External Links &amp; Third-Party Services
          </h2>

          <h3 className="font-bold text-text-primary mb-1">Social Media Links</h3>
          <p>
            Our website may include links to our social media profiles (Instagram, Facebook, LinkedIn).
            Clicking these links will take you to an external platform operated by a third party.
            We are not responsible for the privacy practices of those platforms.
            Please review the respective platform's privacy policy before interacting with it.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">Google Calendar Appointment Scheduling</h3>
          <p>
            When you book a video appointment, you will be directed to Google Calendar Appointment Schedules,
            hosted by Google. The booking process on Google's platform is subject to Google's own Privacy
            Policy and Terms of Service. We use Google Calendar to manage appointment availability only;
            we do not receive or store payment data through this service.
          </p>

          <h3 className="font-bold text-text-primary mb-1 mt-4">Stripe Payment Processing</h3>
          <p>
            Where payment is required, this is handled externally by Stripe. You will interact directly
            with Stripe's payment interface. Stripe processes all card details and is PCI DSS Level 1
            certified. Lincolnshire Knee Clinic does not receive or store card details on this website.
          </p>
        </div>

        {/* 8. Future Supabase */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            8. Future Secure Data Storage — Supabase (Planned Phase 2)
          </h2>
          <p>
            In a future phase of our digital platform, we plan to integrate Supabase as a secure cloud
            database provider. Supabase will store only opted-in marketing contact records (name, email,
            consent status, consent timestamp, and consent source) using AES-256 encryption and SSL/TLS
            secure transit. No clinical or health data will be stored in this system.
            This integration will operate under a signed Data Processing Agreement and comply fully with
            UK GDPR and DPA 2018.
          </p>
        </div>

        {/* 9. Marketing & Unsubscribe */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            9. Marketing Consent, Unsubscribe Rights &amp; Right to Object
          </h2>
          <p>
            We only send email updates to patients who have given explicit, freely given, informed, and
            unambiguous consent by ticking the optional marketing checkbox.
          </p>
          <p className="mt-2">
            You have the right to object to direct marketing at any time and the right to withdraw your
            consent at any time. To unsubscribe:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Click the unsubscribe link in any update email we send.</li>
            <li>Contact us directly at <strong>info@lincsknee.com</strong>.</li>
          </ul>
          <p className="mt-2">
            On receipt of your unsubscribe request, we will cease all marketing communications immediately.
          </p>
        </div>

        {/* 10. Referrals to Third-Party Diagnostic Providers (Future Phase) */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            10. Referrals to Third-Party Diagnostic Providers (Future Phase)
          </h2>
          <p>
            When our consultant refers you to a third-party diagnostic imaging provider (for MRI, X-ray, or ultrasound scans), we will share relevant clinical and personal details with them.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Disclosure authorization:</strong> Information is shared only where appropriate, clinically necessary, and authorized by the patient.</li>
            <li><strong>Scope of data:</strong> The shared data is strictly limited to the minimum necessary information required to coordinate and perform the diagnostic scan (e.g., name, date of birth, contact details, and clinical history).</li>
            <li><strong>Commercial arrangements:</strong> Lincolnshire Knee Clinic may have commercial or commission arrangements with selected diagnostic providers. Any relevant financial interest or referral arrangement will be disclosed clearly to patients, and referrals will always respect patient choice and clinical appropriateness.</li>
          </ul>
          <p className="mt-2 text-xs text-text-muted italic">
            [Draft wording requiring legal and professional review prior to publication]
          </p>
        </div>

        {/* 11. Security */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            11. Security of Special Category Health Data
          </h2>
          <p>
            Medical data is classified as special category data under UK GDPR Article 9. We implement
            strict security controls including encrypted storage, role-based access permissions, and
            access audit logging. Integration workflows (Microsoft 365, Google Workspace, Stripe) comply
            with clinical data processing obligations.
          </p>
        </div>

        {/* 12. Data Retention */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            12. Data Retention
          </h2>
          <p>
            We retain clinical records for the period required by NHS record retention guidelines and
            applicable regulation. General enquiry records are retained for{" "}
            <strong>8 years for clinical records (in line with NHS guidelines)</strong>. Marketing consent records are
            retained until you unsubscribe, at which point they are flagged as unsubscribed and
            suppressed from future communications.
          </p>
        </div>

        {/* 13. Your Rights */}
        <div>
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-3">
            13. Your Rights Under UK GDPR
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Right to access your personal data.</li>
            <li>Right to correct inaccurate personal data.</li>
            <li>Right to erasure ("right to be forgotten") where applicable.</li>
            <li>Right to restrict processing of your personal data.</li>
            <li>Right to data portability.</li>
            <li>Right to object to processing, including direct marketing.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at{" "}
            <strong>info@lincsknee.com</strong>.
          </p>
          <p className="mt-2 text-xs text-text-muted italic">
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO)
            at <strong>ico.org.uk</strong> if you are unhappy with how your data has been handled.
          </p>
        </div>

        {/* Governance footer */}
        <div className="pt-6 border-t border-border-clinical/30 text-xs text-text-muted space-y-1">
          <p className="font-bold text-text-secondary">Document Control</p>
          <p>Prepared by: Lincolnshire Knee Clinic</p>
          <p>Last reviewed: July 2026</p>
          <p>Review due: July 2027</p>
          <p className="italic mt-2">
            This document requires legal review by a qualified solicitor or data protection officer
            before it is published for patients.
          </p>
        </div>
      </div>
    </div>
  );
}
