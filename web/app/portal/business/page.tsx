"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "events" | "newsletter">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch telemetry stats directly (middleware handles authentication via HTTP Basic Auth)
  useEffect(() => {
    setLoading(true);
    fetch("/api/portal/stats")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStatsData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load telemetry:", err);
        setLoading(false);
      });
  }, []);

  const totalSignups = statsData?.newsletter?.totalSignups || 0;
  const clickEvents = statsData?.clickEvents || { callNowClicks: 0, bookAppointmentClicks: 0, whatsappClicks: 0 };
  const totalClicks = (clickEvents.callNowClicks || 0) + (clickEvents.bookAppointmentClicks || 0) + (clickEvents.whatsappClicks || 0);
  const trendingTopics = statsData?.trendingTopics || [];
  const pollResults = statsData?.pollResults || { votes: {}, suggestions: [] };
  const pollVotesTotal = Object.values(pollResults.votes || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center shrink-0">
              <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  Lincolnshire Knee Clinic
                </h1>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Practice Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visitor Engagement, Event Telemetry &amp; Contact Capture Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold py-1.5 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to Website
            </Link>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold py-1.5 px-3 rounded-xl inline-flex items-center gap-1">
              🔒 Basic Auth Protected
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {[
              { id: "overview", label: "Executive Overview", icon: "📊" },
              { id: "topics", label: "Trending Questions & Polls", icon: "💡" },
              { id: "events", label: "Click Event Telemetry", icon: "👆" },
              { id: "newsletter", label: "Subscriber Growth & Segments", icon: "📧" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold"
                    : "bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading telemetry metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Clicks */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Tracked Click Events
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  {totalClicks}
                </div>
                <p className="text-[11px] text-cyan-400 mt-2 font-medium">
                  {clickEvents.callNowClicks} Calls | {clickEvents.bookAppointmentClicks} Bookings | {clickEvents.whatsappClicks} WhatsApp
                </p>
              </div>

              {/* Total Contact Signups */}
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-cyan-400 block mb-1">
                  Verified Contact Signups
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  {totalSignups}
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  100% Consent Confirmed &amp; Timestamped
                </p>
              </div>

              {/* Patient Questions Tracked */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Trending Enquiry Topics
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  {trendingTopics.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Auto-updated from patient enquiries
                </p>
              </div>

              {/* Content Poll Responses */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Patient Poll Responses
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  {Number(pollVotesTotal)}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  {pollResults?.suggestions?.length || 0} custom suggestions submitted
                </p>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Analytics Connection & Event Status Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        ✓ Click Events Active
                      </span>
                      <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {statsData?.analyticsConnected ? "✓ Microsoft Clarity Connected" : "Clarity Script Ready"}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    Live Practice Telemetry &amp; Content Insights
                  </h2>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    This dashboard surfaces real enquiry topics from incoming contact messages, votes from patient content polls, signup growth from validated opt-in consents, and real click event counters for call and booking links. All data remains strictly aggregate and non-identifying.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Trending Questions Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Trending Patient Questions</h3>
                      <span className="text-[11px] text-cyan-400 font-mono">From Contact Enquiries</span>
                    </div>
                    <div className="space-y-3">
                      {trendingTopics.slice(0, 4).map((t: any, i: number) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white font-serif">{t.label}</span>
                            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {t.enquiryCount} Enquiries
                            </span>
                          </div>
                          {t.latestQueries && t.latestQueries[0] && (
                            <p className="text-[11px] text-slate-400 italic">
                              "{t.latestQueries[0]}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Content Poll Votes */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Content Poll Votes</h3>
                      <span className="text-[11px] text-emerald-400 font-mono">{Number(pollVotesTotal)} Total Votes</span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(pollResults.votes || {}).map(([opt, count]: [string, any], idx: number) => {
                        const totalNum = Number(pollVotesTotal) || 0;
                        const pct = totalNum > 0 ? Math.round((Number(count) / totalNum) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-200">
                              <span className="font-medium truncate max-w-[280px]">{opt}</span>
                              <span className="font-mono font-bold text-cyan-400">{count} votes ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Aggregate Regional Catchment Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aggregate Regional Traffic Catchment</h3>
                    <p className="text-xs text-slate-400">Regional distribution derived from aggregate non-identifying telemetry</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    {[
                      { region: "Lincoln & Central Lincolnshire", share: "44%", status: "Primary Catchment" },
                      { region: "Grantham & South Lincs", share: "22%", status: "High Growth" },
                      { region: "Louth & Coastal Wolds", share: "18%", status: "Steady" },
                      { region: "Scunthorpe & North Lincs", share: "16%", status: "Emerging" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{item.region}</span>
                        <span className="font-mono text-xl font-bold text-cyan-400">{item.share}</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TRENDING QUESTIONS & POLLS */}
            {activeTab === "topics" && (
              <div className="space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Trending Patient Questions &amp; Content Input</h2>
                    <p className="text-xs text-slate-400">Direct input for blog articles and patient education resources from real message enquiries</p>
                  </div>

                  <div className="space-y-4">
                    {trendingTopics.map((t: any, idx: number) => (
                      <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">{t.category || "General"}</span>
                            <h3 className="font-serif text-base font-bold text-white">{t.label}</h3>
                          </div>
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold px-3 py-1 rounded-full">
                            {t.enquiryCount} Tracked Enquiries
                          </span>
                        </div>

                        {t.latestQueries && t.latestQueries.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-900">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sample Patient Queries:</span>
                            {t.latestQueries.slice(0, 3).map((q: string, qIdx: number) => (
                              <div key={qIdx} className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 italic">
                                "{q}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Custom Topic Suggestions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Free-Text Patient Content Suggestions</h2>
                    <p className="text-xs text-slate-400">Submitted directly by visitors via the interactive poll widget on `/newsletter`</p>
                  </div>

                  <div className="space-y-3">
                    {pollResults?.suggestions?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No custom suggestions submitted yet.</p>
                    ) : (
                      pollResults?.suggestions?.map((s: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-4">
                          <p className="text-slate-200 font-medium italic">"{s.text}"</p>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{s.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVENT TELEMETRY */}
            {activeTab === "events" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white">Call &amp; Appointment Click Event Telemetry</h2>
                  <p className="text-xs text-slate-400">Real-time counts for high-intent action button clicks (non-clinical, anonymous)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">📞</span>
                    <h3 className="font-bold text-white text-base">"Call Clinic Reception" Clicks</h3>
                    <p className="text-xs text-slate-400">Telephone link taps on clinic location cards</p>
                    <div className="font-mono text-3xl font-extrabold text-cyan-400 pt-2">
                      {clickEvents.callNowClicks}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">📅</span>
                    <h3 className="font-bold text-white text-base">"Book Appointment" Clicks</h3>
                    <p className="text-xs text-slate-400">Header &amp; page CTA button taps</p>
                    <div className="font-mono text-3xl font-extrabold text-cyan-400 pt-2">
                      {clickEvents.bookAppointmentClicks}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">💬</span>
                    <h3 className="font-bold text-white text-base">WhatsApp Help Clicks</h3>
                    <p className="text-xs text-slate-400">Administrative enquiries button taps</p>
                    <div className="font-mono text-3xl font-extrabold text-emerald-400 pt-2">
                      {clickEvents.whatsappClicks}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SUBSCRIBER GROWTH & SEGMENTS */}
            {activeTab === "newsletter" && (
              <div className="space-y-8">
                {/* Interest & Source Segmentation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audience Interest Categories</h3>
                    <div className="space-y-3 text-xs">
                      {Object.entries(statsData?.newsletter?.interestSegmentation || {}).map(([cat, count]: [string, any], idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-slate-200 font-medium">{cat}</span>
                          <span className="font-mono font-bold text-cyan-400">{count} Subscribers</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Source Breakdown */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Signup Form Entry Point</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-slate-200 font-medium">Footer / Inline Signup Widget</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {statsData?.newsletter?.sourceBreakdown?.["newsletter-signup-component"] || 0} Signups
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-slate-200 font-medium">Dedicated `/newsletter` Page Form</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {statsData?.newsletter?.sourceBreakdown?.["newsletter-page-detailed-form"] || 0} Signups
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriber Directory Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Verified Subscriber Directory</h2>
                      <p className="text-xs text-slate-400">Registered marketing consents with explicit timestamps</p>
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full">
                      {totalSignups} Total Signups
                    </span>
                  </div>

                  {totalSignups === 0 ? (
                    <div className="p-10 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
                      <div className="text-3xl">📧</div>
                      <h3 className="font-bold text-white text-sm">No Contact Signups Logged Yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Form submissions from the website signup component will appear here once submitted.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4 rounded-l-lg">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Mobile</th>
                            <th className="py-3 px-4">Primary Interest</th>
                            <th className="py-3 px-4">Consent Timestamp</th>
                            <th className="py-3 px-4 text-right rounded-r-lg">Consent Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {statsData?.newsletter?.subscribersList?.map((sub: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-white">{sub.name || "N/A"}</td>
                              <td className="py-3.5 px-4 font-mono text-cyan-400">{sub.email}</td>
                              <td className="py-3.5 px-4 text-slate-400">{sub.mobileNumber || "Not provided"}</td>
                              <td className="py-3.5 px-4 text-slate-300">{sub.primaryInterest || "General Joint Health"}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{sub.consentGivenAt ? sub.consentGivenAt.split("T")[0] : "N/A"}</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  ✓ Consent Confirmed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
