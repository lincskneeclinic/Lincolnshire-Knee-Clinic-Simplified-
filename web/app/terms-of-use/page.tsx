import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Use | Lincolnshire Knee Clinic",
  description: "The terms and conditions governing use of the Lincolnshire Knee Clinic website.",
};

export default function TermsOfUse() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Terms of Use" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Legal"
        title="Terms of Use"
        subtitle="Terms governing the use of the Lincolnshire Knee Clinic public website."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          Welcome to the <strong>Lincolnshire Knee Clinic</strong> website. By accessing and using this website, you agree to comply with 
          and be bound by the following Terms of Use. If you disagree with any part of these terms, please do not use our website.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          1. Intellectual Property
        </h2>
        <p>
          The content, layout, design, text, graphics, and logo marks on this website are owned by or licensed to Lincolnshire Knee Clinic 
          and are protected by copyright and intellectual property laws. You may view and print educational content for personal, 
          non-commercial use only.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          2. Permitted Use
        </h2>
        <p>
          You agree to use this website only for lawful purposes, such as researching knee conditions, viewing clinic details, 
          using the online booking schedules, and contacting our administrative office. You must not attempt to disrupt website services, 
          submit malicious code, or scrape clinical text.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          3. Disclaimer of Liability
        </h2>
        <p>
          We endeavour to ensure that website information is accurate, balanced, and evidence-aware. However, we do not warrant 
          its completeness or suitability for individual health scenarios. Lincolnshire Knee Clinic is not liable for actions taken based on 
          general educational text in place of a professional clinical consultation.
        </p>
      </div>
    </div>
  );
}
