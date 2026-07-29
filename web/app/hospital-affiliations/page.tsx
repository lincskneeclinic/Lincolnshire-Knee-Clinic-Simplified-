import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

// Draft/unreviewed legal-administrative content (see banner below) — kept out of
// search results and the sitemap until clinical/legal review is complete.
export const metadata: Metadata = {
  title: "Hospital Affiliations | Lincolnshire Knee Clinic",
  description:
    "Draft content awaiting clinical and legal review — hospital affiliations and practising privileges for Lincolnshire Knee Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HospitalAffiliations() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Hospital Affiliations" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Clinical Network"
        title="Hospital Affiliations"
        subtitle="We maintain practising privileges and admitting rights at respected local private hospitals for surgical procedures and diagnostic scanning."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          To coordinate diagnostic imaging (MRI, CT, ultrasound) and execute surgical procedures 
          (such as knee arthroscopy or replacement), <strong>Lincolnshire Knee Clinic</strong> maintains formal admitting rights 
          and clinical privileges with respected private hospitals and imaging centers.
        </p>

        <div className="bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)] my-6">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-4">
            Practising Privileges &amp; Professional Affiliations
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block font-semibold text-text-primary text-xs uppercase tracking-wider">Verified Locations</span>
              <span className="text-text-primary text-base">St Hugh&apos;s (Grimsby), Inspire Health, Parkhill (Doncaster), Lincoln Private &amp; Humber Health Partnership</span>
              <p className="text-xs text-text-muted mt-1">
                Consultant surgeons at Lincolnshire Knee Clinic operate in accordance with the medical advisory 
                and clinical governance regulations of our hospital partners.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-secondary">
          If you have questions regarding admitting privileges, or wish to schedule diagnostic imaging 
          at a specific hospital partner, please contact booking support at admin@lincsknee.com.
        </p>
      </div>
    </div>
  );
}
