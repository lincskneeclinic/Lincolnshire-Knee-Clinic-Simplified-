import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Education & Blog Hub | Lincolnshire Knee Clinic";
const PAGE_DESCRIPTION =
  "Access clear, consultant-reviewed patient resources, orthopedic blog articles, and clinical guides designed to help you understand your knee health.";
const PAGE_URL = `${SITE_URL}/education`;

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

export default function EducationHub() {
  const categories = [
    {
      title: "Knee Arthritis",
      description: "Educational guides on managing knee osteoarthritis, understanding joint wear, and exploring preservation treatments.",
      href: "/education/knee-arthritis",
      imageUrl: "/images/blog/category-arthritis.png",
    },
    {
      title: "Knee Replacement",
      description: "Everything you need to know about partial, total, robotic, and revision knee replacements, including what to expect.",
      href: "/education/knee-replacement",
      imageUrl: "/images/blog/category-replacement.png",
    },
    {
      title: "Sports Knee Injuries",
      description: "Patient guides for meniscus tears, ACL reconstruction, ligament injuries, and rehabilitation to return to sports safely.",
      href: "/education/sports-knee-injuries",
      imageUrl: "/images/blog/category-sports.png",
    },
    {
      title: "Injections",
      description: "Clinical literature comparing steroid, lubrication, PRP, and hydrogel joint injections to help you make informed choices.",
      href: "/education/injections",
      imageUrl: "/images/blog/category-injections.png",
    },
    {
      title: "Recovery & Rehabilitation",
      description: "Post-operative exercise routines, milestone targets, range of movement tracking tips, and recovery guides.",
      href: "/education/recovery-and-rehabilitation",
      imageUrl: "/images/blog/category-recovery.png",
    },
    {
      title: "Patient Guides",
      description: "Step-by-step checklists preparing you for surgery, clinic visits, imaging, and post-discharge home care.",
      href: "/education/patient-guides",
      imageUrl: "/images/blog/category-guides.png",
    },
    {
      title: "Frequently Asked Questions",
      description: "Quick, consultant-reviewed answers to common questions about knee pain, diagnoses, procedures, and appointments.",
      href: "/education/faqs",
      imageUrl: "/images/blog/category-faqs.png",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        "url": PAGE_URL,
        "name": PAGE_TITLE,
        "description": PAGE_DESCRIPTION,
        "inLanguage": "en-GB",
        "hasPart": categories.map((cat) => ({
          "@type": "WebPage",
          "name": cat.title,
          "description": cat.description,
          "url": `${SITE_URL}${cat.href}`
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Education & Blog", "item": PAGE_URL }
        ]
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Education & Blog" }]} />

      <PageHeader
        category="Education & Blog"
        title="Education & Blog Hub"
        subtitle="Access clear, consultant-reviewed patient resources, orthopedic blog articles, and clinical guides designed to help you understand your knee health."
      />

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {categories.map((category, index) => (
          <Card
            key={index}
            category="Resource Category"
            title={category.title}
            description={category.description}
            href={category.href}
            imageUrl={category.imageUrl}
            linkText="Explore articles"
          />
        ))}
      </div>

      <MedicalDisclaimerBlock />
    </div>
  );
}
