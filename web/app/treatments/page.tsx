import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { treatmentsData } from "@/data/treatments";
import { getVisualAsset } from "@/data/visualsInventory";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Knee Treatments & Procedures | Lincolnshire Knee Clinic";
const PAGE_DESCRIPTION =
  "Explore our surgical and non-surgical knee treatment options. Learn about physiotherapy, joint injections, knee arthroscopy, and knee replacements.";
const PAGE_URL = `${SITE_URL}/treatments`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/brand/lkc-logo-k-transparent.png`],
  },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    "url": PAGE_URL,
    "name": PAGE_TITLE,
    "description": PAGE_DESCRIPTION,
    "inLanguage": "en-GB",
    "hasPart": allTreatments.map(t => ({
      "@type": "MedicalWebPage",
      "url": `${SITE_URL}/treatments/${t.slug}`,
      "name": t.name
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Treatments" }]} />

      <PageHeader
        category="Clinical Treatments"
        title="Knee Treatments & Procedures"
        subtitle="Learn about our surgical and non-surgical knee treatment options. We support a balanced, evidence-aware approach, prioritising conservative management before surgical interventions."
      />

      <p className="text-xs text-text-secondary/70 italic border-t border-border-clinical/30 pt-4">
        Content is intended for general patient education. Each page shows its current clinical review status below.
      </p>

      {/* NON-SURGICAL TREATMENTS Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Non-Surgical Treatments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonSurgical.map((item, idx) => {
            const visual = item.slug === "injections" 
              ? { imagePath: "/images/injections/corticosteroid-anatomy.png" } 
              : getVisualAsset(`treatments/${item.slug}`, "overview");

            return (
              <Card
                key={idx}
                category="Non-Surgical"
                title={item.name}
                description={item.shortDescription}
                href={"customHref" in item ? item.customHref : `/treatments/${item.slug}`}
                linkText="Explore Treatment"
                imageUrl={visual.imagePath || undefined}
              />
            );
          })}
        </div>
      </section>

      {/* SURGICAL TREATMENTS Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Surgical Treatments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surgical.map((item, idx) => {
            const visual = getVisualAsset(`treatments/${item.slug}`, "overview");
            return (
              <Card
                key={idx}
                category="Surgical"
                title={item.name}
                description={item.shortDescription}
                href={`/treatments/${item.slug}`}
                linkText="Explore Treatment"
                imageUrl={visual.imagePath || undefined}
              />
            );
          })}
        </div>
      </section>

      {/* RECOVERY & REHABILITATION Section */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
          Recovery & Rehabilitation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recovery.map((item, idx) => {
            const visual = getVisualAsset(`treatments/${item.slug}`, "overview");
            return (
              <Card
                key={idx}
                category="Recovery Resource"
                title={item.name}
                description={item.shortDescription}
                href={`/treatments/${item.slug}`}
                linkText="Explore Resource"
                imageUrl={visual.imagePath || undefined}
              />
            );
          })}
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
