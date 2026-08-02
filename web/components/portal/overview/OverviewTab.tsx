"use client";

import React from "react";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";

export interface NeedsAttentionItem {
  label: string;
  description: string;
  count: number;
  tabId: string;
  icon: string;
}

interface TrendingTopic {
  label: string;
  category?: string;
  enquiryCount?: number;
  latestQueries?: string[];
}

interface ClickEvents {
  callNowClicks: number;
  bookAppointmentClicks: number;
  whatsappClicks: number;
}

interface OverviewTabProps {
  analyticsConnected: boolean;
  needsAttention: NeedsAttentionItem[];
  trendingTopics: TrendingTopic[];
  pollVotes: Record<string, number>;
  pollVotesTotal: number;
  clickEvents: ClickEvents;
  onNavigate: (tabId: string) => void;
  onTriggerTopic: (label: string) => void;
}

export function OverviewTab({
  analyticsConnected,
  needsAttention,
  trendingTopics,
  pollVotes,
  pollVotesTotal,
  clickEvents,
  onNavigate,
  onTriggerTopic,
}: OverviewTabProps) {
  const pendingItems = needsAttention.filter((item) => item.count > 0);

  return (
    <div className="space-y-8">
      <PortalCard className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              ✓ Click Events Active
            </span>
            <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {analyticsConnected ? "✓ Microsoft Clarity Connected" : "Clarity Script Ready"}
            </span>
          </div>
        </div>
        <h2 className="text-lg font-serif font-bold text-white">Live Practice Telemetry &amp; Content Insights</h2>
        <p className="text-xs text-white/70 max-w-3xl leading-relaxed">
          This dashboard surfaces real enquiry topics from incoming contact messages, votes from patient content
          polls, signup growth from validated opt-in consents, and real click event counters for call and booking
          links. All data remains strictly aggregate and non-identifying.
        </p>
      </PortalCard>

      <PortalCard className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Needs Attention</h3>
        </div>
        {pendingItems.length === 0 ? (
          <PortalEmptyState message="You're all caught up — nothing pending review right now." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingItems.map((item) => (
              <button
                key={item.tabId}
                onClick={() => onNavigate(item.tabId)}
                className="text-left p-4 bg-dark-overlay-navy hover:bg-white/5 border border-white/10 hover:border-clinical-teal/40 rounded-xl transition-colors cursor-pointer flex items-start gap-3"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <span className="bg-primary-navy text-clinical-teal border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {item.count}
                    </span>
                  </span>
                  <span className="text-[11px] text-white/60 block mt-0.5">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </PortalCard>

      <PortalCard className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Call &amp; Appointment Click Events</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">📞</span>
            <h4 className="font-bold text-white text-xs">"Call Clinic Reception" Clicks</h4>
            <div className="font-mono text-xl font-bold text-clinical-teal pt-1">{clickEvents.callNowClicks}</div>
          </div>
          <div className="p-5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">📅</span>
            <h4 className="font-bold text-white text-xs">"Book Appointment" Clicks</h4>
            <div className="font-mono text-xl font-bold text-clinical-teal pt-1">{clickEvents.bookAppointmentClicks}</div>
          </div>
          <div className="p-5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">💬</span>
            <h4 className="font-bold text-white text-xs">WhatsApp Help Clicks</h4>
            <div className="font-mono text-xl font-bold text-clinical-teal pt-1">{clickEvents.whatsappClicks}</div>
          </div>
        </div>
      </PortalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PortalCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trending Patient Questions</h3>
            <span className="text-[11px] text-white/60 font-mono">From Contact Enquiries</span>
          </div>
          <div className="space-y-3">
            {trendingTopics.length === 0 ? (
              <PortalEmptyState message="No trending topics yet — these are drawn from real patient contact enquiries." />
            ) : (
              trendingTopics.map((t, i) => (
                <div key={i} className="p-3.5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-clinical-teal uppercase tracking-wider block mb-0.5 text-[10px]">
                        {t.category || "General"}
                      </span>
                      <span className="text-white/90 font-serif">{t.label}</span>
                    </div>
                    <button
                      onClick={() => onTriggerTopic(t.label)}
                      className="bg-dark-overlay-navy hover:bg-white/5 text-clinical-teal border border-clinical-teal/40 text-[11px] px-2.5 py-1 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      🚀 Trigger Content Run
                    </button>
                  </div>
                  {t.latestQueries && t.latestQueries[0] && (
                    <p className="text-[11px] text-white/60 italic">"{t.latestQueries[0]}"</p>
                  )}
                  {typeof t.enquiryCount === "number" && (
                    <span className="bg-primary-navy text-clinical-teal border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                      {t.enquiryCount} Enquiries
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </PortalCard>

        <PortalCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patient Content Poll Votes</h3>
            <span className="text-[11px] text-white/60 font-mono">{pollVotesTotal} Total Votes</span>
          </div>
          <div className="space-y-3">
            {Object.keys(pollVotes).length === 0 ? (
              <PortalEmptyState message="No poll votes yet." />
            ) : (
              Object.entries(pollVotes).map(([opt, count], idx) => {
                const pct = pollVotesTotal > 0 ? Math.round((Number(count) / pollVotesTotal) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/80">
                      <span className="truncate max-w-[280px]">{opt}</span>
                      <span className="font-mono text-clinical-teal">
                        {count} votes ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-dark-overlay-navy rounded-full overflow-hidden border border-white/5">
                      <div className="bg-clinical-teal h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
