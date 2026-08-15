"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface Article {
  title: string;
  description: string;
  readTime: string;
  href: string;
  imageUrl?: string;
  datePublished: string;
}

interface EducationCategoryTabsProps {
  blogs: Article[];
  articles: Article[];
}

const ARCHIVE_THRESHOLD = 6;

function ArticleGrid({ items }: { items: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((article, index) => (
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
  );
}

function ArchivedList({ items }: { items: Article[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border-clinical/40">
      <h3 className="text-sm font-bold uppercase text-clinical-teal tracking-wider mb-6 border-b border-border-clinical/30 pb-2">
        Older &amp; Archived
      </h3>
      <div className="bg-white border border-border-clinical rounded-xl shadow-[0_2px_10px_rgba(8,47,73,0.01)] overflow-hidden">
        <div className="divide-y divide-border-clinical/30">
          {items.map((article, index) => {
            const formattedDate = new Date(article.datePublished).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
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
  );
}

export function EducationCategoryTabs({ blogs, articles }: EducationCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<"blog" | "article">("blog");

  const items = activeTab === "blog" ? blogs : articles;
  const activeItems = items.slice(0, ARCHIVE_THRESHOLD);
  const archivedItems = items.slice(ARCHIVE_THRESHOLD);

  return (
    <div className="my-8">
      <div className="flex gap-2 mb-6 border-b border-border-clinical/30" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "blog"}
          onClick={() => setActiveTab("blog")}
          className={`px-4 py-3 text-sm font-bold font-sans rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "blog"
              ? "text-clinical-teal border-clinical-teal"
              : "text-text-secondary border-transparent hover:text-deep-navy"
          }`}
        >
          Patient Blogs ({blogs.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "article"}
          onClick={() => setActiveTab("article")}
          className={`px-4 py-3 text-sm font-bold font-sans rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "article"
              ? "text-clinical-teal border-clinical-teal"
              : "text-text-secondary border-transparent hover:text-deep-navy"
          }`}
        >
          In-Depth Articles ({articles.length})
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary font-medium py-8 text-center">
          {activeTab === "blog"
            ? "No patient blogs published in this category yet."
            : "No in-depth articles published in this category yet."}
        </p>
      ) : (
        <ArticleGrid items={activeItems} />
      )}

      <ArchivedList items={archivedItems} />
    </div>
  );
}
