"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "events" | "newsletter">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Authenticate PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "230670") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid security PIN. Please enter the administrator code.");
    }
  };

  // Fetch telemetry stats
  useEffect(() => {
    if (isAuthenticated) {
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
    }
  }, [isAuthenticated]);

  // PIN Authentication Overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
              Lincolnshire Knee Clinic
            </h1>
            <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mt-1">
              Website Analytics &amp; Marketing Dashboard
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Enter your 6-digit Security PIN to view site performance &amp; contact signup metrics.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Administrator PIN
              </label>
              <input
                id="pin-input"
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:tracking-normal placeholder:text-slate-600"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-2 px-3 rounded-lg text-center font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-cyan-500/20 text-sm cursor-pointer"
            >
              Unlock Business Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 font-semibold">
              ← Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalSignups = statsData?.newsletter?.totalSignups || 0;

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
                  Marketing &amp; Analytics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visitor Engagement, Event Tracking &amp; Contact Capture Dashboard
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
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {[
              { id: "overview", label: "Analytics Overview", icon: "📊" },
              { id: "pages", label: "Page Views & Content", icon: "📄" },
              { id: "events", label: "Click-Through Tracking", icon: "👆" },
              { id: "newsletter", label: "Contact & Newsletter Signups", icon: "📧" },
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
            <p className="text-slate-400 text-sm">Loading marketing metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Page Views */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Total Page Views
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  --
                </div>
                <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                  Connect analytics integration
                </p>
              </div>

              {/* Time on Page & Bounce Rate */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Avg Time on Page / Bounce Rate
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  --
                </div>
                <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                  Connect analytics integration
                </p>
              </div>

              {/* Click-Through Events */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Call &amp; Booking Click-Throughs
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  --
                </div>
                <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
                  Connect event tracking
                </p>
              </div>

              {/* Total Contact Signups */}
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-cyan-400 block mb-1">
                  Contact / Newsletter Signups
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-white font-mono">
                  {totalSignups}
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  {totalSignups > 0 ? `${totalSignups} active subscriber(s)` : "Form ready for submissions"}
                </p>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Analytics Integration Status
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    Connect Web Analytics Provider
                  </h2>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    This marketing and business dashboard is prepared to track visitor page views, clinical knowledge hub interest, time on page, bounce rate, button click-through events, and newsletter conversion rates once your analytics script (e.g., Plausible, Google Analytics 4, or PostHog) is connected to the site.
                  </p>
                  <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-400 italic">
                    📌 Connect analytics integration to populate live traffic, page views, and click event telemetry for this dashboard.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Traffic Sources Banner */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traffic Sources Breakdown</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tracks proportion of visitors originating from Organic Search, Direct visits, and Referral channels.
                    </p>
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block mb-1">Traffic Channel Telemetry</span>
                      <span className="text-sm font-bold text-amber-400">Connect analytics to populate traffic sources</span>
                    </div>
                  </div>

                  {/* Newsletter Conversion Banner */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Signup Conversion Rate</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calculates newsletter/contact signups ÷ total unique website visitors.
                    </p>
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block mb-1">Conversion Rate Metric</span>
                      <span className="text-sm font-bold text-cyan-400">
                        {totalSignups} total signup(s) logged
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAGE VIEWS */}
            {activeTab === "pages" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white">Page Views &amp; Knowledge Hub Content</h2>
                  <p className="text-xs text-slate-400">Most-visited pages, clinical education articles, and recovery guides</p>
                </div>

                <div className="space-y-3">
                  {[
                    { path: "/clinical-knowledge-hub", name: "Clinical Knowledge Hub" },
                    { path: "/education", name: "Education & Blog Hub" },
                    { path: "/symptoms", name: "Symptoms Hub" },
                    { path: "/conditions", name: "Conditions Hub" },
                    { path: "/treatments", name: "Treatments Hub" },
                    { path: "/injections", name: "Injections & Joint Preservation Hub" },
                    { path: "/recovery", name: "Recovery & Rehab Hub" },
                    { path: "/book-appointment", name: "Book Appointment Page" },
                  ].map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.path}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-medium text-[11px]">Connect analytics to populate views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CLICK-THROUGH EVENTS */}
            {activeTab === "events" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white">Call &amp; Appointment Click-Through Tracking</h2>
                  <p className="text-xs text-slate-400">Event tracking for high-intent visitor interactions (non-clinical, anonymous)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-center">
                    <span className="text-2xl">📞</span>
                    <h3 className="font-bold text-white text-sm">"Call Clinic Reception" Clicks</h3>
                    <p className="text-xs text-slate-400">Telephone link taps on clinic location cards</p>
                    <div className="pt-2 text-amber-400 text-xs font-semibold">Connect analytics to populate</div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-center">
                    <span className="text-2xl">📅</span>
                    <h3 className="font-bold text-white text-sm">"Book Appointment" Clicks</h3>
                    <p className="text-xs text-slate-400">Header &amp; page CTA button clicks</p>
                    <div className="pt-2 text-amber-400 text-xs font-semibold">Connect analytics to populate</div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-center">
                    <span className="text-2xl">💬</span>
                    <h3 className="font-bold text-white text-sm">WhatsApp Help Clicks</h3>
                    <p className="text-xs text-slate-400">Administrative enquiries button taps</p>
                    <div className="pt-2 text-amber-400 text-xs font-semibold">Connect analytics to populate</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWSLETTER SIGNUPS */}
            {activeTab === "newsletter" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Contact &amp; Newsletter Signups</h2>
                    <p className="text-xs text-slate-400">Captured marketing consents and contact requests from website forms</p>
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
                          <th className="py-3 px-4 text-right rounded-r-lg">Consent Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {statsData?.newsletter?.subscribersList?.map((sub: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">{sub.name || "N/A"}</td>
                            <td className="py-3.5 px-4 font-mono text-cyan-400">{sub.email}</td>
                            <td className="py-3.5 px-4 text-slate-400">{sub.mobile || "Not provided"}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                ✓ Opted In
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
