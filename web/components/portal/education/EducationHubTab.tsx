"use client";

import React from "react";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";
import { formatDateSafe } from "@/lib/formatDate";

export interface EducationArticleSummary {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  image?: string;
  datePublished: string;
  removed: boolean;
  removedAt: string | null;
  updatedAt: string | null;
  views: number;
  feedbackUp: number;
  feedbackDown: number;
}

interface EducationHubTabProps {
  articles: EducationArticleSummary[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  isStartingUpdateSlug: string | null;
  onStartUpdate: (article: EducationArticleSummary) => void;
  onRequestRemoval: (article: EducationArticleSummary) => void;
}

export function EducationHubTab({
  articles,
  loading,
  search,
  onSearchChange,
  isStartingUpdateSlug,
  onStartUpdate,
  onRequestRemoval,
}: EducationHubTabProps) {
  const searchTerm = search.trim().toLowerCase();
  const visibleArticles = searchTerm
    ? articles.filter(
        (a) => a.title.toLowerCase().includes(searchTerm) || (a.category || "").toLowerCase().includes(searchTerm)
      )
    : articles;

  return (
    <PortalCard className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Education Hub Articles</h3>
          <p className="text-xs text-white/60 mt-1">
            Remove an article if it's outdated or the underlying evidence has changed — it disappears from the live
            site within a few minutes, no code deploy needed. Restoring it is just as instant. Use Edit to revise
            an article's content through the normal draft editor (references, images, wording) — approving it
            publishes the changes live the same way.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles…"
          className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-64 shrink-0"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-white/60 text-xs">Loading articles…</div>
      ) : articles.length === 0 ? (
        <PortalEmptyState message="No Education Hub articles found." />
      ) : visibleArticles.length === 0 ? (
        <PortalEmptyState message={`No articles match "${search}".`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleArticles.map((article) => (
            <div
              key={article.slug}
              className={`p-4 rounded-xl border space-y-2 ${
                article.removed ? "bg-dark-overlay-navy border-white/10 opacity-60" : "bg-dark-overlay-navy border-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-clinical-teal font-semibold">
                  {article.categoryLabel}
                </span>
                {article.removed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-status-error/40 text-status-error">
                    Removed
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">{article.title}</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/50 font-medium">
                <span>Created: {formatDateSafe(article.datePublished)}</span>
                {article.updatedAt && <span>Last Updated: {formatDateSafe(article.updatedAt)}</span>}
                {article.removedAt && (
                  <span className="text-status-error/80">Removed: {formatDateSafe(article.removedAt)}</span>
                )}
                <span>{article.views.toLocaleString()} views</span>
                {(article.feedbackUp > 0 || article.feedbackDown > 0) && (
                  <span>
                    👍 {article.feedbackUp} · 👎 {article.feedbackDown}
                  </span>
                )}
              </div>
              <div className="flex justify-end items-center gap-2 pt-1 flex-wrap">
                {!article.removed && (
                  <button
                    onClick={() => onStartUpdate(article)}
                    disabled={isStartingUpdateSlug === article.slug}
                    className="border border-white/20 text-white/80 hover:bg-white/5 text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium disabled:opacity-50 flex items-center gap-1"
                  >
                    {isStartingUpdateSlug === article.slug ? "Opening Editor…" : "✏️ Edit"}
                  </button>
                )}
                {article.removed ? (
                  <button
                    onClick={() => onRequestRemoval(article)}
                    className="border border-clinical-teal/40 text-clinical-teal hover:bg-clinical-teal/10 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                  >
                    Restore to Education Hub
                  </button>
                ) : (
                  <button
                    onClick={() => onRequestRemoval(article)}
                    className="border border-status-error/40 text-status-error hover:bg-status-error/10 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                  >
                    Remove from Education Hub
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalCard>
  );
}
