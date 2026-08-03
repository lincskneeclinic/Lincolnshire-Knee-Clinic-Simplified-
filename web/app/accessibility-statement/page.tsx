import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Accessibility Statement | Lincolnshire Knee Clinic",
  description: "Our commitment to WCAG 2.1 AA accessibility standards, including readable typography, keyboard navigation and support for assistive technology.",
};

export default function AccessibilityStatement() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Accessibility Statement" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Accessibility"
        title="Accessibility Statement"
        subtitle="Our commitment to ensuring the platform is accessible to all patients, including those with visual or motor impairments."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          At <strong>Lincolnshire Knee Clinic</strong>, we are committed to ensuring digital accessibility for all patients, 
          including older individuals, those experiencing pain or distress, and those with visual, physical, or 
          cognitive limitations.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          1. Accessibility Standard Goal
        </h2>
        <p>
          We design and build our public website to aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
          standard. These guidelines explain how to make web content more accessible and user-friendly for everyone.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          2. Implemented Accessibility Features
        </h2>
        <p>
          To support accessible usage, our platform includes:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Keyboard Navigation:</strong> All active buttons, links, and forms are navigable using standard keyboard commands.</li>
          <li><strong>Focus Indicators:</strong> High-contrast 2px visual focus outlines indicate keyboard selection states.</li>
          <li><strong>Skip Navigation Link:</strong> A skip-to-content mechanism allows screen reader and keyboard users to bypass header menus.</li>
          <li><strong>Contrast Compliance:</strong> Text color contrast ratios meet or exceed WCAG 2.1 AA standards against page surfaces.</li>
          <li><strong>Responsive Layouts:</strong> Page designs scale fluidly up to 200% zoom without loss of information or breaking structures.</li>
        </ul>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          3. Feedback and Contact
        </h2>
        <p>
          We welcome your feedback on the accessibility of the Lincolnshire Knee Clinic platform. If you encounter any barriers, 
          have difficulty navigating schedules, or require information in alternative formats, please contact us at:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-text-primary">
          <li>Email: info@lincsknee.com</li>
          <li>Phone: 07770 473437</li>
          <li>Postal Address: Correspondence address available on request.</li>
        </ul>
      </div>
    </div>
  );
}
