import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export default function MedicalDisclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Medical Disclaimer" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Governance"
        title="Medical Disclaimer"
        subtitle="Important terms regarding the clinical information provided on our public educational website."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          The information contained on the <strong>Lincolnshire Knee Clinic</strong> website is for general educational 
          and informational purposes only.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          1. No Medical Advice
        </h2>
        <p>
          The website content (including symptoms, conditions, treatments, injections, educational articles, and blog posts) 
          is not intended to be, and must not be taken as, professional medical advice, diagnosis, treatment, or clinical assessment. 
          No patient-clinician relationship is established by reading this website.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          2. Seek Professional Clinical Consultation
        </h2>
        <p>
          You should always obtain professional medical advice from a qualified orthopaedic consultant or other healthcare provider 
          regarding any symptoms, diagnoses, or personal treatment decisions. Never disregard professional medical advice or delay 
          seeking it because of information read on this website.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          3. Emergency and Urgent Care
        </h2>
        <p>
          Lincolnshire Knee Clinic does not provide emergency medical assessments or treatment. If you think you may have a medical 
          emergency, or are experiencing severe pain, infection symptoms, or post-surgical concerns, you must call 999 or contact 
          NHS 111 immediately, or attend your nearest hospital emergency department.
        </p>

        {/* Governance Info */}
        <div className="mt-8 pt-6 border-t border-border-clinical/30 text-xs text-text-muted space-y-1">
          <p className="font-bold text-text-secondary">Clinical Governance Information</p>
          <p>Reviewed by: Mr Ricardo J Pacheco, FRCS (Tr & Orth)</p>
          <p>Last reviewed: July 2026</p>
        </div>
      </div>
    </div>
  );
}
