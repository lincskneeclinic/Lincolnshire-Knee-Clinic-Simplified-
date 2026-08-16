"use client";

import React, { useEffect, useState } from "react";
import { PortalCard } from "@/components/portal/ui";
import { ClinicalContentReviewResult, ClinicalContentReviewFinding } from "@/lib/clinicalContentReviewAgent";

interface AiContentReviewPanelProps {
  loading: boolean;
  error: string | null;
  result: ClinicalContentReviewResult | null;
  onRunReview: () => void;
  onApproveFinding: (finding: ClinicalContentReviewFinding) => Promise<boolean>;

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
  onBackToList: () => void;
}

const SEVERITY_STYLES: Record<"high" | "medium" | "low", string> = {
  high: "bg-status-error/10 text-status-error border-status-error/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-white/5 text-portal-text/60 border-portal-border/10",
};

type FindingStatus = "pending" | "applying" | "applied" | "declined" | "error";

function StringDiff({ current, suggested }: { current: string; suggested: string }) {
  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-portal-text/40 block mb-1">Current</span>
        <p className="text-portal-text/50 line-through leading-relaxed">{current || "(empty)"}</p>
      </div>
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-portal-accent-text block mb-1">Suggested</span>
        <p className="text-portal-text/90 leading-relaxed">{suggested}</p>
      </div>
    </div>
  );
}

function ArrayDiff({ current, suggested }: { current: string[]; suggested: string[] }) {
  const currentSet = new Set(current);
  const suggestedSet = new Set(suggested);
  const removed = current.filter((item) => !suggestedSet.has(item));
  return (
    <div className="space-y-1 text-xs">
      {removed.map((item, i) => (
        <div key={`removed-${i}`} className="text-portal-text/40 line-through">
          {item}
        </div>
      ))}
      {suggested.map((item, i) => (
        <div key={`item-${i}`} className={currentSet.has(item) ? "text-portal-text/80" : "text-portal-accent-text font-medium"}>
          {currentSet.has(item) ? "" : "+ "}
          {item}
        </div>
      ))}
    </div>
  );
}

export function AiContentReviewPanel({
  loading,
  error,
  result,
  onRunReview,
  onApproveFinding,
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
  onBackToList,
}: AiContentReviewPanelProps) {
  const [findingStatus, setFindingStatus] = useState<Record<number, FindingStatus>>({});

  useEffect(() => {
    setFindingStatus({});
  }, [result]);

  const handleApprove = async (finding: ClinicalContentReviewFinding, idx: number) => {
    setFindingStatus((prev) => ({ ...prev, [idx]: "applying" }));
    const success = await onApproveFinding(finding);
    setFindingStatus((prev) => ({ ...prev, [idx]: success ? "applied" : "error" }));
  };

  const handleDecline = (idx: number) => {
    setFindingStatus((prev) => ({ ...prev, [idx]: "declined" }));
  };

  return (
    <PortalCard className="space-y-4 shadow-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-portal-text">AI Content Review</h3>
          <p className="text-[11px] text-portal-text/50 mt-0.5">
            Sends this page&apos;s own text to AI for an advisory read-through — a starting point only. Always apply
            your own clinical judgement before marking this page as reviewed.
          </p>
        </div>
        <button
          onClick={onRunReview}
          disabled={loading}
          className="shrink-0 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? "Reviewing…" : "✨ Review Page Content"}
        </button>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs p-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 border-t border-portal-border/10 pt-4">
          <p className="text-xs text-portal-text/80 leading-relaxed">{result.overall_assessment}</p>

          {result.findings.length === 0 ? (
            <p className="text-xs text-portal-text/50 italic">
              No issues flagged — page reads clinically sound to the AI reviewer.
            </p>
          ) : (
            <div className="space-y-2">
              {result.findings.map((finding, idx) => {
                const status = findingStatus[idx] || "pending";
                const hasFix = !!finding.field && finding.suggested_value !== undefined;
                if (status === "declined") return null;

                return (
                  <div key={idx} className="bg-portal-surface-alt border border-portal-border/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${SEVERITY_STYLES[finding.severity]}`}
                      >
                        {finding.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-portal-text/70 uppercase tracking-wide">
                        {finding.category}
                      </span>
                    </div>
                    <p className="text-xs text-portal-text/80 leading-relaxed">{finding.note}</p>

                    {hasFix && (
                      <div className="bg-portal-surface/50 border border-portal-border/10 rounded-lg p-3 space-y-2">
                        {Array.isArray(finding.suggested_value) ? (
                          <ArrayDiff
                            current={Array.isArray(finding.current_value) ? finding.current_value : []}
                            suggested={finding.suggested_value}
                          />
                        ) : (
                          <StringDiff
                            current={typeof finding.current_value === "string" ? finding.current_value : ""}
                            suggested={finding.suggested_value as string}
                          />
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          {status === "applied" ? (
                            <span className="text-[11px] text-portal-accent-text font-semibold">✓ Applied — now live on the page</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(finding, idx)}
                                disabled={status === "applying"}
                                className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                              >
                                {status === "applying" ? "Applying…" : "✓ Approve"}
                              </button>
                              <button
                                onClick={() => handleDecline(idx)}
                                disabled={status === "applying"}
                                className="border border-portal-border/20 hover:border-portal-border/40 text-portal-text/70 hover:bg-portal-text/5 text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                              >
                                Decline
                              </button>
                              {status === "error" && (
                                <span className="text-[11px] text-status-error">Failed to apply — try again.</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 border-t border-portal-border/10 pt-4">
        <h3 className="text-sm font-bold text-portal-text">Approve this page</h3>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formReviewed}
            onChange={(e) => onFormReviewedChange(e.target.checked)}
            className="w-4 h-4 accent-clinical-teal cursor-pointer"
          />
          <span className="text-sm font-semibold text-portal-text">Mark as clinically reviewed</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-portal-accent-text mb-1 font-semibold">Reviewer Name</div>
            <input
              type="text"
              value={formReviewerName}
              onChange={(e) => onFormReviewerNameChange(e.target.value)}
              className="w-full bg-portal-surface border border-portal-border/20 text-portal-text rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <div className="text-xs text-portal-accent-text mb-1 font-semibold">Reviewer Title</div>
            <input
              type="text"
              value={formReviewerTitle}
              onChange={(e) => onFormReviewerTitleChange(e.target.value)}
              className="w-full bg-portal-surface border border-portal-border/20 text-portal-text rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-portal-accent-text mb-1 font-semibold">Last Reviewed Date</div>
          <input
            type="text"
            placeholder="e.g. July 2026"
            value={formLastReviewedDate}
            onChange={(e) => onFormLastReviewedDateChange(e.target.value)}
            className="w-full bg-portal-surface border border-portal-border/20 text-portal-text rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
          />
        </div>

        <div>
          <div className="text-xs text-portal-accent-text mb-1 font-semibold">Evidence Sources</div>
          <textarea
            rows={3}
            placeholder="e.g. NICE clinical knowledge summaries and British Orthopaedic Association (BOA) guidelines."
            value={formEvidenceSource}
            onChange={(e) => onFormEvidenceSourceChange(e.target.value)}
            className="w-full bg-portal-surface border border-portal-border/20 text-portal-text rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onSaveReview}
            disabled={isSavingReview}
            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSavingReview ? "Saving…" : "Save"}
          </button>
          {formReviewed && (
            <button
              onClick={() => onFormReviewedChange(false)}
              className="border border-orange-500/30 hover:border-orange-500/50 text-orange-400 hover:bg-orange-500/5 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Reset to Awaiting Review
            </button>
          )}
          <button
            onClick={onBackToList}
            className="border border-portal-border/20 hover:border-portal-border/40 text-portal-text/80 hover:bg-portal-text/5 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </PortalCard>
  );
}
