"use client";

import React from "react";
import { PortalModal } from "@/components/portal/ui";

interface PipelineImportResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackground: () => void;
  topic: string;
  onTopicChange: (value: string) => void;
  researchBriefJson: string;
  onResearchBriefJsonChange: (value: string) => void;
  isImporting: boolean;
  importProgress: number;
  importStep: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function PipelineImportResearchModal({
  isOpen,
  onClose,
  onBackground,
  topic,
  onTopicChange,
  researchBriefJson,
  onResearchBriefJsonChange,
  isImporting,
  importProgress,
  importStep,
  onSubmit,
}: PipelineImportResearchModalProps) {
  const handleClose = () => (isImporting ? onBackground() : onClose());

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <span>📋</span>
          <span>Import Researched Brief</span>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-[11px] text-white/60">
          Paste the <code className="text-clinical-teal">research-brief.json</code> produced by running the{" "}
          <code className="text-clinical-teal">lincoln-knee-clinic-blog-research</code> skill for a topic. This skips
          the automated PubMed/Gemini research stage and drafts the blog directly from what you researched — the
          draft then goes through the normal review &amp; approval flow.
        </p>

        <div>
          <label className="block text-xs text-white/80 mb-1">Topic / Clinical Question</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={isImporting}
            placeholder="e.g. Partial vs total knee replacement: how surgeons decide"
            className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs text-white/80 mb-1">research-brief.json contents</label>
          <textarea
            required
            value={researchBriefJson}
            onChange={(e) => onResearchBriefJsonChange(e.target.value)}
            disabled={isImporting}
            rows={10}
            placeholder='{"summary": "...", "key_points": ["..."], "sources": ["..."], "target_audience": "..."}'
            className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-[11px] font-mono focus:border-clinical-teal focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {isImporting && (
          <div className="bg-dark-overlay-navy p-4 rounded-xl border border-clinical-teal/30 space-y-3 my-2 shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="text-clinical-teal flex items-center gap-2 truncate pr-2">
                <span className="inline-block w-2 h-2 rounded-full bg-clinical-teal animate-ping shrink-0" />
                <span className="truncate">{importStep || "Starting drafting..."}</span>
              </span>
              <span className="text-white/80 font-mono shrink-0">{importProgress}%</span>
            </div>
            <div className="w-full bg-primary-navy h-2 rounded-full overflow-hidden">
              <div
                className="bg-clinical-teal h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60 italic text-center">
              Please wait while the AI Medical Writer drafts from your researched brief — or close this window and
              it'll keep generating in the background; check the run list shortly.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
          >
            {isImporting ? "Run in Background" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isImporting}
            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isImporting && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isImporting ? "Drafting..." : "Import & Start Drafting"}
          </button>
        </div>
      </form>
    </PortalModal>
  );
}
