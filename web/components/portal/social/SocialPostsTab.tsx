"use client";

import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { SocialOnlyPost } from "@/lib/socialOnlyPosts";
import { PortalCard, PortalModal, PortalEmptyState } from "@/components/portal/ui";
import { useToast } from "@/components/portal/DashboardFeedback";
import { PlatformCard } from "@/components/portal/social/PlatformCard";
import { downloadImageFile } from "@/lib/downloadImageFile";
import { formatDateSafe } from "@/lib/formatDate";

type PlatformKey = "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
type SocialOnlySubTab = "feed" | "story" | "carousel" | "reel" | "brandkit";

interface SocialPostsTabProps {
  loading: boolean;
  posts: SocialOnlyPost[];
  selectedPost: SocialOnlyPost | null;
  onSelectPost: (post: SocialOnlyPost | null) => void;
  activeSubTab: SocialOnlySubTab;
  onSubTabChange: (tab: SocialOnlySubTab) => void;
  copiedKey: string | null;
  generatingImageKey: string | null;
  onApproveSocialCaption: (postId: string, platform: PlatformKey) => void;
  onSaveSocialCaption: (postId: string, platform: PlatformKey, caption: any) => void;
  onRequestSocialRevision: (postId: string, platform: PlatformKey) => void;
  onCopySocialOnly: (text: string, key: string) => void;
  onAttachSocialImage: (postId: string, platform: PlatformKey, url: string, slideIndex?: number) => void;
  onGenerateSocialImage: (postId: string, platform: PlatformKey, prompt: string, slideIndex?: number) => void;
  onAttachSocialVideo: (postId: string, url: string, source: "upload" | "ai-broll") => void;
  onDeleteSocialOnlyPost: (postId: string) => void;
  isModalOpen: boolean;
  onModalOpenChange: (open: boolean) => void;
  newTopic: string;
  onNewTopicChange: (value: string) => void;
  isGenerating: boolean;
  onGenerateSubmit: (e: React.FormEvent) => void;
}

const SUB_TABS: SocialOnlySubTab[] = ["feed", "story", "carousel", "reel", "brandkit"];
const SUB_TAB_LABELS: Record<SocialOnlySubTab, string> = {
  feed: "Feed Posts",
  story: "Instagram Story",
  carousel: "Instagram Carousel",
  reel: "Instagram Reel Script",
  brandkit: "Brand Kit Templates",
};

export function SocialPostsTab({
  loading,
  posts,
  selectedPost,
  onSelectPost,
  activeSubTab,
  onSubTabChange,
  copiedKey,
  generatingImageKey,
  onApproveSocialCaption,
  onSaveSocialCaption,
  onRequestSocialRevision,
  onCopySocialOnly,
  onAttachSocialImage,
  onGenerateSocialImage,
  onAttachSocialVideo,
  onDeleteSocialOnlyPost,
  isModalOpen,
  onModalOpenChange,
  newTopic,
  onNewTopicChange,
  isGenerating,
  onGenerateSubmit,
}: SocialPostsTabProps) {
  const toast = useToast();

  return (
    <>
      <PortalCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Media Posts</h3>
            <p className="text-xs text-white/60 mt-1">
              Generate Instagram, Facebook &amp; LinkedIn posts from a topic — no blog article needed. Edit,
              regenerate, attach or generate an image, then approve and post manually using the download + copy
              steps on each card.
            </p>
          </div>
          {!selectedPost && (
            <button
              onClick={() => onModalOpenChange(true)}
              className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>✨</span>
              <span>New Social Post</span>
            </button>
          )}
        </div>

        {selectedPost ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => onSelectPost(null)}
                className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to List
              </button>
              <h4 className="font-serif text-sm font-bold text-white">{selectedPost.topic}</h4>
            </div>
            <div className="space-y-4">
              {/* Sub-Tab Navigation for Standalone Social Posts */}
              <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
                {SUB_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onSubTabChange(tab)}
                    className={`text-xs font-semibold px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === tab
                        ? "border-clinical-teal text-clinical-teal font-bold"
                        : "border-transparent text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {SUB_TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {activeSubTab === "feed" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
                  <PlatformCard
                    platformKey="instagram"
                    platformLabel="Instagram Post"
                    icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.instagram.caption}
                    status={selectedPost.instagram.status}
                    isPublished={false}
                    attachedImageUrl={selectedPost.instagram.imageUrl}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "instagram")}
                    onSaveEdit={(newCaption) => onSaveSocialCaption(selectedPost.id, "instagram", newCaption)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "instagram")}
                    onCopy={() => onCopySocialOnly(selectedPost.instagram.caption, "social-only-ig")}
                    isCopied={copiedKey === "social-only-ig"}
                    onAttachImage={(url) => onAttachSocialImage(selectedPost.id, "instagram", url)}
                    imagePromptSuggestion={selectedPost.instagram.imagePromptSuggestion}
                    onGenerateImage={(prompt) => onGenerateSocialImage(selectedPost.id, "instagram", prompt)}
                    isGeneratingImage={generatingImageKey === `${selectedPost.id}-instagram`}
                    showManualUploadGuide
                  />
                  <PlatformCard
                    platformKey="facebook"
                    platformLabel="Facebook Post"
                    icon={<FaFacebook className="w-4 h-4 text-[#1877F2]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.facebook.caption}
                    status={selectedPost.facebook.status}
                    isPublished={false}
                    attachedImageUrl={selectedPost.facebook.imageUrl}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "facebook")}
                    onSaveEdit={(newCaption) => onSaveSocialCaption(selectedPost.id, "facebook", newCaption)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "facebook")}
                    onCopy={() => onCopySocialOnly(selectedPost.facebook.caption, "social-only-fb")}
                    isCopied={copiedKey === "social-only-fb"}
                    onAttachImage={(url) => onAttachSocialImage(selectedPost.id, "facebook", url)}
                    imagePromptSuggestion={selectedPost.facebook.imagePromptSuggestion}
                    onGenerateImage={(prompt) => onGenerateSocialImage(selectedPost.id, "facebook", prompt)}
                    isGeneratingImage={generatingImageKey === `${selectedPost.id}-facebook`}
                    showManualUploadGuide
                  />
                  <PlatformCard
                    platformKey="linkedin"
                    platformLabel="LinkedIn Post"
                    icon={<FaLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.linkedin.caption}
                    status={selectedPost.linkedin.status}
                    isPublished={false}
                    attachedImageUrl={selectedPost.linkedin.imageUrl}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "linkedin")}
                    onSaveEdit={(newCaption) => onSaveSocialCaption(selectedPost.id, "linkedin", newCaption)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "linkedin")}
                    onCopy={() => onCopySocialOnly(selectedPost.linkedin.caption, "social-only-li")}
                    isCopied={copiedKey === "social-only-li"}
                    onAttachImage={(url) => onAttachSocialImage(selectedPost.id, "linkedin", url)}
                    imagePromptSuggestion={selectedPost.linkedin.imagePromptSuggestion}
                    onGenerateImage={(prompt) => onGenerateSocialImage(selectedPost.id, "linkedin", prompt)}
                    isGeneratingImage={generatingImageKey === `${selectedPost.id}-linkedin`}
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
                    caption={selectedPost.instagramStory?.caption || `Check out our latest update about "${selectedPost.topic}"!`}
                    status={selectedPost.instagramStory?.status || "pending"}
                    isPublished={false}
                    attachedImageUrl={selectedPost.instagramStory?.imageUrl}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "instagramStory")}
                    onSaveEdit={(newCaption) => onSaveSocialCaption(selectedPost.id, "instagramStory", newCaption)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "instagramStory")}
                    onCopy={() => onCopySocialOnly(selectedPost.instagramStory?.caption || "", "social-only-story")}
                    isCopied={copiedKey === "social-only-story"}
                    onAttachImage={(url) => onAttachSocialImage(selectedPost.id, "instagramStory", url)}
                    imagePromptSuggestion={
                      selectedPost.instagramStory?.imagePromptSuggestion ||
                      `A premium vertical 9:16 background image for "${selectedPost.topic}"`
                    }
                    onGenerateImage={(prompt) => onGenerateSocialImage(selectedPost.id, "instagramStory", prompt)}
                    isGeneratingImage={generatingImageKey === `${selectedPost.id}-instagramStory`}
                    showManualUploadGuide
                  />
                </div>
              )}

              {activeSubTab === "carousel" && (
                <div className="max-w-xl mx-auto animate-fadeIn">
                  <PlatformCard
                    platformKey="instagramCarousel"
                    platformLabel="Instagram Carousel"
                    icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.instagramCarousel?.caption || ""}
                    status={selectedPost.instagramCarousel?.status || "pending"}
                    isPublished={false}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "instagramCarousel")}
                    onSaveEdit={(newCaption) => onSaveSocialCaption(selectedPost.id, "instagramCarousel", newCaption)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "instagramCarousel")}
                    onCopy={() => {
                      const carousel = selectedPost.instagramCarousel;
                      const textToCopy = carousel?.slides
                        ? carousel.slides.map((s) => `Slide ${s.slideNumber}: ${s.text}`).join("\n\n")
                        : carousel?.caption || "";
                      onCopySocialOnly(textToCopy, "social-only-carousel");
                    }}
                    isCopied={copiedKey === "social-only-carousel"}
                    slides={selectedPost.instagramCarousel?.slides}
                    onAttachImage={(url, slideIndex) => {
                      const slides = [...(selectedPost.instagramCarousel?.slides || [])];
                      if (slideIndex !== undefined && slides[slideIndex]) {
                        slides[slideIndex] = { ...slides[slideIndex], imageUrl: url };
                      }
                      onSaveSocialCaption(selectedPost.id, "instagramCarousel", {
                        slides: slides,
                        caption: selectedPost.instagramCarousel?.caption || "",
                      });
                    }}
                    onGenerateImage={(prompt, slideIndex) =>
                      onGenerateSocialImage(selectedPost.id, "instagramCarousel", prompt, slideIndex)
                    }
                    isGeneratingImage={generatingImageKey === `${selectedPost.id}-instagramCarousel`}
                    showManualUploadGuide
                  />
                </div>
              )}

              {activeSubTab === "reel" && (
                <div className="max-w-xl mx-auto animate-fadeIn">
                  <PlatformCard
                    platformKey="instagramReel"
                    platformLabel="Instagram Reel Script"
                    icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.instagramReel?.caption || ""}
                    status={selectedPost.instagramReel?.status || "pending"}
                    isPublished={false}
                    onApprove={() => onApproveSocialCaption(selectedPost.id, "instagramReel")}
                    onSaveEdit={(newScript) => onSaveSocialCaption(selectedPost.id, "instagramReel", { script: newScript } as any)}
                    onRequestRevision={() => onRequestSocialRevision(selectedPost.id, "instagramReel")}
                    onCopy={() => onCopySocialOnly(selectedPost.instagramReel?.script || "", "social-only-reel")}
                    isCopied={copiedKey === "social-only-reel"}
                    script={selectedPost.instagramReel?.script}
                    topic={selectedPost.topic}
                    attachedVideoUrl={selectedPost.instagramReel?.videoUrl}
                    videoSource={selectedPost.instagramReel?.videoSource}
                    onAttachVideo={(url, source) => onAttachSocialVideo(selectedPost.id, url, source)}
                    showManualUploadGuide
                  />
                </div>
              )}

              {activeSubTab === "brandkit" && (
                <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 shadow-lg animate-fadeIn space-y-6 text-left">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white mb-2">LKC Branded Template Backgrounds</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Download these premium, pre-styled background templates with clinic margins and watermarks.
                      Use them as background layers in Canva or directly in social media apps to overlay the
                      generated caption text.
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
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="py-8 text-center text-white/60 text-xs">Loading social posts…</div>
        ) : posts.length === 0 ? (
          <PortalEmptyState message={'No social posts yet — click "New Social Post" to create one.'} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => {
              const allApproved =
                post.instagram.status === "approved" &&
                post.facebook.status === "approved" &&
                post.linkedin.status === "approved";
              return (
                <div
                  key={post.id}
                  className="p-4 bg-dark-overlay-navy border border-white/10 hover:border-clinical-teal/40 rounded-xl transition-all space-y-2 cursor-pointer"
                  onClick={() => onSelectPost(post)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        allApproved ? "border-clinical-teal/40 text-clinical-teal" : "border-white/20 text-white/60"
                      }`}
                    >
                      {allApproved ? "✓ All Approved" : "Needs Review"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSocialOnlyPost(post.id);
                      }}
                      className="text-[10px] text-status-error/80 hover:text-status-error cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{post.topic}</h4>
                  <span className="text-[10px] text-white/40 font-mono block">{formatDateSafe(post.updated_at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </PortalCard>

      <PortalModal
        isOpen={isModalOpen}
        onClose={() => !isGenerating && onModalOpenChange(false)}
        title={
          <>
            <span>✨</span>
            <span>New Social Media Post</span>
          </>
        }
      >
        <form onSubmit={onGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/80 mb-1">Topic / Patient Question</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => onNewTopicChange(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. 5 signs your knee pain needs a specialist"
              className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <p className="text-[11px] text-white/60 mt-1.5">
              Generates an Instagram, Facebook, and LinkedIn post — each written for that platform's tone, length,
              and hashtag conventions.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onModalOpenChange(false)}
              disabled={isGenerating}
              className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !newTopic.trim()}
              className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isGenerating ? "Generating…" : "Generate Posts"}
            </button>
          </div>
        </form>
      </PortalModal>
    </>
  );
}
