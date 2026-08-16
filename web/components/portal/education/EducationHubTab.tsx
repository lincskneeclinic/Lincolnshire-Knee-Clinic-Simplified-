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
  archived: boolean;
}

// Self-contained expand/fetch for one article's "what could we improve?"
// comments (only ever left alongside a thumbs-down) — fetched on demand
// rather than bundled into the main article list, since most articles have
// none and the text itself is only worth loading when someone asks to see it.
function ArticleCommentsToggle({ slug, feedbackDown }: { slug: string; feedbackDown: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [comments, setComments] = React.useState<Array<{ text: string; date: string }> | null>(null);

  if (feedbackDown === 0) return null;

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (comments !== null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/education-articles/${encodeURIComponent(slug)}/comments`);
      const data = await res.json();
      setComments(data.success ? data.comments : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="text-[10px] text-clinical-teal hover:underline cursor-pointer font-medium"
      >
        {expanded ? "▲ Hide comments" : "💬 View \"could be improved\" comments"}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {loading ? (
            <p className="text-[10px] text-white/50">Loading…</p>
          ) : comments && comments.length > 0 ? (
            comments.map((c, idx) => (
              <div key={idx} className="bg-primary-navy/60 border border-white/10 rounded-lg px-2.5 py-2 text-[10px]">
                <p className="text-white/80">{c.text}</p>
                <p className="text-white/40 mt-0.5">{formatDateSafe(c.date)}</p>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-white/50">No written comments — just thumbs-down votes with nothing added.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface EducationHubTabProps {
  articles: EducationArticleSummary[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  isStartingUpdateSlug: string | null;
  isStartingRunSlug: string | null;
  onStartUpdate: (article: EducationArticleSummary) => void;
  onStartRun: (article: EducationArticleSummary) => void;
  onRequestRemoval: (article: EducationArticleSummary) => void;
}

export function EducationHubTab({
  articles,
  loading,
  search,
  onSearchChange,
  isStartingUpdateSlug,
  isStartingRunSlug,
  onStartUpdate,
  onStartRun,
  onRequestRemoval,
}: EducationHubTabProps) {
  const [showArchived, setShowArchived] = React.useState(false);
  const searchTerm = search.trim().toLowerCase();
  
  const visibleArticles = articles.filter((a) => {
    // If searching, show everything that matches search query
    if (searchTerm) {
      return a.title.toLowerCase().includes(searchTerm) || (a.category || "").toLowerCase().includes(searchTerm);
    }
    // If not searching, filter out archived articles unless showArchived toggle is checked
    if (a.archived && !showArchived) {
      return false;
    }
    return true;
  });

  const archivedCount = articles.filter(a => a.archived).length;

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
          {archivedCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <label className="inline-flex items-center gap-2 text-xs text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-white/20 bg-dark-overlay-navy text-clinical-teal focus:ring-0 cursor-pointer"
                />
                Show Older & Archived Articles ({archivedCount})
              </label>
            </div>
          )}
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
        <PortalEmptyState message={searchTerm ? `No articles match "${search}".` : "No active articles found."} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleArticles.map((article) => (
            <div
              key={article.slug}
              className={`p-4 rounded-xl border space-y-2 ${
                article.removed
                  ? "bg-dark-overlay-navy border-white/10 opacity-60"
                  : article.archived
                  ? "bg-dark-overlay-navy border-white/10 opacity-75"
                  : "bg-dark-overlay-navy border-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-clinical-teal font-semibold">
                  {article.categoryLabel}
                </span>
                {article.removed ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-status-error/40 text-status-error">
                    Removed
                  </span>
                ) : article.archived ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-white/60 bg-white/5">
                    Archived (Older)
                  </span>
                ) : null}
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">{article.title}</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/50 font-medium">
                <span>Created: {formatDateSafe(article.datePublished)}</span>
                {article.updatedAt && <span>Last Updated: {formatDateSafe(article.updatedAt)}</span>}
                {article.removedAt && (
                  <span className="text-status-error/80">Removed: {formatDateSafe(article.removedAt)}</span>
                )}
                <span>{article.views.toLocaleString()} views</span>
                <span>
                  👍 {article.feedbackUp} · 👎 {article.feedbackDown}
                </span>
              </div>
              <ArticleCommentsToggle slug={article.slug} feedbackDown={article.feedbackDown} />
              <div className="flex justify-end items-center gap-2 pt-1 flex-wrap">
                {!article.removed && (
                  <>
                    <button
                      onClick={() => onStartUpdate(article)}
                      disabled={isStartingUpdateSlug === article.slug || isStartingRunSlug === article.slug}
                      className="border border-white/20 text-white/80 hover:bg-white/5 text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {isStartingUpdateSlug === article.slug ? "Opening Editor…" : "✏️ Edit"}
                    </button>
                    <button
                      onClick={() => onStartRun(article)}
                      disabled={isStartingUpdateSlug === article.slug || isStartingRunSlug === article.slug}
                      className="border border-clinical-teal/30 text-clinical-teal hover:bg-clinical-teal/5 text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {isStartingRunSlug === article.slug ? "Starting Run…" : "🚀 Start Run"}
                    </button>
                  </>
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
