import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export default function ProfessionalRegistrations() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Professional Registrations" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Clinical Governance"
        title="Professional Registrations & Credentials"
        subtitle="Verifiable credentials, GMC Specialist Register details, and clinical affiliations for our orthopaedic consultants."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          At <strong>Lincolnshire Knee Clinic</strong>, all clinical consultations, assessments, joint injections, 
          and surgical treatments are conducted by registered medical specialists.
        </p>

        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)] my-6">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-4">
            Lead Orthopaedic Consultant
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block font-semibold text-text-primary text-xs uppercase tracking-wider">Clinician Name</span>
              <span className="text-text-primary text-base">Mr Ricardo J Pacheco</span>
            </div>
            <div className="border-t border-border-clinical/30 pt-3">
              <span className="block font-semibold text-text-primary text-xs uppercase tracking-wider">General Medical Council (GMC)</span>
              <span className="text-text-primary text-base">Reference Number: 4145976</span>
              <p className="text-xs text-text-muted mt-1">
                Registered on the GMC Specialist Register for Trauma and Orthopaedic Surgery (Entry Date: 4th March 2010). 
                Credentials can be verified on the GMC Register.
              </p>
            </div>
            <div className="border-t border-border-clinical/30 pt-3">
              <span className="block font-semibold text-text-primary text-xs uppercase tracking-wider">Practising Privileges &amp; Professional Affiliations</span>
              <span className="text-text-primary text-base">St Hugh&apos;s (Grimsby), Inspire Health, Parkhill (Doncaster), Lincoln Private &amp; Humber Health Partnership</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-secondary">
          For verification of registrations or questions regarding specialist orthopaedic qualifications, 
          please contact our office at admin@lincsknee.com.
        </p>
      </div>
    </div>
  );
}
