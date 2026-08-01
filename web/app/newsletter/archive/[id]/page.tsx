import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getNewsletterEditions } from "@/lib/newsletterDistribution";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Sent newsletter content can change (new editions get sent over time) without a redeploy,
// so this re-checks on each request rather than being purely static forever.
export const revalidate = 0;

function formatDateSafe(value?: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const editions = await getNewsletterEditions();
  const edition = editions.find((e) => e.id === id && e.status === "sent");
  if (!edition) return { title: "Newsletter Not Found | Lincolnshire Knee Clinic" };
  return {
    title: `${edition.subject} | Lincolnshire Knee Clinic Newsletter`,
  };
}

export default async function NewsletterArchiveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const editions = await getNewsletterEditions();
  const edition = editions.find((e) => e.id === id && e.status === "sent");

  if (!edition) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs
        items={[
          { label: "Newsletter Subscription", href: "/newsletter" },
          { label: edition.subject },
        ]}
      />

      <div className="mt-6 mb-10 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-pale-clinical-blue px-2 py-0.5 rounded border border-clinical-teal/10">
          Past Newsletter
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy leading-snug">{edition.subject}</h1>
        <p className="text-xs text-text-muted font-mono">{formatDateSafe(edition.dateSent)}</p>
      </div>

      <article className="prose max-w-none text-text-secondary text-sm md:text-base leading-relaxed space-y-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy mt-8 mb-4 border-b border-border-clinical/30 pb-2">{children}</h2>,
            h2: ({ children }) => <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy mt-8 mb-4 border-b border-border-clinical/30 pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mt-6 mb-3">{children}</h3>,
            p: ({ children }) => <p className="font-medium text-text-secondary leading-relaxed text-sm md:text-base my-4">{children}</p>,
            ul: ({ children }) => <ul className="space-y-2 bg-soft-blue/30 p-5 rounded-xl border border-border-clinical/30 my-4 text-xs md:text-sm list-disc list-inside">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-2 bg-soft-blue/30 p-5 rounded-xl border border-border-clinical/30 my-4 text-xs md:text-sm list-decimal list-inside">{children}</ol>,
            li: ({ children }) => <li className="font-medium text-text-secondary">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-clinical-teal pl-6 my-8 italic text-deep-navy font-medium text-base md:text-lg bg-pale-clinical-blue/20 py-5 pr-6 rounded-r-xl shadow-sm">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <Link href={href || "#"} className="text-clinical-teal hover:underline font-bold">
                {children}
              </Link>
            ),
            img: ({ src, alt }) => (
              <figure className="my-8 rounded-2xl overflow-hidden border border-border-clinical/30 shadow-md bg-pale-clinical-blue/10">
                <img src={src || ""} alt={alt || ""} className="w-full h-auto object-contain max-h-[380px] bg-white" />
                {alt && (
                  <figcaption className="text-center text-xs text-text-muted italic p-3 bg-white/90 border-t border-border-clinical/20 font-medium">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),
          }}
        >
          {edition.bodyMarkdown}
        </ReactMarkdown>
      </article>

      <div className="mt-12 pt-6 border-t border-border-clinical/30">
        <Link href="/newsletter" className="text-clinical-teal hover:underline font-bold text-sm">
          ← Back to Past Newsletters
        </Link>
      </div>
    </div>
  );
}
