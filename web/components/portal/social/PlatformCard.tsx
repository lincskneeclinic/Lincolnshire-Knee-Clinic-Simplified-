"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast, usePrompt } from "@/components/portal/DashboardFeedback";
import GenerateImageModal from "@/components/portal/GenerateImageModal";
import { downloadImageFile } from "@/lib/downloadImageFile";
import { estimatePostScore } from "@/lib/estimatedPostScore";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Opens a self-contained mockup in a new window showing what a Story/Carousel/
// Reel will actually look like once posted — with the caption composited on top
// of the image the way Instagram renders it, not shown as separate text below
// (which is all the inline card view has room for).
function openSocialPreview(
  kind: "story" | "carousel" | "reel",
  data: {
    caption?: string;
    imageUrl?: string;
    slides?: Array<{ slideNumber: number; text: string; imageUrl?: string }>;
    script?: string;
  }
) {
  const win = window.open("", "_blank", "width=480,height=820");
  if (!win) {
    alert("Please allow pop-ups for this site to preview the post.");
    return;
  }

  let bodyHtml = "";
  if (kind === "story") {
    bodyHtml = `
      <div class="story-frame">
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="" />` : `<div class="no-image">No background image yet</div>`}
        <div class="overlay-caption">${escapeHtml(data.caption || "")}</div>
      </div>
    `;
  } else if (kind === "carousel") {
    bodyHtml =
      `<div class="carousel-row">` +
      (data.slides || [])
        .map(
          (s) => `
        <div class="slide-card">
          <div class="slide-number">Slide ${s.slideNumber}</div>
          ${s.imageUrl ? `<img src="${s.imageUrl}" alt="" />` : `<div class="no-image">No image yet</div>`}
          <div class="overlay-caption">${escapeHtml(s.text)}</div>
        </div>
      `
        )
        .join("") +
      `</div>`;
  } else if (kind === "reel") {
    bodyHtml = `
      <div class="story-frame">
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="" />` : `<div class="no-image">No cover image yet</div>`}
        <div class="overlay-caption">${escapeHtml(data.caption || "")}</div>
      </div>
      <div class="script-box">
        <h3>Script</h3>
        <pre>${escapeHtml(data.script || "No script yet.")}</pre>
      </div>
    `;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Post Preview</title>
<style>
  body { margin:0; padding:24px; background:#0b1b2b; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; display:flex; flex-direction:column; align-items:center; gap:20px; }
  .story-frame { position:relative; width:320px; height:568px; border-radius:16px; overflow:hidden; background:#111827; box-shadow:0 8px 30px rgba(0,0,0,0.4); flex-shrink:0; }
  .story-frame img { width:100%; height:100%; object-fit:cover; }
  .overlay-caption { position:absolute; left:12px; right:12px; bottom:20px; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); color:#fff; padding:12px 14px; border-radius:10px; font-size:14px; line-height:1.45; text-align:center; }
  .carousel-row { display:flex; gap:16px; overflow-x:auto; max-width:100%; padding-bottom:12px; }
  .slide-card { position:relative; flex:0 0 auto; width:280px; height:280px; border-radius:12px; overflow:hidden; background:#111827; }
  .slide-card img { width:100%; height:100%; object-fit:cover; }
  .slide-number { position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.6); color:#fff; font-size:11px; padding:3px 8px; border-radius:999px; z-index:2; }
  .no-image { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#8a99a8; font-size:12px; text-align:center; padding:16px; box-sizing:border-box; }
  .script-box { width:320px; background:#12263a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; color:#dbe8f2; box-sizing:border-box; }
  .script-box h3 { margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#5fd0e0; }
  .script-box pre { white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.55; margin:0; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`);
  win.document.close();
}

interface MetricsSnapshot {
  fetched_at: string;
  reach: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  engagement_rate: number | null;
}

interface PerformanceAnalysis {
  score: number;
  assessment: string;
  suggestions: string[];
}

const METRIC_LABELS: Array<{ key: keyof MetricsSnapshot; label: string }> = [
  { key: "reach", label: "Reach" },
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "saves", label: "Saves" },
];

function scoreColor(score: number): string {
  if (score >= 65) return "text-clinical-teal border-clinical-teal/40";
  if (score >= 35) return "text-amber-400 border-amber-500/40";
  return "text-status-error border-status-error/40";
}

/**
 * Heuristic score computed from the caption text alone (length, hashtags,
 * CTA/question presence) — always available, unlike PerformancePanel's real
 * score below which needs an approved + linked + Meta-connected post.
 */
function EstimatedScoreBadge({
  score,
  tips,
  delta,
  live,
}: {
  score: number;
  tips: string[];
  delta?: { before: number; after: number } | null;
  live?: boolean;
}) {
  const tooltip = tips.length > 0 ? tips.join(" ") : "Estimated from the caption text only — length, hashtags, CTA presence.";
  return (
    <div className="flex items-center gap-2 flex-wrap" title={tooltip}>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${scoreColor(score)}`}>
        {live ? "Live estimate" : "Estimated"} {score}/100
      </span>
      {delta && delta.before !== delta.after && (
        <span className="text-[9px] text-white/50">
          {delta.before} → {delta.after} ({delta.after > delta.before ? "+" : ""}
          {delta.after - delta.before})
        </span>
      )}
    </div>
  );
}

/**
 * Real (not AI-estimated) post performance, pulled from the Instagram/Facebook
 * Graph API for a post the account holder manually published and then linked
 * back here by pasting its live URL. Self-contained: fetches its own state
 * directly (matches this file's existing convention for video upload/generation),
 * since nothing else in the dashboard needs to share this state.
 */
function PerformancePanel({
  platformKey,
  sourceType,
  sourceId,
  caption,
}: {
  platformKey: "instagram" | "facebook" | "instagramStory" | "instagramCarousel" | "instagramReel";
  sourceType: "pipeline" | "social_only";
  sourceId: string;
  caption: string;
}) {
  const platform: "instagram" | "facebook" = platformKey === "facebook" ? "facebook" : "instagram";
  const [checked, setChecked] = useState(false);
  const [linked, setLinked] = useState(false);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalysis | null>(null);
  const [permalinkInput, setPermalinkInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    fetch(`/api/portal/meta/link-post?sourceType=${sourceType}&sourceId=${encodeURIComponent(sourceId)}&platform=${platform}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setLinked(!!data.linked);
          setMetrics(data.metrics || null);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecked(true));
    return () => {
      cancelled = true;
    };
  }, [sourceType, sourceId, platform]);

  const refreshMetrics = async () => {
    setError(null);
    setIsBusy(true);
    try {
      const res = await fetch("/api/portal/meta/refresh-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, sourceId, platform, postType: platformKey, caption }),
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setPerformance(data.performance);
      } else {
        setError(data.error || "Failed to fetch performance data.");
      }
    } catch {
      setError("Failed to fetch performance data. Please check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const linkAndAnalyze = async () => {
    if (!permalinkInput.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      const res = await fetch("/api/portal/meta/link-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, sourceId, platform, permalinkUrl: permalinkInput.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Couldn't link that post.");
        setIsBusy(false);
        return;
      }
      setLinked(true);
      await refreshMetrics();
    } catch {
      setError("Couldn't link that post. Please check your connection and try again.");
      setIsBusy(false);
    }
  };

  if (!checked) return null;

  return (
    <div className="bg-primary-navy/50 border border-white/10 rounded-lg p-3 space-y-2.5 text-left">
      <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
        Real Performance {platform === "instagram" ? "(Instagram)" : "(Facebook)"}
      </span>

      {!linked ? (
        <div className="space-y-2">
          <p className="text-[10px] text-white/60 leading-relaxed">
            Once you've posted this manually, paste the live post URL to pull real reach and engagement numbers.
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={permalinkInput}
              onChange={(e) => setPermalinkInput(e.target.value)}
              placeholder={platform === "instagram" ? "https://www.instagram.com/p/..." : "https://www.facebook.com/.../posts/..."}
              className="flex-1 bg-dark-overlay-navy border border-white/20 text-white text-[10px] rounded-lg px-2 py-1.5 focus:border-clinical-teal focus:outline-none"
            />
            <button
              onClick={linkAndAnalyze}
              disabled={isBusy || !permalinkInput.trim()}
              className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isBusy ? "Linking…" : "Link & Analyze"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {metrics && (
            <div className="grid grid-cols-3 gap-1.5">
              {METRIC_LABELS.filter((m) => metrics[m.key] !== null && metrics[m.key] !== undefined).map((m) => (
                <div key={m.key} className="bg-dark-overlay-navy border border-white/5 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[13px] font-bold text-white">{metrics[m.key]}</div>
                  <div className="text-[8px] text-white/50 uppercase tracking-wide">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {performance && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${scoreColor(performance.score)}`}>
                  {performance.score}/100
                </span>
                <span className="text-[9px] text-white/40">real, measured vs. this account's own history</span>
              </div>
              <p className="text-[10px] text-white/80 leading-relaxed">{performance.assessment}</p>
              {performance.suggestions.length > 0 && (
                <ul className="text-[10px] text-white/70 leading-relaxed list-disc list-inside space-y-0.5">
                  {performance.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={refreshMetrics}
            disabled={isBusy}
            className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isBusy ? "Refreshing…" : performance ? "🔄 Refresh & Re-analyze" : "Fetch Real Performance"}
          </button>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-status-error bg-status-error/10 border border-status-error/20 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}

export function PlatformCard({
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
  imagePromptSuggestion,
  onGenerateImage,
  isGeneratingImage,
  showManualUploadGuide,
  slides,
  script,
  topic,
  attachedVideoUrl,
  videoSource,
  onAttachVideo,
  sourceType,
  sourceId,
}: {
  platformKey: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
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
  onAttachImage?: (url: string, slideIndex?: number) => void;
  imagePromptSuggestion?: string;
  onGenerateImage?: (prompt: string, slideIndex?: number) => void;
  isGeneratingImage?: boolean;
  showManualUploadGuide?: boolean;
  slides?: Array<{ slideNumber: number; text: string; imagePromptSuggestion: string; imageUrl?: string }>;
  script?: string;
  topic?: string;
  attachedVideoUrl?: string;
  videoSource?: "upload" | "ai-broll";
  onAttachVideo?: (url: string, source: "upload" | "ai-broll") => void;
  /** Identifies this post for real Meta performance tracking. Omit to hide that panel (e.g. LinkedIn, which isn't supported yet). */
  sourceType?: "pipeline" | "social_only";
  sourceId?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(caption);
  const isCardEditing = isEditing || isExternalEditing;

  const isStory = platformKey === "instagramStory";
  const isCarousel = platformKey === "instagramCarousel";
  const isReel = platformKey === "instagramReel";

  const scorePlatform: "instagram" | "facebook" | "linkedin" = platformKey === "facebook" ? "facebook" : platformKey === "linkedin" ? "linkedin" : "instagram";
  const scorePostType: "post" | "story" | "carousel" | "reel" = isStory ? "story" : isCarousel ? "carousel" : isReel ? "reel" : "post";
  const committedScoreText = isCarousel
    ? (slides && slides.length > 0 ? slides.map((s) => s.text).join(" ") : caption)
    : isReel
    ? script || caption
    : caption;
  const estimated = estimatePostScore({ text: committedScoreText, platform: scorePlatform, postType: scorePostType });
  const liveEstimated = estimatePostScore({ text: editedText, platform: scorePlatform, postType: scorePostType });

  const prevScoreTextRef = useRef(committedScoreText);
  const [scoreDelta, setScoreDelta] = useState<{ before: number; after: number } | null>(null);

  useEffect(() => {
    if (prevScoreTextRef.current !== committedScoreText) {
      const before = estimatePostScore({ text: prevScoreTextRef.current, platform: scorePlatform, postType: scorePostType }).score;
      const after = estimatePostScore({ text: committedScoreText, platform: scorePlatform, postType: scorePostType }).score;
      prevScoreTextRef.current = committedScoreText;
      setScoreDelta(before !== after ? { before, after } : null);
    }
  }, [committedScoreText, scorePlatform, scorePostType]);

  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = slides && slides.length > 0 ? slides[activeSlide] : null;
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isGeneratingBroll, setIsGeneratingBroll] = useState(false);
  const [videoActionError, setVideoActionError] = useState<string | null>(null);
  const toast = useToast();
  const promptAction = usePrompt();

  useEffect(() => {
    setEditedText(caption);
  }, [caption]);

  useEffect(() => {
    if (isExternalEditing) {
      setEditedText(caption);
    }
  }, [caption, isExternalEditing]);

  const handleReelVideoUpload = async (file: File) => {
    setVideoActionError(null);
    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portal/content-pipeline/upload-video", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onAttachVideo?.(data.url, "upload");
      } else {
        setVideoActionError(data.error || "Video upload failed.");
      }
    } catch (err) {
      console.error("Reel video upload failed:", err);
      setVideoActionError("Video upload failed. Please check your connection and try again.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleGenerateBroll = async () => {
    setVideoActionError(null);
    setIsGeneratingBroll(true);
    try {
      const res = await fetch("/api/portal/content-pipeline/generate-reel-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || caption, script }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        onAttachVideo?.(data.url, "ai-broll");
      } else {
        setVideoActionError(data.error || "B-roll generation failed.");
      }
    } catch (err) {
      console.error("Reel b-roll generation failed:", err);
      setVideoActionError("B-roll generation failed. Please check your connection and try again.");
    } finally {
      setIsGeneratingBroll(false);
    }
  };

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

        <EstimatedScoreBadge score={estimated.score} tips={estimated.tips} delta={scoreDelta} />

        {/* Custom Formats Renders */}
        {isStory && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-md bg-gradient-to-b from-slate-900 to-slate-950 w-full aspect-[9/16] max-w-[210px] mx-auto group">
            <img
              src={attachedImageUrl || "/images/templates/vertical-story-template.png"}
              alt="Story Preview Background"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-6 left-2 right-2 bg-black/70 backdrop-blur-md border border-white/10 p-2.5 rounded-lg text-center shadow-lg">
              <p className="text-[10px] font-sans text-white/90 font-medium leading-relaxed">
                {caption || "New update from Lincolnshire Knee Clinic"}
              </p>
            </div>
            <div className="absolute top-2 left-2 bg-primary-navy/95 backdrop-blur text-[9px] text-clinical-teal font-mono px-2 py-0.5 rounded border border-white/10">
              📱 Story Preview
            </div>
          </div>
        )}
        {isStory && (
          <div className="flex justify-center">
            <button
              onClick={() =>
                openSocialPreview("story", {
                  caption,
                  imageUrl: attachedImageUrl || "/images/templates/vertical-story-template.png",
                })
              }
              className="text-[10px] text-clinical-teal hover:underline cursor-pointer font-medium"
            >
              🔍 Preview in new window
            </button>
          </div>
        )}

        {isCarousel && currentSlide && (
          <div className="space-y-3 bg-primary-navy/50 p-4 rounded-xl border border-white/5 animate-fadeIn">
            <div className="flex justify-between items-center text-[10px] text-[#A8C0CC]">
              <span className="font-semibold text-clinical-teal">Slide {activeSlide + 1} of {slides!.length}</span>
              <button
                onClick={() => openSocialPreview("carousel", { slides })}
                className="text-clinical-teal hover:underline cursor-pointer font-medium"
              >
                🔍 Preview all slides
              </button>
            </div>

            {currentSlide.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-md group">
                <img
                  src={currentSlide.imageUrl}
                  alt={`Slide ${activeSlide + 1} Visual`}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="bg-primary-navy/70 border border-dashed border-white/20 rounded-lg p-3 text-center text-[10px] text-white/40 italic">
                No image attached for Slide {activeSlide + 1}
              </div>
            )}

            {!isPublished && (
              <div className="flex justify-end gap-1.5">
                <label className="bg-white/10 hover:bg-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors cursor-pointer font-medium border border-white/10">
                  Upload Slide
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
                          onAttachImage?.(data.url, activeSlide);
                        }
                      } catch (err) {
                        console.error("Slide image upload failed:", err);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {onGenerateImage && (
                  <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors font-medium cursor-pointer disabled:opacity-50"
                  >
                    ✨ Generate
                  </button>
                )}
              </div>
            )}

            <div className="text-[10px] text-white/60 italic bg-primary-navy/80 p-2 rounded border border-white/5 leading-relaxed">
              <strong>Visual Concept:</strong> {currentSlide.imagePromptSuggestion}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-clinical-teal">Slide Text Overlay:</span>
              <div className="bg-primary-navy border border-white/10 p-2.5 rounded-lg text-xs text-white font-sans leading-normal font-semibold text-center select-all cursor-pointer" title="Click to select all">
                "{currentSlide.text}"
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                disabled={activeSlide === 0}
                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                className="bg-white/5 hover:bg-white/10 text-white text-[10px] px-3 py-1 rounded disabled:opacity-30 cursor-pointer"
              >
                ◀ Prev
              </button>
              <button
                disabled={activeSlide === slides!.length - 1}
                onClick={() => setActiveSlide(prev => Math.min(slides!.length - 1, prev + 1))}
                className="bg-white/5 hover:bg-white/10 text-white text-[10px] px-3 py-1 rounded disabled:opacity-30 cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        {isReel && (
          <div className="space-y-3 bg-primary-navy/50 p-4 rounded-xl border border-white/5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5 text-clinical-teal uppercase tracking-wider text-[10px] font-bold">
                <span>🎬</span>
                <span>Reel script outline</span>
              </span>
              <button
                onClick={() => openSocialPreview("reel", { caption, imageUrl: attachedImageUrl || undefined, script })}
                className="text-[10px] text-clinical-teal hover:underline cursor-pointer font-medium"
              >
                🔍 Preview
              </button>
            </div>

            <div className="bg-primary-navy p-3 rounded-lg border border-white/10 text-[11px] text-white/80 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
              {script || caption || "No script outline available."}
            </div>

            <div className="space-y-2 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-clinical-teal uppercase tracking-wider text-[10px] font-bold">
                <span>🎥</span>
                <span>Reel Video</span>
              </span>

              {attachedVideoUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-md max-w-[210px] mx-auto">
                    <video
                      src={attachedVideoUrl}
                      controls
                      className="w-full aspect-[9/16] object-cover bg-black"
                    />
                    <div className="absolute top-2 left-2 bg-primary-navy/95 backdrop-blur text-[9px] text-clinical-teal font-mono px-2 py-0.5 rounded border border-white/10">
                      {videoSource === "ai-broll" ? "🎞️ AI B-Roll" : "📤 Uploaded"}
                    </div>
                  </div>
                  {!isPublished && (
                    <div className="flex justify-end gap-1.5">
                      <label className="bg-white/10 hover:bg-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors cursor-pointer font-medium border border-white/10">
                        {isUploadingVideo ? "Uploading..." : "Replace with Upload"}
                        <input
                          type="file"
                          accept="video/*"
                          disabled={isUploadingVideo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReelVideoUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        disabled={isGeneratingBroll}
                        onClick={handleGenerateBroll}
                        className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors font-medium cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingBroll ? "Generating... (~1-2 min)" : "🎞️ Regenerate B-Roll"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !isPublished && (
                  <div className="space-y-2">
                    <div className="bg-primary-navy/70 border border-dashed border-white/20 rounded-lg p-3 text-center text-[10px] text-white/40 italic">
                      No video attached yet
                    </div>
                    <div className="flex justify-center gap-1.5">
                      <label className="bg-white/10 hover:bg-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2.5 py-1.5 rounded transition-colors cursor-pointer font-medium border border-white/10">
                        {isUploadingVideo ? "Uploading..." : "📤 Upload Video"}
                        <input
                          type="file"
                          accept="video/*"
                          disabled={isUploadingVideo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReelVideoUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        disabled={isGeneratingBroll}
                        onClick={handleGenerateBroll}
                        className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2.5 py-1.5 rounded transition-colors font-medium cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingBroll ? "Generating... (~1-2 min)" : "🎞️ Generate AI B-Roll"}
                      </button>
                    </div>
                  </div>
                )
              )}

              {videoActionError && (
                <div className="text-[10px] text-red-300 bg-red-900/20 border border-red-500/20 rounded-lg p-2">
                  {videoActionError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Standard media attachments for standard platforms and stories */}
        {!isCarousel && !isReel && (
          <>
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
                      onClick={async () => {
                        const url = await promptAction(`Enter direct image URL for ${platformLabel}:`);
                        if (url) {
                          onAttachImage?.(url);
                        }
                      }}
                      className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors font-medium cursor-pointer"
                    >
                      Paste URL
                    </button>
                    {onGenerateImage && (
                      <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2 py-1 rounded transition-colors font-medium cursor-pointer disabled:opacity-50"
                      >
                        ✨ Generate
                      </button>
                    )}
                  </div>
                )}
                {showManualUploadGuide && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => downloadImageFile(attachedImageUrl, `${platformKey}-post-image`, toast.error)}
                      className="text-[9px] text-clinical-teal hover:underline cursor-pointer font-medium"
                    >
                      ⬇ Download Image
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
                      onClick={async () => {
                        const url = await promptAction(`Enter direct image URL for ${platformLabel}:`);
                        if (url) {
                          onAttachImage?.(url);
                        }
                      }}
                      className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      Paste URL
                    </button>
                    {onGenerateImage && (
                      <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="border border-white/20 text-[#A8C0CC] hover:text-white text-[9px] px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
                      >
                        ✨ Generate
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {isCardEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={isStory ? 3 : 6}
              className="w-full bg-primary-navy border border-white/20 text-white text-xs rounded-lg p-2.5 focus:border-clinical-teal focus:outline-none font-sans leading-relaxed"
            />
            <EstimatedScoreBadge score={liveEstimated.score} tips={liveEstimated.tips} live />
            <div className="flex justify-end gap-1.5">
              {!isPublished && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    onCancelExternalEdit?.();
                    onRequestRevision();
                  }}
                  className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer font-sans"
                >
                  🔄 Revision
                </button>
              )}
              <button
                onClick={() => {
                  setIsEditing(false);
                  onCancelExternalEdit?.();
                }}
                className="border border-white/20 hover:bg-white/5 text-white text-[11px] px-3 py-1 rounded-lg cursor-pointer"
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
                {status === "approved" || isPublished ? "Save" : "Save & Approve"}
              </button>
            </div>
          </div>
        ) : (
          !isCarousel && !isReel && (
            <div className="bg-primary-navy/80 p-3.5 rounded-lg border border-white/10 text-xs text-white/80 font-sans leading-relaxed whitespace-pre-wrap">
              {caption || "No content generated yet."}
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        {!isCardEditing && (
          <div className="flex items-center gap-1.5">
            {status !== "approved" && !isPublished ? (
              <>
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
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ✏️ Edit {isPublished ? "Published" : "Approved"} Post
              </button>
            )}
          </div>
        )}

        <button
          onClick={onCopy}
          className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{isCopied ? "✓ Copied!" : "📋 Copy Template Text"}</span>
        </button>
      </div>

      {showManualUploadGuide && status === "approved" && (
        <div className="bg-primary-navy/60 border border-clinical-teal/20 rounded-lg p-3 space-y-1.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
            Ready to post — do it manually in {platformLabel}
          </span>
          <ol className="text-[10px] text-white/70 leading-relaxed list-decimal list-inside space-y-0.5">
            {isCarousel ? (
              <>
                <li>Click slide navigation buttons to copy and compile your slides.</li>
                <li>Ensure you download and save each slide image assets to your device.</li>
                <li>Create a Carousel (multiple photos) post in Instagram.</li>
              </>
            ) : isStory ? (
              <>
                <li>Download the vertical Story background image to your phone/device.</li>
                <li>Copy the overlay caption text to your clipboard.</li>
                <li>Add a new Story in Instagram, select the background image, and overlay the text.</li>
              </>
            ) : isReel ? (
              <>
                <li>Copy the Reel voiceover and visual outline script.</li>
                <li>Record your video using the talking points and visual action directions.</li>
                <li>Upload the video clip to Instagram Reels with the recommended cover thumbnail.</li>
              </>
            ) : (
              <>
                <li>Click "⬇ Download Image" above to save the picture to your device.</li>
                <li>Click "📋 Copy" above to copy the caption text.</li>
                <li>Open the {platformLabel} app (or website).</li>
                <li>Start a new post, add the downloaded image, then paste the caption.</li>
                <li>Review it looks right, then publish.</li>
              </>
            )}
          </ol>
        </div>
      )}

      {status === "approved" && platformKey !== "linkedin" && sourceType && sourceId && (
        <PerformancePanel platformKey={platformKey} sourceType={sourceType} sourceId={sourceId} caption={caption} />
      )}

      <GenerateImageModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        contentType={isStory ? "story" : isCarousel ? "carousel" : isReel ? "reel" : "post"}
        contextHints={{
          imageTitle: (isCarousel ? currentSlide?.imagePromptSuggestion : imagePromptSuggestion) || undefined,
          altText: caption || undefined,
          section: platformLabel,
        }}
        onGenerated={(result) => {
          onAttachImage?.(result.url, isCarousel ? activeSlide : undefined);
          setIsGenerateModalOpen(false);
        }}
      />
    </div>
  );
}
