"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ReviewablePage, ClinicalReviewEntry } from "@/lib/clinicalReview";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";
import { AiContentReviewPanel } from "@/components/portal/clinical-review/AiContentReviewPanel";
import { EditPageContentPanel } from "@/components/portal/clinical-review/EditPageContentPanel";
import { ClinicalContentReviewResult, ClinicalContentReviewFinding } from "@/lib/clinicalContentReviewAgent";

export type ClinicalReviewListItem = ReviewablePage & { review: ClinicalReviewEntry };
export type SearchReference = { title: string; url: string; source: string; summary: string };

interface ClinicalReviewTabProps {
  loading: boolean;
  pages: ClinicalReviewListItem[];
  selectedPageId: string | null;
  onSelectPage: (page: ClinicalReviewListItem) => void;
  onBackToList: () => void;

  formReviewed: boolean;
  onFormReviewedChange: (value: boolean) => void;
  formReviewerName: string;
  onFormReviewerNameChange: (value: string) => void;
  formReviewerTitle: string;
  onFormReviewerTitleChange: (value: string) => void;
  formLastReviewedDate: string;
  onFormLastReviewedDateChange: (value: string) => void;
  formEvidenceSource: string;
  onFormEvidenceSourceChange: (value: string) => void;
  onSaveReview: () => void;
  isSavingReview: boolean;

  onRefreshSearch: () => void;
  searchLoading: boolean;
  addedResults: SearchReference[];
  onUndoSearchResult: (result: SearchReference) => void;
  searchError: string | null;
  searchResults: SearchReference[];
  onTickSearchResult: (result: SearchReference) => void;

  search: string;
  onSearchChange: (value: string) => void;
  bulkReviewSelection: Set<string>;
  onBulkReviewSelectionChange: React.Dispatch<React.SetStateAction<Set<string>>>;
  isBulkReviewFormOpen: boolean;
  onBulkReviewFormOpenChange: (value: boolean) => void;
  bulkReviewerName: string;
  onBulkReviewerNameChange: (value: string) => void;
  bulkReviewerTitle: string;
  onBulkReviewerTitleChange: (value: string) => void;
  bulkReviewDate: string;
  onBulkReviewDateChange: (value: string) => void;
  onSaveBulkReview: () => void;
  isSavingBulkReview: boolean;

  aiReviewLoading: boolean;
  aiReviewError: string | null;
  aiReviewResult: ClinicalContentReviewResult | null;
  onRunAiReview: () => void;
  onApproveAiFinding: (finding: ClinicalContentReviewFinding) => Promise<boolean>;

  pageContentLoading: boolean;
  pageContentAvailable: boolean;
  pageContentFields: Record<string, string | string[]>;
  pageContentFieldTypes: Record<string, "string" | "string[]">;
  onSaveFieldContent: (fieldName: string, value: string | string[]) => Promise<boolean>;
}

const CONTENT_TYPES = ["symptoms", "conditions", "treatments", "injections"] as const;
const LS_KEY = "lkc_dismissed_review_pages";

export function ClinicalReviewTab({
  loading,
  pages,
  selectedPageId,
  onSelectPage,
  onBackToList,
  formReviewed,
  onFormReviewedChange,
  formReviewerName,
  onFormReviewerNameChange,
  formReviewerTitle,
  onFormReviewerTitleChange,
  formLastReviewedDate,
  onFormLastReviewedDateChange,
  formEvidenceSource,
  onFormEvidenceSourceChange,
  onSaveReview,
  isSavingReview,
  onRefreshSearch,
  searchLoading,
  addedResults,
  onUndoSearchResult,
  searchError,
  searchResults,
  onTickSearchResult,
  search,
  onSearchChange,
  bulkReviewSelection,
  onBulkReviewSelectionChange,
  isBulkReviewFormOpen,
  onBulkReviewFormOpenChange,
  bulkReviewerName,
  onBulkReviewerNameChange,
  bulkReviewerTitle,
  onBulkReviewerTitleChange,
  bulkReviewDate,
  onBulkReviewDateChange,
  onSaveBulkReview,
  isSavingBulkReview,
  aiReviewLoading,
  aiReviewError,
  aiReviewResult,
  onRunAiReview,
  onApproveAiFinding,
  pageContentLoading,
  pageContentAvailable,
  pageContentFields,
  pageContentFieldTypes,
  onSaveFieldContent,
}: ClinicalReviewTabProps) {
  const selectedPage = selectedPageId ? pages.find((p) => p.pageId === selectedPageId) : null;

  // ── Dismissed pages ──────────────────────────────────────────────────────
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setDismissedIds(new Set(JSON.parse(raw)));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist any change to localStorage
  const persistDismissed = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore storage errors
    }
    setDismissedIds(next);
  }, []);

  const dismissPage = (pageId: string) => {
    const next = new Set(dismissedIds);
    next.add(pageId);
    persistDismissed(next);
    // Also deselect from bulk if it was selected
    onBulkReviewSelectionChange((prev) => {
      const s = new Set(prev);
      s.delete(pageId);
      return s;
    });
  };

  const restoreAll = () => {
    persistDismissed(new Set());
    setShowDismissed(false);
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const searchTerm = search.trim().toLowerCase();
  const searchFiltered = searchTerm
    ? pages.filter((p) => p.name.toLowerCase().includes(searchTerm))
    : pages;

  // Pages shown in the main list (respects dismiss + showDismissed)
  const visiblePages = showDismissed
    ? searchFiltered
    : searchFiltered.filter((p) => !dismissedIds.has(p.pageId));

  const dismissedCount = searchFiltered.filter((p) => dismissedIds.has(p.pageId)).length;

  const visibleIds = visiblePages.map((p) => p.pageId);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => bulkReviewSelection.has(id));

  const toggleSelectAllVisible = () => {
    onBulkReviewSelectionChange((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const togglePageSelected = (pageId: string) => {
    onBulkReviewSelectionChange((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <PortalCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Clinical Review Status</h2>
          <p className="text-xs text-white/60 mt-1">
            Manage the &quot;Clinically Reviewed&quot; status shown on symptom, condition, treatment and injection pages.
          </p>
        </div>
        {selectedPageId && (
          <button
            onClick={onBackToList}
            className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            ← Back to List
          </button>
        )}
      </PortalCard>

      {loading ? (
        <div className="text-center text-white/50 text-sm py-12">Loading pages…</div>
      ) : selectedPage ? (
        <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortalCard className="space-y-2 shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
              {selectedPage.contentType}
            </span>
            <h3 className="text-base font-bold text-white">{selectedPage.name}</h3>
            <Link href={selectedPage.url} target="_blank" className="text-xs text-clinical-teal hover:underline">
              View page →
            </Link>
          </PortalCard>

          <PortalCard className="space-y-4 flex flex-col shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Suggested Evidence Sources</h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Web search results for &quot;{selectedPage.name}&quot;. Tick any references to move them into
                  Evidence Sources.
                </p>
              </div>
              <button
                onClick={onRefreshSearch}
                disabled={searchLoading}
                className="shrink-0 bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {searchLoading ? "Searching…" : "Refresh Search"}
              </button>
            </div>

            {addedResults.length > 0 && (
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
                  Added to Evidence Sources ({addedResults.length})
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {addedResults.map((result) => (
                    <button
                      key={result.url}
                      type="button"
                      onClick={() => onUndoSearchResult(result)}
                      className="w-full flex items-start gap-2.5 bg-dark-overlay-navy/60 border border-white/5 rounded-xl p-2.5 cursor-pointer hover:border-amber-400/40 transition-colors text-left"
                    >
                      <span className="w-4 h-4 rounded-sm bg-clinical-teal flex items-center justify-center mt-0.5 shrink-0">
                        <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l3 3 7-7" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        {result.source && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">
                            {result.source}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-white/50 line-through block truncate">
                          {result.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-white/40">Click a reference above to move it back to Suggested.</p>
              </div>
            )}

            {searchLoading ? (
              <div className="text-center text-white/50 text-xs py-10">Searching…</div>
            ) : searchError ? (
              <div className="text-center text-xs py-10 space-y-2">
                <p className="text-amber-400">{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-white/50 text-xs py-10">No results found.</div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {searchResults.map((result) => (
                  <label
                    key={result.url}
                    className="flex items-start gap-2.5 bg-dark-overlay-navy border border-white/5 rounded-xl p-3 cursor-pointer hover:border-clinical-teal/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      onChange={() => onTickSearchResult(result)}
                      className="w-4 h-4 accent-clinical-teal cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      {result.source && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">
                          {result.source}
                        </span>
                      )}
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-clinical-teal hover:underline block"
                      >
                        {result.title}
                      </a>
                      <p className="text-[11px] text-white/60 leading-relaxed">{result.summary}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <EditPageContentPanel
          loading={pageContentLoading}
          available={pageContentAvailable}
          fields={pageContentFields}
          fieldTypes={pageContentFieldTypes}
          onSaveField={onSaveFieldContent}
        />

        <AiContentReviewPanel
          loading={aiReviewLoading}
          error={aiReviewError}
          result={aiReviewResult}
          onRunReview={onRunAiReview}
          onApproveFinding={onApproveAiFinding}
          formReviewed={formReviewed}
          onFormReviewedChange={onFormReviewedChange}
          formReviewerName={formReviewerName}
          onFormReviewerNameChange={onFormReviewerNameChange}
          formReviewerTitle={formReviewerTitle}
          onFormReviewerTitleChange={onFormReviewerTitleChange}
          formLastReviewedDate={formLastReviewedDate}
          onFormLastReviewedDateChange={onFormLastReviewedDateChange}
          formEvidenceSource={formEvidenceSource}
          onFormEvidenceSourceChange={onFormEvidenceSourceChange}
          onSaveReview={onSaveReview}
          isSavingReview={isSavingReview}
          onBackToList={onBackToList}
        />
        </div>
      ) : (
        <div className="space-y-6">
          <PortalCard padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pages by name…"
              className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-64"
            />
            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="w-4 h-4 accent-clinical-teal cursor-pointer"
              />
              Select all visible ({visiblePages.length})
            </label>

            {/* Dismissed pages toggle */}
            {dismissedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDismissed((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showDismissed
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-dark-overlay-navy border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={showDismissed ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
                {showDismissed ? "Hide dismissed" : `Show dismissed (${dismissedCount})`}
              </button>
            )}
            {showDismissed && dismissedCount > 0 && (
              <button
                type="button"
                onClick={restoreAll}
                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
              >
                Restore all
              </button>
            )}

            {bulkReviewSelection.size > 0 && (
              <div className="sm:ml-auto flex items-center gap-2">
                <span className="text-xs text-clinical-teal font-semibold">{bulkReviewSelection.size} selected</span>
                <button
                  onClick={() => onBulkReviewFormOpenChange(true)}
                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Bulk Mark Reviewed
                </button>
                <button
                  onClick={() => onBulkReviewSelectionChange(new Set())}
                  className="text-xs text-white/50 hover:text-white/80 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </PortalCard>

          {isBulkReviewFormOpen && (
            <PortalCard className="border-clinical-teal/40 space-y-3">
              <h4 className="text-sm font-bold text-white">
                Mark {bulkReviewSelection.size} page{bulkReviewSelection.size === 1 ? "" : "s"} as clinically reviewed
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={bulkReviewerName}
                  onChange={(e) => onBulkReviewerNameChange(e.target.value)}
                  placeholder="Reviewer name"
                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                />
                <input
                  type="text"
                  value={bulkReviewerTitle}
                  onChange={(e) => onBulkReviewerTitleChange(e.target.value)}
                  placeholder="Reviewer title"
                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                />
                <input
                  type="text"
                  value={bulkReviewDate}
                  onChange={(e) => onBulkReviewDateChange(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onBulkReviewFormOpenChange(false)}
                  className="border border-white/20 text-white/80 hover:bg-white/5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onSaveBulkReview}
                  disabled={isSavingBulkReview}
                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingBulkReview ? "Saving…" : "Confirm & Save"}
                </button>
              </div>
            </PortalCard>
          )}

          {visiblePages.length === 0 && dismissedCount === 0 ? (
            <PortalEmptyState message={`No pages match "${search}".`} />
          ) : visiblePages.length === 0 && dismissedCount > 0 ? (
            <PortalCard className="text-center py-8 space-y-3">
              <p className="text-white/50 text-sm">All reviewed pages have been dismissed.</p>
              <button
                type="button"
                onClick={() => setShowDismissed(true)}
                className="text-xs text-clinical-teal hover:underline cursor-pointer"
              >
                Show {dismissedCount} dismissed page{dismissedCount === 1 ? "" : "s"}
              </button>
            </PortalCard>
          ) : (
            CONTENT_TYPES.map((contentType) => {
              const pagesOfType = visiblePages.filter((p) => p.contentType === contentType);
              if (pagesOfType.length === 0) return null;
              return (
                <PortalCard key={contentType} className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider capitalize">{contentType}</h3>
                  <div className="space-y-2">
                    {pagesOfType.map((page) => {
                      const isDismissed = dismissedIds.has(page.pageId);
                      return (
                        <div
                          key={page.pageId}
                          className={`w-full bg-dark-overlay-navy border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                            isDismissed
                              ? "border-white/5 opacity-50"
                              : "border-white/5 hover:border-clinical-teal/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={bulkReviewSelection.has(page.pageId)}
                            onChange={() => togglePageSelected(page.pageId)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-clinical-teal cursor-pointer shrink-0"
                          />
                          <button
                            onClick={() => onSelectPage(page)}
                            className="flex-1 text-left flex items-center justify-between gap-4 cursor-pointer min-w-0"
                          >
                            <span className="text-xs text-white/90 font-medium truncate">{page.name}</span>
                            {page.review.reviewed ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/30 shrink-0">
                                Reviewed{page.review.lastReviewedDate ? ` — ${page.review.lastReviewedDate}` : ""}
                              </span>
                            ) : page.review.staleReview ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 shrink-0">
                                ⚠ Needs Re-Review{page.review.lastReviewedDate ? ` (was: ${page.review.lastReviewedDate})` : ""}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                                Awaiting review
                              </span>
                            )}
                          </button>

                          {/* Dismiss / Restore button — only on reviewed pages */}
                          {page.review.reviewed && (
                            <button
                              type="button"
                              title={isDismissed ? "Restore and open this page" : "Dismiss from list"}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isDismissed) {
                                  const next = new Set(dismissedIds);
                                  next.delete(page.pageId);
                                  persistDismissed(next);
                                  onSelectPage(page);
                                } else {
                                  dismissPage(page.pageId);
                                }
                              }}
                              className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                                isDismissed
                                  ? "text-clinical-teal/60 hover:text-clinical-teal hover:bg-clinical-teal/10"
                                  : "text-white/20 hover:text-white/60 hover:bg-white/5"
                              }`}
                            >
                              {isDismissed ? (
                                // Eye-slash → restore icon
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                // ✕ dismiss icon
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PortalCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
