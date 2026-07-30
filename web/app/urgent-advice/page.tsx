import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Urgent Knee Advice | Red-Flag Symptoms | Lincolnshire Knee Clinic",
  description:
    "Guidance on red-flag knee symptoms requiring emergency or urgent medical attention. Lincolnshire Knee Clinic does not provide emergency care — find out where to seek help.",
  alternates: {
    canonical: `${SITE_URL}/urgent-advice`,
  },
  openGraph: {
    title: "Urgent Knee Advice | Red-Flag Symptoms | Lincolnshire Knee Clinic",
    description:
      "Guidance on red-flag knee symptoms requiring emergency or urgent medical attention. Lincolnshire Knee Clinic does not provide emergency care — find out where to seek help.",
    url: `${SITE_URL}/urgent-advice`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
        width: 800,
        height: 800,
        alt: "Lincolnshire Knee Clinic logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Urgent Knee Advice | Red-Flag Symptoms | Lincolnshire Knee Clinic",
    description:
      "Guidance on red-flag knee symptoms requiring emergency or urgent medical attention. Lincolnshire Knee Clinic does not provide emergency care.",
  },
};

export default function UrgentAdvice() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Urgent Advice" }]} />

      <PageHeader
        category="Patient Safety"
        title="Urgent Medical Advice"
        subtitle="Guidance for red-flag symptoms requiring emergency or immediate medical attention."
      />

      <div className="bg-status-error-bg border border-status-error/30 p-6 md:p-8 rounded-xl text-status-error mb-8">
        <h2 className="font-serif text-xl md:text-2xl font-bold mb-3">
          Lincolnshire Knee Clinic does not provide emergency medical care.
        </h2>
        <p className="text-base leading-relaxed">
          Our website and administrative teams do not monitor enquiries for urgent or emergency
          medical problems. We cannot provide immediate clinical assessments or medical advice for
          acute injuries or post-surgical complications.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
          <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-3">
            Life-Threatening Emergency?
          </h3>
          <p className="text-text-primary text-base leading-relaxed mb-4">
            If you or someone else is experiencing a life-threatening medical emergency, call 999
            immediately or go to your nearest Emergency Department (A&E).
          </p>
          <span className="inline-block bg-status-error text-white font-bold text-sm px-3 py-1 rounded-xl">
            Dial 999
          </span>
        </div>

        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
          <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-3">
            Urgent Symptoms (Non-Life-Threatening)?
          </h3>
          <p className="text-text-primary text-base leading-relaxed mb-4">
            If you have severe knee pain, cannot put weight on the leg, have a badly swollen or
            deformed knee, or have a fever, redness, or heat around the joint, seek urgent medical
            advice via NHS 111.
          </p>
          <div className="flex gap-4">
            <a
              href="https://111.nhs.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-clinical-blue hover:bg-deep-navy text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              NHS 111 Online
            </a>
            <span className="inline-flex items-center text-text-primary font-bold text-sm">
              Or Call 111
            </span>
          </div>
        </div>

        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
          <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-3">
            Recent Post-Surgery Concerns?
          </h3>
          <p className="text-text-primary text-base leading-relaxed">
            If you have recently had surgery and are concerned about:
          </p>
          <ul className="list-disc pl-5 my-3 text-text-secondary text-sm md:text-base space-y-1">
            <li>Increasing or unmanageable pain</li>
            <li>Wound leakage, discharge, or splitting</li>
            <li>Fever, chills, or persistent sweating</li>
            <li>Swelling, redness, or tenderness in your calf muscle</li>
            <li>Chest pain, shortness of breath, or difficulty breathing</li>
          </ul>
          <p className="text-text-primary text-base leading-relaxed mt-4">
            Please contact the specific hospital ward where your surgery was performed, call your
            clinical team directly using the numbers provided in your discharge paperwork, or seek
            urgent medical help immediately via NHS 111 or 999.
          </p>
        </div>

        {/* Governance Info */}
        <div className="mt-8 pt-6 border-t border-border-clinical/30 text-xs text-text-muted space-y-1">
          <p className="font-bold text-text-secondary">Clinical Safety & Triage Guidance</p>
          <p>Reviewed by: Mr Ricardo J Pacheco, FRCS (Tr & Orth)</p>
        </div>
      </div>
    </div>
  );
}
