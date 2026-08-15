"use client";

import { useEffect, useState } from "react";

export interface GenerateImageContextHints {
  pageTitle?: string;
  pageCategory?: string;
  sectionHeading?: string;
  imageTitle?: string;
  altText?: string;
  placeholderLabel?: string;
  topic?: string;
  page?: string;
  section?: string;
}

export interface GeneratedImageResult {
  url: string;
  assetId: string;
}

type ImageFormat = "desktop" | "tablet" | "mobile-square" | "mobile-portrait" | "instagram-portrait";
type ImageStyle = "illustration" | "photo";

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: "desktop", label: "Desktop Landscape (16:9)" },
  { value: "tablet", label: "Tablet (4:3)" },
  { value: "mobile-square", label: "Mobile Square (1:1)" },
  { value: "mobile-portrait", label: "Mobile Portrait (9:16)" },
  { value: "instagram-portrait", label: "Instagram Feed Portrait (4:5)" },
];

export type GenerateImageContentType = "blog" | "story" | "post" | "reel" | "carousel";

// Sensible default aspect ratio per surface — still fully overridable via the
// Format dropdown, this just saves re-selecting it every time for the common case.
// Carousel defaults to Instagram's own recommended 4:5 feed portrait (more
// vertical space in-feed than 1:1, better engagement). "post" is shared
// across Instagram/Facebook/LinkedIn single-image posts, not Instagram-only,
// so it keeps the safer cross-platform square default.
const DEFAULT_FORMAT_BY_CONTENT_TYPE: Record<GenerateImageContentType, ImageFormat> = {
  blog: "desktop",
  story: "mobile-portrait",
  reel: "mobile-portrait",
  carousel: "instagram-portrait",
  post: "mobile-square",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextHints: GenerateImageContextHints;
  contentType?: GenerateImageContentType;
  onGenerated: (result: GeneratedImageResult) => void;
}

export default function GenerateImageModal({ isOpen, onClose, contextHints, contentType = "blog", onGenerated }: Props) {
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [subjectTitle, setSubjectTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [filename, setFilename] = useState("");
  const [altText, setAltText] = useState("");
  const [format, setFormat] = useState<ImageFormat>("desktop");
  const [style, setStyle] = useState<ImageStyle>("photo");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [addLogo, setAddLogo] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [overwriteInfo, setOverwriteInfo] = useState<{ existingUrl: string } | null>(null);

  const fetchPrompt = (formatOverride: ImageFormat, styleOverride?: ImageStyle) => {
    setLoadError(null);
    setIsLoadingPrompt(true);

    fetch("/api/portal/content-pipeline/build-image-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contextHints, format: formatOverride, style: styleOverride }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategory(data.category);
          setCategoryLabel(data.categoryLabel);
          setSubjectTitle(data.subjectTitle);
          setPrompt(data.prompt);
          setNegativePrompt(data.negativePrompt);
          setFilename(data.proposedFilename);
          setAltText(data.proposedAltText);
          setStyle(data.style);
        } else {
          setLoadError(data.error || "Failed to build the image prompt.");
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Network error while building the image prompt.");
      })
      .finally(() => setIsLoadingPrompt(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    setGenerateError(null);
    setOverwriteInfo(null);

    const defaultFormat = DEFAULT_FORMAT_BY_CONTENT_TYPE[contentType];
    setFormat(defaultFormat);
    // Logo watermark makes sense on social content (branding, anti-repost);
    // less useful on blog images that already live on the clinic's own site.
    setAddLogo(contentType !== "blog");
    fetchPrompt(defaultFormat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleStyleChange = (newStyle: ImageStyle) => {
    if (newStyle === style) return;
    fetchPrompt(format, newStyle);
  };

  if (!isOpen) return null;

  const handleGenerate = async (confirmOverwrite: boolean = false) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      // Blog images stay WebP (good for site performance, never leave the
      // site). Everything social-bound (post/story/carousel/reel) needs a
      // format Instagram/Facebook/LinkedIn's manual upload flows and any
      // future Meta Graph API auto-posting will actually accept — WebP isn't
      // reliably supported there, so those default to JPEG instead. PNG is
      // still used whenever transparency is requested, since JPEG has no
      // alpha channel.
      const outputFormat = transparentBackground ? "png" : contentType !== "blog" ? "jpeg" : "webp";

      const res = await fetch("/api/portal/content-pipeline/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          aspectRatio: { desktop: "16:9", tablet: "4:3", "mobile-square": "1:1", "mobile-portrait": "9:16", "instagram-portrait": "4:5" }[format],
          category,
          subjectTitle,
          filename,
          altText,
          page: contextHints.page,
          section: contextHints.section,
          transparentBackground,
          addLogo,
          confirmOverwrite,
          format: outputFormat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onGenerated({ url: data.url, assetId: data.assetId });
        onClose();
      } else if (data.overwriteNeeded) {
        setOverwriteInfo({ existingUrl: data.existingUrl });
      } else {
        setGenerateError(data.error || "Failed to generate the image.");
      }
    } catch (err) {
      console.error(err);
      setGenerateError("Network error while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-primary-navy border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🖼️</span>
            <span>Generate Image</span>
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm cursor-pointer">✕</button>
        </div>

        {loadError && (
          <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs p-3 rounded-xl">
            {loadError}
          </div>
        )}

        {isLoadingPrompt ? (
          <div className="text-center text-white/50 text-xs py-10">Reading medical imagery guidelines…</div>
        ) : !loadError ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-3">
                <span className="block text-white/50 uppercase tracking-wider text-[10px] mb-1">Detected Context</span>
                <span className="text-white/90">
                  {[contextHints.topic, contextHints.pageTitle, contextHints.placeholderLabel, contextHints.imageTitle]
                    .filter(Boolean)[0] || "—"}
                </span>
              </div>
              <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-3">
                <span className="block text-white/50 uppercase tracking-wider text-[10px] mb-1">Prompt Category</span>
                <span className="text-clinical-teal font-medium">{categoryLabel} — {subjectTitle}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStyleChange("photo")}
                  disabled={isLoadingPrompt}
                  className={`flex-1 text-xs font-semibold px-3 py-2 rounded-xl border cursor-pointer transition-colors disabled:opacity-50 ${
                    style === "photo"
                      ? "bg-clinical-teal/15 border-clinical-teal text-clinical-teal"
                      : "border-white/15 text-white/70 hover:border-white/30"
                  }`}
                >
                  📷 Photograph
                </button>
                <button
                  type="button"
                  onClick={() => handleStyleChange("illustration")}
                  disabled={isLoadingPrompt}
                  className={`flex-1 text-xs font-semibold px-3 py-2 rounded-xl border cursor-pointer transition-colors disabled:opacity-50 ${
                    style === "illustration"
                      ? "bg-clinical-teal/15 border-clinical-teal text-clinical-teal"
                      : "border-white/15 text-white/70 hover:border-white/30"
                  }`}
                >
                  🎨 Illustration
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Image Prompt (editable)</label>
              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-dark-overlay-navy border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Negative Prompt</label>
              <textarea
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full bg-dark-overlay-navy border border-white/15 text-white/80 text-[11px] rounded-xl p-3 focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/80">Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full bg-dark-overlay-navy border border-white/15 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-clinical-teal"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/80">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImageFormat)}
                  className="w-full bg-dark-overlay-navy border border-white/15 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-clinical-teal cursor-pointer"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">Alt Text</label>
              <textarea
                rows={2}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full bg-dark-overlay-navy border border-white/15 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={transparentBackground}
                onChange={(e) => setTransparentBackground(e.target.checked)}
                className="w-4 h-4 accent-clinical-teal cursor-pointer"
              />
              <span className="text-xs text-white/90">Transparent background asset (best effort — not guaranteed by the model)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={addLogo}
                onChange={(e) => setAddLogo(e.target.checked)}
                className="w-4 h-4 accent-clinical-teal cursor-pointer"
              />
              <span className="text-xs text-white/90">Add Lincolnshire Knee Clinic logo (top-right)</span>
            </label>

            {overwriteInfo && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl space-y-2">
                <p>An image named "{filename}" already exists.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerating}
                    className="border border-amber-400/50 hover:border-amber-400 text-amber-200 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    Overwrite it
                  </button>
                  <button
                    onClick={() => setOverwriteInfo(null)}
                    className="border border-white/20 hover:border-white/40 text-white/80 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Choose a different filename
                  </button>
                </div>
              </div>
            )}

            {generateError && (
              <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs p-3 rounded-xl">
                {generateError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating || !prompt.trim() || !!overwriteInfo}
                className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Generating…
                  </>
                ) : (
                  "✨ Generate"
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
