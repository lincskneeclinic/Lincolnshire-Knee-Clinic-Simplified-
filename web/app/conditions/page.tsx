import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { conditionsData } from "@/data/conditions";
import { getVisualAsset } from "@/data/visualsInventory";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Knee Conditions Library | Lincolnshire Knee Clinic";
const PAGE_DESCRIPTION =
  "Explore our comprehensive clinical directory of knee conditions. Learn about knee arthritis, meniscus tears, ACL injuries, patellofemoral pain, and more.";
const PAGE_URL = `${SITE_URL}/conditions`;

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

export default function ConditionsHub() {
  const conditions = Object.values(conditionsData);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Conditions", item: PAGE_URL },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-GB",
      },
      {
        "@type": "ItemList",
        itemListElement: conditions.map((condition, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: condition.name,
          url: `${PAGE_URL}/${condition.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Conditions" }]} />

      {/* Hero Header Block */}
      <div className="w-full bg-gradient-to-r from-[#003B5C] to-[#082F49] text-white py-10 md:py-14 border-b border-border-clinical/10 relative overflow-hidden rounded-xl mb-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="px-6 md:px-8 relative z-10">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-2 font-sans">
            Clinical Directory
          </span>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold !text-white leading-tight">
            Knee Conditions Library
          </h1>
          <p className="font-sans text-sm md:text-base text-[#EAF6FA] leading-relaxed mt-3 max-w-3xl">
            Learn about common orthopaedic knee conditions. We offer specialist assessment and tailored treatment pathways for degenerative disorders, sports injuries, and acute trauma.
          </p>
        </div>
      </div>

      <p className="text-xs text-text-secondary/70 italic border-t border-border-clinical/30 pt-4 mt-6">
        Content is intended for general patient education. Each page shows its current clinical review status below.
      </p>

      {/* Grid of conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {conditions.map((condition, index) => {
          const visualAsset = getVisualAsset(`conditions/${condition.slug}`, "overview");
          const isApproved = visualAsset.status === "approved" && !visualAsset.imagePath.includes("placeholder");
          return (
            <Card
              key={index}
              category="Condition Education"
              title={condition.name}
              description={condition.shortDescription}
              href={`/conditions/${condition.slug}`}
              linkText="Explore Condition"
              imageUrl={isApproved ? visualAsset.imagePath : undefined}
            />
          );
        })}
      </div>

      {/* Booking Prompt Card */}
      <div className="my-10 bg-pale-clinical-blue border border-border-clinical/30 p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
        <div className="max-w-2xl">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-2">
            Concerned about a specific diagnosis?
          </h2>
          <p className="text-sm text-text-secondary">
            Arrange a private specialist consultation. Our team provides precise diagnostic services and evidence-aware clinical recommendations.
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
