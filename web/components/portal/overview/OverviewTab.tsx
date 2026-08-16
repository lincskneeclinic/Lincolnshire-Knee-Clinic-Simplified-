"use client";

import React from "react";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";

interface EngagementSettings {
  whatsappNudgeEnabled: boolean;
  emailCaptureEnabled: boolean;
}

// Self-contained kill switch for the two public-site engagement prompts
// (web/components/ProactivePagePrompt.tsx, web/components/PageInterestCapture.tsx)
// — reads/writes web/app/api/site-settings/engagement independently of the
// rest of the dashboard's data flow, same self-fetching pattern used by
// ArticleCommentsToggle in EducationHubTab.tsx.
function SitePromptsToggleCard() {
  const [settings, setSettings] = React.useState<EngagementSettings | null>(null);
  const [saving, setSaving] = React.useState<"whatsapp" | "email" | null>(null);

  React.useEffect(() => {
    fetch("/api/site-settings/engagement")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const handleToggle = async (key: "whatsappNudgeEnabled" | "emailCaptureEnabled") => {
    if (!settings) return;
    const previous = settings;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(key === "whatsappNudgeEnabled" ? "whatsapp" : "email");
    try {
      const res = await fetch("/api/portal/settings/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: updated[key] }),
      });
      const data = await res.json();
      if (!data.success) setSettings(previous);
    } catch {
      setSettings(previous);
    } finally {
      setSaving(null);
    }
  };

  if (!settings) return null;

  return (
    <PortalCard className="space-y-4">
      <div className="border-b border-portal-border/10 pb-3">
        <h3 className="text-xs font-bold text-portal-text uppercase tracking-wider">Site Prompts</h3>
        <p className="text-[11px] text-portal-text/60 mt-1">
          Switch off either prompt if it ever feels intrusive to visitors — takes effect on the live site immediately.
        </p>
      </div>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <span className="text-xs text-portal-text/80">
            💬 Proactive WhatsApp nudges
            <span className="block text-[10px] text-portal-text/50">&ldquo;Need help?&rdquo; box on booking &amp; treatment pages</span>
          </span>
          <input
            type="checkbox"
            checked={settings.whatsappNudgeEnabled}
            disabled={saving === "whatsapp"}
            onChange={() => handleToggle("whatsappNudgeEnabled")}
            className="w-9 h-5 rounded-full appearance-none bg-portal-text/20 checked:bg-clinical-teal relative cursor-pointer transition-colors shrink-0 disabled:opacity-50 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-white before:shadow-md before:rounded-full before:transition-transform checked:before:translate-x-4"
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <span className="text-xs text-portal-text/80">
            ✉️ Email interest capture box
            <span className="block text-[10px] text-portal-text/50">Quiet opt-in email card on treatment pages</span>
          </span>
          <input
            type="checkbox"
            checked={settings.emailCaptureEnabled}
            disabled={saving === "email"}
            onChange={() => handleToggle("emailCaptureEnabled")}
            className="w-9 h-5 rounded-full appearance-none bg-portal-text/20 checked:bg-clinical-teal relative cursor-pointer transition-colors shrink-0 disabled:opacity-50 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-white before:shadow-md before:rounded-full before:transition-transform checked:before:translate-x-4"
          />
        </label>
      </div>
    </PortalCard>
  );
}

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
  totalClicks: number;
  totalSignups: number;
  reviewNeededRunsCount: number;
  publishedAssetsCount: number;
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
  totalClicks,
  totalSignups,
  reviewNeededRunsCount,
  publishedAssetsCount,
  onNavigate,
  onTriggerTopic,
}: OverviewTabProps) {
  const pendingItems = needsAttention.filter((item) => item.count > 0);

  return (
    <div className="space-y-8">
      {/* KPI Summary Cards — Overview-only (used to render on every tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-portal-surface border border-portal-border/10 rounded-2xl p-5 shadow-lg relative">
          <span className="text-[10px] uppercase tracking-wider text-portal-text/60 block mb-1">
            Tracked Click Events
          </span>
          <div className="text-xl xl:text-2xl font-bold text-portal-text font-mono">
            {totalClicks}
          </div>
          <p className="text-[11px] text-portal-text/60 mt-2">
            {clickEvents.callNowClicks} Calls | {clickEvents.bookAppointmentClicks} Bookings | {clickEvents.whatsappClicks} WhatsApp
          </p>
        </div>

        <div className="bg-portal-surface border border-portal-border/10 rounded-2xl p-5 shadow-lg relative">
          <span className="text-[10px] uppercase tracking-wider text-portal-text/60 block mb-1">
            Verified Contact Signups
          </span>
          <div className="text-xl xl:text-2xl font-bold text-portal-text font-mono">
            {totalSignups}
          </div>
          <p className="text-[11px] text-portal-text/60 mt-2">
            100% Consent Confirmed &amp; Timestamped
          </p>
        </div>

        <div className="bg-portal-surface border border-portal-border/10 rounded-2xl p-5 shadow-lg relative">
          <span className="text-[10px] uppercase tracking-wider text-portal-text/60 block mb-1">
            Content Runs Needing Action
          </span>
          <div className="text-xl xl:text-2xl font-bold text-portal-text font-mono">
            {reviewNeededRunsCount}
          </div>
          <p className="text-[11px] text-portal-text/60 mt-2">
            Blog &amp; Social drafts awaiting approval
          </p>
        </div>

        <div className="bg-portal-surface border border-portal-border/10 rounded-2xl p-5 shadow-lg relative">
          <span className="text-[10px] uppercase tracking-wider text-portal-text/60 block mb-1">
            Published Content Assets
          </span>
          <div className="text-xl xl:text-2xl font-bold text-portal-text font-mono">
            {publishedAssetsCount}
          </div>
          <p className="text-[11px] text-portal-text/60 mt-2">
            Live articles &amp; social packages
          </p>
        </div>
      </div>

      <PortalCard className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-portal-surface-alt border border-clinical-teal/30 text-portal-accent-text text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              ✓ Click Events Active
            </span>
            <span className="bg-portal-surface-alt border border-clinical-teal/30 text-portal-accent-text text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {analyticsConnected ? "✓ Microsoft Clarity Connected" : "Clarity Script Ready"}
            </span>
          </div>
        </div>
        <h2 className="text-lg font-serif font-bold text-portal-text">Live Practice Telemetry &amp; Content Insights</h2>
        <p className="text-xs text-portal-text/70 max-w-3xl leading-relaxed">
          This dashboard surfaces real enquiry topics from incoming contact messages, votes from patient content
          polls, signup growth from validated opt-in consents, and real click event counters for call and booking
          links. All data remains strictly aggregate and non-identifying.
        </p>
      </PortalCard>

      <PortalCard className="space-y-4">
        <div className="flex justify-between items-center border-b border-portal-border/10 pb-3">
          <h3 className="text-xs font-bold text-portal-text uppercase tracking-wider">Needs Attention</h3>
        </div>
        {pendingItems.length === 0 ? (
          <PortalEmptyState message="You're all caught up — nothing pending review right now." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingItems.map((item) => (
              <button
                key={item.tabId}
                onClick={() => onNavigate(item.tabId)}
                className="text-left p-4 bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 hover:border-clinical-teal/40 rounded-xl transition-colors cursor-pointer flex items-start gap-3"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-portal-text">{item.label}</span>
                    <span className="bg-portal-surface text-portal-accent-text border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {item.count}
                    </span>
                  </span>
                  <span className="text-[11px] text-portal-text/60 block mt-0.5">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </PortalCard>

      <SitePromptsToggleCard />

      <PortalCard className="space-y-4">
        <div className="border-b border-portal-border/10 pb-3">
          <h3 className="text-xs font-bold text-portal-text uppercase tracking-wider">Call &amp; Appointment Click Events</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-portal-surface-alt border border-portal-border/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">📞</span>
            <h4 className="font-bold text-portal-text text-xs">&ldquo;Call Clinic Reception&rdquo; Clicks</h4>
            <div className="font-mono text-xl font-bold text-portal-accent-text pt-1">{clickEvents.callNowClicks}</div>
          </div>
          <div className="p-5 bg-portal-surface-alt border border-portal-border/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">📅</span>
            <h4 className="font-bold text-portal-text text-xs">&ldquo;Book Appointment&rdquo; Clicks</h4>
            <div className="font-mono text-xl font-bold text-portal-accent-text pt-1">{clickEvents.bookAppointmentClicks}</div>
          </div>
          <div className="p-5 bg-portal-surface-alt border border-portal-border/5 rounded-xl space-y-2 text-center">
            <span className="text-2xl">💬</span>
            <h4 className="font-bold text-portal-text text-xs">WhatsApp Help Clicks</h4>
            <div className="font-mono text-xl font-bold text-portal-accent-text pt-1">{clickEvents.whatsappClicks}</div>
          </div>
        </div>
      </PortalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PortalCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-portal-border/10 pb-3">
            <h3 className="text-xs font-bold text-portal-text uppercase tracking-wider">Trending Patient Questions</h3>
            <span className="text-[11px] text-portal-text/60 font-mono">From Contact Enquiries</span>
          </div>
          <div className="space-y-3">
            {trendingTopics.length === 0 ? (
              <PortalEmptyState message="No trending topics yet — these are drawn from real patient contact enquiries." />
            ) : (
              trendingTopics.map((t, i) => (
                <div key={i} className="p-3.5 bg-portal-surface-alt border border-portal-border/5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-portal-accent-text uppercase tracking-wider block mb-0.5 text-[10px]">
                        {t.category || "General"}
                      </span>
                      <span className="text-portal-text/90 font-serif">{t.label}</span>
                    </div>
                    <button
                      onClick={() => onTriggerTopic(t.label)}
                      className="bg-portal-surface-alt hover:bg-portal-text/5 text-portal-accent-text border border-clinical-teal/40 text-[11px] px-2.5 py-1 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      🚀 Trigger Content Run
                    </button>
                  </div>
                  {t.latestQueries && t.latestQueries[0] && (
                    <p className="text-[11px] text-portal-text/60 italic">&ldquo;{t.latestQueries[0]}&rdquo;</p>
                  )}
                  {typeof t.enquiryCount === "number" && (
                    <span className="bg-portal-surface text-portal-accent-text border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                      {t.enquiryCount} Enquiries
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </PortalCard>

        <PortalCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-portal-border/10 pb-3">
            <h3 className="text-xs font-bold text-portal-text uppercase tracking-wider">Patient Content Poll Votes</h3>
            <span className="text-[11px] text-portal-text/60 font-mono">{pollVotesTotal} Total Votes</span>
          </div>
          <div className="space-y-3">
            {Object.keys(pollVotes).length === 0 ? (
              <PortalEmptyState message="No poll votes yet." />
            ) : (
              Object.entries(pollVotes).map(([opt, count], idx) => {
                const pct = pollVotesTotal > 0 ? Math.round((Number(count) / pollVotesTotal) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-portal-text/80">
                      <span className="truncate max-w-[280px]">{opt}</span>
                      <span className="font-mono text-portal-accent-text">
                        {count} votes ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-portal-surface-alt rounded-full overflow-hidden border border-portal-border/5">
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
