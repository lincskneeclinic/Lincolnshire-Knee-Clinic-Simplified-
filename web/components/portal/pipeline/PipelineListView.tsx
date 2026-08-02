"use client";

import React from "react";
import { ContentPipelineRun } from "@/lib/contentPipeline";
import { StatusBadge } from "@/components/portal/pipeline/StatusBadge";

interface PipelineListViewProps {
  reviewNeededCount: number;
  visibleReviewNeededRuns: ContentPipelineRun[];
  otherCount: number;
  visibleOtherRuns: ContentPipelineRun[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelectRun: (runId: string) => void;
  onDeleteRun: (runId: string, topic: string) => void;
  isBlogEditInProgress: (run: ContentPipelineRun) => boolean;
}

export function PipelineListView({
  reviewNeededCount,
  visibleReviewNeededRuns,
  otherCount,
  visibleOtherRuns,
  search,
  onSearchChange,
  onSelectRun,
  onDeleteRun,
  isBlogEditInProgress,
}: PipelineListViewProps) {
  return (
    <div className="space-y-8">
      <div className="bg-primary-navy border border-white/10 rounded-2xl p-4 shadow-lg">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search runs by topic or ID…"
          className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-72"
        />
      </div>

      {/* SECTION 1: Needs Your Review */}
      <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-clinical-teal animate-ping" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Needs Your Attention ({visibleReviewNeededRuns.length})
            </h3>
          </div>
          <span className="text-[11px] text-clinical-teal font-mono">Action Required</span>
        </div>

        {reviewNeededCount === 0 ? (
          <div className="py-8 text-center text-white/60 text-xs">
            🎉 No pending drafts require clinical review at this time.
          </div>
        ) : visibleReviewNeededRuns.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-xs">No runs match "{search}".</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleReviewNeededRuns.map((run) => (
              <div
                key={run.id}
                onClick={() => onSelectRun(run.run_id)}
                className="p-5 bg-dark-overlay-navy border border-white/10 hover:border-clinical-teal/50 rounded-xl transition-all shadow-md space-y-3 cursor-pointer group"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-serif text-sm font-bold text-white group-hover:text-clinical-teal transition-colors">
                    {run.topic}
                  </h4>
                  <StatusBadge status={run.status} isContinueEditing={isBlogEditInProgress(run)} />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-mono text-white/40">{run.run_id}</span>
                  <span
                    className="text-[11px] text-white/60 font-mono"
                    title={`Created ${new Date(run.created_at).toLocaleString()}`}
                  >
                    Last saved:{" "}
                    {new Date(run.updated_at).toLocaleString([], {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {run.blog_drafts?.[0]?.flags && run.blog_drafts[0].flags.length > 0 && (
                  <div className="text-[11px] text-amber-300/90 bg-primary-navy border border-amber-500/40 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{run.blog_drafts[0].flags.length} Clinical Review Flag(s)</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRun(run.run_id, run.topic);
                    }}
                    className="text-[11px] text-status-error/80 hover:text-status-error cursor-pointer"
                  >
                    Delete
                  </button>
                  <div className="flex text-xs text-clinical-teal items-center gap-1">
                    <span>Open Review Workspace</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Secondary Section - All Other Runs */}
      <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider">
            In Progress, Published &amp; Archived Runs ({visibleOtherRuns.length})
          </h3>
        </div>

        {otherCount > 0 && visibleOtherRuns.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-xs">No runs match "{search}".</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleOtherRuns.map((run) => (
              <div
                key={run.id}
                onClick={() => onSelectRun(run.run_id)}
                className="p-4 bg-dark-overlay-navy border border-white/10 hover:border-white/20 rounded-xl transition-all space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs text-white/90 font-semibold line-clamp-2">{run.topic}</h4>
                  <StatusBadge status={run.status} isContinueEditing={isBlogEditInProgress(run)} />
                </div>
                <div className="text-[10px] font-mono text-white/30">{run.run_id}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 font-mono">
                    Last saved:{" "}
                    {new Date(run.updated_at).toLocaleString([], {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRun(run.run_id, run.topic);
                    }}
                    className="text-[10px] text-status-error/80 hover:text-status-error cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
