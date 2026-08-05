"use client";

import React, { useState } from "react";
import { ContentPipelineRun } from "@/lib/contentPipeline";
import { ARTICLE_CATEGORIES } from "@/lib/articleCategories";
import { FormattedContent } from "@/components/portal/pipeline/FormattedContent";

type MarkdownInsertType = "bold" | "italic" | "underline" | "h1" | "h2" | "h3" | "bullet";

interface PipelineDraftTabProps {
  selectedRun: ContentPipelineRun;
  isEditMode: boolean;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  editExcerpt: string;
  onEditExcerptChange: (value: string) => void;
  editCategory: string;
  onEditCategoryChange: (value: string) => void;
  editBody: string;
  editSuggestedImages: any[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  livePreviewRef: React.RefObject<HTMLDivElement | null>;
  onTextareaChange: (value: string) => void;
  onTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  insertMarkdown: (type: MarkdownInsertType) => void;
  history: string[];
  historyIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onDiscardChanges: () => void;
  onFinishEditing: () => void;
  onApproveDraft: () => void;
  onPublishBlogOnly: () => void;
  onSaveProgress: () => void;
  isSubmittingReview: boolean;
  generatingImagePlaceholderId: string | null;
  generatedImagePreview: { placeholderId: string; url: string } | null;
  onAttachPlaceholderImage: (placeholderId: string, label: string, url: string, isFeatured?: boolean) => void;
  onGenerateImage: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onResetPlaceholder: (altText: string, srcUrl: string) => void;
  onRemovePlaceholder: (placeholderId: string, label: string, isFeatured?: boolean) => void;
  onRemoveResolvedImage: (altText: string, srcUrl: string) => void;
}

export function PipelineDraftTab({
  selectedRun,
  isEditMode,
  editTitle,
  onEditTitleChange,
  editExcerpt,
  onEditExcerptChange,
  editCategory,
  onEditCategoryChange,
  editBody,
  editSuggestedImages,
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
  onApproveDraft,
  onPublishBlogOnly,
  onSaveProgress,
  isSubmittingReview,
  generatingImagePlaceholderId,
  generatedImagePreview,
  onAttachPlaceholderImage,
  onGenerateImage,
  onResetPlaceholder,
  onRemovePlaceholder,
  onRemoveResolvedImage,
}: PipelineDraftTabProps) {
  const [previewTheme, setPreviewTheme] = useState<"dashboard" | "website">("dashboard");

  return (
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
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-clinical-teal mb-1 font-semibold">Excerpt / Meta Summary</label>
                <textarea
                  value={editExcerpt}
                  onChange={(e) => onEditExcerptChange(e.target.value)}
                  rows={2}
                  className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-clinical-teal mb-1 font-semibold">Education Hub Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => onEditCategoryChange(e.target.value)}
                  className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                >
                  <option value="">Select a category…</option>
                  {ARTICLE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-clinical-teal mb-1 font-semibold">Formatted Body Content (Markdown supported)</label>

                {/* Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 bg-primary-navy border-t border-x border-white/20 rounded-t-lg p-2">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("bold")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="Bold text"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("italic")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="Italic text"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("underline")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10 underline"
                    title="Underline text"
                  >
                    U
                  </button>

                  <span className="w-px h-4 bg-white/10 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertMarkdown("h1")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="H1 Heading"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("h2")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="H2 Heading"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("h3")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="H3 Heading"
                  >
                    H3
                  </button>

                  <span className="w-px h-4 bg-white/10 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertMarkdown("bullet")}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2 py-1.5 rounded transition-colors cursor-pointer border border-white/10"
                    title="Bullet List"
                  >
                    • List
                  </button>

                  <span className="w-px h-4 bg-white/10 mx-1" />

                  <button
                    type="button"
                    onClick={onUndo}
                    disabled={historyIndex <= 0}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                  >
                    ↩ Undo
                  </button>
                  <button
                    type="button"
                    onClick={onRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    ↪ Redo
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={editBody}
                  onChange={(e) => onTextareaChange(e.target.value)}
                  onKeyDown={onTextareaKeyDown}
                  className="w-full bg-primary-navy border border-white/20 text-white rounded-b-lg p-3 text-xs font-mono focus:border-clinical-teal focus:outline-none leading-relaxed custom-scrollbar"
                  style={{ height: "320px", overflowY: "auto" }}
                />
              </div>
            </div>

            {/* Right Column: Live Rendered Preview */}
            <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col">
              <label className="block text-xs text-clinical-teal mb-1 font-semibold">Live Preview</label>
              <div
                ref={livePreviewRef}
                className="bg-primary-navy/40 p-5 rounded-xl border border-white/10 space-y-4 custom-scrollbar overflow-y-auto text-white/80 leading-relaxed font-sans flex-1"
                style={{ maxHeight: "480px" }}
              >
                <h1 className="font-serif text-xl font-bold text-white tracking-tight">
                  {editTitle || selectedRun.blog_drafts[0]?.title}
                </h1>
                {editExcerpt && (
                  <p className="text-[9px] text-white/70 italic border-l-2 border-clinical-teal pl-3 py-1">{editExcerpt}</p>
                )}
                <div className="border-t border-white/10 pt-4">
                  <FormattedContent
                    body={editBody}
                    suggestedImages={editSuggestedImages}
                    onAttachPlaceholder={(placeholderId, label, url, isFeatured) =>
                      onAttachPlaceholderImage(placeholderId, label, url, isFeatured)
                    }
                    references={selectedRun.blog_drafts[0]?.references}
                    generatingPlaceholderId={generatingImagePlaceholderId}
                    pendingPreview={generatedImagePreview}
                    onGenerateImage={(placeholderId, label, isFeatured) => onGenerateImage(placeholderId, label, isFeatured)}
                    onResetPlaceholder={onResetPlaceholder}
                    onRemovePlaceholder={onRemovePlaceholder}
                    onRemoveResolvedImage={onRemoveResolvedImage}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onDiscardChanges}
              className="border border-status-error/40 text-status-error hover:bg-status-error/10 text-xs px-4 py-2 rounded-xl cursor-pointer font-medium"
            >
              Discard Changes
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onFinishEditing}
                className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
                title="Close the editor and return to read-only view. Your changes are preserved locally."
              >
                Finish Editing
              </button>
              <button
                onClick={onSaveProgress}
                disabled={isSubmittingReview}
                className="border border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60 font-medium"
                title="Save your changes to the database without approving the draft, so you can resume on other devices."
              >
                {isSubmittingReview ? "Saving..." : "Save Progress"}
              </button>
              <button
                onClick={onPublishBlogOnly}
                disabled={isSubmittingReview}
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60 font-medium"
              >
                {isSubmittingReview ? "Saving..." : "Save & Publish Edited Draft"}
              </button>
              <button
                onClick={onApproveDraft}
                disabled={isSubmittingReview}
                className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60 font-medium"
              >
                {isSubmittingReview ? "Saving..." : "Save & Approve Edited Draft (Internal)"}
              </button>
            </div>
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

          {/* Theme Selector Toggle */}
          <div className="flex justify-end items-center gap-1.5 bg-dark-overlay-navy border border-white/10 p-2 rounded-xl mb-4 text-xs">
            <span className="text-white/60 mr-2 font-medium">Preview Style:</span>
            <button
              type="button"
              onClick={() => setPreviewTheme("dashboard")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                previewTheme === "dashboard"
                  ? "bg-clinical-teal text-deep-navy shadow-sm"
                  : "bg-primary-navy text-white/70 hover:text-white border border-white/10"
              }`}
            >
              Dashboard Theme (Dark)
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("website")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                previewTheme === "website"
                  ? "bg-clinical-teal text-deep-navy shadow-sm"
                  : "bg-primary-navy text-white/70 hover:text-white border border-white/10"
              }`}
            >
              Website Theme (Light)
            </button>
          </div>

          {previewTheme === "website" ? (
            /* EXACT WEBSITE PREVIEW */
            <div
              ref={livePreviewRef}
              className="bg-white text-text-secondary border border-border-clinical/30 shadow-xl rounded-2xl overflow-y-auto custom-scrollbar font-sans"
              style={{ maxHeight: "620px" }}
            >
              {/* Simulation Header Banner */}
              <div className="bg-[#f0f9ff] border-b border-border-clinical/20 p-3 text-center text-[10px] text-clinical-teal font-bold uppercase tracking-wider">
                💻 Website Live Preview Mode
              </div>
              
              <div className="p-8 max-w-3xl mx-auto space-y-6">
                {/* Breadcrumbs Simulation */}
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <span>Education & Blog</span>
                  <span>&bull;</span>
                  <span className="text-clinical-teal">
                    {ARTICLE_CATEGORIES.find((c) => c.value === (editCategory || selectedRun.blog_drafts[0]?.category))?.label || "General"}
                  </span>
                </div>

                <header className="mt-4 mb-6">
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep-navy leading-tight mb-4">
                    {editTitle || selectedRun.blog_drafts[0]?.title}
                  </h1>

                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center gap-4 border-y border-border-clinical/40 py-3 text-[10px] font-semibold text-text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-clinical-teal text-white flex items-center justify-center font-bold text-xs">
                        RP
                      </div>
                      <div>
                        <span className="block text-deep-navy font-bold">Mr Ricardo J Pacheco</span>
                        <span className="text-[8px] text-text-muted">Consultant Orthopedic Surgeon</span>
                      </div>
                    </div>
                    <span>&bull;</span>
                    <div>
                      <span className="text-text-muted">Published:</span> {new Date().toLocaleDateString("en-GB")}
                    </div>
                    <span>&bull;</span>
                    <div>
                      <span className="text-text-muted">Read Time:</span> 8 min read
                    </div>
                    <span>&bull;</span>
                    <div className="text-status-success uppercase tracking-wider text-[8px] bg-status-success/5 px-2 py-0.5 rounded-full font-bold">
                      Reviewed & Approved
                    </div>
                  </div>
                </header>

                {/* Main Body content with clean light mode styling */}
                <article className="prose max-w-none text-text-secondary text-sm md:text-base leading-relaxed space-y-6">
                  <FormattedContent
                    body={editBody || selectedRun.blog_drafts[0]?.body_markdown || selectedRun.blog_drafts[0]?.body || ""}
                    suggestedImages={
                      editSuggestedImages.length > 0 ? editSuggestedImages : selectedRun.blog_drafts[0]?.suggested_images
                    }
                    onAttachPlaceholder={(placeholderId, label, url, isFeatured) =>
                      onAttachPlaceholderImage(placeholderId, label, url, isFeatured)
                    }
                    references={selectedRun.blog_drafts[0]?.references}
                    generatingPlaceholderId={generatingImagePlaceholderId}
                    pendingPreview={generatedImagePreview}
                    onGenerateImage={(placeholderId, label, isFeatured) => onGenerateImage(placeholderId, label, isFeatured)}
                    onResetPlaceholder={onResetPlaceholder}
                    onRemovePlaceholder={onRemovePlaceholder}
                    onRemoveResolvedImage={onRemoveResolvedImage}
                    lightMode={true}
                    stripClinicalFlags={selectedRun.status === "awaiting_social_approval" || selectedRun.status === "published" || selectedRun.status === "writing_social"}
                  />
                </article>

                {/* Booking CTA simulation */}
                <div className="bg-soft-blue border border-border-clinical p-6 rounded-xl text-center my-8">
                  <h4 className="font-serif text-base font-bold text-deep-navy mb-2">
                    Concerned about your knee symptoms?
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4 font-medium max-w-xl mx-auto">
                    Book a consultation with Mr Ricardo J Pacheco to get a personalized diagnosis, clinical advice, and structured treatment pathway.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button type="button" className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl font-bold shadow transition-colors cursor-pointer border-0">
                      Book Consultation
                    </button>
                    <button type="button" className="border border-border-clinical hover:bg-white text-text-secondary text-xs px-4 py-2 rounded-xl font-bold shadow transition-colors cursor-pointer">
                      Explore More Articles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DEFAULT DARK DASHBOARD PREVIEW */
            <div
              ref={livePreviewRef}
              className="bg-dark-overlay-navy p-6 rounded-xl border border-white/10 space-y-4 custom-scrollbar"
              style={{ maxHeight: "620px", overflowY: "auto" }}
            >
              <h1 className="font-serif text-xl font-bold text-white tracking-tight">
                {editTitle || selectedRun.blog_drafts[0]?.title}
              </h1>
              {(() => {
                const categoryValue = editCategory || selectedRun.blog_drafts[0]?.category;
                const categoryLabel = ARTICLE_CATEGORIES.find((c) => c.value === categoryValue)?.label;
                return categoryLabel ? (
                  <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/30 rounded-full px-2.5 py-1">
                    {categoryLabel}
                  </span>
                ) : null;
              })()}
              {(editExcerpt || selectedRun.blog_drafts[0]?.excerpt) && (
                <p className="text-[9px] text-white/70 italic border-l-2 border-clinical-teal pl-3 py-1">
                  {editExcerpt || selectedRun.blog_drafts[0]?.excerpt}
                </p>
              )}
              <div className="text-white/80 space-y-4 leading-relaxed font-sans border-t border-white/10 pt-4">
                <FormattedContent
                  body={editBody || selectedRun.blog_drafts[0]?.body_markdown || selectedRun.blog_drafts[0]?.body || ""}
                  suggestedImages={
                    editSuggestedImages.length > 0 ? editSuggestedImages : selectedRun.blog_drafts[0]?.suggested_images
                  }
                  onAttachPlaceholder={(placeholderId, label, url, isFeatured) =>
                    onAttachPlaceholderImage(placeholderId, label, url, isFeatured)
                  }
                  references={selectedRun.blog_drafts[0]?.references}
                  generatingPlaceholderId={generatingImagePlaceholderId}
                  pendingPreview={generatedImagePreview}
                  onGenerateImage={(placeholderId, label, isFeatured) => onGenerateImage(placeholderId, label, isFeatured)}
                  onResetPlaceholder={onResetPlaceholder}
                  onRemovePlaceholder={onRemovePlaceholder}
                  onRemoveResolvedImage={onRemoveResolvedImage}
                  lightMode={false}
                  stripClinicalFlags={selectedRun.status === "awaiting_social_approval" || selectedRun.status === "published" || selectedRun.status === "writing_social"}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
