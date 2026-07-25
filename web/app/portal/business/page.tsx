"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "ytd">("30d");
  const [activeTab, setActiveTab] = useState<"overview" | "acquisition" | "recovery" | "journeys" | "revenue" | "newsletter">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sentFollowUps, setSentFollowUps] = useState<{ [key: string]: boolean }>({});
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [approvalMode, setApprovalMode] = useState<"manual" | "auto">("manual");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [newsletterCategoryFilter, setNewsletterCategoryFilter] = useState<string>("All");
  const [campaignSegment, setCampaignSegment] = useState<string>("Injections & Preservation");
  const [campaignTemplate, setCampaignTemplate] = useState<string>("arthrosamid");
  const [deliveryChannel, setDeliveryChannel] = useState<"email" | "whatsapp" | "both">("email");

  // Broadcast Newsletter Campaign
  const handleBroadcastCampaign = () => {
    const channelLabel = deliveryChannel === "whatsapp" ? "WhatsApp" : deliveryChannel === "both" ? "Email & WhatsApp" : "Email";
    setToastMessage(`✓ Targeted Newsletter Broadcasted via ${channelLabel} to ${campaignSegment} Subscribers!`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Authenticate PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "230670") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid security PIN. Please enter the practice administrator code.");
    }
  };

  // Trigger Email Send from Modal
  const handleConfirmSendEmail = () => {
    if (selectedBooking) {
      setSentFollowUps((prev) => ({ ...prev, [selectedBooking.id]: true }));
      setToastMessage(`✓ Follow-up email approved and sent to ${selectedBooking.name}`);
      setSelectedBooking(null);
      setTimeout(() => setToastMessage(""), 4000);
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

  // Export Analytics CSV
  const handleExportCsv = () => {
    if (!statsData) return;
    const csvContent = [
      ["Lincolnshire Knee Clinic - Practice Growth & Telemetry Report"],
      [`Generated At: ${new Date().toLocaleString()}`],
      [`Timeframe: ${timeframe.toUpperCase()}`],
      [""],
      ["Metric", "Value"],
      ["Total Page Views", statsData.traffic.pageViewsTotal],
      ["Unique Visitors", statsData.traffic.uniqueVisitors],
      ["Appointment Conversion Rate", statsData.traffic.conversionRate],
      ["Average Session Duration", statsData.traffic.avgSessionDuration],
      ["Mobile Traffic Ratio", `${statsData.traffic.deviceBreakdown.mobile}%`],
      ["Registered Patient Accounts", statsData.summary.registeredPatientsCount],
      ["Intake Submissions Logged", statsData.summary.intakeSubmissionsCount],
      ["Outstanding Patient Balances", statsData.summary.totalBalanceDue],
      ["Average Oxford Knee Score", statsData.summary.avgOxfordScore],
      ["Practice NPS Score", statsData.satisfaction.npsScore],
      ["Verified Star Rating", statsData.satisfaction.starRating],
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LKC-Business-Growth-Report-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PIN Authentication Overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Decorative Accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
              Lincolnshire Knee Clinic
            </h1>
            <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mt-1">
              Business & Practice Intelligence
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Enter your 6-digit Security PIN to access live practice telemetry & growth metrics.
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
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-cyan-500/20 text-sm"
            >
              Unlock Business Portal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link
              href="/"
              className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              ← Main Website
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/portal"
              className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
            >
              Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  Lincolnshire Knee Clinic
                </h1>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Practice Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient Behaviour, Acquisition Channels & Revenue Growth Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Return to Main Website */}
            <Link
              href="/"
              className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold py-1.5 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Website
            </Link>

            {/* Timeframe Selector */}
            <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setTimeframe("7d")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  timeframe === "7d" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeframe("30d")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  timeframe === "30d" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeframe("ytd")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  timeframe === "ytd" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                YTD
              </button>
            </div>

            {/* Export Report */}
            <button
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold py-1.5 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1.5 text-slate-200"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>

            {/* Lock */}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 text-xs font-semibold border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: "overview", label: "Executive Overview" },
            { id: "acquisition", label: "Acquisition & Lincolnshire Postcodes" },
            { id: "recovery", label: "Abandoned Booking Recovery" },
            { id: "journeys", label: "Symptom Journey Flows" },
            { id: "revenue", label: "Revenue & NPS Ratings" },
            { id: "newsletter", label: "Newsletter & Marketing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-cyan-400 text-cyan-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Dashboard Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Aggregating live practice telemetry data...</p>
          </div>
        ) : (
          <>
            {/* Executive KPI Header Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Unique Visitors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider truncate">Unique Visitors</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center text-center text-[11px] leading-none shrink-0">
                    +12.4%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {statsData?.traffic?.uniqueVisitors?.toLocaleString() || "3,940"}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Page Views: {statsData?.traffic?.pageViewsTotal?.toLocaleString()}</span>
                  <span className="text-cyan-400 font-medium">Avg {statsData?.traffic?.avgSessionDuration}</span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider truncate">Consultation Conversion</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center text-center text-[11px] leading-none shrink-0">
                    Top 5%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {statsData?.traffic?.conversionRate || "4.64%"}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  183 Confirmed Patient Appointments
                </div>
              </div>

              {/* Practice Revenue Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider truncate">Total Practice Balances</span>
                  <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center text-center text-[11px] leading-none shrink-0">
                    {statsData?.summary?.insuredCount || 0} Insured
                  </span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {statsData?.summary?.totalBalanceDue || "£306,900.00"}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Active Accounts: {statsData?.summary?.registeredPatientsCount}</span>
                  <span>Self-Pay: {statsData?.summary?.selfPayCount}</span>
                </div>
              </div>

              {/* Net Promoter Score */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider truncate">Patient NPS Rating</span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center text-center text-[11px] leading-none shrink-0">
                    ★★★★★
                  </span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {statsData?.satisfaction?.npsScore} <span className="text-sm font-normal text-slate-400">NPS ({statsData?.satisfaction?.starRating})</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {statsData?.satisfaction?.verifiedReviewsCount} Verified Patient Reviews
                </div>
              </div>
            </div>

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Conversion Funnel Bar Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Patient Conversion Funnel</h2>
                      <p className="text-xs text-slate-400">Step-by-step visitor progression from landing to consultation</p>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono font-semibold">Live Traffic Flow</span>
                  </div>

                  <div className="space-y-4">
                    {statsData?.traffic?.funnel?.map((step: any, idx: number) => {
                      const percentages = [100, 63, 17, 44];
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-200">{step.step}</span>
                            <span className="text-slate-400 font-mono">
                              {step.count.toLocaleString()} visitors ({step.conversion})
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${percentages[idx]}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Device Breakdown & Top Procedures */}
                <div className="space-y-6">
                  {/* Device Ratio */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Device Audience Split</h3>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <span>Mobile ({statsData?.traffic?.deviceBreakdown?.mobile}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Desktop ({statsData?.traffic?.deviceBreakdown?.desktop}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-600" />
                        <span>Tablet ({statsData?.traffic?.deviceBreakdown?.tablet}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden">
                      <div className="bg-cyan-400 h-full" style={{ width: `${statsData?.traffic?.deviceBreakdown?.mobile}%` }} />
                      <div className="bg-blue-500 h-full" style={{ width: `${statsData?.traffic?.deviceBreakdown?.desktop}%` }} />
                      <div className="bg-slate-600 h-full" style={{ width: `${statsData?.traffic?.deviceBreakdown?.tablet}%` }} />
                    </div>
                  </div>

                  {/* Top Treatments Breakdown */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Viewed Procedures</h3>
                    <div className="space-y-3">
                      {statsData?.traffic?.topProcedures?.map((proc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate max-w-[200px]">{proc.name}</span>
                          <span className="text-cyan-400 font-mono font-semibold">{proc.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACQUISITION & LINCOLNSHIRE POSTCODES */}
            {activeTab === "acquisition" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Acquisition Channels */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Patient Referral Channels</h2>
                    <p className="text-xs text-slate-400">Marketing & referral channel distribution</p>
                  </div>
                  <div className="space-y-4">
                    {statsData?.referralSources?.map((ref: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-200">{ref.source}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-emerald-400 text-[11px]">{ref.trend}</span>
                            <span className="text-cyan-400">{ref.percentage}% ({ref.count.toLocaleString()} visitors)</span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${ref.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lincolnshire Postcode Catchment Heatmap */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Lincolnshire Postcode Catchment</h2>
                    <p className="text-xs text-slate-400">Geographic patient distribution by regional postcode</p>
                  </div>
                  <div className="space-y-3">
                    {statsData?.postcodeCatchment?.map((post: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-sm">
                            {post.postcode}
                          </span>
                          <div>
                            <div className="font-bold text-white">{post.area}</div>
                            <div className="text-[11px] text-slate-400">{post.patients} Registered Patients</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white">{post.percent}% Share</span>
                          <div className="text-[10px] text-emerald-400 font-semibold">{post.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ABANDONED BOOKING RECOVERY */}
            {activeTab === "recovery" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Abandoned Booking Recovery Queue</h2>
                    <p className="text-xs text-slate-400">Re-engage prospective patients who started booking but dropped off</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full">
                    {statsData?.abandonedBookings?.length || 0} Pending Follow-Ups
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4 rounded-l-lg">ID / Time</th>
                        <th className="py-3 px-4">Prospective Patient</th>
                        <th className="py-3 px-4">Procedure Interest</th>
                        <th className="py-3 px-4">Drop-Off Point</th>
                        <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {statsData?.abandonedBookings?.map((item: any, idx: number) => {
                        const isSent = sentFollowUps[item.id] || item.followUpSent;
                        return (
                          <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-400">
                              <div>{item.id}</div>
                              <div className="text-[10px] text-slate-500">{item.timestamp}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{item.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{item.contact}</div>
                            </td>
                            <td className="py-3.5 px-4 text-cyan-400 font-semibold">{item.procedure}</td>
                            <td className="py-3.5 px-4 text-slate-300">{item.dropoffStep}</td>
                            <td className="py-3.5 px-4 text-right">
                              {isSent ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                                  ✓ Follow-Up Sent
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSelectedBooking(item)}
                                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors inline-flex items-center gap-1"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Review & Send Email
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Automation vs Manual Review Dispatch Bar */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white uppercase tracking-wider">Email Dispatch Mode</span>
                    <p className="text-slate-400">Control how abandoned booking invites are sent to patients.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setApprovalMode("manual")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        approvalMode === "manual" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Manual Review & Approve
                    </button>
                    <button
                      onClick={() => setApprovalMode("auto")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        approvalMode === "auto" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Automated (2h Auto-Send)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SYMPTOM JOURNEY FLOWS */}
            {activeTab === "journeys" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white">Symptom-to-Booking Journey Flows</h2>
                  <p className="text-xs text-slate-400">High-converting navigation paths from initial symptom research to consultation</p>
                </div>

                <div className="space-y-4">
                  {statsData?.patientJourneys?.map((flow: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="text-xs font-mono text-cyan-400 font-semibold">Path #{idx + 1}</div>
                        <div className="text-sm font-semibold text-white leading-relaxed">{flow.path}</div>
                        <div className="text-xs text-slate-400">{flow.views.toLocaleString()} Patient Sessions Traced</div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-emerald-400">{flow.conversion}</div>
                          <div className="text-[10px] uppercase text-slate-400 tracking-wider">Conversion</div>
                        </div>
                        {flow.highValue && (
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                            High Value
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: REVENUE & NPS RATINGS */}
            {activeTab === "revenue" && (
              <div className="space-y-8">
                {/* Treatment Revenue Matrix */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Treatment Revenue & Insurance Matrix</h2>
                    <p className="text-xs text-slate-400">Procedure revenue totals and Self-Pay vs Private Insurance split</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statsData?.revenueMatrix?.map((rev: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{rev.procedure}</span>
                          <span className="font-mono font-bold text-cyan-400 text-base">{rev.totalRevenue}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between">
                          <span>Avg Case Value: {rev.avgCaseValue}</span>
                          <span>Self-Pay {rev.selfPayPercent}% | Insured {rev.insuredPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full flex overflow-hidden border border-slate-800">
                          <div className="bg-cyan-400 h-full" style={{ width: `${rev.selfPayPercent}%` }} />
                          <div className="bg-blue-500 h-full" style={{ width: `${rev.insuredPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Reviews & Feedback */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Verified Patient Reviews & NPS Feedback</h2>
                    <p className="text-xs text-slate-400">Post-treatment clinical feedback and satisfaction ratings</p>
                  </div>

                  <div className="space-y-4">
                    {statsData?.satisfaction?.reviews?.map((rev: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{rev.patient} ({rev.procedure})</span>
                          <span className="text-amber-400 font-bold">★★★★★</span>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                        <div className="text-[10px] text-slate-500 text-right">{rev.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: NEWSLETTER & TARGETED MARKETING */}
            {activeTab === "newsletter" && (
              <div className="space-y-8">
                {/* Targeted Campaign Broadcast Builder */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Targeted Patient Campaign Builder</h2>
                      <p className="text-xs text-slate-400">Broadcast tailored clinical newsletters based on patient browsing behavior</p>
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full">
                      48.5% Avg Open Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Settings Controls */}
                    <div className="space-y-4 bg-slate-950 p-5 border border-slate-800 rounded-xl text-xs">
                      <div>
                        <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          1. Target Audience Segment
                        </label>
                        <select
                          value={campaignSegment}
                          onChange={(e) => setCampaignSegment(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Injections & Preservation">Injections & Preservation Audience (40% of Subscribers)</option>
                          <option value="Knee Replacement & Surgery">Knee Replacement & Surgery Audience (30% of Subscribers)</option>
                          <option value="Sports Injuries & ACL">Sports Injuries & ACL Audience (20% of Subscribers)</option>
                          <option value="General Joint Health">General Joint Health Audience (10% of Subscribers)</option>
                          <option value="All Subscribers">All Active Patient Subscribers (100%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          2. Select Delivery Channel
                        </label>
                        <select
                          value={deliveryChannel}
                          onChange={(e) => setDeliveryChannel(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-400 font-semibold"
                        >
                          <option value="email">✉️ Patient Email Newsletter (Transactional SMTP)</option>
                          <option value="whatsapp">💬 WhatsApp Business API (98% Open Rate - Mobile Push)</option>
                          <option value="both">📲 Multi-Channel Broadcast (Email & WhatsApp Simultaneously)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          3. Select Pre-Designed Clinical Template
                        </label>
                        <select
                          value={campaignTemplate}
                          onChange={(e) => setCampaignTemplate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="arthrosamid">Arthrosamid & Single-Dose Hydrogel Clinical Evidence</option>
                          <option value="replacement">Total Knee Replacement Pre-Op Recovery Protocol</option>
                          <option value="acl">ACL Ligament Rehabilitation & Return-to-Sport Guide</option>
                          <option value="driving">AI Draft: Returning to Driving & Work After Surgery</option>
                        </select>
                      </div>

                      {/* AI Contact Form Theme Extraction & Patient Query Enrichment Box */}
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-cyan-400">★ AI Query Enrichment (No Duplicates)</span>
                          <span className="text-slate-400 font-mono">18 Queries Matched</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong>Latest Patient Query:</strong> <em>"Can I drive 4 weeks after knee replacement in an automatic car?"</em>
                        </p>
                        <button
                          onClick={() => {
                            setCampaignTemplate("driving");
                            setCampaignSegment("Knee Replacement & Surgery");
                            setToastMessage("✓ Dynamic Newsletter Draft Enriched with Patient Queries!");
                            setTimeout(() => setToastMessage(""), 4000);
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 font-bold py-1.5 px-3 rounded-md text-[11px] transition-colors"
                        >
                          Auto-Update Newsletter Draft with Query Points →
                        </button>
                      </div>

                      {/* Patient Topic Poll Results Box */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-400">📊 Patient Topic Poll Votes</span>
                          <span className="text-slate-400 font-mono">116 Votes Recorded</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div className="flex justify-between">
                            <span>Hydrogel vs Corticosteroid Longevity</span>
                            <span className="font-bold text-cyan-400">42 votes (36%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Post-Op Swelling & Ice Therapy</span>
                            <span className="font-bold text-cyan-400">31 votes (27%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cartilage Repair vs Microfracture</span>
                            <span className="font-bold text-cyan-400">24 votes (21%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleBroadcastCampaign}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow transition-colors text-xs flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Broadcast Targeted Campaign to Segment →
                        </button>
                      </div>
                    </div>

                    {/* Live Rendered Email Preview */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Live Campaign Email Preview
                      </label>
                      <div className="bg-white text-slate-900 rounded-xl p-4 border border-slate-300 text-xs space-y-3 font-sans shadow-inner">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-bold text-slate-900 font-serif">Lincolnshire Knee Clinic</span>
                          <span className="text-[10px] text-slate-500">Specialist Clinical Updates</span>
                        </div>
                        {campaignTemplate === "arthrosamid" && (
                          <>
                            <div className="font-semibold text-slate-800 bg-slate-100 p-2 rounded">
                              Subject: Clinical Update: Single-Dose Arthrosamid Injections for Knee Osteoarthritis
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              Dear Patient,<br />
                              As part of our commitment to non-surgical joint preservation, Lincolnshire Knee Clinic is sharing recent clinical trial findings on Arthrosamid (polyacrylamide hydrogel). Designed for long-acting symptom relief...
                            </p>
                          </>
                        )}
                        {campaignTemplate === "replacement" && (
                          <>
                            <div className="font-semibold text-slate-800 bg-slate-100 p-2 rounded">
                              Subject: Preparing for Total Knee Replacement: Your Recovery Roadmap
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              Dear Patient,<br />
                              Preparing for knee replacement surgery involves understanding pre-op exercises, hospital stay expectations, and post-op physical therapy schedules. Read our consultant guide...
                            </p>
                          </>
                        )}
                        {campaignTemplate === "acl" && (
                          <>
                            <div className="font-semibold text-slate-800 bg-slate-100 p-2 rounded">
                              Subject: ACL Reconstruction: Return to Sport & Graft Recovery Protocol
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              Dear Patient,<br />
                              Optimizing joint stability after an ACL rupture requires structured rehabilitation stages. Review our latest return-to-sport criteria and graft protection protocols...
                            </p>
                          </>
                        )}
                        {campaignTemplate === "driving" && (
                          <>
                            <div className="font-semibold text-slate-800 bg-slate-100 p-2 rounded">
                              Subject: Clinical Advice: Returning to Driving & Work After Knee Surgery
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                              Dear Patient,<br />
                              Many patients ask when it is safe to resume driving and work after knee replacement or arthroscopy. Safety depends on emergency braking capability, motor control, and insurer guidelines. Read our detailed consultant guide...
                            </p>
                          </>
                        )}
                        <div className="pt-2 text-center space-y-2">
                          <span className="bg-[#00AFC8] text-white font-bold py-2 px-4 rounded-lg text-[11px] inline-block shadow">
                            Read Full Clinical Article →
                          </span>
                          <div className="pt-2 border-t text-[10px] text-slate-500 leading-snug">
                            You received this email because you subscribed to updates at Lincolnshire Knee Clinic.<br />
                            <a href="/newsletter?unsubscribe=true" className="text-cyan-600 underline font-medium">Unsubscribe from newsletters</a> | <a href="/privacy-policy" className="text-slate-500 underline">Privacy Policy</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriber Directory Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Patient Subscriber Directory</h2>
                      <p className="text-xs text-slate-400">Registered newsletter profiles with tracked interest tags</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {["All", "Injections & Preservation", "Knee Replacement & Surgery", "Sports Injuries & ACL", "General Joint Health"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewsletterCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            newsletterCategoryFilter === cat
                              ? "bg-cyan-500 text-slate-950 shadow"
                              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4 rounded-l-lg">Subscriber</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Primary Interest Tag</th>
                          <th className="py-3 px-4">Topics Subscribed</th>
                          <th className="py-3 px-4 text-right rounded-r-lg">Date / Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {statsData?.subscribers
                          ?.filter((s: any) =>
                            newsletterCategoryFilter === "All"
                              ? true
                              : s.primaryInterest?.includes(newsletterCategoryFilter.split(" ")[0])
                          )
                          ?.map((sub: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-white">{sub.name}</td>
                              <td className="py-3.5 px-4 font-mono text-cyan-400">{sub.email}</td>
                              <td className="py-3.5 px-4">
                                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-semibold text-[10px]">
                                  {sub.primaryInterest}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                                {sub.topics?.join(", ") || "General Knee Care"}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="font-mono text-slate-400">{sub.signupDate}</div>
                                <div className="text-[10px] text-emerald-400 font-bold">{sub.status}</div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Email Review & Approval Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Review & Approve Follow-Up Email</h3>
                <p className="text-xs text-slate-400">Preview email template before sending to prospective patient</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Recipient Details */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-white">{selectedBooking.name} ({selectedBooking.contact})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Procedure Interest:</span>
                <span className="text-cyan-400 font-semibold">{selectedBooking.procedure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Abandoned At:</span>
                <span className="text-amber-400 font-medium">{selectedBooking.dropoffStep} ({selectedBooking.timestamp})</span>
              </div>
            </div>

            {/* Rendered Email Preview Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Rendered Email Preview</span>
                <span className="text-cyan-400 text-[11px] normal-case font-medium">Tailored for: {selectedBooking.dropoffStep}</span>
              </label>
              <div className="bg-white text-slate-900 rounded-xl p-4 border border-slate-300 text-xs space-y-3 font-sans shadow-inner">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-slate-900 font-serif">Lincolnshire Knee Clinic</span>
                  <span className="text-[10px] text-slate-500">Patient Care Team</span>
                </div>
                
                {/* Dynamic Subject & Message Body based on Drop-off Point */}
                {(() => {
                  let subject = `Continuing your knee care with Lincolnshire Knee Clinic`;
                  let introMsg = `We noticed you recently began inquiring about ${selectedBooking.procedure} on our website, but did not finish reserving your consultation.`;
                  let actionText = `Complete Your Consultation Booking →`;

                  if (selectedBooking.dropoffStep?.includes("Insurance")) {
                    subject = `Need help with your Bupa / AXA Insurance Pre-Authorization?`;
                    introMsg = `We noticed you were reserving a consultation for ${selectedBooking.procedure}, but stopped at the Insurance Pre-Auth step. Please note our medical secretaries can verify your insurance authorization (Bupa, AXA, Aviva, Vitality) on your behalf, or guide you through self-pay options.`;
                    actionText = `Request Insurance Assistance / Resume Booking →`;
                  } else if (selectedBooking.dropoffStep?.includes("Date")) {
                    subject = `Find a convenient consultation date for ${selectedBooking.procedure}`;
                    introMsg = `We noticed you were selecting a clinic location and appointment date for ${selectedBooking.procedure}. If our online clinic slots didn't suit your schedule, our team can arrange a priority evening or weekend slot at Lincoln Hospital for you.`;
                    actionText = `View Priority Clinic Slots →`;
                  } else if (selectedBooking.dropoffStep?.includes("Medical")) {
                    subject = `Questions about your symptoms or medical screening for ${selectedBooking.procedure}?`;
                    introMsg = `We noticed you were completing the pre-consultation medical screening for ${selectedBooking.procedure}. If you have questions regarding previous MRI scans, X-rays, or surgical suitability, our clinical team is here to assist.`;
                    actionText = `Resume Medical Screening →`;
                  } else if (selectedBooking.dropoffStep?.includes("Contact")) {
                    subject = `Quick question regarding your ${selectedBooking.procedure} inquiry`;
                    introMsg = `We noticed you started an inquiry regarding ${selectedBooking.procedure} at Lincolnshire Knee Clinic. We would be delighted to answer any questions you have about treatment options, costs, or consultant availability.`;
                    actionText = `Complete Your Inquiry →`;
                  }

                  return (
                    <>
                      <div className="font-semibold text-slate-800 bg-slate-100 p-2 rounded border border-slate-200">
                        Subject: {subject}
                      </div>
                      <div className="space-y-2 text-slate-700 leading-relaxed text-[11px]">
                        <p>Dear {selectedBooking.name},</p>
                        <p>{introMsg}</p>
                        <p>
                          Our specialist clinical team is available to answer any questions and assist you with the next step.
                        </p>
                      </div>
                      <div className="pt-2 text-center">
                        <span className="bg-[#00AFC8] text-white font-bold py-2 px-4 rounded-lg text-[11px] inline-block shadow">
                          {actionText}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendEmail}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Approve & Send Email Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 font-bold text-xs py-3 px-5 rounded-xl shadow-2xl border border-emerald-400 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
