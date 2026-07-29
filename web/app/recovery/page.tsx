import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { PageHeader } from "@/components/PageHeader";
import { ContinueYourKneeJourney } from "@/components/ContinueYourKneeJourney";

export const metadata: Metadata = {
  title: "Knee Surgery Recovery & Rehabilitation | Lincolnshire Knee Clinic",
  description: "Understand the postoperative recovery process, physiotherapy rehabilitation stages, and guidelines for returning to work, driving, and sports.",
};

export default function RecoveryHub() {
  const recoveryResources = [
    {
      title: "Preparing for Surgery",
      description: "Practical guidelines, home safety preparations, and pre-operative strengthening (prehab) to optimize your recovery.",
      href: "/treatments/preparing-for-surgery",
    },
    {
      title: "Enhanced Recovery (ERAS)",
      description: "Learn about the modern clinical pathway designed to reduce pain, stand early, and speed up recovery following knee surgery.",
      href: "/treatments/enhanced-recovery",
    },
    {
      title: "Physiotherapy After Surgery",
      description: "Find out what to expect from outpatient rehabilitation phases, range of motion goals, and home exercise sets.",
      href: "/treatments/physiotherapy-after-surgery",
    },
    {
      title: "Returning to Driving",
      description: "Safety guidelines, vehicle controls (manual vs. automatic), and reaction tests needed before driving after surgery.",
      href: "/treatments/returning-to-driving",
    },
    {
      title: "Returning to Work",
      description: "Learn about typical timelines for returning to employment, including phased return adjustments for desk and manual roles.",
      href: "/treatments/returning-to-work",
    },
    {
      title: "Returning to Sport",
      description: "Step-by-step guidelines and strength symmetry targets for returning to running, golf, and pivoting contact sports.",
      href: "/treatments/returning-to-sport",
    },
    {
      title: "Recovery FAQs",
      description: "Answers to common questions regarding post-operative wound care, bathing, swelling, ice, and warning signs.",
      href: "/treatments/recovery-faqs",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans space-y-12">
      <Breadcrumbs items={[{ label: "Recovery" }]} />

      <PageHeader
        category="Recovery & Rehabilitation"
        title="Knee Recovery Guides"
        subtitle="Explore key phases of the postoperative knee recovery journey. Successful outcomes depend upon active physical therapy participation, sensible load pacing, and following clinical instructions."
      />

      {/* Safety Notice Banner */}
      <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 p-5 rounded-xl text-left">
        <h3 className="text-xs font-bold text-deep-navy uppercase tracking-wider mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Important Recovery & Safety Notice
        </h3>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
          Postoperative recovery timelines and guidelines are for general patient education. We do not provide fixed recovery guarantees. Formal medical clearance to return to driving, work, or sports must be obtained individually from your surgeon or clinical team during follow-up reviews.
        </p>
      </div>

      <p className="text-xs text-text-secondary/70 italic border-t border-border-clinical/30 pt-4">
        Content is intended for general patient education. Each page shows its current clinical review status below.
      </p>

      {/* Grid of Recovery Resources */}
      <section className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recoveryResources.map((item, idx) => (
            <Card
              key={idx}
              category="Recovery & Rehab"
              title={item.title}
              description={item.description}
              href={item.href}
              linkText="Explore Resource"
            />
          ))}
        </div>
      </section>

      {/* Continue journey step */}
      <ContinueYourKneeJourney currentStage="recovery" />

      <MedicalDisclaimerBlock />
    </div>
  );
}
