import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { treatmentsData } from "@/data/treatments";

export const metadata: Metadata = {
  title: "Knee Treatments & Procedures | Lincolnshire Knee Clinic",
  description: "Explore our surgical and non-surgical knee treatment options. Learn about physiotherapy, joint injections, knee arthroscopy, and knee replacements.",
};

export default function TreatmentsHub() {
  const allTreatments = Object.values(treatmentsData);

  // Group treatments by category
  const nonSurgical = [
    ...allTreatments.filter((t) => t.category === "non-surgical"),
    // Add manual entry for Knee Injections pointing to existing Injections hub
    {
      slug: "injections",
      name: "Knee Injections",
      shortDescription: "Clinical joint injections (steroid, hyaluronic acid, hydrogel) to manage pain and localized inflammation.",
      customHref: "/injections"
    }
  ];

  const surgical = allTreatments.filter((t) => t.category === "surgical");
  const recovery = allTreatments.filter((t) => t.category === "recovery");

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans space-y-12">
      <Breadcrumbs items={[{ label: "Treatments" }]} />

      <PageHeader
        category="Clinical Treatments"
        title="Knee Treatments & Procedures"
        subtitle="Learn about our surgical and non-surgical knee treatment options. We support a balanced, evidence-aware approach, prioritising conservative management before surgical interventions."
      />

      <p className="text-xs text-text-secondary/70 italic border-t border-border-clinical/30 pt-4">
        Content is consultant reviewed and intended for general patient education.
      </p>

      {/* NON-SURGICAL TREATMENTS Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Non-Surgical Treatments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonSurgical.map((item, idx) => (
            <Card
              key={idx}
              category="Non-Surgical"
              title={item.name}
              description={item.shortDescription}
              href={"customHref" in item ? item.customHref : `/treatments/${item.slug}`}
              linkText="Explore Treatment"
            />
          ))}
        </div>
      </section>

      {/* SURGICAL TREATMENTS Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Surgical Treatments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surgical.map((item, idx) => (
            <Card
              key={idx}
              category="Surgical"
              title={item.name}
              description={item.shortDescription}
              href={`/treatments/${item.slug}`}
              linkText="Explore Treatment"
            />
          ))}
        </div>
      </section>

      {/* RECOVERY & REHABILITATION Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Recovery & Rehabilitation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recovery.map((item, idx) => (
            <Card
              key={idx}
              category="Recovery Resource"
              title={item.name}
              description={item.shortDescription}
              href={`/treatments/${item.slug}`}
              linkText="Explore Resource"
            />
          ))}
        </div>
      </section>

      {/* Booking CTA Panel */}
      <div className="my-10 bg-pale-clinical-blue border border-border-clinical/30 p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
        <div className="max-w-2xl">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-2">
            Interested in exploring conservative or surgical options?
          </h2>
          <p className="text-sm text-text-secondary">
            Book an assessment with our specialist consultant to discuss the most appropriate treatment pathway for your specific clinical needs.
          </p>
        </div>
        <Button href="/book-appointment" variant="primary" className="shrink-0">
          Book Appointment
        </Button>
      </div>

      <MedicalDisclaimerBlock />
    </div>
  );
}
