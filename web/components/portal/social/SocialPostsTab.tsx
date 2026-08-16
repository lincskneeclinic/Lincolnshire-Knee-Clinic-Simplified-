"use client";

import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { SocialOnlyPost } from "@/lib/socialOnlyPosts";
import { PortalCard, PortalModal, PortalEmptyState } from "@/components/portal/ui";
import { useToast } from "@/components/portal/DashboardFeedback";
import { PlatformCard } from "@/components/portal/social/PlatformCard";
import { ConnectedAccountsCard } from "@/components/portal/social/ConnectedAccountsCard";
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
  onArchiveSocialOnlyPost: (postId: string) => void;
  onUnarchiveSocialOnlyPost: (postId: string) => void;
  onGoToLinkedArticle: (pipelineRunId: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  isModalOpen: boolean;
  onModalOpenChange: (open: boolean) => void;
  newTopic: string;
  onNewTopicChange: (value: string) => void;
  isGenerating: boolean;
  onGenerateSubmit: (e: React.FormEvent) => void;
  batchMode: boolean;
  onBatchModeChange: (value: boolean) => void;
  batchTopics: string;
  onBatchTopicsChange: (value: string) => void;
  batchProgress: { done: number; total: number } | null;
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
  onArchiveSocialOnlyPost,
  onUnarchiveSocialOnlyPost,
  onGoToLinkedArticle,
  showArchived,
  onShowArchivedChange,
  isModalOpen,
  onModalOpenChange,
  newTopic,
  onNewTopicChange,
  isGenerating,
  onGenerateSubmit,
  batchMode,
  onBatchModeChange,
  batchTopics,
  onBatchTopicsChange,
  batchProgress,
}: SocialPostsTabProps) {
  const toast = useToast();
  const batchTopicCount = batchTopics.split("\n").map((t) => t.trim()).filter(Boolean).length;

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
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-1.5 text-[10px] text-white/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => onShowArchivedChange(e.target.checked)}
                  className="accent-clinical-teal"
                />
                Show archived
              </label>
              <button
                onClick={() => onModalOpenChange(true)}
                className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨</span>
                <span>New Social Post</span>
              </button>
            </div>
          )}
        </div>

        {!selectedPost && <ConnectedAccountsCard />}

        {selectedPost ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => onSelectPost(null)}
                className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to List
              </button>
              <h4 className="font-serif text-sm font-bold text-white flex-1 text-center px-2">{selectedPost.topic}</h4>
              {selectedPost.archived ? (
                <button
                  onClick={() => onUnarchiveSocialOnlyPost(selectedPost.id)}
                  className="bg-clinical-teal/10 hover:bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/40 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  ↩ Restore to Active
                </button>
              ) : (
                <button
                  onClick={() => onArchiveSocialOnlyPost(selectedPost.id)}
                  className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  📦 Archive
                </button>
              )}
            </div>
            {selectedPost.archived && (
              <div className="text-[10px] text-white/50 bg-dark-overlay-navy border border-white/10 rounded-lg px-3 py-2">
                Archived {selectedPost.archived_at ? formatDateSafe(selectedPost.archived_at) : ""} — content is
                read-only. Click "Restore to Active" to edit, regenerate, or repost it.
              </div>
            )}
            {selectedPost.linkedArticle && (
              <div className="text-[10px] bg-dark-overlay-navy border border-white/10 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap">
                {selectedPost.linkedArticle.status === "published" ? (
                  <>
                    <span className="text-white/70">
                      🔗 Companion article live: <span className="text-white font-medium">{selectedPost.linkedArticle.title}</span>.
                      Paste this link into your Instagram bio / Facebook comment / LinkedIn first comment when you post.
                    </span>
                    <button
                      onClick={() => onCopySocialOnly(selectedPost.linkedArticle!.url || "", "linked-article-url")}
                      className="text-clinical-teal hover:underline cursor-pointer font-semibold shrink-0"
                    >
                      {copiedKey === "linked-article-url" ? "✓ Copied" : "📋 Copy Link"}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-white/70">
                      📝 A companion article for this topic is drafted and awaiting clinical review before it can go
                      live and be linked here.
                    </span>
                    <button
                      onClick={() => onGoToLinkedArticle(selectedPost.linkedArticle!.pipelineRunId)}
                      className="text-clinical-teal hover:underline cursor-pointer font-semibold shrink-0"
                    >
                      Review it →
                    </button>
                  </>
                )}
              </div>
            )}
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
                    isPublished={!!selectedPost.archived}
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
                    sourceType="social_only"
                    sourceId={selectedPost.id}
                  />
                  <PlatformCard
                    platformKey="facebook"
                    platformLabel="Facebook Post"
                    icon={<FaFacebook className="w-4 h-4 text-[#1877F2]" />}
                    color=""
                    borderColor=""
                    caption={selectedPost.facebook.caption}
                    status={selectedPost.facebook.status}
                    isPublished={!!selectedPost.archived}
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
                    sourceType="social_only"
                    sourceId={selectedPost.id}
                  />
                  <div className="space-y-2">
                    <PlatformCard
                      platformKey="linkedin"
                      platformLabel="LinkedIn Post"
                      icon={<FaLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                      color=""
                      borderColor=""
                      caption={selectedPost.linkedin.caption}
                      status={selectedPost.linkedin.status}
                      isPublished={!!selectedPost.archived}
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
                    {selectedPost.linkedArticle?.status === "published" && selectedPost.linkedArticle.technicalUrl && (
                      <div className="text-[10px] bg-dark-overlay-navy border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-white/70">
                          🎓 For referring clinicians: <span className="text-white font-medium">{selectedPost.linkedArticle.technicalTitle}</span> (clinical-depth article)
                        </span>
                        <button
                          onClick={() => onCopySocialOnly(selectedPost.linkedArticle!.technicalUrl || "", "linked-technical-article-url")}
                          className="text-clinical-teal hover:underline cursor-pointer font-semibold shrink-0"
                        >
                          {copiedKey === "linked-technical-article-url" ? "✓ Copied" : "📋 Copy Link"}
                        </button>
                      </div>
                    )}
                  </div>
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
                    isPublished={!!selectedPost.archived}
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
                    sourceType="social_only"
                    sourceId={selectedPost.id}
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
                    isPublished={!!selectedPost.archived}
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
                    sourceType="social_only"
                    sourceId={selectedPost.id}
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
                    isPublished={!!selectedPost.archived}
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
                    sourceType="social_only"
                    sourceId={selectedPost.id}
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
        ) : posts.filter((p) => !!p.archived === showArchived).length === 0 ? (
          <PortalEmptyState
            message={
              showArchived
                ? "No archived posts yet — archive a post you've already published to save it for a future refresh-and-repost."
                : 'No social posts yet — click "New Social Post" to create one.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts
              .filter((p) => !!p.archived === showArchived)
              .map((post) => {
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
                        post.archived
                          ? "border-white/20 text-white/50"
                          : allApproved
                            ? "border-clinical-teal/40 text-clinical-teal"
                            : "border-white/20 text-white/60"
                      }`}
                    >
                      {post.archived ? "📦 Archived" : allApproved ? "✓ All Approved" : "Needs Review"}
                    </span>
                    <div className="flex items-center gap-2">
                      {post.archived ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnarchiveSocialOnlyPost(post.id);
                          }}
                          className="text-[10px] text-clinical-teal hover:underline cursor-pointer font-medium"
                        >
                          ↩ Restore
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveSocialOnlyPost(post.id);
                          }}
                          className="text-[10px] text-white/60 hover:text-white cursor-pointer"
                        >
                          Archive
                        </button>
                      )}
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
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{post.topic}</h4>
                  <span className="text-[10px] text-white/40 font-mono block">
                    {post.archived && post.archived_at
                      ? `Archived ${formatDateSafe(post.archived_at)}`
                      : formatDateSafe(post.updated_at)}
                  </span>
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
          <div className="flex border-b border-white/10 gap-1">
            <button
              type="button"
              onClick={() => onBatchModeChange(false)}
              disabled={isGenerating}
              className={`text-xs font-semibold px-3 py-2 border-b-2 transition-all cursor-pointer disabled:opacity-50 ${
                !batchMode ? "border-clinical-teal text-clinical-teal" : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              Single Topic
            </button>
            <button
              type="button"
              onClick={() => onBatchModeChange(true)}
              disabled={isGenerating}
              className={`text-xs font-semibold px-3 py-2 border-b-2 transition-all cursor-pointer disabled:opacity-50 ${
                batchMode ? "border-clinical-teal text-clinical-teal" : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              Batch (Week's Worth)
            </button>
          </div>

          {!batchMode ? (
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
                and hashtag conventions — plus a companion blog article on the same topic, sent for clinical review
                in the Content Pipeline tab, so there's somewhere real to send anyone who wants more than the caption.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-white/80 mb-1">Topics — one per line</label>
              <textarea
                value={batchTopics}
                onChange={(e) => onBatchTopicsChange(e.target.value)}
                disabled={isGenerating}
                rows={6}
                placeholder={
                  "e.g.\n5 signs your knee pain needs a specialist\nIs running bad for your knees?\nWhat to expect after a knee replacement\nStretches to do before a 5k"
                }
                className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50 resize-y"
                autoFocus
              />
              <p className="text-[11px] text-white/60 mt-1.5">
                {batchProgress
                  ? `Generating ${batchProgress.done} of ${batchProgress.total}… each topic is a separate request, so this keeps working even if one topic is slow.`
                  : batchTopicCount > 0
                    ? `Will generate ${batchTopicCount} full post${batchTopicCount === 1 ? "" : "s"} (Instagram, Facebook, LinkedIn, Story, Carousel, Reel script each) plus a companion article per topic for clinical review, one at a time — this can take a few minutes.`
                    : "Add one topic per line — a week's cadence is usually 3-4 topics. Each also gets a companion article sent for clinical review."}
              </p>
              {batchProgress && (
                <div className="w-full bg-dark-overlay-navy border border-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-clinical-teal h-full transition-all duration-300"
                    style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

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
              disabled={isGenerating || (batchMode ? batchTopicCount === 0 : !newTopic.trim())}
              className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isGenerating
                ? batchMode
                  ? batchProgress
                    ? `Generating ${batchProgress.done}/${batchProgress.total}…`
                    : "Generating…"
                  : "Generating…"
                : batchMode
                  ? `Generate ${batchTopicCount || ""} Post${batchTopicCount === 1 ? "" : "s"}`
                  : "Generate Posts"}
            </button>
          </div>
        </form>
      </PortalModal>
    </>
  );
}
