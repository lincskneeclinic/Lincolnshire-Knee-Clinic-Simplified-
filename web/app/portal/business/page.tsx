"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ContentPipelineRun, ContentPipelineReview } from "@/lib/contentPipeline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";

type RunDetailTab = "draft" | "research" | "images" | "social";

function getRenderableImageUrl(suggestedImages?: any[]): string | null {
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "events" | "newsletter" | "pipeline">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Content Pipeline State
  const [pipelineRuns, setPipelineRuns] = useState<ContentPipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ContentPipelineRun | null>(null);
  const [selectedRunReviews, setSelectedRunReviews] = useState<ContentPipelineReview[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [isVersionHistoryExpanded, setIsVersionHistoryExpanded] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [runDetailTab, setRunDetailTab] = useState<RunDetailTab>("draft");

  // Trigger New Run Form State
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [newRunTopic, setNewRunTopic] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerProgress, setTriggerProgress] = useState(0);
  const [triggerStep, setTriggerStep] = useState("");

  // Review Actions State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editIgCaption, setEditIgCaption] = useState("");
  const [editFbCaption, setEditFbCaption] = useState("");
  const [editLiCaption, setEditLiCaption] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<"instagram" | "facebook" | "linkedin" | null>(null);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionStage, setRevisionStage] = useState<"blog" | "social">("blog");
  const [revisionPlatform, setRevisionPlatform] = useState<"instagram" | "facebook" | "linkedin" | undefined>(undefined);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const insertMarkdown = (type: "bold" | "italic" | "heading" | "bullet") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (type === "bold") {
      replacement = `**${selectedText || "text"}**`;
    } else if (type === "italic") {
      replacement = `*${selectedText || "text"}*`;
    } else if (type === "heading") {
      const beforeText = text.substring(0, start);
      const lineStart = beforeText.lastIndexOf("\n") + 1;
      const afterLineStartText = beforeText.substring(lineStart);
      
      const newBefore = text.substring(0, lineStart) + "## " + afterLineStartText;
      const newText = newBefore + text.substring(start);
      setEditBody(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + 3 + start - lineStart, lineStart + 3 + end - lineStart);
      }, 0);
      return;
    } else if (type === "bullet") {
      const beforeText = text.substring(0, start);
      const lineStart = beforeText.lastIndexOf("\n") + 1;
      const afterLineStartText = beforeText.substring(lineStart);
      
      const newBefore = text.substring(0, lineStart) + "- " + afterLineStartText;
      const newText = newBefore + text.substring(start);
      setEditBody(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + 2 + start - lineStart, lineStart + 2 + end - lineStart);
      }, 0);
      return;
    }

    if (type === "bold" || type === "italic") {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setEditBody(newText);
      
      setTimeout(() => {
        textarea.focus();
        const offset = type === "bold" ? 2 : 1;
        if (selectedText) {
          textarea.setSelectionRange(start + offset, start + offset + selectedText.length);
        } else {
          textarea.setSelectionRange(start + offset, start + offset + 4);
        }
      }, 0);
    }
  };

  const handleAttachPlaceholderImage = async (placeholderId: string, label: string, url: string) => {
    if (!selectedRun) return;
    const currentDraft = selectedRun.blog_drafts[0];
    const currentImages = currentDraft?.suggested_images || [];
    
    const exists = currentImages.some(
      (img) => typeof img === "object" && img !== null && (img as any).placeholderId === placeholderId
    );

    let updatedImages;
    if (exists) {
      updatedImages = currentImages.map((img) => {
        if (typeof img === "object" && img !== null && (img as any).placeholderId === placeholderId) {
          return { ...(img as any), url };
        }
        return img;
      });
    } else {
      updatedImages = [...currentImages, { placeholderId, label, url }];
    }

    await handleReviewSubmission("blog", "edited", {
      title: currentDraft?.title,
      excerpt: currentDraft?.excerpt,
      body_markdown: currentDraft?.body_markdown || currentDraft?.body,
      body: currentDraft?.body_markdown || currentDraft?.body,
      suggestedImages: updatedImages,
      references: currentDraft?.references,
    });
  };

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
        setRunDetailTab("draft");
        setEditingPlatform(null);
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
    setTriggerProgress(5);
    setTriggerStep("Selecting topic & initializing clinical pipeline...");

    const steps = [
      { progress: 15, time: 1500, text: "Scanning patient enquiries for trending knee conditions..." },
      { progress: 30, time: 3500, text: "Stage 1: Searching PubMed & orthopaedic literature journals..." },
      { progress: 50, time: 7000, text: "Stage 1: Synthesizing evidence-based clinical research brief..." },
      { progress: 65, time: 11000, text: "Stage 2: AI Medical Writer drafting 800+ word article & references..." },
      { progress: 80, time: 16000, text: "Stage 2: Performing clinical review formatting & imagery suggestions..." },
      { progress: 92, time: 22000, text: "Finalizing content package & preparing review dashboard..." },
    ];

    const timers = steps.map((s) =>
      setTimeout(() => {
        setTriggerProgress(s.progress);
        setTriggerStep(s.text);
      }, s.time)
    );

    try {
      const res = await fetch("/api/portal/content-pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newRunTopic.trim() || undefined }),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from server:", res.status, text);
        if (res.status === 504 || res.status === 502 || res.status === 503) {
          throw new Error("Server timeout while synthesizing AI medical literature. We have increased route duration—please try again.");
        }
        throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}`);
      }

      timers.forEach((t) => clearTimeout(t));

      if (res.ok && data.success && data.run) {
        setTriggerProgress(100);
        setTriggerStep("Run completed successfully! Loading review workspace...");
        await new Promise((r) => setTimeout(r, 600));
        setIsTriggerModalOpen(false);
        setNewRunTopic("");
        await fetchPipelineRuns();
        await fetchRunDetail(data.run.run_id);
        setActionFeedback("🚀 New content automation run initiated successfully!");
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        throw new Error(data.error || data.message || "Failed to trigger content pipeline run.");
      }
    } catch (err: any) {
      timers.forEach((t) => clearTimeout(t));
      console.error("Error triggering run:", err);
      alert(err?.message || "An error occurred while triggering the automation run.");
    } finally {
      timers.forEach((t) => clearTimeout(t));
      setIsTriggering(false);
      setTriggerProgress(0);
      setTriggerStep("");
    }
  };

  // Submit review decision (approved | edited | revision_requested | revert_to_blog | revert_to_social)
  const handleReviewSubmission = async (
    stage: "blog" | "social",
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social",
    customPayload?: any,
    platform?: "instagram" | "facebook" | "linkedin"
  ) => {
    if (!selectedRun) return;
    setIsSubmittingReview(true);
    setActionError(null);
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

      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Server error occurred. The Gemini AI generation might have timed out or failed.";
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = parsed.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.success && data.run) {
        setIsEditMode(false);
        setEditingPlatform(null);
        setIsRevisionModalOpen(false);
        setRevisionNotes("");
        setRevisionPlatform(undefined);
        await fetchPipelineRuns();
        await fetchRunDetail(data.run.run_id);
        const targetDesc = platform ? `${platform.toUpperCase()} (${decision.toUpperCase()})` : decision.toUpperCase();
        setActionFeedback(`✓ Action for ${targetDesc} recorded successfully.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setActionError(err?.message || "An unexpected network error occurred while submitting the review.");
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
  const selectedRunHasSocial =
    !!selectedRun &&
    (selectedRun.status === "awaiting_social_approval" ||
      selectedRun.status === "published" ||
      selectedRun.social_drafts.length > 0);
  const activeRunDetailTab: RunDetailTab =
    runDetailTab === "social" && !selectedRunHasSocial ? "draft" : runDetailTab;
  const runDetailTabs = [
    { id: "draft" as const, label: "Draft" },
    { id: "research" as const, label: "Research" },
    { id: "images" as const, label: "Images" },
    ...(selectedRunHasSocial ? [{ id: "social" as const, label: "Social" }] : []),
  ];
  const socialReviewPlatforms = [
    { key: "instagram" as const, label: "Instagram" },
    { key: "facebook" as const, label: "Facebook" },
    { key: "linkedin" as const, label: "LinkedIn" },
  ];
  const navTabs = [
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
  ];
  const handleNavTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    if (tabId === "pipeline") {
      setSelectedRun(null);
      setRunDetailTab("draft");
      setEditingPlatform(null);
    }
  };

  return (
    <div className="min-h-screen bg-deep-navy text-white/80 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-primary-navy border-b border-white/10 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-3.5">
          {/* Mobile Header (below md) */}
          <div className="flex md:hidden flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-dark-overlay-navy border border-clinical-teal/30 rounded-xl flex items-center justify-center shrink-0">
                <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-7 h-7 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <h1 className="font-serif text-base font-bold text-white tracking-tight leading-tight">
                    Lincolnshire Knee Clinic
                  </h1>
                  <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                    Practice Intelligence
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-snug mt-0.5">
                  Visitor Engagement, Event Telemetry &amp; Content Automation Pipeline
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="bg-dark-overlay-navy hover:bg-white/5 border border-clinical-teal/30 text-clinical-teal text-[11px] py-1.5 px-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
              >
                ← Return to Website
              </Link>
              <span className="bg-dark-overlay-navy border border-white/10 text-white/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1">
                🔒 Basic Auth Protected
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Header (md and up) — unchanged */}
          <div className="hidden md:flex md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dark-overlay-navy border border-clinical-teal/30 rounded-xl flex items-center justify-center shrink-0">
                <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                    Lincolnshire Knee Clinic
                  </h1>
                  <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Practice Intelligence
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Visitor Engagement, Event Telemetry &amp; Content Automation Pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="bg-dark-overlay-navy hover:bg-white/5 border border-clinical-teal/30 text-clinical-teal text-xs py-1.5 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                ← Return to Website
              </Link>
              <span className="bg-dark-overlay-navy border border-white/10 text-white/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1">
                🔒 Basic Auth Protected
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="py-2.5 border-t border-white/10">
          {/* Mobile: horizontal scrollable strip */}
          <div className="relative md:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-4">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleNavTabClick(tab.id)}
                  className={`py-2 px-3 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer border shrink-0 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-clinical-teal text-deep-navy border-clinical-teal shadow-md"
                      : "bg-deep-navy text-white/70 hover:text-white border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-clinical-teal text-deep-navy text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
              <span className="shrink-0 w-1" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary-navy to-transparent" />
          </div>

          {/* Desktop/Tablet: unchanged */}
          <div className="hidden md:flex flex-wrap items-center justify-start gap-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavTabClick(tab.id)}
                className={`py-1.5 px-2 rounded-xl text-[9.5px] transition-all flex items-center gap-1 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-clinical-teal text-deep-navy border-clinical-teal shadow-md"
                    : "bg-deep-navy text-white/70 hover:text-white border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-[10px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-clinical-teal text-deep-navy text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
        <div className="fixed top-20 right-6 z-50 bg-primary-navy border border-clinical-teal text-clinical-teal px-4 py-3 rounded-xl shadow-2xl text-xs font-normal animate-bounce">
          {actionFeedback}
        </div>
      )}

      {actionError && (
        <div className="fixed top-20 right-6 z-50 bg-primary-navy border border-status-error text-status-error px-4 py-3 rounded-xl shadow-2xl text-xs font-normal flex items-center gap-2 max-w-sm animate-fadeIn">
          <span>⚠️</span>
          <div className="flex-1">{actionError}</div>
          <button onClick={() => setActionError(null)} className="text-white/60 hover:text-white cursor-pointer ml-2">✕</button>
        </div>
      )}

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-clinical-teal border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Loading telemetry metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards (Visible across all tabs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg relative">
                <span className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">
                  Tracked Click Events
                </span>
                <div className="text-xl xl:text-2xl font-bold text-white font-mono">
                  {totalClicks}
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  {clickEvents.callNowClicks} Calls | {clickEvents.bookAppointmentClicks} Bookings | {clickEvents.whatsappClicks} WhatsApp
                </p>
              </div>

              <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg relative">
                <span className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">
                  Verified Contact Signups
                </span>
                <div className="text-xl xl:text-2xl font-bold text-white font-mono">
                  {totalSignups}
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  100% Consent Confirmed &amp; Timestamped
                </p>
              </div>

              <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg relative">
                <span className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">
                  Content Runs Needing Action
                </span>
                <div className="text-xl xl:text-2xl font-bold text-white font-mono">
                  {reviewNeededRuns.length}
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  Blog &amp; Social drafts awaiting approval
                </p>
              </div>

              <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg relative">
                <span className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">
                  Published Content Assets
                </span>
                <div className="text-xl xl:text-2xl font-bold text-white font-mono">
                  {pipelineRuns.filter((r) => r.status === "published").length}
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  Live articles &amp; social packages
                </p>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        ✓ Click Events Active
                      </span>
                      <span className="bg-dark-overlay-navy border border-clinical-teal/30 text-clinical-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {statsData?.analyticsConnected ? "✓ Microsoft Clarity Connected" : "Clarity Script Ready"}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-lg font-serif font-bold text-white">
                    Live Practice Telemetry &amp; Content Insights
                  </h2>
                  <p className="text-xs text-white/70 max-w-3xl leading-relaxed">
                    This dashboard surfaces real enquiry topics from incoming contact messages, votes from patient content polls, signup growth from validated opt-in consents, and real click event counters for call and booking links. All data remains strictly aggregate and non-identifying.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Trending Patient Questions</h3>
                      <span className="text-[11px] text-white/60 font-mono">From Contact Enquiries</span>
                    </div>
                    <div className="space-y-3">
                      {trendingTopics.slice(0, 4).map((t: any, i: number) => (
                        <div key={i} className="p-3.5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white/90 font-serif">{t.label}</span>
                            <span className="bg-primary-navy text-clinical-teal border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {t.enquiryCount} Enquiries
                            </span>
                          </div>
                          {t.latestQueries && t.latestQueries[0] && (
                            <p className="text-[11px] text-white/60 italic">
                              "{t.latestQueries[0]}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patient Content Poll Votes</h3>
                      <span className="text-[11px] text-white/60 font-mono">{Number(pollVotesTotal)} Total Votes</span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(pollResults.votes || {}).map(([opt, count]: [string, any], idx: number) => {
                        const totalNum = Number(pollVotesTotal) || 0;
                        const pct = totalNum > 0 ? Math.round((Number(count) / totalNum) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-white/80">
                              <span className="truncate max-w-[280px]">{opt}</span>
                              <span className="font-mono text-clinical-teal">{count} votes ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-dark-overlay-navy rounded-full overflow-hidden border border-white/5">
                              <div className="bg-clinical-teal h-full rounded-full" style={{ width: `${pct}%` }} />
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
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-base font-bold text-white">Trending Patient Questions &amp; Content Input</h2>
                    <p className="text-xs text-white/60">Direct input for blog articles and patient education resources from real message enquiries</p>
                  </div>

                  <div className="space-y-4">
                    {trendingTopics.map((t: any, idx: number) => (
                      <div key={idx} className="p-5 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xs text-clinical-teal uppercase tracking-wider block mb-0.5">{t.category || "General"}</span>
                            <h3 className="font-serif text-sm font-bold text-white">{t.label}</h3>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("pipeline");
                              setNewRunTopic(t.label);
                              setIsTriggerModalOpen(true);
                            }}
                            className="bg-dark-overlay-navy hover:bg-white/5 text-clinical-teal border border-clinical-teal/40 text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
              <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-base font-bold text-white">Call &amp; Appointment Click Event Telemetry</h2>
                  <p className="text-xs text-white/60">Real-time counts for high-intent action button clicks (non-clinical, anonymous)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">📞</span>
                    <h3 className="font-bold text-white text-sm">"Call Clinic Reception" Clicks</h3>
                    <div className="font-mono text-2xl font-bold text-clinical-teal pt-2">{clickEvents.callNowClicks}</div>
                  </div>
                  <div className="p-6 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">📅</span>
                    <h3 className="font-bold text-white text-sm">"Book Appointment" Clicks</h3>
                    <div className="font-mono text-2xl font-bold text-clinical-teal pt-2">{clickEvents.bookAppointmentClicks}</div>
                  </div>
                  <div className="p-6 bg-dark-overlay-navy border border-white/5 rounded-xl space-y-3 text-center">
                    <span className="text-3xl">💬</span>
                    <h3 className="font-bold text-white text-sm">WhatsApp Help Clicks</h3>
                    <div className="font-mono text-2xl font-bold text-clinical-teal pt-2">{clickEvents.whatsappClicks}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWSLETTER */}
            {activeTab === "newsletter" && (
              <div className="space-y-8">
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
                  <h2 className="text-base font-bold text-white">Verified Subscriber Directory</h2>
                  <p className="text-xs text-white/60">Total signups: {totalSignups}</p>
                </div>
              </div>
            )}

            {/* TAB: CONTENT PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="space-y-8">
                {/* Header Control Bar */}
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">Content Automation Pipeline</h2>
                      <span className="bg-dark-overlay-navy text-clinical-teal border border-clinical-teal/30 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                        Clinical Review Portal
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      Review, edit, and approve AI-generated blog posts and multi-platform social captions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRun && (
                      <button
                        onClick={() => {
                          setSelectedRun(null);
                          setRunDetailTab("draft");
                          setEditingPlatform(null);
                        }}
                        className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        ← Back to List
                      </button>
                    )}
                    <button
                      onClick={() => setIsTriggerModalOpen(true)}
                      className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-white/60">{selectedRun.run_id}</span>
                          <StatusBadge status={selectedRun.status} />
                        </div>
                        <span className="text-xs text-white/60 font-mono">
                          Created: {new Date(selectedRun.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-white leading-snug">{selectedRun.topic}</h3>

                    </div>

                    {/* RUN REVIEW WORKSPACE */}
                    <div className="bg-primary-navy border border-white/10 rounded-2xl shadow-xl overflow-y-auto custom-scrollbar max-h-[calc(100vh-9rem)]">
                      <div className="sticky top-0 z-30 bg-primary-navy border-b border-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.22)] px-4 sm:px-6 py-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-bold text-white">
                              {selectedRun.status === "awaiting_social_approval"
                                ? "Multi-Platform Social Media Review"
                                : (
                                  <>
                                    Blog Article Draft (Version {selectedRun.blog_drafts[0]?.version || 1})
                                  </>
                                )}
                            </h3>
                            <p className="text-xs text-white/60">
                              {selectedRun.status === "awaiting_social_approval"
                                ? "Approve each platform caption independently or publish all platforms."
                                : "Review clinical accuracy and patient-facing tone."}
                            </p>
                          </div>

                          {(selectedRun.status === "awaiting_blog_approval" || selectedRun.status === "writing_blog") && (
                            <div className="flex flex-wrap items-center gap-2">
                              {isEditMode ? null : (
                                <>
                                  <button
                                    onClick={() => handleReviewSubmission("blog", "approved")}
                                    disabled={isSubmittingReview}
                                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                                  >
                                    Approve Draft
                                  </button>
                                  <button
                                    onClick={() => {
                                      const latestDraft = selectedRun.blog_drafts?.[0];
                                      if (latestDraft) {
                                        setEditTitle(latestDraft.title || "");
                                        setEditExcerpt(latestDraft.excerpt || "");
                                        setEditBody(latestDraft.body_markdown || latestDraft.body || "");
                                      }
                                      setRunDetailTab("draft");
                                      setIsEditMode(true);
                                    }}
                                    className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                                  >
                                    Edit Draft
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRevisionStage("blog");
                                      setIsRevisionModalOpen(true);
                                    }}
                                    className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                                  >
                                    Request Revision
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {selectedRun.status === "awaiting_social_approval" && (
                            <div className="space-y-3 lg:min-w-[420px]">
                              <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2">
                                <button
                                  onClick={() => handleReviewSubmission("social", "approved")}
                                  disabled={isSubmittingReview}
                                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                                >
                                  Approve All Platforms
                                </button>
                                <button
                                   onClick={() => {
                                     setRevisionStage("social");
                                     setRevisionPlatform(undefined);
                                     setIsRevisionModalOpen(true);
                                   }}
                                   className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                                 >
                                   Request Revision
                                 </button>
                                 <button
                                   onClick={() => handleReviewSubmission("blog", "revert_to_blog")}
                                   disabled={isSubmittingReview}
                                   className="border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:bg-amber-500/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 font-sans"
                                 >
                                   ↩ Revert to Blog Review
                                 </button>
                              </div>

                              {selectedRun.social_drafts.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10">
                                  {socialReviewPlatforms.map((platform) => {
                                    const platformDraft = selectedRun.social_drafts[0]?.[platform.key];
                                    const isApproved = platformDraft?.status === "approved";

                                    return (
                                      <div
                                        key={platform.key}
                                        className="bg-dark-overlay-navy border border-white/10 rounded-lg p-2 space-y-2"
                                      >
                                        <span className="block text-[10px] text-white/70">{platform.label}</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          <button
                                            onClick={() => handleReviewSubmission("social", "approved", undefined, platform.key)}
                                            disabled={isSubmittingReview || isApproved}
                                            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                          >
                                            {isApproved ? "Approved" : "Approve"}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRunDetailTab("social");
                                              setEditingPlatform(platform.key);
                                            }}
                                            disabled={isApproved}
                                            className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRevisionStage("social");
                                              setRevisionPlatform(platform.key);
                                              setIsRevisionModalOpen(true);
                                            }}
                                            className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                          >
                                            Revision
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 sm:px-6 pt-4">
                        <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-3">
                          {runDetailTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setRunDetailTab(tab.id)}
                              className={
                                "py-1 px-2 rounded-lg text-[9px] transition-all flex items-center gap-1 cursor-pointer border " +
                                (activeRunDetailTab === tab.id
                                  ? "bg-clinical-teal text-deep-navy border-clinical-teal shadow-sm"
                                  : "bg-deep-navy text-white/70 hover:text-white border-white/10 hover:border-white/20")
                              }
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        {activeRunDetailTab === "draft" && (
                          <div className="space-y-6">
                            {isEditMode ? (
                              <div className="space-y-4 bg-dark-overlay-navy p-5 rounded-xl border border-clinical-teal/30 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Left Column: Markdown editor fields */}
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-xs text-clinical-teal mb-1 font-semibold">Article Title</label>
                                      <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-clinical-teal mb-1 font-semibold">Excerpt / Meta Summary</label>
                                      <textarea
                                        value={editExcerpt}
                                        onChange={(e) => setEditExcerpt(e.target.value)}
                                        rows={2}
                                        className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-clinical-teal mb-1 font-semibold">Formatted Body Content (Markdown supported)</label>
                                      
                                      {/* Markdown Toolbar */}
                                      <div className="flex items-center gap-1 bg-primary-navy border-t border-x border-white/20 rounded-t-lg p-1.5">
                                        <button
                                          type="button"
                                          onClick={() => insertMarkdown("bold")}
                                          className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer border border-white/10"
                                          title="Bold text"
                                        >
                                          <strong>B</strong>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => insertMarkdown("italic")}
                                          className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer border border-white/10"
                                          title="Italic text"
                                        >
                                          <em>I</em>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => insertMarkdown("heading")}
                                          className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer border border-white/10"
                                          title="H2 Heading"
                                        >
                                          H2
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => insertMarkdown("bullet")}
                                          className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer border border-white/10"
                                          title="Bullet List"
                                        >
                                          • List
                                        </button>
                                      </div>

                                      <textarea
                                        ref={textareaRef}
                                        value={editBody}
                                        onChange={(e) => setEditBody(e.target.value)}
                                        className="w-full bg-primary-navy border border-white/20 text-white rounded-b-lg p-3 text-xs font-mono focus:border-clinical-teal focus:outline-none leading-relaxed custom-scrollbar"
                                        style={{ height: "320px", overflowY: "auto" }}
                                      />
                                    </div>
                                  </div>

                                  {/* Right Column: Live Rendered Preview */}
                                  <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col">
                                    <label className="block text-xs text-clinical-teal mb-1 font-semibold">Live Preview</label>
                                    <div
                                      className="bg-primary-navy/40 p-5 rounded-xl border border-white/10 space-y-4 custom-scrollbar overflow-y-auto text-[9px] text-white/80 leading-relaxed font-sans flex-1"
                                      style={{ maxHeight: "480px" }}
                                    >
                                      <h1 className="font-serif text-xl font-bold text-white tracking-tight">
                                        {editTitle || selectedRun.blog_drafts[0]?.title}
                                      </h1>
                                      {editExcerpt && (
                                        <p className="text-[9px] text-white/70 italic border-l-2 border-clinical-teal pl-3 py-1">
                                          {editExcerpt}
                                        </p>
                                      )}
                                      <div className="border-t border-white/10 pt-4">
                                        <FormattedContent 
                                          body={editBody} 
                                          suggestedImages={selectedRun.blog_drafts[0]?.suggested_images}
                                          onAttachPlaceholder={(placeholderId, label, url) => handleAttachPlaceholderImage(placeholderId, label, url)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                  <button
                                    onClick={() => setIsEditMode(false)}
                                    className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReviewSubmission("blog", "edited")}
                                    disabled={isSubmittingReview}
                                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60"
                                  >
                                    {isSubmittingReview ? "Saving..." : "Save & Approve Edited Draft"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {selectedRun.blog_drafts[0]?.flags && selectedRun.blog_drafts[0].flags.length > 0 && (
                                  <div className="bg-dark-overlay-navy border border-amber-500/50 text-amber-200/90 p-4 rounded-xl shadow-md space-y-2">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400/90 font-normal">
                                      <span>Action Required: Clinical Items Highlighted</span>
                                    </div>
                                    <ul className="list-disc pl-5 text-xs space-y-1 text-white/80 font-normal">
                                      {selectedRun.blog_drafts[0].flags.map((flag, idx) => (
                                        <li key={idx}>{flag}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div
                                  className="bg-dark-overlay-navy p-6 rounded-xl border border-white/10 space-y-4 custom-scrollbar"
                                  style={{ maxHeight: "620px", overflowY: "auto" }}
                                >
                                  <h1 className="font-serif text-xl font-bold text-white tracking-tight">
                                    {selectedRun.blog_drafts[0]?.title}
                                  </h1>
                                  {selectedRun.blog_drafts[0]?.excerpt && (
                                    <p className="text-[9px] text-white/70 italic border-l-2 border-clinical-teal pl-3 py-1">
                                      {selectedRun.blog_drafts[0].excerpt}
                                    </p>
                                  )}
                                  <div className="text-[9px] text-white/80 space-y-4 leading-relaxed font-sans border-t border-white/10 pt-4">
                                    <FormattedContent 
                                      body={selectedRun.blog_drafts[0]?.body_markdown || selectedRun.blog_drafts[0]?.body || ""} 
                                      suggestedImages={selectedRun.blog_drafts[0]?.suggested_images}
                                      onAttachPlaceholder={(placeholderId, label, url) => handleAttachPlaceholderImage(placeholderId, label, url)}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {activeRunDetailTab === "research" && (
                          <div className="bg-dark-overlay-navy p-5 rounded-xl border border-white/10 space-y-4 text-[9px]">
                            {selectedRun.research_brief ? (
                              <>
                                <p className="text-white/80 leading-relaxed">{selectedRun.research_brief.summary}</p>

                                {selectedRun.research_brief.key_points && selectedRun.research_brief.key_points.length > 0 && (
                                  <div>
                                    <span className="text-clinical-teal block mb-1 text-[10px]">Key Clinical Findings:</span>
                                    <ul className="list-disc pl-5 text-white/80 space-y-1">
                                      {selectedRun.research_brief.key_points.map((pt, i) => (
                                        <li key={i}>{pt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {selectedRun.research_brief.conflicting_findings && selectedRun.research_brief.conflicting_findings.length > 0 && (
                                  <div className="bg-primary-navy/50 border-l-2 border-amber-500/70 p-3 rounded-r-lg space-y-1">
                                    <span className="text-amber-300/90 block mb-0.5 text-[10px]">Conflicting Findings &amp; Clinical Nuances:</span>
                                    <ul className="list-disc pl-4 text-amber-200/80 text-[9px] space-y-1">
                                      {selectedRun.research_brief.conflicting_findings.map((cf, i) => (
                                        <li key={i}>{cf}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {selectedRun.research_brief.clinical_indications && selectedRun.research_brief.clinical_indications.length > 0 && (
                                  <div>
                                    <span className="text-clinical-teal block mb-1 text-[10px]">Clinical Indication Criteria:</span>
                                    <ul className="list-disc pl-5 text-white/80 space-y-1">
                                      {selectedRun.research_brief.clinical_indications.map((ci, i) => (
                                        <li key={i}>{ci}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {selectedRun.research_brief.pubmed_articles && selectedRun.research_brief.pubmed_articles.length > 0 && (
                                  <div>
                                    <span className="text-clinical-teal block mb-1.5 text-[10px]">Verified PubMed Literature (NCBI):</span>
                                    <div className="space-y-2">
                                      {selectedRun.research_brief.pubmed_articles.map((art, i) => (
                                        <div key={i} className="bg-primary-navy p-3 rounded-lg border border-white/10 space-y-1">
                                          <a
                                            href={art.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-clinical-teal hover:underline flex items-center gap-1 leading-snug text-[10px]"
                                          >
                                            <span>{art.title}</span>
                                            <span className="text-[8px] text-white/60">Open</span>
                                          </a>
                                          <div className="text-[9px] text-white/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span>Authors: {art.authors}</span>
                                            <span>Journal: {art.journal} ({art.pubdate})</span>
                                            <span className="font-mono text-clinical-teal/80">PMID: {art.pmid}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedRun.research_brief.sources && selectedRun.research_brief.sources.length > 0 && (
                                  <div>
                                    <span className="text-white/60 uppercase tracking-wider text-[10px] block mb-1">Source Citations Log:</span>
                                    <div className="space-y-1">
                                      {selectedRun.research_brief.sources.map((src, i) => (
                                        <div key={i} className="text-white/60 bg-primary-navy/40 p-2 rounded border border-white/10 font-mono text-[9px]">
                                          {src}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-white/50 italic">Research material is not available for this run yet.</p>
                            )}
                          </div>
                        )}

                        {activeRunDetailTab === "images" && (
                          <div className="space-y-6">
                            <div className="bg-dark-overlay-navy p-5 rounded-xl border border-white/10 space-y-4">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-clinical-teal uppercase tracking-wider text-xs">
                                  Attached Media Asset &amp; Image Controls
                                </span>
                                {getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images) ? (
                                  <span className="text-[11px] text-clinical-teal bg-primary-navy border border-clinical-teal/30 px-2.5 py-0.5 rounded-full">
                                    Active Image Attached
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-white/70 bg-primary-navy border border-white/20 px-2.5 py-0.5 rounded-full">
                                    No Image Attached
                                  </span>
                                )}
                              </div>

                              {getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images) ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg max-h-80">
                                  <img
                                    src={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)!}
                                    alt="Attached Blog Visual"
                                    className="w-full max-h-80 object-cover"
                                  />
                                  <div className="absolute bottom-3 left-3 bg-dark-overlay-navy/90 backdrop-blur text-[11px] text-clinical-teal px-3 py-1 rounded-full border border-white/10">
                                    Attached Featured Image
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-primary-navy/60 p-3.5 rounded-xl border border-dashed border-white/20 text-white/70 text-xs">
                                  <span className="block text-white/90">No image attached yet</span>
                                  <span className="text-white/60 text-[11px]">
                                    Upload an image or paste a URL below to attach it to this blog post and all social media cards.
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-white/10">
                                <label className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow">
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
                                    className="flex-1 bg-primary-navy border border-white/20 text-white rounded-xl p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
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
                                    className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Attach URL
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-dark-overlay-navy p-4 rounded-xl border border-white/10 space-y-2">
                                <span className="text-clinical-teal uppercase tracking-wider text-[10px] block">Suggested Visual Prompts</span>
                                <ul className="list-disc pl-4 text-white/70 space-y-1">
                                  {selectedRun.blog_drafts[0]?.suggested_images?.filter(img => typeof img === "string").map((img, i) => (
                                    <li key={i}>{img as string}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-dark-overlay-navy p-4 rounded-xl border border-white/10 space-y-2">
                                <span className="text-clinical-teal uppercase tracking-wider text-[10px] block">References &amp; Citations</span>
                                <ul className="list-disc pl-4 text-white/70 space-y-1 font-mono text-[11px]">
                                  {selectedRun.blog_drafts[0]?.references?.map((ref, i) => (
                                    <li key={i}>{ref}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeRunDetailTab === "social" && (
                          <>
                            {selectedRunHasSocial ? (
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <PlatformCard
                                  platformKey="instagram"
                                  platformLabel="Instagram"
                                  icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                                  color=""
                                  borderColor=""
                                  caption={selectedRun.social_drafts[0]?.instagram?.caption || ""}
                                  status={selectedRun.social_drafts[0]?.instagram?.status || "pending"}
                                  isPublished={selectedRun.status === "published"}
                                  attachedImageUrl={selectedRun.social_drafts[0]?.instagram?.imageUrl}
                                  isExternalEditing={editingPlatform === "instagram"}
                                  onCancelExternalEdit={() => setEditingPlatform(null)}
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
                                  onAttachImage={(url) => {
                                    const latestSocial = selectedRun.social_drafts[0];
                                    const customPayload = {
                                      ...latestSocial,
                                      instagram: {
                                        ...latestSocial.instagram,
                                        imageUrl: url
                                      }
                                    };
                                    handleReviewSubmission("social", "edited", customPayload, "instagram");
                                  }}
                                />

                                <PlatformCard
                                  platformKey="facebook"
                                  platformLabel="Facebook"
                                  icon={<FaFacebook className="w-4 h-4 text-[#1877F2]" />}
                                  color=""
                                  borderColor=""
                                  caption={selectedRun.social_drafts[0]?.facebook?.caption || ""}
                                  status={selectedRun.social_drafts[0]?.facebook?.status || "pending"}
                                  isPublished={selectedRun.status === "published"}
                                  attachedImageUrl={selectedRun.social_drafts[0]?.facebook?.imageUrl}
                                  isExternalEditing={editingPlatform === "facebook"}
                                  onCancelExternalEdit={() => setEditingPlatform(null)}
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
                                  onAttachImage={(url) => {
                                    const latestSocial = selectedRun.social_drafts[0];
                                    const customPayload = {
                                      ...latestSocial,
                                      facebook: {
                                        ...latestSocial.facebook,
                                        imageUrl: url
                                      }
                                    };
                                    handleReviewSubmission("social", "edited", customPayload, "facebook");
                                  }}
                                />

                                <PlatformCard
                                  platformKey="linkedin"
                                  platformLabel="LinkedIn"
                                  icon={<FaLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                                  color=""
                                  borderColor=""
                                  caption={selectedRun.social_drafts[0]?.linkedin?.caption || ""}
                                  status={selectedRun.social_drafts[0]?.linkedin?.status || "pending"}
                                  isPublished={selectedRun.status === "published"}
                                  attachedImageUrl={selectedRun.social_drafts[0]?.linkedin?.imageUrl}
                                  isExternalEditing={editingPlatform === "linkedin"}
                                  onCancelExternalEdit={() => setEditingPlatform(null)}
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
                                  onAttachImage={(url) => {
                                    const latestSocial = selectedRun.social_drafts[0];
                                    const customPayload = {
                                      ...latestSocial,
                                      linkedin: {
                                        ...latestSocial.linkedin,
                                        imageUrl: url
                                      }
                                    };
                                    handleReviewSubmission("social", "edited", customPayload, "linkedin");
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 text-xs text-white/60">
                                Social captions are not available for this run yet.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* PUBLISHED RUN DETAILS & ASSET DOWNLOADS */}
                    {selectedRun.status === "published" && (
                      <div className="bg-primary-navy border border-clinical-teal/30 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="bg-dark-overlay-navy text-clinical-teal border border-clinical-teal/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span>🚀</span>
                            <span>Published &amp; Ready for Distribution</span>
                          </span>
                          {selectedRun.published_urls?.blog_url && (
                            <Link
                              href={selectedRun.published_urls.blog_url}
                              target="_blank"
                              className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 animate-fadeIn"
                            >
                              <span>🔗</span>
                              <span>View Live Blog Post</span>
                            </Link>
                          )}
                          <button
                            onClick={() => handleReviewSubmission("social", "revert_to_social")}
                            disabled={isSubmittingReview}
                            className="border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:bg-amber-500/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 font-sans"
                          >
                            ↩ Unpublish / Revert to Social Review
                          </button>
                          <button
                            onClick={() => handleReviewSubmission("blog", "revert_to_blog")}
                            disabled={isSubmittingReview}
                            className="border border-white/20 hover:border-white/40 text-white hover:bg-white/5 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 font-sans"
                          >
                            ↩ Revert to Blog Review
                          </button>
                        </div>

                        {/* Downloadable Assets */}
                        {selectedRun.social_media_assets && selectedRun.social_media_assets.length > 0 && (
                          <div className="pt-3 border-t border-white/10 space-y-2">
                            <span className="text-xs text-white/70 uppercase tracking-wider block">
                              Media Asset Packages Ready for Manual Posting:
                            </span>
                            <div className="flex flex-wrap gap-3 text-xs">
                              {selectedRun.social_media_assets.map((asset, i) => (
                                <a
                                  key={i}
                                  href={asset.asset_url}
                                  download
                                  className="bg-dark-overlay-navy hover:bg-white/5 border border-clinical-teal/30 text-clinical-teal px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-mono"
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
                    <div className="bg-primary-navy border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <button
                        onClick={() => setIsVersionHistoryExpanded(!isVersionHistoryExpanded)}
                        className="w-full text-left px-6 py-4 bg-primary-navy hover:bg-primary-navy/80 flex justify-between items-center text-xs text-white/80 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span>📜</span>
                          <span>Version &amp; Audit Review History ({selectedRunReviews.length} records)</span>
                        </span>
                        <span>{isVersionHistoryExpanded ? "▲ Collapse Audit Log" : "▼ View Audit History"}</span>
                      </button>

                      {isVersionHistoryExpanded && (
                        <div className="p-6 space-y-4 border-t border-white/10 text-xs">
                          {selectedRunReviews.length === 0 ? (
                            <p className="text-white/50 italic">No previous revision logs recorded for this run.</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRunReviews.map((rev) => (
                                <div key={rev.id} className="p-3.5 bg-dark-overlay-navy border border-white/10 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-primary-navy text-clinical-teal">
                                        Stage: {rev.stage}
                                      </span>
                                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-primary-navy border border-clinical-teal/30 text-clinical-teal">
                                        {rev.decision.replace("_", " ")}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-white/50 font-mono">
                                      {new Date(rev.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {rev.revision_notes && (
                                    <p className="text-white/80 bg-primary-navy p-2.5 rounded border border-white/10 italic">
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
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-clinical-teal animate-ping" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Needs Your Attention ({reviewNeededRuns.length})
                          </h3>
                        </div>
                        <span className="text-[11px] text-clinical-teal font-mono">Action Required</span>
                      </div>

                      {reviewNeededRuns.length === 0 ? (
                        <div className="py-8 text-center text-white/60 text-xs">
                          🎉 No pending drafts require clinical review at this time.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {reviewNeededRuns.map((run) => (
                            <div
                              key={run.id}
                              onClick={() => fetchRunDetail(run.run_id)}
                              className="p-5 bg-dark-overlay-navy border border-white/10 hover:border-clinical-teal/50 rounded-xl transition-all shadow-md space-y-3 cursor-pointer group"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-white/70">{run.run_id}</span>
                                  <StatusBadge status={run.status} />
                                </div>
                                <span className="text-[11px] text-white/60 font-mono">
                                  {new Date(run.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <h4 className="font-serif text-sm font-bold text-white group-hover:text-clinical-teal transition-colors">
                                {run.topic}
                              </h4>

                              {run.blog_drafts?.[0]?.flags && run.blog_drafts[0].flags.length > 0 && (
                                <div className="text-[11px] text-amber-300/90 bg-primary-navy border border-amber-500/40 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                                  <span>⚠️</span>
                                  <span>{run.blog_drafts[0].flags.length} Clinical Review Flag(s)</span>
                                </div>
                              )}

                              <div className="flex justify-end text-xs text-clinical-teal items-center gap-1">
                                <span>Open Review Workspace</span>
                                <span>→</span>
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
                          In Progress, Published &amp; Archived Runs ({otherRuns.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherRuns.map((run) => (
                          <div
                            key={run.id}
                            onClick={() => fetchRunDetail(run.run_id)}
                            className="p-4 bg-dark-overlay-navy border border-white/10 hover:border-white/20 rounded-xl transition-all space-y-2 cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-white/60">{run.run_id}</span>
                              <StatusBadge status={run.status} />
                            </div>
                            <h4 className="text-xs text-white/80 line-clamp-2">{run.topic}</h4>
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
          <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-primary-navy border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>✨</span>
                  <span>Start New Content Automation Run</span>
                </h3>
                <button
                  onClick={() => !isTriggering && setIsTriggerModalOpen(false)}
                  disabled={isTriggering}
                  className="text-white/60 hover:text-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTriggerRun} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/80 mb-1">
                    Custom Topic / Patient Question (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRunTopic}
                    onChange={(e) => setNewRunTopic(e.target.value)}
                    disabled={isTriggering}
                    placeholder="e.g. Can I kneel after partial knee replacement?"
                    className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-white/60 mt-1.5">
                    If left blank, the pipeline will automatically select the highest-trending patient question from contact enquiries.
                  </p>
                </div>

                {isTriggering && (
                  <div className="bg-dark-overlay-navy p-4 rounded-xl border border-clinical-teal/30 space-y-3 my-2 shadow-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-clinical-teal flex items-center gap-2 truncate pr-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-clinical-teal animate-ping shrink-0" />
                        <span className="truncate">{triggerStep || "Initializing pipeline..."}</span>
                      </span>
                      <span className="text-white/80 font-mono shrink-0">{triggerProgress}%</span>
                    </div>
                    <div className="w-full bg-primary-navy h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-clinical-teal h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${triggerProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-white/60 italic text-center">
                      Please wait while our AI clinical agents analyze medical literature and synthesize your draft...
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !isTriggering && setIsTriggerModalOpen(false)}
                    disabled={isTriggering}
                    className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTriggering}
                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isTriggering && (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isTriggering ? "Initiating Pipeline..." : "Launch Automation Run"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST REVISION MODAL */}
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-primary-navy border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
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
                  className="text-white/60 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-amber-300/90 mb-1">
                    Clinical Revision Notes (Required)
                  </label>
                  <textarea
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    rows={4}
                    placeholder="Specify exact wording adjustments or clinical clarifications required..."
                    className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRevisionModalOpen(false);
                      setRevisionPlatform(undefined);
                    }}
                    className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview || !revisionNotes.trim()}
                    onClick={() => handleReviewSubmission(revisionStage, "revision_requested", undefined, revisionPlatform)}
                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50"
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
    awaiting_blog_approval: "bg-dark-overlay-navy border-clinical-teal/40 text-clinical-teal",
    awaiting_social_approval: "bg-dark-overlay-navy border-clinical-teal/40 text-clinical-teal",
    published: "bg-dark-overlay-navy border-clinical-teal/30 text-white/90",
    researching: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    writing_blog: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    writing_social: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    abandoned: "bg-dark-overlay-navy border-white/10 text-white/50",
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
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
        styles[status] || "bg-dark-overlay-navy border-white/10 text-white/70"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// Subcomponent: Fixed Footer, CTA & Disclaimer Template
function ArticleFooterTemplate() {
  return (
    <div className="mt-8 border-t border-white/10 pt-6 space-y-6">
      {/* 1. CTA Button */}
      <div className="text-center">
        <Link
          href="/book-appointment"
          className="inline-block bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
        >
          Book a Consultation
        </Link>
      </div>

      {/* 2. Disclaimer */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-[10px] text-white/50 leading-relaxed text-center max-w-2xl mx-auto">
          This article is for general informational purposes only and does not constitute medical advice. It is not a substitute for professional diagnosis or treatment. Always consult Mr. Pacheco or another qualified healthcare professional regarding your individual condition.
        </p>
      </div>

      {/* 3. Footer */}
      <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/60">
        <div className="flex items-center gap-2">
          <img
            src="/brand/lkc-logo-k-transparent.png"
            alt="Lincolnshire Knee Clinic Logo"
            className="w-6 h-6 object-contain"
          />
          <span className="font-serif font-bold text-white">Lincolnshire Knee Clinic</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center sm:justify-end">
          <span>Lead Consultant: Mr Ricardo J Pacheco (GMC 4145976)</span>
          <span>📞 07770 473437</span>
          <span>✉ admin@lincsknee.com</span>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Formatted Content Preview
function FormattedContent({ 
  body, 
  body_markdown,
  suggestedImages,
  onAttachPlaceholder
}: { 
  body?: string; 
  body_markdown?: string;
  suggestedImages?: any[];
  onAttachPlaceholder?: (placeholderId: string, label: string, url: string) => void;
}) {
  const content = body_markdown || body || "";
  if (!content) return null;

  return (
    <div className="markdown-content space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-[9.5px] text-white/80 leading-normal">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-primary-navy">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/5 bg-dark-overlay-navy/40">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-serif font-bold text-white tracking-wider border-r border-white/10 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 whitespace-normal border-r border-white/5 last:border-r-0 text-white/80">
              {children}
            </td>
          ),
          h1: ({ children }) => <h1 className="font-serif text-base font-bold text-white pt-3 border-b border-white/10 pb-1 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="font-serif text-sm font-bold text-white pt-3 border-b border-white/10 pb-1 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="font-serif text-xs font-bold text-white pt-2 border-b border-white/10 pb-1 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="font-serif text-[11px] font-bold text-white pt-2 pb-1 mb-1">{children}</h4>,
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
                <div className="bg-dark-overlay-navy border-l-4 border-amber-500/70 text-amber-200/90 p-3.5 rounded-r-lg my-3 flex items-start gap-2.5 shadow-sm">
                  <span className="text-amber-400/80 shrink-0">⚠️</span>
                  <div className="leading-relaxed text-[9px]">{children}</div>
                </div>
              );
            }

            const placeholderRegex = /^\[IMAGE PLACEHOLDER:\s*(.*?)\]$/i;
            const match = text.trim().match(placeholderRegex);
            if (match) {
              const label = match[1].trim();
              const resolvedImage = (suggestedImages || []).find(
                (item) => 
                  typeof item === "object" && 
                  item !== null && 
                  item.label?.trim().toLowerCase() === label.toLowerCase()
              );

              if (resolvedImage && resolvedImage.url) {
                return (
                  <div className="my-4 space-y-1.5 text-center">
                    <img 
                      src={resolvedImage.url} 
                      alt={label} 
                      className="mx-auto rounded-xl border border-white/10 shadow-lg max-h-80 object-cover" 
                    />
                    <span className="text-[10px] text-white/50 italic block">
                      📷 Inline Image: {label}
                    </span>
                  </div>
                );
              }

              const placeholderId = resolvedImage?.placeholderId || `placeholder-${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

              return (
                <div className="border border-dashed border-clinical-teal/40 bg-primary-navy/40 p-4 rounded-xl my-4 text-center space-y-3">
                  <div className="text-[10px] uppercase tracking-wider text-clinical-teal font-semibold">📷 Suggested Image Placement</div>
                  <p className="text-[11px] text-white/90 italic">"{label}"</p>
                  {onAttachPlaceholder && (
                    <div className="flex items-center justify-center gap-2">
                      <label className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch("/api/portal/content-pipeline/upload", {
                                method: "POST",
                                body: formData,
                              });
                              const data = await res.json();
                              if (data.success && data.url) {
                                onAttachPlaceholder(placeholderId, label, data.url);
                              }
                            } catch (err) {
                              console.error("Placeholder upload failed:", err);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          const url = prompt("Enter the direct image URL:");
                          if (url) {
                            onAttachPlaceholder(placeholderId, label, url);
                          }
                        }}
                        className="border border-white/20 text-white/80 hover:bg-white/5 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium"
                      >
                        Paste URL
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return <p className="leading-relaxed mb-3">{children}</p>;
          },
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          hr: () => <hr className="border-white/10 my-4" />,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/80">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-clinical-teal bg-dark-overlay-navy pl-4 py-2 italic text-white/80 my-3 rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      <ArticleFooterTemplate />
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
  isExternalEditing = false,
  onCancelExternalEdit,
  onApprove,
  onSaveEdit,
  onRequestRevision,
  onCopy,
  isCopied,
  onAttachImage,
}: {
  platformKey: "instagram" | "facebook" | "linkedin";
  platformLabel: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  caption: string;
  status: string;
  isPublished: boolean;
  attachedImageUrl?: string | null;
  isExternalEditing?: boolean;
  onCancelExternalEdit?: () => void;
  onApprove: () => void;
  onSaveEdit: (newCaption: string) => void;
  onRequestRevision: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onAttachImage?: (url: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(caption);
  const isCardEditing = isEditing || isExternalEditing;

  useEffect(() => {
    setEditedText(caption);
  }, [caption]);

  useEffect(() => {
    if (isExternalEditing) {
      setEditedText(caption);
    }
  }, [caption, isExternalEditing]);

  return (
    <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 animate-fadeIn">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/90 flex items-center gap-1.5 font-semibold">
            <span className="shrink-0">{icon}</span>
            <span>{platformLabel}</span>
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              status === "approved" || isPublished
                ? "bg-primary-navy text-clinical-teal border-clinical-teal/30"
                : "bg-primary-navy text-white/70 border-white/20"
            }`}
          >
            {status === "approved" || isPublished ? "✓ Approved" : "Pending Review"}
          </span>
        </div>

        {/* Attached Image or Placeholder Banner */}
        {attachedImageUrl ? (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-md group">
              <img
                src={attachedImageUrl}
                alt={`${platformLabel} Visual Asset`}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300 animate-fadeIn"
              />
              <div className="absolute bottom-2 right-2 bg-primary-navy/90 backdrop-blur text-[10px] text-clinical-teal font-mono px-2 py-0.5 rounded border border-white/10">
                📷 Attached Media Asset
              </div>
            </div>
            {!isPublished && (
              <div className="flex justify-end gap-1.5">
                <label className="bg-white/10 hover:bg-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors cursor-pointer font-medium border border-white/10">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch("/api/portal/content-pipeline/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.url) {
                          onAttachImage?.(data.url);
                        }
                      } catch (err) {
                        console.error("Platform image upload failed:", err);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    const url = prompt(`Enter direct image URL for ${platformLabel}:`);
                    if (url) {
                      onAttachImage?.(url);
                    }
                  }}
                  className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors font-medium cursor-pointer"
                >
                  Paste URL
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-primary-navy/70 border border-dashed border-white/20 rounded-lg p-4 text-center space-y-2">
            <div className="text-[10px] text-white/50">No platform-specific image attached</div>
            {!isPublished && (
              <div className="flex items-center justify-center gap-1.5">
                <label className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[9px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors font-medium">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch("/api/portal/content-pipeline/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.url) {
                          onAttachImage?.(data.url);
                        }
                      } catch (err) {
                        console.error("Platform image upload failed:", err);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    const url = prompt(`Enter direct image URL for ${platformLabel}:`);
                    if (url) {
                      onAttachImage?.(url);
                    }
                  }}
                  className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Paste URL
                </button>
              </div>
            )}
          </div>
        )}

        {isCardEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={6}
              className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-3 text-xs focus:border-clinical-teal focus:outline-none leading-relaxed font-sans"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  onCancelExternalEdit?.();
                }}
                className="border border-white/20 text-white/70 hover:bg-white/5 text-[11px] px-3 py-1 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveEdit(editedText);
                  setIsEditing(false);
                  onCancelExternalEdit?.();
                }}
                className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-[11px] px-3 py-1 rounded-lg cursor-pointer"
              >
                Save &amp; Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-primary-navy/80 p-3.5 rounded-lg border border-white/10 text-xs text-white/80 font-sans leading-relaxed whitespace-pre-wrap">
            {caption || "No caption generated yet."}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        <button
          onClick={onCopy}
          className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{isCopied ? "✓ Copied!" : "📋 Copy"}</span>
        </button>

        {status !== "approved" && !isPublished && !isCardEditing && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onRequestRevision}
              className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              🔄 Revision
            </button>
            <button
              onClick={onApprove}
              className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✓ Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
