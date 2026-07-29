import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { DiagnosticsClient } from "./DiagnosticsClient";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Diagnostic Imaging & Radiography | Lincolnshire Knee Clinic";
const PAGE_DESCRIPTION =
  "Specialist musculoskeletal MRI, dynamic ultrasound, weight-bearing X-rays, and CT scans delivered in official partnership with Vista Health across Lincolnshire and nationwide.";
const PAGE_URL = `${SITE_URL}/diagnostics`;

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

export default function DiagnosticsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${PAGE_URL}#webpage`,
        "url": PAGE_URL,
        "name": PAGE_TITLE,
        "description": PAGE_DESCRIPTION,
        "inLanguage": "en-GB",
        "medicalAudience": "Patient",
        "specialty": "Orthopedic",
        "about": {
          "@type": "MedicalClinic",
          "name": "Vista Health Diagnostic Network",
          "description": "Official diagnostic partner providing fast-track MRI, Ultrasound, X-Ray, and CT scans."
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Diagnostics", "item": PAGE_URL }
        ]
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Diagnostics" }]} />

      <PageHeader
        category="Clinical Partnerships & Diagnostic Imaging"
        title="Diagnostic Imaging & Radiography"
        subtitle="Specialist musculoskeletal MRI, dynamic ultrasound, weight-bearing X-rays, and CT scans delivered in official partnership with Vista Health across Lincolnshire and nationwide."
      />

      <DiagnosticsClient />

      <MedicalDisclaimerBlock />
    </div>
  );
}
