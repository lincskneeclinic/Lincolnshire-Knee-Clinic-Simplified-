import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { blogArticles } from "@/data/articles";
import { FaqAccordion } from "@/components/FaqAccordion";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{
    category: string;
    article: string;
  }>;
}

export function generateStaticParams() {
  return Object.values(blogArticles).map((item) => ({
    category: item.category,
    article: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { article } = await params;
  const data = blogArticles[article];

  if (!data) {
    return {
      title: "Article Not Found | Lincolnshire Knee Clinic",
    };
  }

  const pageTitle = `${data.title} | Blog & Article`;
  const pageUrl = `${SITE_URL}/education/${category}/${article}`;
  const imageUrl = data.image ? `${SITE_URL}${data.image}` : `${SITE_URL}/brand/lkc-logo-k-transparent.png`;

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
      type: "article",
      publishedTime: data.datePublished,
      authors: [data.author],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: data.description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, article } = await params;
  const data = blogArticles[article];

  // Protect route and ensure it belongs to the correct category
  if (!data || data.category !== category) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/education/${category}/${article}`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        "headline": data.title,
        "description": data.description,
        "image": data.image ? `${SITE_URL}${data.image}` : undefined,
        "author": {
          "@type": "Person",
          "name": data.author,
          "jobTitle": data.authorTitle
        },
        "publisher": {
          "@type": "MedicalOrganization",
          "name": "Lincolnshire Knee Clinic",
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/brand/lkc-logo-k-transparent.png`
          }
        },
        "datePublished": data.datePublished,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl
        }
      },
      {
        "@type": "MedicalWebPage",
        "@id": `${pageUrl}#medicalwebpage`,
        "name": data.title,
        "description": data.description,
        "about": {
          "@type": "MedicalCondition",
          "name": data.categoryLabel
        },
        "reviewedBy": {
          "@type": "Person",
          "name": data.author,
          "jobTitle": data.authorTitle
        },
        "lastReviewed": data.datePublished
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Education & Blog", href: "/education" },
          { label: data.categoryLabel, href: `/education/${data.category}` },
          { label: data.title }
        ]}
      />

      {/* Article Header (Blog Style) */}
      <header className="mt-6 mb-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-clinical-teal/10 text-clinical-teal mb-4 uppercase tracking-wider">
          {data.categoryLabel}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-deep-navy leading-tight mb-6">
          {data.title}
        </h1>
        
        {/* Author / Date Meta bar */}
        <div className="flex flex-wrap items-center gap-4 border-y border-border-clinical/40 py-4 text-xs font-semibold text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-clinical-teal text-white flex items-center justify-center font-bold text-sm">
              RP
            </div>
            <div>
              <span className="block text-deep-navy font-bold">{data.author}</span>
              <span className="text-[10px] text-text-muted">{data.authorTitle}</span>
            </div>
          </div>
          <span className="text-border-clinical/80 hidden sm:inline">&bull;</span>
          <div>
            <span className="text-text-muted">Published:</span> {data.datePublished}
          </div>
          <span className="text-border-clinical/80 hidden sm:inline">&bull;</span>
          <div>
            <span className="text-text-muted">Read Time:</span> {data.readTime}
          </div>
          <span className="text-border-clinical/80 hidden sm:inline">&bull;</span>
          <div className="text-status-success uppercase tracking-wider text-[10px] bg-status-success/5 px-2 py-0.5 rounded-full font-bold">
            Reviewed & Approved
          </div>
        </div>
      </header>

      {/* Article Banner Image */}
      {data.image && (
        <div className="w-full h-60 sm:h-80 md:h-[400px] relative rounded-2xl overflow-hidden mb-10 border border-border-clinical/30 bg-pale-clinical-blue/10">
          <img src={data.image} alt={data.title} className="object-contain w-full h-full bg-white" />
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 gap-10">
        
        {/* Article Body */}
        <article className="prose max-w-none text-text-secondary text-sm md:text-base leading-relaxed space-y-6">
          
          {/* Key Takeaways */}
          <div className="bg-pale-clinical-blue/30 border-l-4 border-clinical-teal p-6 rounded-r-xl my-6">
            <h4 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-3">
              Key Takeaways
            </h4>
            <ul className="space-y-2 list-disc list-inside text-xs md:text-sm font-semibold">
              {data.takeaways.map((item, idx) => (
                <li key={idx} className="text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Render Main Text Sections & Quotes (excluding warning block for bottom positioning) */}
          {data.sections
            .filter((section) => !section.isWarning)
            .map((section, idx) => {
              if (section.isQuote) {
                return (
                  <blockquote key={idx} className="border-l-4 border-clinical-teal pl-6 my-8 italic text-deep-navy font-medium text-base md:text-lg bg-pale-clinical-blue/20 py-5 pr-6 rounded-r-xl shadow-sm">
                    "{section.content}"
                  </blockquote>
                );
              }

              // Paragraph splitting to prevent walls of text
              const paragraphs = section.content.split("\n\n").filter(Boolean);

              return (
                <div key={idx} className="my-8">
                  {section.heading && (
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-deep-navy mt-8 mb-4 border-b border-border-clinical/30 pb-2">
                      {section.heading}
                    </h3>
                  )}
                  
                  <div className="space-y-4">
                    {paragraphs.map((para, pIdx) => {
                      const renderTextWithLinks = (text: string) => {
                        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
                        const parts = [];
                        let lastIndex = 0;
                        let match;

                        while ((match = regex.exec(text)) !== null) {
                          const [fullMatch, linkText, url] = match;
                          const index = match.index;

                          if (index > lastIndex) {
                            parts.push(text.substring(lastIndex, index));
                          }

                          parts.push(
                            <Link
                              key={index}
                              href={url}
                              className="text-clinical-teal hover:underline font-bold"
                            >
                              {linkText}
                            </Link>
                          );

                          lastIndex = index + fullMatch.length;
                        }

                        if (lastIndex < text.length) {
                          parts.push(text.substring(lastIndex));
                        }

                        return parts.length > 0 ? parts : text;
                      };

                      if (para.includes("\n1. ") || para.includes("\n- ") || para.startsWith("1. ") || para.startsWith("- ")) {
                        const lines = para.split("\n").filter(Boolean);
                        return (
                          <ul key={pIdx} className="space-y-2 bg-soft-blue/30 p-5 rounded-xl border border-border-clinical/30 my-4 text-xs md:text-sm">
                            {lines.map((line, lIdx) => (
                              <li key={lIdx} className="flex items-start gap-2 font-medium text-text-secondary">
                                <span className="text-clinical-teal font-bold shrink-0 mt-0.5">&bull;</span>
                                <span>{renderTextWithLinks(line.replace(/^(\d+\.|\-)\s*/, ""))}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <p key={pIdx} className="font-medium text-text-secondary leading-relaxed text-sm md:text-base">
                          {renderTextWithLinks(para)}
                        </p>
                      );
                    })}
                  </div>

                  {/* Inline Image / Clinical Diagram */}
                  {section.inlineImage && (
                    <figure className="my-8 rounded-2xl overflow-hidden border border-border-clinical/30 shadow-md bg-pale-clinical-blue/10">
                      <img
                        src={section.inlineImage}
                        alt={section.heading || data.title}
                        className="w-full h-auto object-contain max-h-[380px] bg-white"
                      />
                      {section.inlineImageCaption && (
                        <figcaption className="text-center text-xs text-text-muted italic p-3 bg-white/90 border-t border-border-clinical/20 font-medium">
                          {section.inlineImageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              );
            })}

        </article>

        {/* References & Medical Literature (After main text, before FAQs) */}
        {data.references && data.references.length > 0 && (
          <section className="border-t border-border-clinical/30 pt-8 mt-2">
            <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              References & Medical Literature
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-text-muted font-medium bg-pale-clinical-blue/20 p-5 rounded-xl border border-border-clinical/30">
              {data.references.map((ref, idx) => (
                <li key={idx} className="leading-relaxed">
                  {ref}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* FAQs Accordion (Rendered after References) */}
        {data.faqs && data.faqs.length > 0 && (
          <section className="border-t border-border-clinical/30 pt-10">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-deep-navy mb-6">
              Frequently Asked Questions
            </h3>
            <FaqAccordion items={data.faqs} />
          </section>
        )}

        {/* Clinical Warning Box (Rendered after References) */}
        {data.sections
          .filter((section) => section.isWarning)
          .map((section, idx) => (
            <div key={idx} className="bg-status-error/5 border border-status-error/20 p-5 rounded-xl text-xs md:text-sm my-6 font-semibold flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 text-status-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold text-status-error block mb-1 uppercase tracking-wider text-xs">Clinical Warning</span>
                {section.content}
              </div>
            </div>
          ))}

        {/* Next Steps / CTAs */}
        <section className="bg-soft-blue border border-border-clinical p-6 md:p-8 rounded-xl text-center my-8">
          <h4 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-2">
            Concerned about your knee symptoms?
          </h4>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-6 font-medium max-w-xl mx-auto">
            Book a consultation with Mr Ricardo J Pacheco to get a personalized diagnosis, clinical advice, and structured treatment pathway.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/book-appointment" variant="primary">
              Book Consultation
            </Button>
            <Button href={`/education/${data.category}`} variant="secondary">
              Explore More in {data.categoryLabel}
            </Button>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <MedicalDisclaimerBlock />

      </div>
    </div>
  );
}
