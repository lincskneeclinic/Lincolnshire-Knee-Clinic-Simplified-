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
  // Placed in page body as everything must remain a placeholder
  const mockFeaturedReviews = [] as any[]; // Will be populated with genuine reviews later

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        <ReviewPlatformCard
          platformName="Google"
          description="Read verified patient reviews on Google."
          rating="[Overall Rating — Google Reviews]"
          reviewCount="[Total Review Count — Google Reviews]"
          featuredReviews={mockFeaturedReviews}
          platformUrl="https://g.page/r/CYqSfdXK1SGEEBM/review"
        />
        <ReviewPlatformCard
          platformName="Doctify"
          description="Read verified patient reviews on Doctify."
          rating="[Overall Rating — Doctify Reviews]"
          reviewCount="[Total Review Count — Doctify Reviews]"
          featuredReviews={mockFeaturedReviews}
          platformUrl={null} // Pending setup
        />
      </div>

      {/* Featured Patient Comments */}
      <div className="bg-white border border-border-clinical rounded-xl p-6 md:p-8 my-8 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-deep-navy mb-4">Featured Patient Comments</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Selected comments from our patient satisfaction reviews will be featured here as genuine feedback is published on independent platforms.
        </p>
        <div className="border border-dashed border-border-clinical/80 p-6 rounded-lg text-center text-xs text-text-muted italic bg-warm-off-white/20">
          [Featured Patient Comments — Pending publication of verified testimonials]
        </div>
      </div>

      {/* How Reviews Are Collected */}
      <div className="bg-warm-off-white border border-border-clinical/40 rounded-xl p-6 md:p-8 my-8">
        <h3 className="font-sans text-lg font-bold text-deep-navy mb-3">How Reviews Are Collected</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          All reviews displayed or linked on this site are collected by independent, third-party feedback platforms. These platforms verify reviewer identities and check submissions against strict guidelines to ensure they represent genuine clinical interactions.
        </p>
        <ul className="list-disc pl-5 text-xs text-text-secondary space-y-2">
          <li><strong>Independent Verification:</strong> Reviews are processed externally on Google and Doctify networks.</li>
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
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <div className="flex flex-col items-center">
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
          <div className="flex flex-col items-center">
            <Button disabled variant="secondary" className="min-w-[200px]">
              Leave a Doctify Review
            </Button>
            <span className="text-[10px] text-text-muted mt-1 italic">Doctify link pending</span>
          </div>
        </div>
      </div>

      {/* Review Policy Section */}
      <div className="bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-6 md:p-8 my-8">
        <h3 className="font-sans text-base font-bold text-deep-navy mb-3">Review Policy &amp; Transparency Statement</h3>
        <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
          <p className="font-medium text-clinical-teal">
            “Reviews shown on this website will be taken from independent third-party platforms. Lincolnshire Knee Clinic does not edit or alter patient reviews. Only genuine reviews published on the original review platforms will be displayed.”
          </p>
          <div className="p-3 bg-white border border-border-clinical/40 rounded italic font-semibold text-deep-navy">
            [Review Verification Policy – placeholder pending legal and clinical governance review prior to publication]
          </div>
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
