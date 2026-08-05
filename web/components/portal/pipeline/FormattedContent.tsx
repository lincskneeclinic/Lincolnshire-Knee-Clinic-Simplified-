"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import GenerateImageModal from "@/components/portal/GenerateImageModal";
import { useToast, usePrompt } from "@/components/portal/DashboardFeedback";
import { cleanHeadingBugs } from "@/lib/contentPipelineFormatting";

/**
 * Recursively flattens a React children tree back into plain text. Used to
 * recover the literal source text of a rendered markdown paragraph (e.g. to
 * detect "[IMAGE PLACEHOLDER: ...]" markers) — a single-level extraction
 * breaks as soon as the paragraph contains any nested inline formatting
 * (emphasis, nested spans, etc.), silently truncating or garbling the text.
 */
function extractPlainText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractPlainText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractPlainText(props?.children);
  }
  return "";
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
      {/* Deliberately always column layout (not a viewport-width sm: breakpoint) — this
          renders inside a narrow, fixed-width preview pane regardless of how wide the
          browser window is, so a viewport-based breakpoint here caused the two rows to
          collapse into an overlapping single line. */}
      <div className="border-t border-white/5 pt-4 flex flex-col items-center gap-3 text-[10px] text-white/60">
        <div className="flex items-center gap-2">
          <img
            src="/brand/lkc-logo-k-transparent.png"
            alt="Lincolnshire Knee Clinic Logo"
            className="w-6 h-6 object-contain shrink-0"
          />
          <span className="font-serif font-bold text-white">Lincolnshire Knee Clinic</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center text-center text-[5px]">
          <span>Lead Consultant: Mr Ricardo J Pacheco (GMC 4145976)</span>
          <span>📞 07770 473437</span>
          <span>✉ info@lincsknee.com</span>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Formatted Content Preview
export function FormattedContent({
  body,
  body_markdown,
  suggestedImages,
  onAttachPlaceholder,
  references,
  generatingPlaceholderId,
  pendingPreview,
  onGenerateImage,
  onResetPlaceholder,
  onRemovePlaceholder,
  onRemoveResolvedImage,
  lightMode = false
}: {
  body?: string;
  body_markdown?: string;
  suggestedImages?: any[];
  onAttachPlaceholder?: (placeholderId: string, label: string, url: string, isFeatured?: boolean) => void;
  references?: string[];
  generatingPlaceholderId?: string | null;
  pendingPreview?: { placeholderId: string; url: string } | null;
  onGenerateImage?: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onResetPlaceholder?: (altText: string, srcUrl: string) => void;
  onRemovePlaceholder?: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onRemoveResolvedImage?: (altText: string, srcUrl: string) => void;
  lightMode?: boolean;
}) {
  const [activeGeneratePlaceholder, setActiveGeneratePlaceholder] = useState<
    { placeholderId: string; label: string; isFeatured?: boolean } | null
  >(null);
  const toast = useToast();
  const promptAction = usePrompt();

  const content = cleanHeadingBugs(body_markdown || body || "");
  if (!content) return null;

  // Assigns a stable, position-based id to each inline placeholder as it's
  // encountered during this render pass ("placeholder-1", "placeholder-2", ...),
  // matching the order blogWriterAgent.ts numbers them in. Matching by position
  // instead of by label text means the image still lands correctly even if the
  // label wording drifts slightly from what's stored in suggestedImages.
  let inlinePlaceholderCounter = 0;

  return (
    <div className="markdown-content space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ children }) => (
            <div className={`overflow-x-auto my-4 rounded-lg border ${lightMode ? "border-border-clinical/30" : "border-white/10"}`}>
              <table className={`min-w-full divide-y text-[9.5px] leading-normal ${lightMode ? "divide-border-clinical/30 text-text-secondary" : "divide-white/10 text-white/80"}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className={lightMode ? "bg-[#f0f9ff]" : "bg-primary-navy"}>{children}</thead>,
          tbody: ({ children }) => <tbody className={`divide-y ${lightMode ? "divide-border-clinical/20 bg-white" : "divide-white/5 bg-dark-overlay-navy/40"}`}>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className={`px-3 py-2 text-left font-serif font-bold tracking-wider border-r last:border-r-0 ${lightMode ? "text-deep-navy border-border-clinical/20" : "text-white border-white/10"}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-3 py-2 whitespace-normal border-r last:border-r-0 ${lightMode ? "text-text-secondary border-border-clinical/10" : "text-white/80 border-white/5"}`}>
              {children}
            </td>
          ),
          h1: ({ children }) => <h1 className={`font-serif font-bold pt-3 border-b pb-1 mb-2 ${lightMode ? "text-xl md:text-2xl text-deep-navy border-border-clinical/30" : "text-base text-white border-white/10"}`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`font-serif font-bold pt-3 border-b pb-1 mb-2 ${lightMode ? "text-lg md:text-xl text-deep-navy border-border-clinical/30" : "text-sm text-white border-white/10"}`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`font-serif font-bold pt-2 border-b pb-1 mb-2 ${lightMode ? "text-base md:text-lg text-deep-navy border-border-clinical/30" : "text-xs text-white border-white/10"}`}>{children}</h3>,
          h4: ({ children }) => <h4 className={`font-serif font-bold pt-2 pb-1 mb-1 ${lightMode ? "text-sm text-deep-navy" : "text-[11px] text-white"}`}>{children}</h4>,
          p: ({ children }) => {
            const text = extractPlainText(children);

            if (text.includes("[NEEDS CLINICAL REVIEW]")) {
              return (
                <div className="bg-dark-overlay-navy border-l-4 border-amber-500/70 text-amber-200/90 p-3.5 rounded-r-lg my-3 flex items-start gap-2.5 shadow-sm">
                  <span className="text-amber-400/80 shrink-0">⚠️</span>
                  <div className="leading-relaxed text-[9px]">{children}</div>
                </div>
              );
            }

            const placeholderRegex = /^\[(FEATURED IMAGE PLACEHOLDER|IMAGE PLACEHOLDER):\s*(.*?)\]$/i;
            const match = text.trim().match(placeholderRegex);
            if (match) {
              const isFeatured = match[1].toUpperCase() === "FEATURED IMAGE PLACEHOLDER";
              const label = match[2].trim();
              const placeholderId = isFeatured ? "featured-image" : `placeholder-${++inlinePlaceholderCounter}`;
              const resolvedImage = (suggestedImages || []).find(
                (item) => typeof item === "object" && item !== null && item.placeholderId === placeholderId
              );

              if (resolvedImage && resolvedImage.url) {
                return (
                  <div className="my-4 space-y-1.5 text-center">
                    <img
                      src={resolvedImage.url}
                      alt={label}
                      className="mx-auto rounded-xl border border-white/10 shadow-lg max-h-80 object-contain bg-white/5"
                      style={{ aspectRatio: "16 / 9", width: "100%" }}
                    />
                    <span className="text-[10px] text-white/50 italic block">
                      {isFeatured ? "🖼️ Featured Image (Education Hub card)" : "📷 Inline Image"}: {label}
                    </span>
                  </div>
                );
              }

              const isGeneratingThis = generatingPlaceholderId === placeholderId;
              const previewForThis = pendingPreview?.placeholderId === placeholderId ? pendingPreview : null;

              return (
                <div className={`border border-dashed p-4 rounded-xl my-4 text-center space-y-3 ${isFeatured ? "border-amber-400/50 bg-amber-950/10" : "border-clinical-teal/40 bg-primary-navy/40"}`}>
                  <div className={`text-[10px] uppercase tracking-wider font-semibold ${isFeatured ? "text-amber-300" : "text-clinical-teal"}`}>
                    {isFeatured ? "🖼️ Featured Image — used as this article's Education Hub card" : "📷 Suggested Image Placement"}
                  </div>
                  <p className="text-[11px] text-white/90 italic">"{label}"</p>

                  {previewForThis ? (
                    <div className="space-y-2.5">
                      <img
                        src={previewForThis.url}
                        alt={label}
                        className="mx-auto rounded-xl border border-white/10 shadow-lg object-contain bg-white/5"
                        style={{ aspectRatio: "16 / 9", width: "100%", maxHeight: "14rem" }}
                      />
                      {onAttachPlaceholder && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => onAttachPlaceholder(placeholderId, label, previewForThis.url, isFeatured)}
                            className={`text-deep-navy text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium ${isFeatured ? "bg-amber-400 hover:bg-amber-300" : "bg-clinical-teal hover:bg-clinical-teal-hover"}`}
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => setActiveGeneratePlaceholder({ placeholderId, label, isFeatured })}
                            className="border border-white/20 text-white/80 hover:bg-white/5 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium disabled:opacity-50"
                          >
                            🔄 Regenerate
                          </button>
                          {onRemovePlaceholder && (
                            <button
                              onClick={() => onRemovePlaceholder(placeholderId, label, isFeatured)}
                              className="border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                            >
                              🗑️ Delete Placeholder
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    onAttachPlaceholder && (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <label className={`text-deep-navy text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium ${isFeatured ? "bg-amber-400 hover:bg-amber-300" : "bg-clinical-teal hover:bg-clinical-teal-hover"}`}>
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
                                  onAttachPlaceholder(placeholderId, label, data.url, isFeatured);
                                } else {
                                  toast.error(`Image upload failed: ${data.error || "Unknown error"}`);
                                }
                              } catch (err) {
                                console.error("Placeholder upload failed:", err);
                                toast.error("Image upload failed. Please check your connection and try again.");
                              } finally {
                                e.target.value = "";
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={async () => {
                            const url = await promptAction("Enter the direct image URL:");
                            if (url) {
                              onAttachPlaceholder(placeholderId, label, url, isFeatured);
                            }
                          }}
                          className="border border-white/20 text-white/80 hover:bg-white/5 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium"
                        >
                          Paste URL
                        </button>
                        <button
                          onClick={() => setActiveGeneratePlaceholder({ placeholderId, label, isFeatured })}
                          className="border border-white/20 text-white/80 hover:bg-white/5 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          ✨ Generate Image
                        </button>
                        {onRemovePlaceholder && (
                          <button
                            onClick={() => onRemovePlaceholder(placeholderId, label, isFeatured)}
                            className="border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 text-[10px] px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                          >
                            🗑️ Delete Placeholder
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              );
            }

            return <p className={lightMode ? "font-medium text-text-secondary leading-relaxed text-sm md:text-base my-4" : "leading-relaxed mb-3 text-white/80"}>{children}</p>;
          },
          ul: ({ children }) => <ul className={lightMode ? "space-y-2 bg-soft-blue/30 p-5 rounded-xl border border-border-clinical/30 my-4 text-xs md:text-sm list-disc list-inside" : "list-disc pl-5 space-y-1.5 mb-3 text-white/80"}>{children}</ul>,
          ol: ({ children }) => <ol className={lightMode ? "space-y-2 bg-soft-blue/30 p-5 rounded-xl border border-border-clinical/30 my-4 text-xs md:text-sm list-decimal list-inside" : "list-decimal pl-5 space-y-1.5 mb-3 text-white/80"}>{children}</ol>,
          li: ({ children }) => <li className={lightMode ? "font-medium text-text-secondary leading-relaxed" : "leading-relaxed"}>{children}</li>,
          hr: () => <hr className={lightMode ? "border-border-clinical/30 my-6" : "border-white/10 my-4"} />,
          strong: ({ children }) => <strong className={lightMode ? "font-bold text-deep-navy" : "font-bold text-white"}>{children}</strong>,
          em: ({ children }) => <em className={lightMode ? "italic text-text-secondary" : "italic text-white/80"}>{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className={lightMode 
              ? "border-l-4 border-clinical-teal pl-6 my-8 italic text-deep-navy font-medium text-base md:text-lg bg-pale-clinical-blue/20 py-5 pr-6 rounded-r-xl shadow-sm"
              : "border-l-4 border-clinical-teal bg-dark-overlay-navy pl-4 py-2 italic text-white/80 my-3 rounded-r"}>
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => {
            const hasChangePermission = Boolean(onAttachPlaceholder);
            return (
              <div className="my-4 space-y-1.5 text-center relative group">
                <img
                  src={src || ""}
                  alt={alt || ""}
                  className="mx-auto rounded-xl border border-white/10 shadow-lg max-h-80 object-contain bg-white/5"
                  style={{ aspectRatio: "16 / 9", width: "100%" }}
                />
                {alt && (
                  <span className="text-[10px] text-white/50 italic block">
                    {alt}
                  </span>
                )}
                {hasChangePermission && onResetPlaceholder && src && typeof src === "string" && (
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      onClick={() => onResetPlaceholder(alt || "", src as string)}
                      className="bg-amber-500 hover:bg-amber-600 text-deep-navy text-[9px] font-semibold px-2.5 py-1 rounded transition-colors shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      🔄 Change Image
                    </button>
                    {onRemoveResolvedImage && (
                      <button
                        onClick={() => onRemoveResolvedImage(alt || "", src as string)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-semibold px-2.5 py-1 rounded transition-colors shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        🗑️ Delete Image
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {references && references.length > 0 && (
        <div className={`mt-6 border-t pt-4 ${lightMode ? "border-border-clinical/30" : "border-white/10"}`}>
          <span className={`block mb-2 ${lightMode ? "font-serif text-base font-bold text-deep-navy border-b border-border-clinical/20 pb-1" : "text-[10px] font-bold uppercase tracking-wider text-white/50"}`}>
            References
          </span>
          <ol className={`list-decimal pl-5 space-y-1 text-[11px] leading-relaxed ${lightMode ? "text-text-secondary" : "text-white/70"}`}>
            {references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ol>
        </div>
      )}
      {!lightMode && <ArticleFooterTemplate />}

      <GenerateImageModal
        isOpen={!!activeGeneratePlaceholder}
        onClose={() => setActiveGeneratePlaceholder(null)}
        contextHints={{
          imageTitle: activeGeneratePlaceholder?.label,
          placeholderLabel: activeGeneratePlaceholder?.label,
          section: activeGeneratePlaceholder?.isFeatured ? "Featured Image" : "Inline Image",
        }}
        onGenerated={(result) => {
          if (activeGeneratePlaceholder) {
            onAttachPlaceholder?.(
              activeGeneratePlaceholder.placeholderId,
              activeGeneratePlaceholder.label,
              result.url,
              activeGeneratePlaceholder.isFeatured
            );
          }
          setActiveGeneratePlaceholder(null);
        }}
      />
    </div>
  );
}
