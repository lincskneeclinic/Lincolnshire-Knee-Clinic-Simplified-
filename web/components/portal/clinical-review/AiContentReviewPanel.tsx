"use client";

import React from "react";
import { PortalCard } from "@/components/portal/ui";
import { ClinicalContentReviewResult } from "@/lib/clinicalContentReviewAgent";

interface AiContentReviewPanelProps {
  loading: boolean;
  error: string | null;
  result: ClinicalContentReviewResult | null;
  onRunReview: () => void;
}

const SEVERITY_STYLES: Record<"high" | "medium" | "low", string> = {
  high: "bg-status-error/10 text-status-error border-status-error/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-white/5 text-white/60 border-white/10",
};

export function AiContentReviewPanel({ loading, error, result, onRunReview }: AiContentReviewPanelProps) {
  return (
    <PortalCard className="space-y-4 shadow-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white">AI Content Review</h3>
          <p className="text-[11px] text-white/50 mt-0.5">
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
        <div className="space-y-3 border-t border-white/10 pt-4">
          <p className="text-xs text-white/80 leading-relaxed">{result.overall_assessment}</p>

          {result.findings.length === 0 ? (
            <p className="text-xs text-white/50 italic">
              No issues flagged — page reads clinically sound to the AI reviewer.
            </p>
          ) : (
            <div className="space-y-2">
              {result.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="bg-dark-overlay-navy border border-white/5 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${SEVERITY_STYLES[finding.severity]}`}
                    >
                      {finding.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">
                      {finding.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{finding.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PortalCard>
  );
}
