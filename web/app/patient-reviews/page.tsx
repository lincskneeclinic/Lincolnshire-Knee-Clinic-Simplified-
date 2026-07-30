import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { ReviewPlatformCard } from "@/components/ReviewPlatformCard";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Patient Reviews | Lincolnshire Knee Clinic",
  description: "Read verified patient reviews and experiences for Lincolnshire Knee Clinic from trusted independent review platforms.",
};

export default function PatientReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Patient Reviews" }]} />

      <PageHeader
        category="Patient Feedback"
        title="Patient Reviews & Experiences"
        subtitle="Lincolnshire Knee Clinic values transparency and strives to deliver high-quality, consultant-led orthopaedic care."
      />

      {/* Introductory Paragraph */}
      <div className="my-8 bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-5 md:p-6 text-sm text-text-secondary leading-relaxed">
        <p className="font-bold text-deep-navy text-base mb-2">Patient Feedback Wording</p>
        <p className="mb-2">
          Patient feedback is important to Lincolnshire Knee Clinic.
          Verified reviews from independent platforms will be displayed here as they become available.
        </p>
        <p className="text-xs text-text-muted italic">
          To maintain transparency, reviews will be collected and verified by independent platforms. Lincolnshire Knee Clinic does not edit or alter patient reviews.
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="max-w-md mx-auto my-10">
        <ReviewPlatformCard
          platformName="Google"
          description="Read verified patient reviews on Google."
          platformUrl="https://g.page/r/CYqSfdXK1SGEEBM/review"
        />
      </div>

      {/* Featured Patient Comments */}
      <div className="bg-white border border-border-clinical rounded-xl p-6 md:p-8 my-8 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-deep-navy mb-4">Featured Patient Comments</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Selected comments from our patient satisfaction reviews will be featured here as genuine feedback is published on independent platforms.
        </p>
        <div className="border border-dashed border-border-clinical/80 p-6 rounded-lg text-center text-xs text-text-muted italic bg-warm-off-white/20">
          Featured patient comments will appear here once verified testimonials are published on our review platforms.
        </div>
      </div>

      {/* How Reviews Are Collected */}
      <div className="bg-warm-off-white border border-border-clinical/40 rounded-xl p-6 md:p-8 my-8">
        <h3 className="font-sans text-lg font-bold text-deep-navy mb-3">How Reviews Are Collected</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          All reviews displayed or linked on this site are collected by independent, third-party feedback platforms. These platforms verify reviewer identities and check submissions against strict guidelines to ensure they represent genuine clinical interactions.
        </p>
        <ul className="list-disc pl-5 text-xs text-text-secondary space-y-2">
          <li><strong>Independent Verification:</strong> Reviews are processed externally on the Google network.</li>
          <li><strong>GMC Compliance:</strong> Feedback collection processes follow General Medical Council (GMC) guidelines on clinical transparency.</li>
          <li><strong>Patient Anonymity:</strong> Patients are free to submit anonymous or pseudonymous reviews as supported by the platforms.</li>
        </ul>
      </div>

      {/* Leave a Review Section */}
      <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-6 md:p-8 my-8 text-center">
        <h3 className="font-serif text-xl font-bold text-deep-navy mb-2">Leave a Review</h3>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl mx-auto mb-6">
          Help other patients by sharing your experience. We welcome constructive feedback to help refine and improve our services.
        </p>
        <div className="flex justify-center">
          <Button
            href="https://g.page/r/CYqSfdXK1SGEEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="min-w-[200px]"
          >
            Leave a Google Review
          </Button>
        </div>
      </div>

      {/* Review Policy Section */}
      <div className="bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-6 md:p-8 my-8">
        <h3 className="font-sans text-base font-bold text-deep-navy mb-3">Review Policy &amp; Transparency Statement</h3>
        <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
          <p className="font-medium text-clinical-teal">
            “Reviews shown on this website will be taken from independent third-party platforms. Lincolnshire Knee Clinic does not edit or alter patient reviews. Only genuine reviews published on the original review platforms will be displayed.”
          </p>
          <p>
            Feedback displayed on this page is synced periodically. We do not cherry-pick, filter, or suppress negative reviews. All feedback is valuable and helps maintain our high standards of clinical excellence.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <MedicalDisclaimerBlock />
      </div>
    </div>
  );
}
