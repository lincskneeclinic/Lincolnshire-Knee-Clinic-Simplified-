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
import { getRemovedArticleSlugs, getArticleOverrides, ArticleOverride } from "@/lib/educationArticles";

// Articles can be removed from the Education Hub via the business dashboard without a
// redeploy — this page re-checks the removed-article list every `revalidate` seconds
// (ISR) instead of being purely static forever, so a removal actually takes effect.
// Force cache refresh for updated article illustrations.
export const revalidate = 300;

// Definition of categories data
interface Article {
  title: string;
  description: string;
  readTime: string;
  href: string;
  imageUrl?: string;
  datePublished: string;
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

// Built per-request (not at module scope) so a freshly removed/updated article can be
// reflected without needing the data baked in at build time.
function buildCategoriesData(
  removedSlugs: string[],
  overrides: Record<string, ArticleOverride>
): Record<string, CategoryData> {
  const categoriesData: Record<string, CategoryData> = {};

  Object.entries(categoryMeta).forEach(([catKey, meta]) => {
    const articlesInCat = Object.values(blogArticles)
      .filter((a) => a.category === catKey && !removedSlugs.includes(a.slug))
      .map((a) => {
        const override = overrides[a.slug];
        return {
          title: override?.title || a.title,
          description: override?.excerpt || a.description,
          readTime: a.readTime,
          href: `/education/${a.category}/${a.slug}`,
          imageUrl: override?.featuredImage || a.image,
          datePublished: a.datePublished
        };
      });

    // Sort by publication date descending (newest first)
    articlesInCat.sort(
      (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
    );

    categoriesData[catKey] = {
      title: meta.title,
      categoryLabel: meta.categoryLabel,
      description: meta.description,
      articles: articlesInCat
    };
  });

  return categoriesData;
}

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((category) => ({
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
  const data = categoryMeta[category];

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
  const [removedSlugs, overrides] = await Promise.all([getRemovedArticleSlugs(), getArticleOverrides()]);
  const categoriesData = buildCategoriesData(removedSlugs, overrides);
  const data = categoriesData[category];

  if (!data) {
    notFound();
  }

  const activeArticles = data.articles.slice(0, 6);
  const archivedArticles = data.articles.slice(6);

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
          {activeArticles.map((article, index) => (
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

      {/* Archived / Older Articles Section */}
      {archivedArticles.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border-clinical/40">
          <h3 className="text-sm font-bold uppercase text-clinical-teal tracking-wider mb-6 border-b border-border-clinical/30 pb-2">
            Older & Archived Articles
          </h3>
          <div className="bg-white border border-border-clinical rounded-xl shadow-[0_2px_10px_rgba(8,47,73,0.01)] overflow-hidden">
            <div className="divide-y divide-border-clinical/30">
              {archivedArticles.map((article, index) => {
                const formattedDate = new Date(article.datePublished).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={index}
                    className="p-4 sm:px-6 hover:bg-warm-off-white/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {formattedDate} &bull; {article.readTime}
                      </span>
                      <h4 className="font-serif text-sm md:text-base font-bold text-deep-navy">
                        {article.title}
                      </h4>
                      <p className="text-xs text-text-secondary line-clamp-1 font-medium">
                        {article.description}
                      </p>
                    </div>
                    <Button
                      href={article.href}
                      variant="secondary"
                      className="py-1 px-3 text-xs self-start sm:self-auto shrink-0"
                    >
                      Read Article
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
