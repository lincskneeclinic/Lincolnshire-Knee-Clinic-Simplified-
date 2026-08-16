"use client";

import React from "react";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";

export interface CommunityReport {
  id: string;
  target_type: "post" | "reply";
  target_id: string;
  reason: string;
  status: "open" | "actioned" | "dismissed";
  created_at: string;
  reporterDisplayName: string;
  authorDisplayName: string;
  authorEmail: string | null;
  target: { id: string; title?: string; body: string; status: string } | null;
}

interface CommunityReportsTabProps {
  reports: CommunityReport[];
  loading: boolean;
  error: string | null;
  onAction: (report: CommunityReport, action: "hide" | "dismiss") => void;
}

export function CommunityReportsTab({ reports, loading, error, onAction }: CommunityReportsTabProps) {
  return (
    <div className="space-y-8">
      <PortalCard>
        <h2 className="text-lg font-bold text-portal-text">Community Reports</h2>
        <p className="text-xs text-portal-text/60 mt-1">
          Member-flagged posts and replies from the patient Community. Hiding a post or reply removes it from view
          for other members immediately; the author still sees it, labelled as hidden.
        </p>
      </PortalCard>

      {error && (
        <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs p-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-portal-text/50 text-sm py-12">Loading reports…</div>
      ) : reports.length === 0 ? (
        <PortalEmptyState message="No reports yet." />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <PortalCard key={report.id} padding="md" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    report.status === "open"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : report.status === "actioned"
                        ? "bg-status-error/10 text-status-error border-status-error/30"
                        : "bg-white/5 text-portal-text/50 border-portal-border/10"
                  }`}
                >
                  {report.status}
                </span>
                <span className="text-[11px] text-portal-text/50">
                  Reported {new Date(report.created_at).toLocaleString("en-GB")} by {report.reporterDisplayName}
                </span>
              </div>

              <div className="bg-portal-surface-alt border border-portal-border/5 rounded-xl p-4 space-y-1">
                <p className="text-[11px] text-portal-accent-text font-semibold uppercase tracking-wide">
                  {report.target_type} by {report.authorDisplayName}
                  {report.authorEmail ? ` (${report.authorEmail})` : ""}
                </p>
                {report.target?.title && <p className="text-sm font-bold text-portal-text">{report.target.title}</p>}
                <p className="text-xs text-portal-text/70 whitespace-pre-wrap">
                  {report.target?.body || "(content no longer available)"}
                </p>
                <p className="text-[11px] text-portal-text/40 mt-2">Current status: {report.target?.status || "unknown"}</p>
              </div>

              <div className="text-xs text-portal-text/70">
                <span className="font-semibold text-portal-text/90">Reason: </span>
                {report.reason}
              </div>

              {report.status === "open" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => onAction(report, "hide")}
                    className="bg-status-error/90 hover:bg-status-error text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Hide Content
                  </button>
                  <button
                    onClick={() => onAction(report, "dismiss")}
                    className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/20 text-portal-text/80 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
