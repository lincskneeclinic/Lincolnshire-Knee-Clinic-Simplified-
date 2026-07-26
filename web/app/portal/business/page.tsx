"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ContentPipelineRun, ContentPipelineReview } from "@/lib/contentPipeline";
import ReactMarkdown from "react-markdown";

function getRenderableImageUrl(suggestedImages?: string[]): string | null {
  if (!suggestedImages || !Array.isArray(suggestedImages) || suggestedImages.length === 0) return null;
  const match = suggestedImages.find(
    (item) =>
      typeof item === "string" &&
      (item.startsWith("http://") ||
        item.startsWith("https://") ||
        item.startsWith("/") ||
        item.startsWith("data:"))
  );
  return match || null;
}

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "events" | "newsletter" | "pipeline">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Content Pipeline State
  const [pipelineRuns, setPipelineRuns] = useState<ContentPipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ContentPipelineRun | null>(null);
  const [selectedRunReviews, setSelectedRunReviews] = useState<ContentPipelineReview[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [isResearchBriefExpanded, setIsResearchBriefExpanded] = useState(true);
  const [isVersionHistoryExpanded, setIsVersionHistoryExpanded] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Trigger New Run Form State
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [newRunTopic, setNewRunTopic] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);

  // Review Actions State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editIgCaption, setEditIgCaption] = useState("");
  const [editFbCaption, setEditFbCaption] = useState("");
  const [editLiCaption, setEditLiCaption] = useState("");

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionStage, setRevisionStage] = useState<"blog" | "social">("blog");
  const [revisionPlatform, setRevisionPlatform] = useState<"instagram" | "facebook" | "linkedin" | undefined>(undefined);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch telemetry stats
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

  // Fetch pipeline runs list
  const fetchPipelineRuns = useCallback(async () => {
    setPipelineLoading(true);
    try {
      const res = await fetch("/api/portal/content-pipeline/runs");
      const data = await res.json();
      if (data.success && Array.isArray(data.runs)) {
        setPipelineRuns(data.runs);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline runs:", err);
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  // Fetch single run detail
  const fetchRunDetail = useCallback(async (runId: string) => {
    setPipelineLoading(true);
    try {
      const res = await fetch(`/api/portal/content-pipeline/runs/${encodeURIComponent(runId)}`);
      const data = await res.json();
      if (data.success && data.run) {
        setSelectedRun(data.run);
        setSelectedRunReviews(data.reviews || []);
        // Pre-fill edit states
        const blogDraft = data.run.blog_drafts?.[0];
        if (blogDraft) {
          setEditTitle(blogDraft.title || "");
          setEditExcerpt(blogDraft.excerpt || "");
          setEditBody(blogDraft.body_markdown || blogDraft.body || "");
        }
        const socialDraft = data.run.social_drafts?.[0];
        if (socialDraft) {
          setEditIgCaption(socialDraft.instagram?.caption || "");
          setEditFbCaption(socialDraft.facebook?.caption || "");
          setEditLiCaption(socialDraft.linkedin?.caption || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch run detail:", err);
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  // Sync tab or runId from URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const runIdParam = params.get("runId");
      if (tabParam === "pipeline" || runIdParam) {
        setActiveTab("pipeline");
        fetchPipelineRuns();
        if (runIdParam) {
          fetchRunDetail(runIdParam);
        }
      }
    }
  }, [fetchPipelineRuns, fetchRunDetail]);

  useEffect(() => {
    if (activeTab === "pipeline" && pipelineRuns.length === 0) {
      fetchPipelineRuns();
    }
  }, [activeTab, fetchPipelineRuns, pipelineRuns.length]);

  // Handle trigger new run submission
  const handleTriggerRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggering(true);
    try {
      const res = await fetch("/api/portal/content-pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newRunTopic.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success && data.run) {
        setIsTriggerModalOpen(false);
        setNewRunTopic("");
        await fetchPipelineRuns();
        await fetchRunDetail(data.run.run_id);
        setActionFeedback("🚀 New content automation run initiated successfully!");
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Error triggering run:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  // Submit review decision (approved | edited | revision_requested)
  const handleReviewSubmission = async (
    stage: "blog" | "social",
    decision: "approved" | "edited" | "revision_requested",
    customPayload?: any,
    platform?: "instagram" | "facebook" | "linkedin"
  ) => {
    if (!selectedRun) return;
    setIsSubmittingReview(true);
    try {
      let bodyData: any = {
        stage,
        decision,
        platform,
      };

      if (decision === "edited") {
        if (stage === "blog") {
          bodyData.editedContent = {
            title: editTitle,
            excerpt: editExcerpt,
            body_markdown: editBody,
            body: editBody,
          };
        } else if (customPayload) {
          bodyData.editedContent = customPayload;
        } else {
          bodyData.editedContent = {
            instagram: { caption: editIgCaption, status: "approved" },
            facebook: { caption: editFbCaption, status: "approved" },
            linkedin: { caption: editLiCaption, status: "approved" },
          };
        }
      } else if (decision === "revision_requested") {
        bodyData.revisionNotes = revisionNotes;
      } else if (customPayload) {
        bodyData.editedContent = customPayload;
      }

      const res = await fetch(`/api/portal/content-pipeline/runs/${selectedRun.run_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (data.success && data.run) {
        setIsEditMode(false);
        setIsRevisionModalOpen(false);
        setRevisionNotes("");
        setRevisionPlatform(undefined);
        await fetchPipelineRuns();
        await fetchRunDetail(data.run.run_id);
        const targetDesc = platform ? `${platform.toUpperCase()} (${decision.toUpperCase()})` : decision.toUpperCase();
        setActionFeedback(`✓ Review decision for ${targetDesc} recorded successfully.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Image attachment helpers
  const handleAttachImage = async (newImageUrl: string) => {
    if (!selectedRun) return;
    const currentDraft = selectedRun.blog_drafts[0];
    const currentImages = currentDraft?.suggested_images || [];
    const cleanUrl = newImageUrl.trim();
    const updatedImages = [cleanUrl, ...currentImages.filter((img) => img !== cleanUrl)];

    await handleReviewSubmission("blog", "edited", {
      title: currentDraft?.title,
      excerpt: currentDraft?.excerpt,
      body_markdown: currentDraft?.body_markdown || currentDraft?.body,
      body: currentDraft?.body_markdown || currentDraft?.body,
      suggestedImages: updatedImages,
      references: currentDraft?.references,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/portal/content-pipeline/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        await handleAttachImage(data.url);
        setActionFeedback("✓ Image uploaded to Supabase Storage and attached successfully!");
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        console.error("Upload error:", data.error);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const totalSignups = statsData?.newsletter?.totalSignups || 0;
  const clickEvents = statsData?.clickEvents || { callNowClicks: 0, bookAppointmentClicks: 0, whatsappClicks: 0 };
  const totalClicks = (clickEvents.callNowClicks || 0) + (clickEvents.bookAppointmentClicks || 0) + (clickEvents.whatsappClicks || 0);
  const trendingTopics = statsData?.trendingTopics || [];
  const pollResults = statsData?.pollResults || { votes: {}, suggestions: [] };
  const pollVotesTotal = Object.values(pollResults.votes || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0);

  // Group pipeline runs
  const reviewNeededRuns = pipelineRuns.filter(
    (r) => r.status === "awaiting_blog_approval" || r.status === "awaiting_social_approval"
  );
  const otherRuns = pipelineRuns.filter(
    (r) => r.status !== "awaiting_blog_approval" && r.status !== "awaiting_social_approval"
  );

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
                Visitor Engagement, Event Telemetry &amp; Content Automation Pipeline
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
              {
                id: "pipeline",
                label: "Content Pipeline",
                icon: "📝",
                badge: reviewNeededRuns.length > 0 ? reviewNeededRuns.length : null,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "pipeline") setSelectedRun(null);
                }}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold"
                    : "bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-bounce">
          {actionFeedback}
        </div>
      )}

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading telemetry metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards (Visible across all tabs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Content Runs Needing Action
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-amber-400 font-mono">
                  {reviewNeededRuns.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Blog &amp; Social drafts awaiting approval
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Published Content Assets
                </span>
                <div className="text-2xl xl:text-3xl font-extrabold text-emerald-400 font-mono">
                  {pipelineRuns.filter((r) => r.status === "published").length}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Live articles &amp; social packages
                </p>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
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
              </div>
            )}

            {/* TAB: TOPICS */}
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
                          <button
                            onClick={() => {
                              setActiveTab("pipeline");
                              setNewRunTopic(t.label);
                              setIsTriggerModalOpen(true);
                            }}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-3 py-1 rounded-xl transition-colors"
                          >
                            🚀 Trigger Content Run for Topic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVENTS */}
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
                    <div className="font-mono text-3xl font-extrabold text-cyan-400 pt-2">{clickEvents.callNowClicks}</div>
                  </div>
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">📅</span>
                    <h3 className="font-bold text-white text-base">"Book Appointment" Clicks</h3>
                    <div className="font-mono text-3xl font-extrabold text-cyan-400 pt-2">{clickEvents.bookAppointmentClicks}</div>
                  </div>
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">💬</span>
                    <h3 className="font-bold text-white text-base">WhatsApp Help Clicks</h3>
                    <div className="font-mono text-3xl font-extrabold text-emerald-400 pt-2">{clickEvents.whatsappClicks}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWSLETTER */}
            {activeTab === "newsletter" && (
              <div className="space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <h2 className="text-lg font-bold text-white">Verified Subscriber Directory</h2>
                  <p className="text-xs text-slate-400">Total signups: {totalSignups}</p>
                </div>
              </div>
            )}

            {/* TAB: CONTENT PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="space-y-8">
                {/* Header Control Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Content Automation Pipeline</h2>
                      <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                        Clinical Review Portal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Review, edit, and approve AI-generated blog posts and multi-platform social captions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRun && (
                      <button
                        onClick={() => setSelectedRun(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        ← Back to List
                      </button>
                    )}
                    <button
                      onClick={() => setIsTriggerModalOpen(true)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✨</span>
                      <span>Start New Run</span>
                    </button>
                  </div>
                </div>

                {/* PIPELINE DETAIL VIEW */}
                {selectedRun ? (
                  <div className="space-y-8">
                    {/* Run Summary Banner */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-400 font-bold">{selectedRun.run_id}</span>
                          <StatusBadge status={selectedRun.status} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Created: {new Date(selectedRun.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-white leading-snug">{selectedRun.topic}</h3>

                      {/* Collapsible Research Brief Accordion */}
                      {selectedRun.research_brief && (
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                          <button
                            onClick={() => setIsResearchBriefExpanded(!isResearchBriefExpanded)}
                            className="w-full text-left px-4 py-3 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span>🔬</span>
                              <span>Research Brief &amp; Literature Sources</span>
                            </span>
                            <span>{isResearchBriefExpanded ? "▲ Collapse" : "▼ Expand Material"}</span>
                          </button>

                          {isResearchBriefExpanded && (
                            <div 
                              className="p-5 space-y-4 text-xs border-t border-slate-800/80 custom-scrollbar"
                              style={{ maxHeight: '480px', overflowY: 'auto' }}
                            >
                              <p className="text-slate-300 leading-relaxed">{selectedRun.research_brief.summary}</p>

                              {/* Key Points */}
                              {selectedRun.research_brief.key_points && selectedRun.research_brief.key_points.length > 0 && (
                                <div>
                                  <span className="font-bold text-cyan-400 block mb-1">Key Clinical Findings:</span>
                                  <ul className="list-disc pl-5 text-slate-300 space-y-1">
                                    {selectedRun.research_brief.key_points.map((pt, i) => (
                                      <li key={i}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Conflicting Findings / Nuances */}
                              {selectedRun.research_brief.conflicting_findings && selectedRun.research_brief.conflicting_findings.length > 0 && (
                                <div className="bg-amber-950/40 border-l-2 border-amber-400 p-3 rounded-r-lg space-y-1">
                                  <span className="font-bold text-amber-400 block mb-0.5">⚠️ Conflicting Findings &amp; Clinical Nuances:</span>
                                  <ul className="list-disc pl-4 text-amber-200 text-[11px] space-y-1">
                                    {selectedRun.research_brief.conflicting_findings.map((cf, i) => (
                                      <li key={i}>{cf}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Clinical Indications */}
                              {selectedRun.research_brief.clinical_indications && selectedRun.research_brief.clinical_indications.length > 0 && (
                                <div>
                                  <span className="font-bold text-emerald-400 block mb-1">Clinical Indication Criteria:</span>
                                  <ul className="list-disc pl-5 text-slate-300 space-y-1">
                                    {selectedRun.research_brief.clinical_indications.map((ci, i) => (
                                      <li key={i}>{ci}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* PubMed Articles */}
                              {selectedRun.research_brief.pubmed_articles && selectedRun.research_brief.pubmed_articles.length > 0 && (
                                <div>
                                  <span className="font-bold text-cyan-400 block mb-1.5">Verified PubMed Literature (NCBI):</span>
                                  <div className="space-y-2">
                                    {selectedRun.research_brief.pubmed_articles.map((art, i) => (
                                      <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                                        <a
                                          href={art.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-bold text-cyan-300 hover:underline flex items-center gap-1 leading-snug"
                                        >
                                          <span>📄</span>
                                          <span>{art.title}</span>
                                          <span className="text-[10px] text-slate-400">↗</span>
                                        </a>
                                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                          <span><strong>Authors:</strong> {art.authors}</span>
                                          <span><strong>Journal:</strong> {art.journal} ({art.pubdate})</span>
                                          <span className="font-mono text-cyan-400/80">PMID: {art.pmid}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sources */}
                              {selectedRun.research_brief.sources && selectedRun.research_brief.sources.length > 0 && (
                                <div>
                                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Source Citations Log:</span>
                                  <div className="space-y-1">
                                    {selectedRun.research_brief.sources.map((src, i) => (
                                      <div key={i} className="text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800/80 font-mono text-[11px]">
                                        📄 {src}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STAGE 1: BLOG DRAFT REVIEW (Awaiting Blog Approval) */}
                    {(selectedRun.status === "awaiting_blog_approval" || selectedRun.status === "writing_blog") && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <span>📝</span>
                              <span>Blog Article Draft (Version {selectedRun.blog_drafts[0]?.version || 1})</span>
                            </h3>
                            <p className="text-xs text-slate-400">Review clinical accuracy and patient-facing tone.</p>
                          </div>
                          {!isEditMode && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReviewSubmission("blog", "approved")}
                                disabled={isSubmittingReview}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                              >
                                ✓ Approve Draft
                              </button>
                              <button
                                onClick={() => setIsEditMode(true)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                              >
                                ✏️ Edit Draft
                              </button>
                              <button
                                onClick={() => {
                                  setRevisionStage("blog");
                                  setIsRevisionModalOpen(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                              >
                                🔄 Request Revision
                              </button>
                            </div>
                          )}
                        </div>

                        {/* EDIT MODE FORM */}
                        {isEditMode ? (
                          <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-cyan-500/30">
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Article Title</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Excerpt / Meta Summary</label>
                              <textarea
                                value={editExcerpt}
                                onChange={(e) => setEditExcerpt(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-cyan-400 mb-1">Formatted Body Content (Markdown supported)</label>
                              <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 text-xs font-mono focus:border-cyan-400 focus:outline-none leading-relaxed custom-scrollbar"
                                style={{ height: '320px', overflowY: 'auto' }}
                              />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                              <button
                                onClick={() => setIsEditMode(false)}
                                className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-xl cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReviewSubmission("blog", "edited")}
                                disabled={isSubmittingReview}
                                className="bg-cyan-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                              >
                                {isSubmittingReview ? "Saving..." : "Save & Approve Edited Draft"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* READ/PREVIEW MODE */
                          <div className="space-y-6">
                            {/* Prominent Clinical Review Flag Banner */}
                            {selectedRun.blog_drafts[0]?.flags && selectedRun.blog_drafts[0].flags.length > 0 && (
                              <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-red-950 border-2 border-amber-500 text-amber-200 p-4 rounded-xl shadow-lg space-y-2">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
                                  <span>⚠️</span>
                                  <span>Action Required: Clinical Items Highlighted</span>
                                </div>
                                <ul className="list-disc pl-5 text-xs space-y-1 text-amber-100">
                                  {selectedRun.blog_drafts[0].flags.map((flag, idx) => (
                                    <li key={idx} className="font-semibold">{flag}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Rendered Formatted Article Body */}
                            <div 
                              className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 custom-scrollbar"
                              style={{ maxHeight: '550px', overflowY: 'auto' }}
                            >
                              {/* PROMINENT FEATURED ARTICLE IMAGE */}
                              {getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images) && (
                                <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg max-h-80 mb-4">
                                  <img
                                    src={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)!}
                                    alt="Attached Blog Visual"
                                    className="w-full max-h-80 object-cover"
                                  />
                                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur text-[11px] text-cyan-300 font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                                    <span>🖼️</span>
                                    <span>Attached Featured Image</span>
                                  </div>
                                </div>
                              )}

                              <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                                {selectedRun.blog_drafts[0]?.title}
                              </h1>
                              {selectedRun.blog_drafts[0]?.excerpt && (
                                <p className="text-xs text-slate-400 italic border-l-2 border-cyan-500 pl-3 py-1">
                                  {selectedRun.blog_drafts[0].excerpt}
                                </p>
                              )}
                              <div className="text-xs text-slate-300 space-y-4 leading-relaxed font-sans border-t border-slate-900 pt-4">
                                <FormattedContent body={selectedRun.blog_drafts[0]?.body_markdown || selectedRun.blog_drafts[0]?.body || ""} />
                              </div>
                            </div>

                            {/* ATTACH IMAGE & ASSET CONTROL PANEL */}
                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-cyan-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                                  <span>🖼️</span>
                                  <span>Attached Media Asset &amp; Image Controls</span>
                                </span>
                                {getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images) ? (
                                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                                    ✓ Active Image Attached
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                                    No Image Attached
                                  </span>
                                )}
                              </div>

                              {!getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images) && (
                                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-dashed border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">🖼️</span>
                                    <div>
                                      <span className="font-bold block text-white">No image attached yet</span>
                                      <span className="text-slate-400 text-[11px]">
                                        Upload an image or paste a URL below to attach it to this blog post and all social media cards.
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Controls: File Upload & URL Paste */}
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-900">
                                <label className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow">
                                  <span>📁</span>
                                  <span>{isUploadingImage ? "Uploading to Storage..." : "Upload Image File"}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingImage}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                  />
                                </label>

                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Or paste direct image URL (https://...)"
                                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    disabled={!imageUrlInput.trim()}
                                    onClick={async () => {
                                      if (imageUrlInput.trim()) {
                                        await handleAttachImage(imageUrlInput.trim());
                                        setImageUrlInput("");
                                      }
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-slate-700"
                                  >
                                    Attach URL
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* References & Image Prompts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block">Suggested Visual Prompts</span>
                                <ul className="list-disc pl-4 text-slate-400 space-y-1">
                                  {selectedRun.blog_drafts[0]?.suggested_images?.map((img, i) => (
                                    <li key={i}>{img}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block">References &amp; Citations</span>
                                <ul className="list-disc pl-4 text-slate-400 space-y-1 font-mono text-[11px]">
                                  {selectedRun.blog_drafts[0]?.references?.map((ref, i) => (
                                    <li key={i}>{ref}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STAGE 2: SOCIAL DRAFTS REVIEW (Awaiting Social Approval or Published) */}
                    {(selectedRun.status === "awaiting_social_approval" ||
                      selectedRun.status === "published" ||
                      selectedRun.social_drafts.length > 0) && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <span>📱</span>
                              <span>Multi-Platform Social Media Drafts</span>
                            </h3>
                            <p className="text-xs text-slate-400">
                              Approve each platform's caption independently or publish all.
                            </p>
                          </div>
                          {selectedRun.status === "awaiting_social_approval" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReviewSubmission("social", "approved")}
                                disabled={isSubmittingReview}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                              >
                                ✓ Approve All Platforms
                              </button>
                              <button
                                onClick={() => {
                                  setRevisionStage("social");
                                  setIsRevisionModalOpen(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                              >
                                🔄 Request Revision
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 3 Independent Platform Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Instagram Card */}
                          <PlatformCard
                            platformKey="instagram"
                            platformLabel="Instagram"
                            icon="📸"
                            color="from-purple-950 to-pink-950"
                            borderColor="border-pink-500/30"
                            caption={selectedRun.social_drafts[0]?.instagram?.caption || ""}
                            status={selectedRun.social_drafts[0]?.instagram?.status || "pending"}
                            isPublished={selectedRun.status === "published"}
                            attachedImageUrl={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)}
                            onApprove={() => handleReviewSubmission("social", "approved", undefined, "instagram")}
                            onSaveEdit={(newCaption) =>
                              handleReviewSubmission("social", "edited", { caption: newCaption }, "instagram")
                            }
                            onRequestRevision={() => {
                              setRevisionStage("social");
                              setRevisionPlatform("instagram");
                              setIsRevisionModalOpen(true);
                            }}
                            onCopy={() =>
                              handleCopyToClipboard(
                                selectedRun.social_drafts[0]?.instagram?.caption || "",
                                "ig"
                              )
                            }
                            isCopied={copiedKey === "ig"}
                          />

                          {/* Facebook Card */}
                          <PlatformCard
                            platformKey="facebook"
                            platformLabel="Facebook"
                            icon="📘"
                            color="from-blue-950 to-indigo-950"
                            borderColor="border-blue-500/30"
                            caption={selectedRun.social_drafts[0]?.facebook?.caption || ""}
                            status={selectedRun.social_drafts[0]?.facebook?.status || "pending"}
                            isPublished={selectedRun.status === "published"}
                            attachedImageUrl={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)}
                            onApprove={() => handleReviewSubmission("social", "approved", undefined, "facebook")}
                            onSaveEdit={(newCaption) =>
                              handleReviewSubmission("social", "edited", { caption: newCaption }, "facebook")
                            }
                            onRequestRevision={() => {
                              setRevisionStage("social");
                              setRevisionPlatform("facebook");
                              setIsRevisionModalOpen(true);
                            }}
                            onCopy={() =>
                              handleCopyToClipboard(
                                selectedRun.social_drafts[0]?.facebook?.caption || "",
                                "fb"
                              )
                            }
                            isCopied={copiedKey === "fb"}
                          />

                          {/* LinkedIn Card */}
                          <PlatformCard
                            platformKey="linkedin"
                            platformLabel="LinkedIn"
                            icon="💼"
                            color="from-slate-950 to-cyan-950"
                            borderColor="border-cyan-500/30"
                            caption={selectedRun.social_drafts[0]?.linkedin?.caption || ""}
                            status={selectedRun.social_drafts[0]?.linkedin?.status || "pending"}
                            isPublished={selectedRun.status === "published"}
                            attachedImageUrl={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)}
                            onApprove={() => handleReviewSubmission("social", "approved", undefined, "linkedin")}
                            onSaveEdit={(newCaption) =>
                              handleReviewSubmission("social", "edited", { caption: newCaption }, "linkedin")
                            }
                            onRequestRevision={() => {
                              setRevisionStage("social");
                              setRevisionPlatform("linkedin");
                              setIsRevisionModalOpen(true);
                            }}
                            onCopy={() =>
                              handleCopyToClipboard(
                                selectedRun.social_drafts[0]?.linkedin?.caption || "",
                                "li"
                              )
                            }
                            isCopied={copiedKey === "li"}
                          />
                        </div>
                      </div>
                    )}

                    {/* PUBLISHED RUN DETAILS & ASSET DOWNLOADS */}
                    {selectedRun.status === "published" && (
                      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span>🚀</span>
                            <span>Published &amp; Ready for Distribution</span>
                          </span>
                          {selectedRun.published_urls?.blog_url && (
                            <Link
                              href={selectedRun.published_urls.blog_url}
                              target="_blank"
                              className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>🔗</span>
                              <span>View Live Blog Post</span>
                            </Link>
                          )}
                        </div>

                        {/* Downloadable Assets */}
                        {selectedRun.social_media_assets && selectedRun.social_media_assets.length > 0 && (
                          <div className="pt-3 border-t border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                              Media Asset Packages Ready for Manual Posting:
                            </span>
                            <div className="flex flex-wrap gap-3 text-xs">
                              {selectedRun.social_media_assets.map((asset, i) => (
                                <a
                                  key={i}
                                  href={asset.asset_url}
                                  download
                                  className="bg-slate-950 hover:bg-slate-900 border border-slate-700 text-cyan-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-mono"
                                >
                                  <span>📥</span>
                                  <span>{asset.platform} Asset Package</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* COLLAPSIBLE VERSION HISTORY ACCORDION */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                      <button
                        onClick={() => setIsVersionHistoryExpanded(!isVersionHistoryExpanded)}
                        className="w-full text-left px-6 py-4 bg-slate-900 hover:bg-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span>📜</span>
                          <span>Version &amp; Audit Review History ({selectedRunReviews.length} records)</span>
                        </span>
                        <span>{isVersionHistoryExpanded ? "▲ Collapse Audit Log" : "▼ View Audit History"}</span>
                      </button>

                      {isVersionHistoryExpanded && (
                        <div className="p-6 space-y-4 border-t border-slate-800 text-xs">
                          {selectedRunReviews.length === 0 ? (
                            <p className="text-slate-500 italic">No previous revision logs recorded for this run.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRunReviews.map((rev) => (
                                <div key={rev.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                                        Stage: {rev.stage}
                                      </span>
                                      <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                                        rev.decision === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                                        rev.decision === "edited" ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/20 text-amber-400"
                                      }`}>
                                        {rev.decision.replace("_", " ")}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(rev.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {rev.revision_notes && (
                                    <p className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 italic">
                                      "{rev.revision_notes}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* PIPELINE LIST VIEW */
                  <div className="space-y-8">
                    {/* SECTION 1: Needs Your Review */}
                    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Needs Your Attention ({reviewNeededRuns.length})
                          </h3>
                        </div>
                        <span className="text-[11px] text-amber-400 font-mono">Action Required</span>
                      </div>

                      {reviewNeededRuns.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          🎉 No pending drafts require clinical review at this time.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {reviewNeededRuns.map((run) => (
                            <div
                              key={run.id}
                              onClick={() => fetchRunDetail(run.run_id)}
                              className="p-5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all shadow-md space-y-3 cursor-pointer group"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-cyan-400 font-bold">{run.run_id}</span>
                                  <StatusBadge status={run.status} />
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {new Date(run.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <h4 className="font-serif text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {run.topic}
                              </h4>

                              {run.blog_drafts?.[0]?.flags && run.blog_drafts[0].flags.length > 0 && (
                                <div className="text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                                  <span>⚠️</span>
                                  <span>{run.blog_drafts[0].flags.length} Clinical Review Flag(s)</span>
                                </div>
                              )}

                              <div className="flex justify-end text-xs text-cyan-400 font-bold items-center gap-1">
                                <span>Open Review Workspace</span>
                                <span>→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: Secondary Section - All Other Runs */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                          In Progress, Published &amp; Archived Runs ({otherRuns.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherRuns.map((run) => (
                          <div
                            key={run.id}
                            onClick={() => fetchRunDetail(run.run_id)}
                            className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all space-y-2 cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-slate-400">{run.run_id}</span>
                              <StatusBadge status={run.status} />
                            </div>
                            <h4 className="font-medium text-xs text-slate-200 line-clamp-2">{run.topic}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* START NEW RUN MODAL */}
        {isTriggerModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>✨</span>
                  <span>Start New Content Automation Run</span>
                </h3>
                <button
                  onClick={() => setIsTriggerModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTriggerRun} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Custom Topic / Patient Question (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRunTopic}
                    onChange={(e) => setNewRunTopic(e.target.value)}
                    placeholder="e.g. Can I kneel after partial knee replacement?"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    If left blank, the pipeline will automatically select the highest-trending patient question from contact enquiries.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTriggerModalOpen(false)}
                    className="bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTriggering}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer"
                  >
                    {isTriggering ? "Initiating..." : "Launch Automation Run"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST REVISION MODAL */}
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🔄</span>
                  <span>
                    Request Revision ({revisionStage.toUpperCase()}
                    {revisionPlatform ? ` — ${revisionPlatform.toUpperCase()}` : ""})
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setIsRevisionModalOpen(false);
                    setRevisionPlatform(undefined);
                  }}
                  className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Clinical Revision Notes (Required)
                  </label>
                  <textarea
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    rows={4}
                    placeholder="Specify exact wording adjustments or clinical clarifications required..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRevisionModalOpen(false);
                      setRevisionPlatform(undefined);
                    }}
                    className="bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview || !revisionNotes.trim()}
                    onClick={() => handleReviewSubmission(revisionStage, "revision_requested", undefined, revisionPlatform)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Send Revision Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Subcomponent: Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    awaiting_blog_approval: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    awaiting_social_approval: "bg-purple-500/20 border-purple-500/40 text-purple-300",
    published: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    researching: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    writing_blog: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    writing_social: "bg-pink-500/20 border-pink-500/40 text-pink-300",
    abandoned: "bg-slate-800 border-slate-700 text-slate-400",
  };

  const labels: Record<string, string> = {
    awaiting_blog_approval: "Awaiting Blog Review",
    awaiting_social_approval: "Awaiting Social Review",
    published: "Published Live",
    researching: "Researching",
    writing_blog: "Writing Blog",
    writing_social: "Writing Social Captions",
    abandoned: "Archived",
  };

  return (
    <span
      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
        styles[status] || "bg-slate-800 text-slate-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// Subcomponent: Formatted Content Preview
function FormattedContent({ body, body_markdown }: { body?: string; body_markdown?: string }) {
  const content = body_markdown || body || "";
  if (!content) return null;

  return (
    <div className="markdown-content space-y-3">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="font-serif text-xl font-bold text-white pt-3 border-b border-slate-800 pb-1 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="font-serif text-lg font-bold text-white pt-3 border-b border-slate-800 pb-1 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="font-serif text-base font-bold text-white pt-2 border-b border-slate-800 pb-1 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="font-serif text-sm font-bold text-white pt-2 pb-1 mb-1">{children}</h4>,
          p: ({ children }) => {
            const text = React.Children.toArray(children)
              .map((child: any) => {
                if (typeof child === "string" || typeof child === "number") return String(child);
                if (child?.props?.children) {
                  return Array.isArray(child.props.children)
                    ? child.props.children.join("")
                    : String(child.props.children);
                }
                return "";
              })
              .join("");

            if (text.includes("[NEEDS CLINICAL REVIEW]")) {
              return (
                <div className="bg-amber-950/60 border-l-4 border-amber-400 text-amber-200 p-3 rounded-r-lg font-semibold my-2 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">⚠️</span>
                  <div className="leading-relaxed">{children}</div>
                </div>
              );
            }
            return <p className="leading-relaxed mb-3">{children}</p>;
          },
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          hr: () => <hr className="border-slate-800 my-4" />,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 bg-slate-900/50 pl-4 py-2 italic text-slate-300 my-3 rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Subcomponent: Social Platform Card
function PlatformCard({
  platformKey,
  platformLabel,
  icon,
  color,
  borderColor,
  caption,
  status,
  isPublished,
  attachedImageUrl,
  onApprove,
  onSaveEdit,
  onRequestRevision,
  onCopy,
  isCopied,
}: {
  platformKey: "instagram" | "facebook" | "linkedin";
  platformLabel: string;
  icon: string;
  color: string;
  borderColor: string;
  caption: string;
  status: string;
  isPublished: boolean;
  attachedImageUrl?: string | null;
  onApprove: () => void;
  onSaveEdit: (newCaption: string) => void;
  onRequestRevision: () => void;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(caption);

  useEffect(() => {
    setEditedText(caption);
  }, [caption]);

  return (
    <div className={`bg-gradient-to-b ${color} border ${borderColor} rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4`}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>{icon}</span>
            <span>{platformLabel}</span>
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              status === "approved" || isPublished
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            {status === "approved" || isPublished ? "✓ Approved" : "Pending Review"}
          </span>
        </div>

        {/* Attached Image or Placeholder Banner */}
        {attachedImageUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-md group">
            <img
              src={attachedImageUrl}
              alt={`${platformLabel} Visual Asset`}
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              📷 Attached Media Asset
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/70 border border-dashed border-amber-500/30 rounded-lg p-3 text-center text-amber-300/90 text-[11px] flex items-center justify-center gap-2">
            <span>🖼️</span>
            <span>No image attached — add one in the blog review step</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-cyan-500/50 text-white rounded-lg p-3 text-xs focus:outline-none leading-relaxed font-sans"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-900 text-slate-300 text-[11px] px-3 py-1 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveEdit(editedText);
                  setIsEditing(false);
                }}
                className="bg-cyan-500 text-slate-950 font-bold text-[11px] px-3 py-1 rounded-lg cursor-pointer"
              >
                Save &amp; Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
            {caption || "No caption generated yet."}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={onCopy}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{isCopied ? "✓ Copied!" : "📋 Copy"}</span>
        </button>

        {status !== "approved" && !isPublished && !isEditing && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onRequestRevision}
              className="bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              🔄 Revision
            </button>
            <button
              onClick={onApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✓ Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
