"use client";

import React from "react";
import Link from "next/link";
import { ContentPipelineRun, ContentPipelineReview } from "@/lib/contentPipeline";
import { RunDetailTab } from "@/lib/contentPipelineFormatting";
import { PortalCard } from "@/components/portal/ui";
import { StatusBadge } from "@/components/portal/pipeline/StatusBadge";
import { PipelineListView } from "@/components/portal/pipeline/PipelineListView";
import { PipelineDraftTab } from "@/components/portal/pipeline/PipelineDraftTab";
import { PipelineResearchTab } from "@/components/portal/pipeline/PipelineResearchTab";
import { PipelineImagesTab } from "@/components/portal/pipeline/PipelineImagesTab";
import { PipelineSocialTab } from "@/components/portal/pipeline/PipelineSocialTab";

type PlatformKey = "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
type SocialSubTab = "feed" | "story" | "carousel" | "reel" | "brandkit";

const SOCIAL_REVIEW_PLATFORMS: { key: "instagram" | "facebook" | "linkedin"; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
];

interface PipelineTabProps {
  // List view
  reviewNeededCount: number;
  visibleReviewNeededRuns: ContentPipelineRun[];
  otherCount: number;
  visibleOtherRuns: ContentPipelineRun[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelectRun: (runId: string) => void;
  onDeleteRun: (runId: string, topic: string) => void;
  isBlogEditInProgress: (run: ContentPipelineRun) => boolean;

  // Selection / header
  selectedRun: ContentPipelineRun | null;
  onBackToList: () => void;
  onOpenTriggerModal: () => void;
  onOpenImportModal: () => void;

  // Sticky action bar
  isEditMode: boolean;
  onStartEdit: () => void;
  onApproveDraft: () => void;
  isSubmittingReview: boolean;
  onOpenBlogRevision: () => void;
  onPublishBlogOnly: () => void;
  onApproveAllSocial: () => void;
  onOpenSocialRevision: () => void;
  onRevertToBlog: () => void;
  onApprovePlatform: (platform: "instagram" | "facebook" | "linkedin") => void;
  onEditPlatform: (platform: "instagram" | "facebook" | "linkedin") => void;
  onOpenPlatformRevision: (platform: "instagram" | "facebook" | "linkedin") => void;

  // Sub-tab nav
  runDetailTab: RunDetailTab;
  onRunDetailTabChange: (tab: RunDetailTab) => void;

  // Draft sub-tab
  activeDraftSubTab: "layman" | "technical";
  onActiveDraftSubTabChange: (value: "layman" | "technical") => void;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  editExcerpt: string;
  onEditExcerptChange: (value: string) => void;
  editCategory: string;
  onEditCategoryChange: (value: string) => void;
  editBody: string;
  editSuggestedImages: any[];
  editArticleTitle: string;
  onEditArticleTitleChange: (value: string) => void;
  editArticleExcerpt: string;
  onEditArticleExcerptChange: (value: string) => void;
  editArticleBody: string;
  editArticleSuggestedImages: any[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  livePreviewRef: React.RefObject<HTMLDivElement | null>;
  onTextareaChange: (value: string) => void;
  onTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  insertMarkdown: (type: "bold" | "italic" | "underline" | "h1" | "h2" | "h3" | "bullet") => void;
  history: string[];
  historyIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onDiscardChanges: () => void;
  onFinishEditing: () => void;
  onSaveProgress: () => void;
  generatingImagePlaceholderId: string | null;
  generatedImagePreview: { placeholderId: string; url: string } | null;
  onAttachPlaceholderImage: (placeholderId: string, label: string, url: string, isFeatured?: boolean) => void;
  onGenerateImage: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onResetPlaceholder: (altText: string, srcUrl: string) => void;
  onRemovePlaceholder: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onRemoveResolvedImage: (altText: string, srcUrl: string) => void;

  // Images sub-tab
  isUploadingImage: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageUrlInput: string;
  onImageUrlInputChange: (value: string) => void;
  onAttachImage: (url: string) => Promise<void>;

  // Social sub-tab
  activeSocialSubTab: SocialSubTab;
  onSocialSubTabChange: (tab: SocialSubTab) => void;
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

  // Version history
  selectedRunReviews: ContentPipelineReview[];
  isVersionHistoryExpanded: boolean;
  onToggleVersionHistory: () => void;
}

export function PipelineTab({
  reviewNeededCount,
  visibleReviewNeededRuns,
  otherCount,
  visibleOtherRuns,
  search,
  onSearchChange,
  onSelectRun,
  onDeleteRun,
  isBlogEditInProgress,
  selectedRun,
  onBackToList,
  onOpenTriggerModal,
  onOpenImportModal,
  isEditMode,
  onStartEdit,
  onApproveDraft,
  isSubmittingReview,
  onOpenBlogRevision,
  onPublishBlogOnly,
  onApproveAllSocial,
  onOpenSocialRevision,
  onRevertToBlog,
  onApprovePlatform,
  onEditPlatform,
  onOpenPlatformRevision,
  runDetailTab,
  onRunDetailTabChange,
  activeDraftSubTab,
  onActiveDraftSubTabChange,
  editTitle,
  onEditTitleChange,
  editExcerpt,
  onEditExcerptChange,
  editCategory,
  onEditCategoryChange,
  editBody,
  editSuggestedImages,
  editArticleTitle,
  onEditArticleTitleChange,
  editArticleExcerpt,
  onEditArticleExcerptChange,
  editArticleBody,
  editArticleSuggestedImages,
  textareaRef,
  livePreviewRef,
  onTextareaChange,
  onTextareaKeyDown,
  insertMarkdown,
  history,
  historyIndex,
  onUndo,
  onRedo,
  onDiscardChanges,
  onFinishEditing,
  onSaveProgress,
  generatingImagePlaceholderId,
  generatedImagePreview,
  onAttachPlaceholderImage,
  onGenerateImage,
  onResetPlaceholder,
  onRemovePlaceholder,
  onRemoveResolvedImage,
  isUploadingImage,
  onFileUpload,
  imageUrlInput,
  onImageUrlInputChange,
  onAttachImage,
  activeSocialSubTab,
  onSocialSubTabChange,
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
  selectedRunReviews,
  isVersionHistoryExpanded,
  onToggleVersionHistory,
}: PipelineTabProps) {
  const selectedRunHasSocial =
    !!selectedRun &&
    (selectedRun.status === "awaiting_social_approval" ||
      selectedRun.status === "published" ||
      selectedRun.social_drafts.length > 0);
  const activeRunDetailTab: RunDetailTab = runDetailTab === "social" && !selectedRunHasSocial ? "draft" : runDetailTab;
  const runDetailTabs = [
    { id: "draft" as const, label: "Draft" },
    { id: "research" as const, label: "Research" },
    { id: "images" as const, label: "Images" },
    ...(selectedRunHasSocial ? [{ id: "social" as const, label: "Social" }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header Control Bar */}
      <PortalCard padding="lg" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              onClick={onBackToList}
              className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              ← Back to List
            </button>
          )}
          <button
            onClick={onOpenImportModal}
            className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📋</span>
            <span>Import Research</span>
          </button>
          <button
            onClick={onOpenTriggerModal}
            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✨</span>
            <span>Start New Run</span>
          </button>
        </div>
      </PortalCard>

      {/* PIPELINE DETAIL VIEW */}
      {selectedRun ? (
        <div className="space-y-8">
          {/* Run Summary Banner */}
          <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/60">{selectedRun.run_id}</span>
                <StatusBadge status={selectedRun.status} isContinueEditing={isBlogEditInProgress(selectedRun)} />
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
                    {selectedRun.status === "awaiting_social_approval" ? (
                      "Multi-Platform Social Media Review"
                    ) : (
                      <>Blog Article Draft (Version {selectedRun.blog_drafts[0]?.version || 1})</>
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
                          onClick={onPublishBlogOnly}
                          disabled={isSubmittingReview}
                          className="bg-[#059669] hover:bg-[#047857] text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Approve & Publish Blog
                        </button>
                        <button
                          onClick={onApproveDraft}
                          disabled={isSubmittingReview}
                          className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Approve Draft (Internal)
                        </button>
                        <button
                          onClick={onStartEdit}
                          className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                        >
                          Edit Draft
                        </button>
                        <button
                          onClick={onOpenBlogRevision}
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
                      {!selectedRun.published_urls?.blog_url && (
                        <button
                          onClick={onPublishBlogOnly}
                          disabled={isSubmittingReview}
                          className="bg-[#059669] hover:bg-[#047857] text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Publish Blog to Website
                        </button>
                      )}
                      <button
                        onClick={onApproveAllSocial}
                        disabled={isSubmittingReview}
                        className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Approve All Platforms
                      </button>
                      <button
                        onClick={onOpenSocialRevision}
                        className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={onRevertToBlog}
                        disabled={isSubmittingReview}
                        className="border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:bg-amber-500/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 font-sans"
                      >
                        ↩ Revert to Blog Review
                      </button>
                    </div>

                    {selectedRun.social_drafts.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10">
                        {SOCIAL_REVIEW_PLATFORMS.map((platform) => {
                          const platformDraft = selectedRun.social_drafts[0]?.[platform.key];
                          const isApproved = platformDraft?.status === "approved";

                          return (
                            <div key={platform.key} className="bg-dark-overlay-navy border border-white/10 rounded-lg p-2 space-y-2">
                              <span className="block text-[10px] text-white/70">{platform.label}</span>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => onApprovePlatform(platform.key)}
                                  disabled={isSubmittingReview || isApproved}
                                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {isApproved ? "Approved" : "Approve"}
                                </button>
                                <button
                                  onClick={() => onEditPlatform(platform.key)}
                                  disabled={isApproved}
                                  className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onOpenPlatformRevision(platform.key)}
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
                    onClick={() => onRunDetailTabChange(tab.id)}
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
                <PipelineDraftTab
                  selectedRun={selectedRun}
                  isEditMode={isEditMode}
                  activeDraftSubTab={activeDraftSubTab}
                  onActiveDraftSubTabChange={onActiveDraftSubTabChange}
                  editTitle={editTitle}
                  onEditTitleChange={onEditTitleChange}
                  editExcerpt={editExcerpt}
                  onEditExcerptChange={onEditExcerptChange}
                  editCategory={editCategory}
                  onEditCategoryChange={onEditCategoryChange}
                  editBody={editBody}
                  editSuggestedImages={editSuggestedImages}
                  editArticleTitle={editArticleTitle}
                  onEditArticleTitleChange={onEditArticleTitleChange}
                  editArticleExcerpt={editArticleExcerpt}
                  onEditArticleExcerptChange={onEditArticleExcerptChange}
                  editArticleBody={editArticleBody}
                  editArticleSuggestedImages={editArticleSuggestedImages}
                  textareaRef={textareaRef}
                  livePreviewRef={livePreviewRef}
                  onTextareaChange={onTextareaChange}
                  onTextareaKeyDown={onTextareaKeyDown}
                  insertMarkdown={insertMarkdown}
                  history={history}
                  historyIndex={historyIndex}
                  onUndo={onUndo}
                  onRedo={onRedo}
                  onDiscardChanges={onDiscardChanges}
                  onFinishEditing={onFinishEditing}
                  onApproveDraft={onApproveDraft}
                  onPublishBlogOnly={onPublishBlogOnly}
                  onSaveProgress={onSaveProgress}
                  isSubmittingReview={isSubmittingReview}
                  generatingImagePlaceholderId={generatingImagePlaceholderId}
                  generatedImagePreview={generatedImagePreview}
                  onAttachPlaceholderImage={onAttachPlaceholderImage}
                  onGenerateImage={onGenerateImage}
                  onResetPlaceholder={onResetPlaceholder}
                  onRemovePlaceholder={onRemovePlaceholder}
                  onRemoveResolvedImage={onRemoveResolvedImage}
                />
              )}

              {activeRunDetailTab === "research" && <PipelineResearchTab researchBrief={selectedRun.research_brief} />}

              {activeRunDetailTab === "images" && (
                <PipelineImagesTab
                  selectedRun={selectedRun}
                  isUploadingImage={isUploadingImage}
                  onFileUpload={onFileUpload}
                  imageUrlInput={imageUrlInput}
                  onImageUrlInputChange={onImageUrlInputChange}
                  onAttachImage={onAttachImage}
                />
              )}

              {activeRunDetailTab === "social" && (
                <PipelineSocialTab
                  selectedRun={selectedRun}
                  selectedRunHasSocial={selectedRunHasSocial}
                  activeSubTab={activeSocialSubTab}
                  onSubTabChange={onSocialSubTabChange}
                  editingPlatform={editingPlatform}
                  onCancelExternalEdit={onCancelExternalEdit}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                  generatingSocialImageKey={generatingSocialImageKey}
                  onGeneratingSocialImageKeyChange={onGeneratingSocialImageKeyChange}
                  onReviewSubmission={onReviewSubmission}
                  onOpenRevision={onOpenRevision}
                  isBackfillingFormats={isBackfillingFormats}
                  onGenerateMissingFormats={onGenerateMissingFormats}
                />
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
                  onClick={() => onReviewSubmission("social", "revert_to_social")}
                  disabled={isSubmittingReview}
                  className="border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:bg-amber-500/10 text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 font-sans"
                >
                  ↩ Unpublish / Revert to Social Review
                </button>
                <button
                  onClick={onRevertToBlog}
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
              onClick={onToggleVersionHistory}
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
        <PipelineListView
          reviewNeededCount={reviewNeededCount}
          visibleReviewNeededRuns={visibleReviewNeededRuns}
          otherCount={otherCount}
          visibleOtherRuns={visibleOtherRuns}
          search={search}
          onSearchChange={onSearchChange}
          onSelectRun={onSelectRun}
          onDeleteRun={onDeleteRun}
          isBlogEditInProgress={isBlogEditInProgress}
        />
      )}
    </div>
  );
}
