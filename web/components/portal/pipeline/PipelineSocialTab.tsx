"use client";

import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { ContentPipelineRun } from "@/lib/contentPipeline";
import { PlatformCard } from "@/components/portal/social/PlatformCard";
import { downloadImageFile } from "@/lib/downloadImageFile";
import { useToast } from "@/components/portal/DashboardFeedback";

type PlatformKey = "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
type SocialSubTab = "feed" | "story" | "carousel" | "reel" | "brandkit";

interface PipelineSocialTabProps {
  selectedRun: ContentPipelineRun;
  selectedRunHasSocial: boolean;
  activeSubTab: SocialSubTab;
  onSubTabChange: (tab: SocialSubTab) => void;
  editingPlatform: PlatformKey | null;
  onCancelExternalEdit: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  generatingSocialImageKey: string | null;
  onGeneratingSocialImageKeyChange: (key: string) => void;
  onReviewSubmission: (
    stage: "blog" | "social",
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social" | "save_progress",
    customPayload?: any,
    platform?: PlatformKey,
    keepEditMode?: boolean
  ) => void | Promise<void>;
  onOpenRevision: (platform: PlatformKey) => void;
  isBackfillingFormats: boolean;
  onGenerateMissingFormats: () => void;
}

function MissingFormatCta({
  label,
  isBackfillingFormats,
  onGenerateMissingFormats,
}: {
  label: string;
  isBackfillingFormats: boolean;
  onGenerateMissingFormats: () => void;
}) {
  return (
    <div className="max-w-md mx-auto bg-dark-overlay-navy border border-dashed border-white/20 rounded-xl p-6 text-center space-y-3 animate-fadeIn">
      <p className="text-xs text-white/60">
        This run was created before {label} content existed. Generate it now to review and approve it.
      </p>
      <button
        type="button"
        onClick={onGenerateMissingFormats}
        disabled={isBackfillingFormats}
        className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all disabled:opacity-60 cursor-pointer"
      >
        {isBackfillingFormats ? "Generating…" : `✨ Generate ${label}`}
      </button>
    </div>
  );
}

export function PipelineSocialTab({
  selectedRun,
  selectedRunHasSocial,
  activeSubTab,
  onSubTabChange,
  editingPlatform,
  onCancelExternalEdit,
  copiedKey,
  onCopy,
  generatingSocialImageKey,
  onGeneratingSocialImageKeyChange,
  onReviewSubmission,
  onOpenRevision,
  isBackfillingFormats,
  onGenerateMissingFormats,
}: PipelineSocialTabProps) {
  const toast = useToast();

  return (
    <div className="space-y-6">
      {selectedRunHasSocial ? (
        <>
          {/* Social Formats Sub-Tab Navigation */}
          <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
            {(["feed", "story", "carousel", "reel", "brandkit"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onSubTabChange(tab)}
                className={`text-xs font-semibold px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === tab
                    ? "border-clinical-teal text-clinical-teal font-bold"
                    : "border-transparent text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                {tab === "feed" && "Feed Posts"}
                {tab === "story" && "Instagram Story"}
                {tab === "carousel" && "Instagram Carousel"}
                {tab === "reel" && "Instagram Reel Script"}
                {tab === "brandkit" && "Brand Kit Templates"}
              </button>
            ))}
          </div>

          {/* Render Active Format Container */}
          {activeSubTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <PlatformCard
                platformKey="instagram"
                platformLabel="Instagram Post"
                icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                color=""
                borderColor=""
                caption={selectedRun.social_drafts[0]?.instagram?.caption || ""}
                status={selectedRun.social_drafts[0]?.instagram?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                attachedImageUrl={selectedRun.social_drafts[0]?.instagram?.imageUrl}
                isExternalEditing={editingPlatform === "instagram"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "instagram")}
                onSaveEdit={(newCaption) => onReviewSubmission("social", "edited", { caption: newCaption }, "instagram")}
                onRequestRevision={() => onOpenRevision("instagram")}
                onCopy={() => onCopy(selectedRun.social_drafts[0]?.instagram?.caption || "", "ig")}
                isCopied={copiedKey === "ig"}
                onAttachImage={(url) => {
                  const latestSocial = selectedRun.social_drafts[0];
                  const customPayload = {
                    ...latestSocial,
                    instagram: {
                      ...latestSocial.instagram,
                      imageUrl: url,
                    },
                  };
                  onReviewSubmission("social", "edited", customPayload, "instagram");
                }}
                imagePromptSuggestion={selectedRun.social_drafts[0]?.instagram?.imagePromptSuggestion}
                onGenerateImage={async (prompt) => {
                  onGeneratingSocialImageKeyChange(`${selectedRun.id}-instagram`);
                  try {
                    const res = await fetch("/api/portal/content-pipeline/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, runId: selectedRun.run_id }),
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      const latestSocial = selectedRun.social_drafts[0];
                      const customPayload = {
                        ...latestSocial,
                        instagram: {
                          ...latestSocial.instagram,
                          imageUrl: data.url,
                        },
                      };
                      await onReviewSubmission("social", "edited", customPayload, "instagram");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    onGeneratingSocialImageKeyChange("");
                  }
                }}
                isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-instagram`}
                showManualUploadGuide
              />

              <PlatformCard
                platformKey="facebook"
                platformLabel="Facebook Post"
                icon={<FaFacebook className="w-4 h-4 text-[#1877F2]" />}
                color=""
                borderColor=""
                caption={selectedRun.social_drafts[0]?.facebook?.caption || ""}
                status={selectedRun.social_drafts[0]?.facebook?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                attachedImageUrl={selectedRun.social_drafts[0]?.facebook?.imageUrl}
                isExternalEditing={editingPlatform === "facebook"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "facebook")}
                onSaveEdit={(newCaption) => onReviewSubmission("social", "edited", { caption: newCaption }, "facebook")}
                onRequestRevision={() => onOpenRevision("facebook")}
                onCopy={() => onCopy(selectedRun.social_drafts[0]?.facebook?.caption || "", "fb")}
                isCopied={copiedKey === "fb"}
                onAttachImage={(url) => {
                  const latestSocial = selectedRun.social_drafts[0];
                  const customPayload = {
                    ...latestSocial,
                    facebook: {
                      ...latestSocial.facebook,
                      imageUrl: url,
                    },
                  };
                  onReviewSubmission("social", "edited", customPayload, "facebook");
                }}
                imagePromptSuggestion={selectedRun.social_drafts[0]?.facebook?.imagePromptSuggestion}
                onGenerateImage={async (prompt) => {
                  onGeneratingSocialImageKeyChange(`${selectedRun.id}-facebook`);
                  try {
                    const res = await fetch("/api/portal/content-pipeline/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, runId: selectedRun.run_id }),
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      const latestSocial = selectedRun.social_drafts[0];
                      const customPayload = {
                        ...latestSocial,
                        facebook: {
                          ...latestSocial.facebook,
                          imageUrl: data.url,
                        },
                      };
                      await onReviewSubmission("social", "edited", customPayload, "facebook");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    onGeneratingSocialImageKeyChange("");
                  }
                }}
                isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-facebook`}
                showManualUploadGuide
              />

              <PlatformCard
                platformKey="linkedin"
                platformLabel="LinkedIn Post"
                icon={<FaLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                color=""
                borderColor=""
                caption={selectedRun.social_drafts[0]?.linkedin?.caption || ""}
                status={selectedRun.social_drafts[0]?.linkedin?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                attachedImageUrl={selectedRun.social_drafts[0]?.linkedin?.imageUrl}
                isExternalEditing={editingPlatform === "linkedin"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "linkedin")}
                onSaveEdit={(newCaption) => onReviewSubmission("social", "edited", { caption: newCaption }, "linkedin")}
                onRequestRevision={() => onOpenRevision("linkedin")}
                onCopy={() => onCopy(selectedRun.social_drafts[0]?.linkedin?.caption || "", "li")}
                isCopied={copiedKey === "li"}
                onAttachImage={(url) => {
                  const latestSocial = selectedRun.social_drafts[0];
                  const customPayload = {
                    ...latestSocial,
                    linkedin: {
                      ...latestSocial.linkedin,
                      imageUrl: url,
                    },
                  };
                  onReviewSubmission("social", "edited", customPayload, "linkedin");
                }}
                imagePromptSuggestion={selectedRun.social_drafts[0]?.linkedin?.imagePromptSuggestion}
                onGenerateImage={async (prompt) => {
                  onGeneratingSocialImageKeyChange(`${selectedRun.id}-linkedin`);
                  try {
                    const res = await fetch("/api/portal/content-pipeline/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, runId: selectedRun.run_id }),
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      const latestSocial = selectedRun.social_drafts[0];
                      const customPayload = {
                        ...latestSocial,
                        linkedin: {
                          ...latestSocial.linkedin,
                          imageUrl: data.url,
                        },
                      };
                      await onReviewSubmission("social", "edited", customPayload, "linkedin");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    onGeneratingSocialImageKeyChange("");
                  }
                }}
                isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-linkedin`}
                showManualUploadGuide
              />
            </div>
          )}

          {activeSubTab === "story" && (
            <div className="max-w-md mx-auto animate-fadeIn">
              <PlatformCard
                platformKey="instagramStory"
                platformLabel="Instagram Story"
                icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                color=""
                borderColor=""
                caption={
                  selectedRun.social_drafts[0]?.instagramStory?.caption ||
                  `New guide: ${selectedRun.blog_drafts[0]?.title || selectedRun.topic}!`
                }
                status={selectedRun.social_drafts[0]?.instagramStory?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                attachedImageUrl={selectedRun.social_drafts[0]?.instagramStory?.imageUrl}
                isExternalEditing={editingPlatform === "instagramStory"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "instagramStory")}
                onSaveEdit={(newCaption) => onReviewSubmission("social", "edited", { caption: newCaption }, "instagramStory")}
                onRequestRevision={() => onOpenRevision("instagramStory")}
                onCopy={() => onCopy(selectedRun.social_drafts[0]?.instagramStory?.caption || "", "story")}
                isCopied={copiedKey === "story"}
                onAttachImage={(url) => {
                  const latestSocial = selectedRun.social_drafts[0];
                  const customPayload = {
                    ...latestSocial,
                    instagramStory: {
                      ...(latestSocial.instagramStory || { caption: "", status: "pending" }),
                      imageUrl: url,
                    },
                  };
                  onReviewSubmission("social", "edited", customPayload, "instagramStory");
                }}
                imagePromptSuggestion={
                  selectedRun.social_drafts[0]?.instagramStory?.imagePromptSuggestion ||
                  `A premium vertical 9:16 background image for "${selectedRun.topic}"`
                }
                onGenerateImage={async (prompt) => {
                  onGeneratingSocialImageKeyChange(`${selectedRun.id}-instagramStory`);
                  try {
                    const res = await fetch("/api/portal/content-pipeline/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, runId: selectedRun.run_id, aspectRatio: "9:16" }),
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      const latestSocial = selectedRun.social_drafts[0];
                      const customPayload = {
                        ...latestSocial,
                        instagramStory: {
                          ...(latestSocial.instagramStory || { caption: "", status: "pending" }),
                          imageUrl: data.url,
                        },
                      };
                      await onReviewSubmission("social", "edited", customPayload, "instagramStory");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    onGeneratingSocialImageKeyChange("");
                  }
                }}
                isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-instagramStory`}
                showManualUploadGuide
              />
            </div>
          )}

          {activeSubTab === "carousel" && (selectedRun.social_drafts[0]?.instagramCarousel?.slides?.length || 0) === 0 && (
            <MissingFormatCta
              label="Instagram Carousel"
              isBackfillingFormats={isBackfillingFormats}
              onGenerateMissingFormats={onGenerateMissingFormats}
            />
          )}

          {activeSubTab === "carousel" && (selectedRun.social_drafts[0]?.instagramCarousel?.slides?.length || 0) > 0 && (
            <div className="max-w-xl mx-auto animate-fadeIn">
              <PlatformCard
                platformKey="instagramCarousel"
                platformLabel="Instagram Carousel"
                icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                color=""
                borderColor=""
                caption={selectedRun.social_drafts[0]?.instagramCarousel?.caption || ""}
                status={selectedRun.social_drafts[0]?.instagramCarousel?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                isExternalEditing={editingPlatform === "instagramCarousel"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "instagramCarousel")}
                onSaveEdit={(newCaption) => onReviewSubmission("social", "edited", { caption: newCaption }, "instagramCarousel")}
                onRequestRevision={() => onOpenRevision("instagramCarousel")}
                onCopy={() => {
                  const carousel = selectedRun.social_drafts[0]?.instagramCarousel;
                  const textToCopy = carousel?.slides
                    ? carousel.slides.map((s) => `Slide ${s.slideNumber}: ${s.text}`).join("\n\n")
                    : carousel?.caption || "";
                  onCopy(textToCopy, "carousel");
                }}
                isCopied={copiedKey === "carousel"}
                slides={selectedRun.social_drafts[0]?.instagramCarousel?.slides}
                onAttachImage={(url, slideIndex) => {
                  const latestSocial = selectedRun.social_drafts[0];
                  const slides = [...(latestSocial.instagramCarousel?.slides || [])];
                  if (slideIndex !== undefined && slides[slideIndex]) {
                    slides[slideIndex] = { ...slides[slideIndex], imageUrl: url };
                  }
                  const customPayload = {
                    ...latestSocial,
                    instagramCarousel: {
                      ...(latestSocial.instagramCarousel || {
                        caption: "",
                        imagePromptSuggestion: "",
                        slides: [],
                        status: "pending",
                      }),
                      slides,
                    },
                  };
                  onReviewSubmission("social", "edited", customPayload, "instagramCarousel");
                }}
                onGenerateImage={async (prompt, slideIndex) => {
                  onGeneratingSocialImageKeyChange(`${selectedRun.id}-instagramCarousel`);
                  try {
                    const res = await fetch("/api/portal/content-pipeline/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, runId: selectedRun.run_id }),
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      const latestSocial = selectedRun.social_drafts[0];
                      const slides = [...(latestSocial.instagramCarousel?.slides || [])];
                      if (slideIndex !== undefined && slides[slideIndex]) {
                        slides[slideIndex] = { ...slides[slideIndex], imageUrl: data.url };
                      }
                      const customPayload = {
                        ...latestSocial,
                        instagramCarousel: {
                          ...(latestSocial.instagramCarousel || {
                            caption: "",
                            imagePromptSuggestion: "",
                            slides: [],
                            status: "pending",
                          }),
                          slides,
                        },
                      };
                      await onReviewSubmission("social", "edited", customPayload, "instagramCarousel");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    onGeneratingSocialImageKeyChange("");
                  }
                }}
                isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-instagramCarousel`}
                showManualUploadGuide
              />
            </div>
          )}

          {activeSubTab === "reel" && !selectedRun.social_drafts[0]?.instagramReel?.script?.trim() && (
            <MissingFormatCta
              label="Instagram Reel Script"
              isBackfillingFormats={isBackfillingFormats}
              onGenerateMissingFormats={onGenerateMissingFormats}
            />
          )}

          {activeSubTab === "reel" && selectedRun.social_drafts[0]?.instagramReel?.script?.trim() && (
            <div className="max-w-xl mx-auto animate-fadeIn">
              <PlatformCard
                platformKey="instagramReel"
                platformLabel="Instagram Reel Script"
                icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                color=""
                borderColor=""
                caption={selectedRun.social_drafts[0]?.instagramReel?.caption || ""}
                status={selectedRun.social_drafts[0]?.instagramReel?.status || "pending"}
                isPublished={selectedRun.status === "published"}
                isExternalEditing={editingPlatform === "instagramReel"}
                onCancelExternalEdit={onCancelExternalEdit}
                onApprove={() => onReviewSubmission("social", "approved", undefined, "instagramReel")}
                onSaveEdit={(newScript) => onReviewSubmission("social", "edited", { script: newScript }, "instagramReel")}
                onRequestRevision={() => onOpenRevision("instagramReel")}
                onCopy={() => onCopy(selectedRun.social_drafts[0]?.instagramReel?.script || "", "reel")}
                isCopied={copiedKey === "reel"}
                script={selectedRun.social_drafts[0]?.instagramReel?.script}
                topic={selectedRun.topic}
                attachedVideoUrl={selectedRun.social_drafts[0]?.instagramReel?.videoUrl}
                videoSource={selectedRun.social_drafts[0]?.instagramReel?.videoSource}
                onAttachVideo={(url, source) =>
                  onReviewSubmission("social", "edited", { videoUrl: url, videoSource: source }, "instagramReel")
                }
                showManualUploadGuide
              />
            </div>
          )}

          {activeSubTab === "brandkit" && (
            <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 shadow-lg animate-fadeIn space-y-6 text-left">
              <div>
                <h4 className="font-serif text-sm font-bold text-white mb-2">LKC Branded Template Backgrounds</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Download these premium, pre-styled background templates with clinic margins and watermarks. Use
                  them as background layers in Canva or directly in social media apps to overlay the generated
                  caption text.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-white/10 bg-primary-navy/50 p-4 rounded-xl flex flex-col justify-between items-center space-y-4">
                  <span className="text-xs font-semibold text-clinical-teal font-sans">Square Template (1:1 Posts / Carousels)</span>
                  <div className="w-32 h-32 relative border border-white/20 rounded shadow-md overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img src="/images/templates/square-post-template.png" className="object-cover w-full h-full" alt="Square Post Template" />
                  </div>
                  <button
                    onClick={() => downloadImageFile("/images/templates/square-post-template.png", "lkc-square-post-template", toast.error)}
                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    ⬇ Download Square PNG
                  </button>
                </div>

                <div className="border border-white/10 bg-primary-navy/50 p-4 rounded-xl flex flex-col justify-between items-center space-y-4">
                  <span className="text-xs font-semibold text-clinical-teal font-sans">Vertical Template (9:16 Stories / Reels)</span>
                  <div className="w-20 h-32 relative border border-white/20 rounded shadow-md overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img src="/images/templates/vertical-story-template.png" className="object-cover w-full h-full" alt="Vertical Story Template" />
                  </div>
                  <button
                    onClick={() => downloadImageFile("/images/templates/vertical-story-template.png", "lkc-vertical-story-template", toast.error)}
                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    ⬇ Download Vertical PNG
                  </button>
                </div>
              </div>

              {/* Highlights Strategy */}
              <div className="bg-primary-navy/40 p-4 rounded-xl border border-white/5 space-y-3">
                <span className="text-clinical-teal uppercase tracking-wider text-[10px] font-bold block">✨ Instagram Highlights Guide</span>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Organise your stories into permanent, categorised profiles on your Instagram profile page:
                </p>
                <ul className="list-disc pl-4 text-[11px] text-white/70 space-y-2">
                  <li><strong>🏥 The Clinic:</strong> Clinical credentials, GMC Specialists registers, consulting locations, and photos of consulting rooms.</li>
                  <li><strong>🦵 Knee Joint Care:</strong> Educational guides explaining knee arthritis, meniscus tears, ACL injuries, and loose bodies.</li>
                  <li><strong>💉 Injections:</strong> Explanatory guides on Corticosteroid, Hyaluronic Acid, PRP, and Arthrosamid treatments.</li>
                  <li><strong>⭐ Testimonials:</strong> Patient review snippets (Google and iWantGreatCare testimonials).</li>
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 text-xs text-white/60">
          Social captions are not available for this run yet.
        </div>
      )}
    </div>
  );
}
