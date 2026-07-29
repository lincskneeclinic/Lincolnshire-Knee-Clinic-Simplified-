import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { SITE_URL } from "@/lib/site";

import { blogArticles } from "@/data/articles";

// Definition of categories data
interface Article {
  title: string;
  description: string;
  readTime: string;
  href: string;
  imageUrl?: string;
}

interface CategoryData {
  title: string;
  description: string;
  categoryLabel: string;
  articles: Article[];
}

const categoryMeta: Record<string, { title: string; categoryLabel: string; description: string }> = {
  "knee-arthritis": {
    title: "Knee Arthritis",
    categoryLabel: "Knee Arthritis",
    description: "Access educational guides on managing knee osteoarthritis, understanding joint wear, and exploring joint preservation treatments."
  },
  "knee-replacement": {
    title: "Knee Replacement",
    categoryLabel: "Knee Replacement",
    description: "Everything you need to know about partial, total, robotic, and revision knee replacements, including what to expect during your surgical journey."
  },
  "sports-knee-injuries": {
    title: "Sports Knee Injuries",
    categoryLabel: "Sports Knee Injuries",
    description: "Patient guides for meniscus tears, ACL reconstruction, ligament injuries, and structured rehabilitation to help you return to sports safely."
  },
  "injections": {
    title: "Knee Injections",
    categoryLabel: "Injections",
    description: "Clinical literature comparing steroid, lubrication, PRP, and hydrogel joint injections to help you make informed treatment choices."
  },
  "recovery-and-rehabilitation": {
    title: "Recovery & Rehabilitation",
    categoryLabel: "Recovery & Rehab",
    description: "Post-operative exercise routines, milestone targets, range of movement tracking tips, and comprehensive recovery guides."
  },
  "patient-guides": {
    title: "Patient Guides",
    categoryLabel: "Patient Guides",
    description: "Step-by-step checklists preparing you for surgery, clinic visits, imaging, and post-discharge home care."
  },
  "faqs": {
    title: "Frequently Asked Questions",
    categoryLabel: "FAQs",
    description: "Quick, consultant-reviewed answers to common questions about knee pain, diagnoses, procedures, and clinic appointments."
  }
};

const categoriesData: Record<string, CategoryData> = {};

Object.entries(categoryMeta).forEach(([catKey, meta]) => {
  const articlesInCat = Object.values(blogArticles)
    .filter((a) => a.category === catKey)
    .map((a) => ({
      title: a.title,
      description: a.description,
      readTime: a.readTime,
      href: `/education/${a.category}/${a.slug}`,
      imageUrl: a.image
    }));

  categoriesData[catKey] = {
    title: meta.title,
    categoryLabel: meta.categoryLabel,
    description: meta.description,
    articles: articlesInCat
  };
});

export function generateStaticParams() {
  return Object.keys(categoriesData).map((category) => ({
    category,
  }));
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const data = categoriesData[category];

  if (!data) {
    return {
      title: "Category Not Found | Lincolnshire Knee Clinic",
    };
  }

  const pageTitle = `${data.title} | Patient Resources & Articles`;
  const pageUrl = `${SITE_URL}/education/${category}`;

  return {
    title: pageTitle,
    description: data.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: data.description,
      url: pageUrl,
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
      title: pageTitle,
      description: data.description,
      images: [`${SITE_URL}/brand/lkc-logo-k-transparent.png`],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const data = categoriesData[category];

  if (!data) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/education/${category}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": data.title,
    "description": data.description,
    "url": pageUrl,
    "itemListElement": data.articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${SITE_URL}${article.href}`
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: "Education & Blog", href: "/education" },
          { label: data.categoryLabel }
        ]}
      />

      <PageHeader
        category="Education & Blog Category"
        title={data.title}
        subtitle={data.description}
      />

      <div className="my-8">
        <h3 className="text-sm font-bold uppercase text-clinical-teal tracking-wider mb-6 border-b border-border-clinical/30 pb-2">
          Articles & Resources in this Category
        </h3>
        
        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.articles.map((article, index) => (
            <Card
              key={index}
              category={article.readTime}
              title={article.title}
              description={article.description}
              href={article.href}
              imageUrl={article.imageUrl}
              linkText="Read article"
            />
          ))}
        </div>
      </div>

      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-6 md:p-8 rounded-xl text-center max-w-3xl mx-auto my-12">
        <h4 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-2">
          Need a Clinical Assessment?
        </h4>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-6 font-medium">
          While educational resources provide valuable general information, they cannot replace a personalized diagnosis. If you are experiencing persistent pain or instability, book a consultation with our specialist.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button href="/book-appointment" variant="primary">
            Book Appointment
          </Button>
          <Button href="/education" variant="secondary">
            Back to Education Hub
          </Button>
        </div>
      </div>

      <MedicalDisclaimerBlock />
    </div>
  );
}
