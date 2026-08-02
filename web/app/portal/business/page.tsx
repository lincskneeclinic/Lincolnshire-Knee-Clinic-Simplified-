"use client";

import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import { ContentPipelineRun, ContentPipelineReview } from "@/lib/contentPipeline";
import { MIN_BLOG_BODY_LENGTH } from "@/lib/contentPipelineConstants";
import { ARTICLE_CATEGORIES } from "@/lib/articleCategories";
import { SocialOnlyPost } from "@/lib/socialOnlyPosts";
import { markdownToEmailHtml } from "@/lib/newsletterMarkdown";
import { ReviewablePage, ClinicalReviewEntry } from "@/lib/clinicalReview";
import GenerateImageModal from "@/components/portal/GenerateImageModal";
import { DashboardFeedbackProvider, useToast, useConfirm, usePrompt } from "@/components/portal/DashboardFeedback";
import { CommunityReportsTab, CommunityReport } from "@/components/portal/community/CommunityReportsTab";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import rehypeRaw from "rehype-raw";

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

type RunDetailTab = "draft" | "research" | "images" | "social";
type ClinicalReviewListItem = ReviewablePage & { review: ClinicalReviewEntry };
type SearchReference = { title: string; url: string; source: string; summary: string };
interface EducationArticleSummary {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  image?: string;
  datePublished: string;
  removed: boolean;
  removedAt: string | null;
  updatedAt: string | null;
  views: number;
  feedbackUp: number;
  feedbackDown: number;
}

// Guards against rendering "Invalid Date" if an article's stored date string isn't in
// a format Date can parse — falls back to showing the raw string instead.
function formatDateSafe(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

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

function cleanHeadingBugs(text: string): string {
  if (!text) return "";
  return text.replace(/^(\s*)(#+)\s*(#+)\s*/gm, "$1$2 ");
}

export default function BusinessDashboardPage() {
  return (
    <DashboardFeedbackProvider>
      <BusinessDashboardPageInner />
    </DashboardFeedbackProvider>
  );
}

function BusinessDashboardPageInner() {
  const toast = useToast();
  const confirmAction = useConfirm();
  const promptAction = usePrompt();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "events" | "newsletter" | "newsletterCreator" | "pipeline" | "clinicalReview" | "community" | "educationHub" | "socialOnly">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [educationSearch, setEducationSearch] = useState("");
  const [isAdminPasswordOpen, setIsAdminPasswordOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [adminPasswordSaving, setAdminPasswordSaving] = useState(false);
  const [adminPasswordMessage, setAdminPasswordMessage] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  // Newsletter Creator & Distribution States
  const [newsletterEditions, setNewsletterEditions] = useState<any[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [activeSubscribersCount, setActiveSubscribersCount] = useState(0);
  const [newNewsletterTopic, setNewNewsletterTopic] = useState("");
  const [newsletterIncludeResearch, setNewsletterIncludeResearch] = useState(true);
  const [isGeneratingNewsletter, setIsGeneratingNewsletter] = useState(false);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<any | null>(null);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [isDiscardingNewsletter, setIsDiscardingNewsletter] = useState(false);
  const [showNewsletterSendConfirm, setShowNewsletterSendConfirm] = useState(false);
  const [newsletterEditSubject, setNewsletterEditSubject] = useState("");
  const [newsletterEditMarkdown, setNewsletterEditMarkdown] = useState("");
  const [newsletterHtmlPreview, setNewsletterHtmlPreview] = useState("");


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
  const triggerBackgroundedRef = React.useRef(false);

  // Review Actions State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSuggestedImages, setEditSuggestedImages] = useState<any[]>([]);
  const [generatingImagePlaceholderId, setGeneratingImagePlaceholderId] = useState<string | null>(null);
  const [generatedImagePreview, setGeneratedImagePreview] = useState<{ placeholderId: string; url: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Preserves the Live Preview's scroll position across body edits (e.g. inserting an
  // image into a placeholder). Without this, replacing a placeholder box with the
  // resolved <img> reflows the content and the browser resets scroll to the top.
  const livePreviewRef = React.useRef<HTMLDivElement>(null);
  const pendingScrollRestoreRef = React.useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingScrollRestoreRef.current !== null && livePreviewRef.current) {
      livePreviewRef.current.scrollTop = pendingScrollRestoreRef.current;
      pendingScrollRestoreRef.current = null;
    }
  });
  const [editIgCaption, setEditIgCaption] = useState("");
  const [editFbCaption, setEditFbCaption] = useState("");
  const [editLiCaption, setEditLiCaption] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<"instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel" | null>(null);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionStage, setRevisionStage] = useState<"blog" | "social">("blog");
  const [revisionPlatform, setRevisionPlatform] = useState<"instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel" | undefined>(undefined);

  const [activeSocialSubTab, setActiveSocialSubTab] = useState<"feed" | "story" | "carousel" | "reel" | "brandkit">("feed");
  const [activeSocialOnlySubTab, setActiveSocialOnlySubTab] = useState<"feed" | "story" | "carousel" | "reel" | "brandkit">("feed");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Clinical Review State
  const [clinicalReviewPages, setClinicalReviewPages] = useState<ClinicalReviewListItem[]>([]);
  const [clinicalReviewLoading, setClinicalReviewLoading] = useState(false);
  const [selectedReviewPageId, setSelectedReviewPageId] = useState<string | null>(null);
  const [reviewFormReviewed, setReviewFormReviewed] = useState(false);
  const [reviewFormReviewerName, setReviewFormReviewerName] = useState("");
  const [reviewFormReviewerTitle, setReviewFormReviewerTitle] = useState("");
  const [reviewFormLastReviewedDate, setReviewFormLastReviewedDate] = useState("");
  const [reviewFormEvidenceSource, setReviewFormEvidenceSource] = useState("");
  const [clinicalReviewSearch, setClinicalReviewSearch] = useState("");
  const [bulkReviewSelection, setBulkReviewSelection] = useState<Set<string>>(new Set());
  const [isBulkReviewFormOpen, setIsBulkReviewFormOpen] = useState(false);
  const [bulkReviewerName, setBulkReviewerName] = useState("");
  const [bulkReviewerTitle, setBulkReviewerTitle] = useState("");
  const [bulkReviewDate, setBulkReviewDate] = useState("");
  const [isSavingBulkReview, setIsSavingBulkReview] = useState(false);

  // Education Hub Article Management State
  const [educationArticles, setEducationArticles] = useState<EducationArticleSummary[]>([]);
  const [educationArticlesLoading, setEducationArticlesLoading] = useState(false);
  const [articlePendingRemoval, setArticlePendingRemoval] = useState<EducationArticleSummary | null>(null);
  const [isUpdatingArticleVisibility, setIsUpdatingArticleVisibility] = useState(false);

  // Standalone Social-Only Post State (Instagram/Facebook/LinkedIn without a blog)
  const [socialOnlyPosts, setSocialOnlyPosts] = useState<SocialOnlyPost[]>([]);
  const [socialOnlyPostsLoading, setSocialOnlyPostsLoading] = useState(false);
  const [selectedSocialOnlyPost, setSelectedSocialOnlyPost] = useState<SocialOnlyPost | null>(null);
  const [isSocialOnlyModalOpen, setIsSocialOnlyModalOpen] = useState(false);
  const [newSocialOnlyTopic, setNewSocialOnlyTopic] = useState("");
  const [isGeneratingSocialOnly, setIsGeneratingSocialOnly] = useState(false);
  const [generatingSocialImageKey, setGeneratingSocialImageKey] = useState<string | null>(null);
  const [isBackfillingFormats, setIsBackfillingFormats] = useState(false);
  const [socialOnlyCopiedKey, setSocialOnlyCopiedKey] = useState<string | null>(null);

  // Community Moderation State
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [communityReportsLoading, setCommunityReportsLoading] = useState(false);
  const [communityActionError, setCommunityActionError] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Suggested Evidence Sources (web search panel) state
  const [searchResults, setSearchResults] = useState<SearchReference[]>([]);
  const [addedResults, setAddedResults] = useState<SearchReference[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPageCursor, setSearchPageCursor] = useState(1);

  // Initialize/reset history stack when entering Edit mode
  useEffect(() => {
    if (isEditMode) {
      setHistory([editBody]);
      setHistoryIndex(0);
    }
  }, [isEditMode]);

  const pushHistory = useCallback((newText: string) => {
    setHistory((prev) => {
      const nextHist = prev.slice(0, historyIndex + 1);
      if (nextHist[nextHist.length - 1] === newText) return prev;
      const updated = [...nextHist, newText];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  const handleTextareaChange = (newVal: string) => {
    setEditBody(newVal);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      pushHistory(newVal);
    }, 500);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setEditBody(history[prevIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEditBody(history[nextIndex]);
    }
  }, [history, historyIndex]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (isCmdOrCtrl) {
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key.toLowerCase() === "y" && !isMac) {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  // Close the editor without saving/approving — edits remain in local state so the
  // read-only preview shows them until the user navigates away or reloads.
  const handleFinishEditing = () => {
    setIsEditMode(false);
  };

  // Approve Draft: if the user has local edits that haven't been saved yet, warn them.
  const handleApproveDraft = async () => {
    const serverDraft = selectedRun?.blog_drafts?.[0];
    const hasLocalEdits =
      editTitle !== (serverDraft?.title || "") ||
      editExcerpt !== (serverDraft?.excerpt || "") ||
      editBody !== (serverDraft?.body_markdown || serverDraft?.body || "");
    if (hasLocalEdits) {
      if (editBody.trim().length < MIN_BLOG_BODY_LENGTH) {
        toast.error(
          `The article body is too short to approve (minimum ${MIN_BLOG_BODY_LENGTH} characters). Please write or restore the full article content before approving.`
        );
        return;
      }
      const proceed = await confirmAction(
        "You have unsaved edits in the editor. Save and approve your edited version?",
        { confirmLabel: "Save & Approve" }
      );
      if (!proceed) return;
      handleReviewSubmission("blog", "edited");
    } else {
      handleReviewSubmission("blog", "approved");
    }
  };

  const handleDiscardChanges = async () => {
    if (await confirmAction("Discard all unsaved edits? This will restore the original draft text.", { confirmLabel: "Discard", danger: true })) {
      const blogDraft = selectedRun?.blog_drafts?.[0];
      if (blogDraft) {
        setEditTitle(blogDraft.title || "");
        setEditExcerpt(blogDraft.excerpt || "");
        setEditBody(cleanHeadingBugs(blogDraft.body_markdown || blogDraft.body || ""));
        setEditSuggestedImages(blogDraft.suggested_images || []);
        setEditCategory(blogDraft.category || "");
      }
      setIsEditMode(false);
    }
  };

  const insertMarkdown = (type: "bold" | "italic" | "underline" | "h1" | "h2" | "h3" | "bullet") => {
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
    } else if (type === "underline") {
      replacement = `<u>${selectedText || "text"}</u>`;
    } else if (type === "h1" || type === "h2" || type === "h3") {
      const targetPrefix = type === "h1" ? "# " : type === "h2" ? "## " : "### ";
      
      const beforeText = text.substring(0, start);
      const lineStart = beforeText.lastIndexOf("\n") + 1;
      
      const lineEnd = text.indexOf("\n", lineStart) === -1 ? text.length : text.indexOf("\n", lineStart);
      const lineText = text.substring(lineStart, lineEnd);
      
      // Match existing headers (e.g. "# ", "## ", "### ")
      const headerMatch = lineText.match(/^(\s*)(#{1,6}\s+)/);
      
      let newLineText = "";
      let newSelectionStart = start;
      let newSelectionEnd = end;
      
      if (headerMatch) {
        const leadingWhitespace = headerMatch[1];
        const existingPrefix = headerMatch[2];
        const existingPrefixLength = existingPrefix.length;
        
        if (existingPrefix === targetPrefix) {
          // Toggle off: Remove the header prefix
          newLineText = leadingWhitespace + lineText.substring(leadingWhitespace.length + existingPrefixLength);
          
          const shift = existingPrefixLength;
          const prefixEndIndexInLine = leadingWhitespace.length + existingPrefixLength;
          
          const relativeStart = start - lineStart;
          const relativeEnd = end - lineStart;
          
          const newRelativeStart = relativeStart >= prefixEndIndexInLine 
            ? relativeStart - shift 
            : Math.max(leadingWhitespace.length, relativeStart);
            
          const newRelativeEnd = relativeEnd >= prefixEndIndexInLine 
            ? relativeEnd - shift 
            : Math.max(leadingWhitespace.length, relativeEnd);
            
          newSelectionStart = lineStart + newRelativeStart;
          newSelectionEnd = lineStart + newRelativeEnd;
        } else {
          // Replace: Swap existing prefix with targetPrefix
          newLineText = leadingWhitespace + targetPrefix + lineText.substring(leadingWhitespace.length + existingPrefixLength);
          
          const shift = targetPrefix.length - existingPrefixLength;
          const prefixEndIndexInLine = leadingWhitespace.length + existingPrefixLength;
          
          const relativeStart = start - lineStart;
          const relativeEnd = end - lineStart;
          
          const newRelativeStart = relativeStart >= prefixEndIndexInLine
            ? relativeStart + shift
            : Math.max(leadingWhitespace.length + targetPrefix.length, relativeStart);
            
          const newRelativeEnd = relativeEnd >= prefixEndIndexInLine
            ? relativeEnd + shift
            : Math.max(leadingWhitespace.length + targetPrefix.length, relativeEnd);
            
          newSelectionStart = lineStart + newRelativeStart;
          newSelectionEnd = lineStart + newRelativeEnd;
        }
      } else {
        // Prepend: Insert targetPrefix at start of line
        const whitespaceMatch = lineText.match(/^(\s*)/);
        const leadingWhitespace = whitespaceMatch ? whitespaceMatch[1] : "";
        
        newLineText = leadingWhitespace + targetPrefix + lineText.substring(leadingWhitespace.length);
        
        const shift = targetPrefix.length;
        const relativeStart = start - lineStart;
        const relativeEnd = end - lineStart;
        
        const newRelativeStart = relativeStart >= leadingWhitespace.length
          ? relativeStart + shift
          : relativeStart;
          
        const newRelativeEnd = relativeEnd >= leadingWhitespace.length
          ? relativeEnd + shift
          : relativeEnd;
          
        newSelectionStart = lineStart + newRelativeStart;
        newSelectionEnd = lineStart + newRelativeEnd;
      }
      
      const newText = text.substring(0, lineStart) + newLineText + text.substring(lineEnd);
      setEditBody(newText);
      pushHistory(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }, 0);
      return;
    } else if (type === "bullet") {
      const beforeText = text.substring(0, start);
      const lineStart = beforeText.lastIndexOf("\n") + 1;
      
      const lineEnd = text.indexOf("\n", lineStart) === -1 ? text.length : text.indexOf("\n", lineStart);
      const lineText = text.substring(lineStart, lineEnd);
      
      const listMatch = lineText.match(/^(\s*)(-\s+|\*\s+)/);
      const headerMatch = lineText.match(/^(\s*)(#{1,6}\s+)/);
      
      let newLineText = "";
      let newSelectionStart = start;
      let newSelectionEnd = end;
      
      if (listMatch) {
        // Toggle off: Remove the bullet
        const leadingWhitespace = listMatch[1];
        const existingPrefix = listMatch[2];
        const existingPrefixLength = existingPrefix.length;
        
        newLineText = leadingWhitespace + lineText.substring(leadingWhitespace.length + existingPrefixLength);
        
        const shift = existingPrefixLength;
        const prefixEndIndexInLine = leadingWhitespace.length + existingPrefixLength;
        
        const relativeStart = start - lineStart;
        const relativeEnd = end - lineStart;
        
        const newRelativeStart = relativeStart >= prefixEndIndexInLine
          ? relativeStart - shift
          : Math.max(leadingWhitespace.length, relativeStart);
          
        const newRelativeEnd = relativeEnd >= prefixEndIndexInLine
          ? relativeEnd - shift
          : Math.max(leadingWhitespace.length, relativeEnd);
          
        newSelectionStart = lineStart + newRelativeStart;
        newSelectionEnd = lineStart + newRelativeEnd;
      } else if (headerMatch) {
        // Replace: Swap header prefix for bullet prefix
        const leadingWhitespace = headerMatch[1];
        const existingPrefix = headerMatch[2];
        const existingPrefixLength = existingPrefix.length;
        
        newLineText = leadingWhitespace + "- " + lineText.substring(leadingWhitespace.length + existingPrefixLength);
        
        const shift = 2 - existingPrefixLength;
        const prefixEndIndexInLine = leadingWhitespace.length + existingPrefixLength;
        
        const relativeStart = start - lineStart;
        const relativeEnd = end - lineStart;
        
        const newRelativeStart = relativeStart >= prefixEndIndexInLine
          ? relativeStart + shift
          : Math.max(leadingWhitespace.length + 2, relativeStart);
          
        const newRelativeEnd = relativeEnd >= prefixEndIndexInLine
          ? relativeEnd + shift
          : Math.max(leadingWhitespace.length + 2, relativeEnd);
          
        newSelectionStart = lineStart + newRelativeStart;
        newSelectionEnd = lineStart + newRelativeEnd;
      } else {
        // Prepend: Insert bullet prefix
        const whitespaceMatch = lineText.match(/^(\s*)/);
        const leadingWhitespace = whitespaceMatch ? whitespaceMatch[1] : "";
        
        newLineText = leadingWhitespace + "- " + lineText.substring(leadingWhitespace.length);
        
        const shift = 2;
        const relativeStart = start - lineStart;
        const relativeEnd = end - lineStart;
        
        const newRelativeStart = relativeStart >= leadingWhitespace.length
          ? relativeStart + shift
          : relativeStart;
          
        const newRelativeEnd = relativeEnd >= leadingWhitespace.length
          ? relativeEnd + shift
          : relativeEnd;
          
        newSelectionStart = lineStart + newRelativeStart;
        newSelectionEnd = lineStart + newRelativeEnd;
      }
      
      const newText = text.substring(0, lineStart) + newLineText + text.substring(lineEnd);
      setEditBody(newText);
      pushHistory(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }, 0);
      return;
    }

    if (type === "bold" || type === "italic" || type === "underline") {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setEditBody(newText);
      pushHistory(newText);
      
      setTimeout(() => {
        textarea.focus();
        const startOffset = type === "bold" ? 2 : type === "italic" ? 1 : 3;
        if (selectedText) {
          textarea.setSelectionRange(start + startOffset, start + startOffset + selectedText.length);
        } else {
          textarea.setSelectionRange(start + startOffset, start + startOffset + 4);
        }
      }, 0);
    }
  };


  const handleAttachPlaceholderImage = (placeholderId: string, label: string, url: string, isFeatured?: boolean) => {
    // Replace the [IMAGE PLACEHOLDER: label] (or [FEATURED IMAGE PLACEHOLDER: label])
    // marker in the body with real Markdown image syntax. This makes the image a
    // permanent part of body_markdown — no separate side-channel lookup needed.
    // ReactMarkdown's standard <img> renderer then displays it automatically.
    const imageMarkdown = `![${label}](${url})`;
    let newBody = editBody;

    // Try an exact match on this placeholder's own label text first. Image
    // generation can take 10-30+ seconds with the modal open the whole time, and
    // nothing stops the user resolving a *different* placeholder (or editing the
    // body) while it's in flight — placeholderId ("placeholder-2") is just "the
    // Nth still-unresolved marker" at the moment the button was clicked, and that
    // numbering shifts every time an earlier placeholder gets resolved out from
    // under it. An exact label match is immune to reordering; only fall back to
    // positional counting if the label text itself no longer matches verbatim
    // (e.g. it was hand-edited in the meantime).
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exactPattern = new RegExp(
      `\\[${isFeatured ? "FEATURED IMAGE PLACEHOLDER" : "IMAGE PLACEHOLDER"}:\\s*${escapedLabel}\\s*\\]`,
      "i"
    );
    if (exactPattern.test(editBody)) {
      newBody = editBody.replace(exactPattern, imageMarkdown);
    } else if (isFeatured) {
      const featuredPattern = /\[FEATURED IMAGE PLACEHOLDER:[^\]]*\]/i;
      newBody = editBody.replace(featuredPattern, imageMarkdown);
    } else {
      const targetIndex = parseInt(placeholderId.replace(/[^0-9]/g, ""), 10) || 1;
      const inlinePattern = /\[IMAGE PLACEHOLDER:[^\]]*\]/gi;
      let occurrence = 0;
      newBody = editBody.replace(inlinePattern, (matchText) => {
        occurrence += 1;
        return occurrence === targetIndex ? imageMarkdown : matchText;
      });
    }

    if (newBody === editBody) {
      // Nothing matched — surface this clearly rather than silently discarding the
      // upload. The image itself uploaded fine (it has a real URL); only the
      // automatic placement into the draft text failed.
      toast.error(
        `The image uploaded successfully, but couldn't be automatically placed in the draft (the placeholder marker may have been removed from the text). You can paste this URL manually where you want the image: ${url}`
      );
      return;
    }

    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setEditBody(newBody);
    pushHistory(newBody);

    // Remove the resolved placeholder entry. If this was the FEATURED image, also
    // add its URL as a plain string entry — the same shape the "Attached Media
    // Asset" panel and social media cards use — so uploading the featured image
    // once here automatically becomes the article's featured/hub-card image too.
    const withoutPlaceholder = editSuggestedImages.filter(
      (img: any) => !(typeof img === "object" && img !== null && img.placeholderId === placeholderId)
    );
    const updatedImages = isFeatured ? [url, ...withoutPlaceholder.filter((img: any) => img !== url)] : withoutPlaceholder;
    setEditSuggestedImages(updatedImages);
    setGeneratedImagePreview((prev) => (prev?.placeholderId === placeholderId ? null : prev));

    // If we're NOT in edit mode (read-only view), save the image attachment to the server
    // immediately as progress — NOT as "edited", which would prematurely advance the run
    // past blog review into social-caption stage just because an image was attached.
    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      // keepEditMode=true here isn't about edit mode at all — it tells
      // handleReviewSubmission to update selectedRun in place rather than calling
      // fetchRunDetail(), which would reset editBody/editSuggestedImages from the
      // server response and force a second re-render (and a second scroll jump)
      // immediately after the one we just restored from.
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: newBody,
        body: newBody,
        suggestedImages: updatedImages,
        references: currentDraft?.references,
        category: editCategory || currentDraft?.category,
      }, undefined, true);
    }
  };

  const handleResetPlaceholderImage = (altText: string, srcUrl: string) => {
    const targetPattern = `![${altText}](${srcUrl})`;
    const targetIndex = editBody.indexOf(targetPattern);
    
    if (targetIndex === -1) {
      const fallbackRegex = new RegExp(`!\\[(.*?)\\]\\(${srcUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, "i");
      const match = editBody.match(fallbackRegex);
      if (match) {
        const matchedAlt = match[1];
        const isFeatured = editBody.indexOf(match[0]) === editBody.indexOf("![");
        const replacementPlaceholder = isFeatured
          ? `[FEATURED IMAGE PLACEHOLDER: ${matchedAlt}]`
          : `[IMAGE PLACEHOLDER: ${matchedAlt}]`;
        
        const newBody = editBody.replace(match[0], replacementPlaceholder);
        if (livePreviewRef.current) {
          pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
        }
        setEditBody(newBody);
        pushHistory(newBody);
        
        if (isFeatured) {
          const updatedImages = editSuggestedImages.filter((img: any) => img !== srcUrl);
          setEditSuggestedImages(updatedImages);
          if (!isEditMode && selectedRun) {
            const currentDraft = selectedRun.blog_drafts[0];
            handleReviewSubmission("blog", "save_progress", {
              title: editTitle || currentDraft?.title,
              excerpt: editExcerpt || currentDraft?.excerpt,
              body_markdown: newBody,
              body: newBody,
              suggestedImages: updatedImages,
              references: currentDraft?.references,
              category: editCategory || currentDraft?.category,
            }, undefined, true);
          }
        } else if (!isEditMode && selectedRun) {
          const currentDraft = selectedRun.blog_drafts[0];
          handleReviewSubmission("blog", "save_progress", {
            title: editTitle || currentDraft?.title,
            excerpt: editExcerpt || currentDraft?.excerpt,
            body_markdown: newBody,
            body: newBody,
            suggestedImages: editSuggestedImages,
            references: currentDraft?.references,
            category: editCategory || currentDraft?.category,
          }, undefined, true);
        }
        return;
      }
      toast.error("Could not locate the image in the editor text. You can manually delete it from the editor tab.");
      return;
    }

    const firstImageIndex = editBody.indexOf("![");
    const isFeatured = (firstImageIndex !== -1 && targetIndex === firstImageIndex);
    const replacementPlaceholder = isFeatured
      ? `[FEATURED IMAGE PLACEHOLDER: ${altText}]`
      : `[IMAGE PLACEHOLDER: ${altText}]`;

    const newBody = editBody.replace(targetPattern, replacementPlaceholder);
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    
    setEditBody(newBody);
    pushHistory(newBody);

    const updatedImages = isFeatured
      ? editSuggestedImages.filter((img: any) => img !== srcUrl)
      : editSuggestedImages;

    if (isFeatured) {
      setEditSuggestedImages(updatedImages);
    }

    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: newBody,
        body: newBody,
        suggestedImages: updatedImages,
        references: currentDraft?.references,
        category: editCategory || currentDraft?.category,
      }, undefined, true);
    }
  };

  const handleRemovePlaceholder = async (placeholderId: string, label: string, isFeatured?: boolean) => {
    if (!(await confirmAction("Are you sure you want to permanently delete this image placeholder from the article?", { confirmLabel: "Delete", danger: true }))) return;
    
    const target = isFeatured
      ? `[FEATURED IMAGE PLACEHOLDER: ${label}]`
      : `[IMAGE PLACEHOLDER: ${label}]`;
    
    const escapedTarget = target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedTarget}\\s*`, "i");
    
    const newBody = editBody.replace(regex, "\n\n").trim();
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setEditBody(newBody);
    pushHistory(newBody);
    
    const updatedImages = editSuggestedImages.filter(
      (img: any) => !(typeof img === "object" && img !== null && img.placeholderId === placeholderId)
    );
    setEditSuggestedImages(updatedImages);
    setGeneratedImagePreview((prev) => (prev?.placeholderId === placeholderId ? null : prev));
    
    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: newBody,
        body: newBody,
        suggestedImages: updatedImages,
        references: currentDraft?.references,
        category: editCategory || currentDraft?.category,
      }, undefined, true);
    }
  };

  const handleRemoveResolvedImage = async (altText: string, srcUrl: string) => {
    if (!(await confirmAction("Are you sure you want to permanently delete this image from the article?", { confirmLabel: "Delete", danger: true }))) return;

    const escapedSrc = srcUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedAlt = altText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`\\s*!\\[${escapedAlt}\\]\\(${escapedSrc}\\)\\s*`, "i");
    
    let newBody = editBody.replace(pattern, "\n\n").trim();
    
    if (newBody === editBody) {
      const fallbackRegex = new RegExp(`\\s*!\\[(.*?)\\]\\(${escapedSrc}\\)\\s*`, "i");
      newBody = editBody.replace(fallbackRegex, "\n\n").trim();
    }
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setEditBody(newBody);
    pushHistory(newBody);
    
    const updatedImages = editSuggestedImages.filter(
      (img: any) => {
        if (typeof img === "string") return img !== srcUrl;
        return img.url !== srcUrl;
      }
    );
    setEditSuggestedImages(updatedImages);
    
    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: newBody,
        body: newBody,
        suggestedImages: updatedImages,
        references: currentDraft?.references,
        category: editCategory || currentDraft?.category,
      }, undefined, true);
    }
  };

  // Calls the Gemini image-generation endpoint and stores the result as a pending
  // preview (not yet inserted into the body) so the user can Accept or Regenerate
  // before committing — Accept reuses handleAttachPlaceholderImage above.
  const handleGenerateImage = async (placeholderId: string, label: string, isFeatured?: boolean) => {
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setGeneratingImagePlaceholderId(placeholderId);
    try {
      const res = await fetch("/api/portal/content-pipeline/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: label, isFeatured: Boolean(isFeatured) }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (livePreviewRef.current) {
          pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
        }
        setGeneratedImagePreview({ placeholderId, url: data.url });
      } else {
        toast.error(`Image generation failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("AI image generation failed:", err);
      toast.error("Image generation failed. Please check your connection and try again.");
    } finally {
      if (livePreviewRef.current) {
        pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
      }
      setGeneratingImagePlaceholderId(null);
    }
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

  // Permanently deletes a draft that isn't worth continuing — e.g. from the "Needs
  // Your Attention" list when you decide not to pursue it further.
  const handleDeletePipelineRun = async (runId: string, topic: string) => {
    if (!(await confirmAction(`Delete this draft ("${topic}")? This can't be undone.`, { confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/portal/content-pipeline/runs/${encodeURIComponent(runId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete the draft.");
      setPipelineRuns((prev) => prev.filter((r) => r.run_id !== runId));
      if (selectedRun?.run_id === runId) setSelectedRun(null);
      toast.success("Draft deleted.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete the draft.");
    }
  };

  // Fetch single run detail
  const fetchRunDetail = useCallback(async (runId: string, preserveTab: boolean = false) => {
    setPipelineLoading(true);
    try {
      const res = await fetch(`/api/portal/content-pipeline/runs/${encodeURIComponent(runId)}`);
      const data = await res.json();
      if (data.success && data.run) {
        setSelectedRun(data.run);
        setSelectedRunReviews(data.reviews || []);
        if (!preserveTab) {
          setRunDetailTab("draft");
        }
        setEditingPlatform(null);
        // Pre-fill edit states
        const blogDraft = data.run.blog_drafts?.[0];
        if (blogDraft) {
          setEditTitle(blogDraft.title || "");
          setEditExcerpt(blogDraft.excerpt || "");
          setEditBody(cleanHeadingBugs(blogDraft.body_markdown || blogDraft.body || ""));
          setEditSuggestedImages(blogDraft.suggested_images || []);
          setEditCategory(blogDraft.category || "");
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
      if (tabParam === "clinicalReview") {
        setActiveTab("clinicalReview");
      }
    }
  }, [fetchPipelineRuns, fetchRunDetail]);

  useEffect(() => {
    if (activeTab === "pipeline" && pipelineRuns.length === 0) {
      fetchPipelineRuns();
    }
  }, [activeTab, fetchPipelineRuns, pipelineRuns.length]);

  // Fetch clinical review pages list
  const fetchClinicalReviewPages = useCallback(async () => {
    setClinicalReviewLoading(true);
    try {
      const res = await fetch("/api/portal/clinical-review");
      const data = await res.json();
      if (data.success && Array.isArray(data.pages)) {
        setClinicalReviewPages(data.pages);
      }
    } catch (err) {
      console.error("Failed to fetch clinical review pages:", err);
    } finally {
      setClinicalReviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "clinicalReview" && clinicalReviewPages.length === 0) {
      fetchClinicalReviewPages();
    }
  }, [activeTab, fetchClinicalReviewPages, clinicalReviewPages.length]);

  // Fetch community moderation reports
  const fetchCommunityReports = useCallback(async () => {
    setCommunityReportsLoading(true);
    try {
      const res = await fetch("/api/portal/community-reports");
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        setCommunityReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch community reports:", err);
    } finally {
      setCommunityReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "community" && communityReports.length === 0) {
      fetchCommunityReports();
    }
  }, [activeTab, fetchCommunityReports, communityReports.length]);

  // Fetch Education Hub articles (for the remove/restore management screen)
  const fetchEducationArticles = useCallback(async () => {
    setEducationArticlesLoading(true);
    try {
      const res = await fetch("/api/portal/education-articles");
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setEducationArticles(data.articles);
      }
    } catch (err) {
      console.error("Failed to fetch Education Hub articles:", err);
    } finally {
      setEducationArticlesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "educationHub" && educationArticles.length === 0) {
      fetchEducationArticles();
    }
  }, [activeTab, fetchEducationArticles, educationArticles.length]);

  // Newsletter Creator & Distribution Handlers
  const fetchNewsletterEditions = useCallback(async () => {
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/portal/newsletter/list");
      const data = await res.json();
      if (data.success) {
        setNewsletterEditions(data.editions || []);
        setActiveSubscribersCount(data.activeSubscribersCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch newsletters:", err);
    } finally {
      setNewsletterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "newsletterCreator") {
      fetchNewsletterEditions();
    }
  }, [activeTab, fetchNewsletterEditions]);

  const clientConvertMarkdownToHtml = (subject: string, markdown: string): string => {
    if (!markdown) return "";
    const html = markdownToEmailHtml(markdown);

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px 12px; margin: 0; color: #334155;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color: #0c4a6e; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 20px; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Lincolnshire Knee Clinic</h1>
              <p style="color: #38bdf8; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 1px;">Patient Education Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <h2 style="font-family: Georgia, serif; color: #0f172a; font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">${subject}</h2>
              ${html}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #475569;">Lincolnshire Knee Clinic</p>
              <p style="margin: 0 0 12px 0;">Consultant-led orthopaedic care and joint preservation pathways across Lincolnshire.</p>
              <a href="https://lincolnshirekneeclinic.co.uk/book-appointment" target="_blank" style="background-color: #14b8a6; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; display: inline-block;">Book a Consultation</a>
              <p style="margin: 16px 0 0 0; color: #94a3b8;">
                You received this email because you opted into updates from Lincolnshire Knee Clinic.
                <br />
                <a href="https://lincolnshirekneeclinic.co.uk/newsletter?unsubscribe=true&email=patient@example.com" target="_blank" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Unsubscribe Instantly</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  const handleGenerateNewsletter = async () => {
    if (!newNewsletterTopic.trim()) return;
    setIsGeneratingNewsletter(true);
    try {
      const res = await fetch("/api/portal/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: newNewsletterTopic,
          includeResearch: newsletterIncludeResearch,
        }),
      });
      const data = await res.json();
      if (data.success && data.edition) {
        setNewsletterEditions(prev => [data.edition, ...prev]);
        setSelectedNewsletter(data.edition);
        setNewsletterEditSubject(data.edition.subject);
        setNewsletterEditMarkdown(data.edition.bodyMarkdown);
        setNewsletterHtmlPreview(data.edition.bodyHtml);
        setNewNewsletterTopic("");
      } else {
        toast.error(data.error || "Failed to generate newsletter draft.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error generating newsletter.");
    } finally {
      setIsGeneratingNewsletter(false);
    }
  };

  const handleGenerateDigestNewsletter = async () => {
    setIsGeneratingDigest(true);
    try {
      const res = await fetch("/api/portal/newsletter/generate-digest", { method: "POST" });
      const data = await res.json();
      if (data.success && data.edition) {
        setNewsletterEditions(prev => [data.edition, ...prev]);
        setSelectedNewsletter(data.edition);
        setNewsletterEditSubject(data.edition.subject);
        setNewsletterEditMarkdown(data.edition.bodyMarkdown);
        setNewsletterHtmlPreview(data.edition.bodyHtml);
      } else {
        toast.error(data.error || "Failed to generate monthly digest draft.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error generating monthly digest.");
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!selectedNewsletter) return;
    setIsSendingNewsletter(true);
    try {
      const res = await fetch("/api/portal/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId: selectedNewsletter.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Newsletter successfully distributed to ${data.sentCount} subscribed patients via ${data.mode}!`);
        setShowNewsletterSendConfirm(false);
        fetchNewsletterEditions();
      } else {
        toast.error(data.error || "Failed to send newsletter.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error sending newsletter.");
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const handleDeleteNewsletter = async (editionId: string) => {
    if (!(await confirmAction("Are you sure you want to permanently discard this newsletter draft?", { confirmLabel: "Discard", danger: true }))) return;
    setIsDiscardingNewsletter(true);
    try {
      const res = await fetch("/api/portal/newsletter/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterEditions(prev => prev.filter(e => e.id !== editionId));
        if (selectedNewsletter?.id === editionId) {
          setSelectedNewsletter(null);
          setNewsletterEditSubject("");
          setNewsletterEditMarkdown("");
          setNewsletterHtmlPreview("");
        }
      } else {
        toast.error(data.error || "Failed to discard draft.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error discarding draft.");
    } finally {
      setIsDiscardingNewsletter(false);
    }
  };

  const selectNewsletterForEdit = (edition: any) => {
    setSelectedNewsletter(edition);
    setNewsletterEditSubject(edition.subject);
    setNewsletterEditMarkdown(edition.bodyMarkdown);
    setNewsletterHtmlPreview(edition.bodyHtml);
  };

  const handleUpdateNewsletterContent = (subject: string, markdown: string) => {
    setNewsletterEditSubject(subject);
    setNewsletterEditMarkdown(markdown);
    
    const compiledHtml = clientConvertMarkdownToHtml(subject, markdown);
    setNewsletterHtmlPreview(compiledHtml);

    setNewsletterEditions(prev => prev.map(e => {
      if (e.id === selectedNewsletter?.id) {
        return {
          ...e,
          subject,
          bodyMarkdown: markdown,
          bodyHtml: compiledHtml
        };
      }
      return e;
    }));
  };

  // Standalone Social-Only Post handlers
  const fetchSocialOnlyPosts = useCallback(async () => {
    setSocialOnlyPostsLoading(true);
    try {
      const res = await fetch("/api/portal/social-only");
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setSocialOnlyPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch social-only posts:", err);
    } finally {
      setSocialOnlyPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "socialOnly" && socialOnlyPosts.length === 0) {
      fetchSocialOnlyPosts();
    }
  }, [activeTab, fetchSocialOnlyPosts, socialOnlyPosts.length]);

  const handleGenerateSocialOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialOnlyTopic.trim()) return;
    setIsGeneratingSocialOnly(true);
    try {
      const res = await fetch("/api/portal/social-only/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newSocialOnlyTopic.trim() }),
      });
      const data = await res.json();
      if (!data.success || !data.post) {
        throw new Error(data.error || "Failed to generate social posts.");
      }
      setSocialOnlyPosts((prev) => [data.post, ...prev]);
      setSelectedSocialOnlyPost(data.post);
      setIsSocialOnlyModalOpen(false);
      setNewSocialOnlyTopic("");
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while generating the social posts.");
    } finally {
      setIsGeneratingSocialOnly(false);
    }
  };

  const patchSocialOnlyPost = async (postId: string, body: any) => {
    const res = await fetch(`/api/portal/social-only/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success || !data.post) {
      throw new Error(data.error || "Failed to update the post.");
    }
    setSocialOnlyPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
    setSelectedSocialOnlyPost(data.post);
    return data.post;
  };

  const handleSaveSocialCaption = async (
    postId: string,
    platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel",
    caption: any
  ) => {
    try {
      const payload: any = { platform, status: "approved" };
      if (platform === "instagramCarousel" && typeof caption === "object") {
        payload.slides = caption.slides;
        payload.caption = caption.caption;
      } else if (platform === "instagramReel" && typeof caption === "object") {
        payload.script = caption.script;
        payload.caption = caption.caption;
      } else {
        payload.caption = caption;
      }
      await patchSocialOnlyPost(postId, payload);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save the caption.");
    }
  };

  const handleApproveSocialCaption = async (
    postId: string,
    platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel"
  ) => {
    try {
      await patchSocialOnlyPost(postId, { platform, status: "approved" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve the post.");
    }
  };

  const handleRequestSocialRevision = async (
    postId: string,
    platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel"
  ) => {
    const notes = (await promptAction("Any specific feedback for the rewrite? (Leave blank for a fresh alternative take.)", { multiline: true, placeholder: "e.g. more casual tone, focus on recovery timeline..." })) || undefined;
    try {
      await patchSocialOnlyPost(postId, { platform, action: "regenerate", revisionNotes: notes });
    } catch (err: any) {
      toast.error(err?.message || "Failed to regenerate the caption.");
    }
  };

  const handleAttachSocialImage = async (
    postId: string,
    platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel",
    url: string,
    slideIndex?: number
  ) => {
    try {
      if (platform === "instagramCarousel" && slideIndex !== undefined) {
        const slides = [...(selectedSocialOnlyPost?.instagramCarousel?.slides || [])];
        if (slides[slideIndex]) {
          slides[slideIndex] = { ...slides[slideIndex], imageUrl: url };
        }
        await patchSocialOnlyPost(postId, { platform, slides });
      } else {
        await patchSocialOnlyPost(postId, { platform, imageUrl: url });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to attach the image.");
    }
  };

  const handleAttachSocialVideo = async (
    postId: string,
    url: string,
    source: "upload" | "ai-broll"
  ) => {
    try {
      await patchSocialOnlyPost(postId, { platform: "instagramReel", videoUrl: url, videoSource: source });
    } catch (err: any) {
      toast.error(err?.message || "Failed to attach the video.");
    }
  };

  const handleGenerateSocialImage = async (
    postId: string,
    platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel",
    promptText: string,
    slideIndex?: number
  ) => {
    const key = `${postId}-${platform}`;
    setGeneratingSocialImageKey(key);
    try {
      const res = await fetch("/api/portal/content-pipeline/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio: platform === "instagramStory" ? "9:16" : undefined
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        await handleAttachSocialImage(postId, platform, data.url, slideIndex);
      } else {
        toast.error(`Image generation failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Social image generation failed:", err);
      toast.error("Image generation failed. Please check your connection and try again.");
    } finally {
      setGeneratingSocialImageKey(null);
    }
  };

  const handleCopySocialOnly = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setSocialOnlyCopiedKey(key);
    setTimeout(() => setSocialOnlyCopiedKey(null), 2500);
  };

  const handleDeleteSocialOnlyPost = async (postId: string) => {
    if (!(await confirmAction("Delete this social post draft? This can't be undone.", { confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/portal/social-only/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete the post.");
      setSocialOnlyPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedSocialOnlyPost?.id === postId) setSelectedSocialOnlyPost(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete the post.");
    }
  };

  const handleConfirmArticleVisibility = async (action: "remove" | "restore") => {
    if (!articlePendingRemoval) return;
    setIsUpdatingArticleVisibility(true);
    try {
      const res = await fetch("/api/portal/education-articles/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: articlePendingRemoval.slug, action }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update the article.");
      }
      setArticlePendingRemoval(null);
      await fetchEducationArticles();
      setActionFeedback(
        action === "remove"
          ? `"${articlePendingRemoval.title}" has been removed from the Education Hub.`
          : `"${articlePendingRemoval.title}" has been restored to the Education Hub.`
      );
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while updating the article.");
    } finally {
      setIsUpdatingArticleVisibility(false);
    }
  };

  // Seeds a new content pipeline run from an already-published article's current
  // content, then jumps into the normal Pipeline editing workflow for it — same as
  // opening any other run (Edit Draft, replace/regenerate images, references, etc).
  // Approving its blog draft writes the changes back as a live article update.
  const [isStartingArticleUpdate, setIsStartingArticleUpdate] = useState<string | null>(null);
  const handleStartArticleUpdate = async (article: EducationArticleSummary) => {
    setIsStartingArticleUpdate(article.slug);
    try {
      const res = await fetch("/api/portal/education-articles/update-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: article.slug }),
      });
      const data = await res.json();
      if (!data.success || !data.run) {
        throw new Error(data.error || "Failed to start an update run for this article.");
      }
      setActiveTab("pipeline");
      await fetchPipelineRuns();
      await fetchRunDetail(data.run.run_id);
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while starting the update.");
    } finally {
      setIsStartingArticleUpdate(null);
    }
  };

  const handleCommunityReportAction = async (
    report: { id: string; target_type: string; target_id: string },
    action: "hide" | "dismiss"
  ) => {
    setCommunityActionError(null);
    try {
      const res = await fetch("/api/portal/community-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          action,
          targetType: report.target_type,
          targetId: report.target_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCommunityActionError(data.message || "Failed to update report.");
        return;
      }
      fetchCommunityReports();
    } catch (err) {
      console.error("Failed to action community report:", err);
      setCommunityActionError("Network error. Please try again.");
    }
  };

  const buildReferenceLine = (result: SearchReference) => `${result.title} (${result.source}) — ${result.url}`;

  const handleSelectReviewPage = (page: ClinicalReviewListItem) => {
    setSelectedReviewPageId(page.pageId);
    setReviewFormReviewed(page.review.reviewed);
    setReviewFormReviewerName(page.review.reviewerName || "Mr Ricardo J Pacheco (GMC 4145976)");
    setReviewFormReviewerTitle(page.review.reviewerTitle || "Consultant Trauma & Orthopaedic Surgeon");
    
    // Pre-populate with today's date in "D MMMM YYYY" format (e.g. "30 July 2026")
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("en-GB", { month: "long" });
    const year = today.getFullYear();
    const todayFormatted = `${day} ${month} ${year}`;
    
    setReviewFormLastReviewedDate(page.review.lastReviewedDate || todayFormatted);
    // Evidence Sources starts blank — it's populated only by ticking references
    // from the search panel, not pre-filled from any previously-saved draft text.
    setReviewFormEvidenceSource("");
    setAddedResults([]);
    setSearchPageCursor(1);
    fetchSearchReferences(page.pageId, 1);
  };

  const fetchSearchReferences = async (pageId: string, cursor: number) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/portal/clinical-review/search-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, page: cursor }),
      });
      const data = await res.json();
      if (data.success) {
        // Don't re-show a result that's already been added, in case a refreshed
        // page of search results happens to overlap with an earlier one.
        const addedUrls = new Set(addedResults.map((r) => r.url));
        setSearchResults((data.results || []).filter((r: SearchReference) => !addedUrls.has(r.url)));
      } else {
        setSearchResults([]);
        setSearchError(data.error || "Failed to fetch search results.");
      }
    } catch (err: any) {
      setSearchResults([]);
      setSearchError(err.message || "Failed to fetch search results.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefreshSearch = () => {
    if (!selectedReviewPageId) return;
    const nextCursor = searchPageCursor >= 3 ? 1 : searchPageCursor + 1;
    setSearchPageCursor(nextCursor);
    fetchSearchReferences(selectedReviewPageId, nextCursor);
  };

  // Ticking a reference moves it from "Suggested" into "Added to Evidence
  // Sources" and appends its line into the Evidence Sources field. Any number
  // of references can be added — there's no cap.
  const handleTickSearchResult = (result: SearchReference) => {
    setReviewFormEvidenceSource((current) => {
      const line = buildReferenceLine(result);
      return current ? `${current}\n${line}` : line;
    });
    setSearchResults((prev) => prev.filter((r) => r.url !== result.url));
    setAddedResults((prev) => [...prev, result]);
  };

  // Moves a reference back from "Added" to "Suggested" and removes its line
  // from Evidence Sources — undoes an accidental tick. If the textarea was
  // hand-edited afterwards the exact line may no longer match and won't be
  // removed automatically, but the reference still reappears in Suggested.
  const handleUndoSearchResult = (result: SearchReference) => {
    const line = buildReferenceLine(result);
    setReviewFormEvidenceSource((current) =>
      current
        .split("\n")
        .filter((existingLine) => existingLine !== line)
        .join("\n")
    );
    setAddedResults((prev) => prev.filter((r) => r.url !== result.url));
    setSearchResults((prev) => [result, ...prev]);
  };

  const handleSaveReview = async () => {
    if (!selectedReviewPageId) return;
    setIsSavingReview(true);
    setActionError(null);
    try {
      const res = await fetch("/api/portal/clinical-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedReviewPageId,
          reviewed: reviewFormReviewed,
          reviewerName: reviewFormReviewerName,
          reviewerTitle: reviewFormReviewerTitle,
          lastReviewedDate: reviewFormLastReviewedDate,
          evidenceSource: reviewFormEvidenceSource,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback("✓ Clinical review status saved.");
        setTimeout(() => setActionFeedback(null), 4000);
        setSelectedReviewPageId(null);
        await fetchClinicalReviewPages();
      } else {
        throw new Error(data.error || "Failed to save clinical review status.");
      }
    } catch (err: any) {
      console.error("Error saving clinical review status:", err);
      setActionError(err.message || "Failed to save clinical review status.");
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleSaveBulkReview = async () => {
    if (bulkReviewSelection.size === 0) return;
    setIsSavingBulkReview(true);
    try {
      const pageIds = Array.from(bulkReviewSelection);
      const results = await Promise.all(
        pageIds.map((pageId) =>
          fetch("/api/portal/clinical-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pageId,
              reviewed: true,
              reviewerName: bulkReviewerName,
              reviewerTitle: bulkReviewerTitle,
              lastReviewedDate: bulkReviewDate,
            }),
          }).then((res) => res.json())
        )
      );
      const failedCount = results.filter((r) => !r.success).length;
      await fetchClinicalReviewPages();
      setBulkReviewSelection(new Set());
      setIsBulkReviewFormOpen(false);
      if (failedCount > 0) {
        toast.error(`${pageIds.length - failedCount} of ${pageIds.length} pages marked as reviewed — ${failedCount} failed.`);
      } else {
        toast.success(`${pageIds.length} page${pageIds.length === 1 ? "" : "s"} marked as clinically reviewed.`);
      }
    } catch (err: any) {
      console.error("Bulk review save failed:", err);
      toast.error("Failed to save bulk review status.");
    } finally {
      setIsSavingBulkReview(false);
    }
  };

  // Handle trigger new run submission
  // Runs the topic through /trigger (which returns almost immediately — see route
  // comments) then polls the run's own status endpoint until Stage 1 (research) and
  // Stage 2 (AI drafting) finish server-side. Polling avoids ever holding one HTTP
  // request open for the full multi-minute pipeline, which is what was triggering the
  // hosting platform's reverse-proxy timeout (the "Server timeout while synthesizing..."
  // error) even though the Node process itself kept working past that point.
  const handleTriggerRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggering(true);
    setTriggerProgress(5);
    setTriggerStep("Selecting topic & initializing clinical pipeline...");
    triggerBackgroundedRef.current = false;

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
        throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}`);
      }

      if (!res.ok || !data.success || !data.run) {
        throw new Error(data.error || data.message || "Failed to trigger content pipeline run.");
      }

      const runId = data.run.run_id;
      setTriggerProgress(12);
      setTriggerStep("Stage 1: Searching PubMed & orthopaedic literature journals...");
      await fetchPipelineRuns();

      const POLL_INTERVAL_MS = 3000;
      const MAX_POLLS = 100; // ~5 minutes
      let finished = false;

      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (triggerBackgroundedRef.current) return; // user chose to keep it running and close the modal

        const pollRes = await fetch(`/api/portal/content-pipeline/runs/${encodeURIComponent(runId)}`);
        const pollData = await pollRes.json().catch(() => null);
        if (!pollData?.success || !pollData.run) continue;

        if (pollData.run.status === "writing_blog") {
          setTriggerProgress((p) => Math.max(p, 55));
          setTriggerStep("Stage 2: AI Medical Writer drafting 800+ word article & references...");
        } else if (pollData.run.status !== "researching") {
          finished = true;
          break;
        } else {
          setTriggerProgress((p) => Math.min(p + 2, 45));
        }
      }

      if (triggerBackgroundedRef.current) return;

      if (!finished) {
        throw new Error(
          "This is taking longer than expected. The run is still generating in the background — check back in the run list shortly."
        );
      }

      setTriggerProgress(100);
      setTriggerStep("Run completed! Loading review workspace...");
      await new Promise((r) => setTimeout(r, 400));
      setIsTriggerModalOpen(false);
      setNewRunTopic("");
      await fetchPipelineRuns();
      await fetchRunDetail(runId);
      setActionFeedback("🚀 New content automation run completed successfully!");
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      if (triggerBackgroundedRef.current) return;
      console.error("Error triggering run:", err);
      toast.error(err?.message || "An error occurred while triggering the automation run.");
    } finally {
      if (!triggerBackgroundedRef.current) {
        setIsTriggering(false);
        setTriggerProgress(0);
        setTriggerStep("");
      }
    }
  };

  // Closes the "Start New Run" modal while generation is in progress without
  // cancelling the actual server-side work (which keeps running regardless) — the run
  // will simply show as "Researching"/"Writing Blog" in the list until it's ready.
  const handleBackgroundTriggerRun = () => {
    triggerBackgroundedRef.current = true;
    setIsTriggering(false);
    setTriggerProgress(0);
    setTriggerStep("");
    setIsTriggerModalOpen(false);
    fetchPipelineRuns();
  };

  // Submit review decision (approved | edited | revision_requested | revert_to_blog | revert_to_social)
  const handleReviewSubmission = async (
    stage: "blog" | "social",
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social" | "save_progress",
    customPayload?: any,
    platform?: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel",
    keepEditMode?: boolean
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

      if (decision === "edited" || decision === "save_progress") {
        if (stage === "blog") {
          // Prefer an explicitly passed payload (e.g. from an image attach that just
          // computed a fresh body) over component state — state setters like
          // setEditBody() don't take effect until the next render, so reading
          // editBody here in the same call would silently submit stale text.
          bodyData.editedContent = customPayload || {
            title: editTitle,
            excerpt: editExcerpt,
            body_markdown: editBody,
            body: editBody,
            suggestedImages: editSuggestedImages,
            category: editCategory,
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
        if (!keepEditMode) {
          setIsEditMode(false);
        }
        setEditingPlatform(null);
        setIsRevisionModalOpen(false);
        setRevisionNotes("");
        setRevisionPlatform(undefined);
        await fetchPipelineRuns();
        // Only re-fetch run detail (which resets local edit state) if we are not in edit mode
        if (!keepEditMode) {
          await fetchRunDetail(data.run.run_id, true);
        } else {
          // Just refresh the run list without blowing away our local edits
          setSelectedRun(data.run);
        }
        const targetDesc = platform ? `${platform.toUpperCase()} (${decision.toUpperCase()})` : decision.toUpperCase();
        const feedbackMessage = decision === "save_progress" 
          ? "✓ Draft progress saved successfully! You can resume editing on any device." 
          : `✓ Action for ${targetDesc} recorded successfully.`;
        setActionFeedback(feedbackMessage);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setActionError(err?.message || "An unexpected network error occurred while submitting the review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Backfills Instagram Story/Carousel/Reel content for runs created before those
  // formats existed, whose social_drafts have those fields missing entirely.
  const handleGenerateMissingFormats = async () => {
    if (!selectedRun) return;
    setIsBackfillingFormats(true);
    try {
      const res = await fetch(`/api/portal/content-pipeline/runs/${selectedRun.run_id}/generate-formats`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.run) {
        setSelectedRun(data.run);
        await fetchPipelineRuns();
      } else {
        toast.error(data.error || "Failed to generate the missing format.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error generating the missing format.");
    } finally {
      setIsBackfillingFormats(false);
    }
  };

  const renderMissingFormatCta = (label: string) => (
    <div className="max-w-md mx-auto bg-dark-overlay-navy border border-dashed border-white/20 rounded-xl p-6 text-center space-y-3 animate-fadeIn">
      <p className="text-xs text-white/60">
        This run was created before {label} content existed. Generate it now to review and approve it.
      </p>
      <button
        type="button"
        onClick={handleGenerateMissingFormats}
        disabled={isBackfillingFormats}
        className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all disabled:opacity-60 cursor-pointer"
      >
        {isBackfillingFormats ? "Generating…" : `✨ Generate ${label}`}
      </button>
    </div>
  );

  // Image attachment helpers
  // Note: handleAttachImage handles the featured/main image (uploaded via the Images tab or the
  // featured image section), NOT inline placeholder images. Inline placeholders are handled by
  // handleAttachPlaceholderImage above, which writes them directly into body_markdown.
  const handleAttachImage = async (newImageUrl: string) => {
    if (!selectedRun) return;
    const cleanUrl = newImageUrl.trim();
    const updatedImages = [cleanUrl, ...editSuggestedImages.filter((img) => img !== cleanUrl)];

    // Always update local preview state immediately
    setEditSuggestedImages(updatedImages);

    // If we are in edit mode, keep editing — save happens on "Save & Approve".
    if (isEditMode) return;

    // Outside edit mode (read-only view), persist to server immediately as progress
    // (not "edited", which would prematurely advance the run past blog review).
    const currentDraft = selectedRun.blog_drafts[0];
    await handleReviewSubmission("blog", "save_progress", {
      title: editTitle || currentDraft?.title,
      excerpt: editExcerpt || currentDraft?.excerpt,
      body_markdown: editBody || currentDraft?.body_markdown || currentDraft?.body,
      body: editBody || currentDraft?.body_markdown || currentDraft?.body,
      suggestedImages: updatedImages,
      references: currentDraft?.references,
      category: editCategory || currentDraft?.category,
    }, undefined, true);
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
  const subscribersList: any[] = statsData?.newsletter?.subscribersList || [];
  const clickEvents = statsData?.clickEvents || { callNowClicks: 0, bookAppointmentClicks: 0, whatsappClicks: 0 };
  const totalClicks = (clickEvents.callNowClicks || 0) + (clickEvents.bookAppointmentClicks || 0) + (clickEvents.whatsappClicks || 0);
  const trendingTopics = statsData?.trendingTopics || [];
  const pollResults = statsData?.pollResults || { votes: {}, suggestions: [] };
  const pollVotesTotal = Object.values(pollResults.votes || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0);
  const filteredSubscribers = subscriberSearch.trim()
    ? subscribersList.filter((s) =>
        `${s.name || ""} ${s.email || ""}`.toLowerCase().includes(subscriberSearch.trim().toLowerCase())
      )
    : subscribersList;

  const handleExportSubscribersCsv = () => {
    const header = ["Name", "Email", "Primary Interest", "Consent Source", "Consent Date"];
    const rows = filteredSubscribers.map((s) => [
      s.name || "",
      s.email || "",
      s.primaryInterest || "",
      s.consentSource || "",
      s.consentGivenAt ? formatDateSafe(s.consentGivenAt) : "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lkc-newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // A run is "mid manual edit" (Save Progress was used) rather than a fresh, never-touched
  // draft when the run has been touched (updated_at) more recently than its latest draft
  // version was created. A fresh run or a freshly AI-rewritten revision always has
  // run.updated_at === latest draft's created_at (both stamped with the same timestamp at
  // creation time); only "Save Progress" moves updated_at forward without creating a new
  // draft version, so this needs no extra persisted field to detect.
  const isBlogEditInProgress = (run: ContentPipelineRun) => {
    const latestDraft = run.blog_drafts?.[0];
    return (
      run.status === "awaiting_blog_approval" &&
      !!latestDraft &&
      run.updated_at !== latestDraft.created_at
    );
  };

  // Group pipeline runs
  const reviewNeededRuns = pipelineRuns.filter(
    (r) => r.status === "awaiting_blog_approval" || r.status === "awaiting_social_approval"
  );
  const otherRuns = pipelineRuns.filter(
    (r) => r.status !== "awaiting_blog_approval" && r.status !== "awaiting_social_approval"
  );
  const pipelineSearchTerm = pipelineSearch.trim().toLowerCase();
  const matchesPipelineSearch = (r: ContentPipelineRun) =>
    !pipelineSearchTerm || r.topic.toLowerCase().includes(pipelineSearchTerm) || r.run_id.toLowerCase().includes(pipelineSearchTerm);
  const visibleReviewNeededRuns = reviewNeededRuns.filter(matchesPipelineSearch);
  const visibleOtherRuns = otherRuns.filter(matchesPipelineSearch);
  const reviewNeededPages = clinicalReviewPages.filter((page) => !page.review.reviewed);
  const openCommunityReportsCount = communityReports.filter((report) => report.status === "open").length;
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
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "topics", label: "Topics", icon: "💡" },
    { id: "events", label: "Clicks", icon: "👆" },
    { id: "newsletter", label: "Subscribers", icon: "📧" },
    { id: "newsletterCreator", label: "Newsletters", icon: "✉️" },
    {
      id: "pipeline",
      label: "Pipeline",
      icon: "📝",
      badge: reviewNeededRuns.length > 0 ? reviewNeededRuns.length : null,
    },
    {
      id: "clinicalReview",
      label: "Review",
      icon: "🩺",
      badge: reviewNeededPages.length > 0 ? reviewNeededPages.length : null,
    },
    {
      id: "community",
      label: "Community",
      icon: "💬",
      badge: openCommunityReportsCount > 0 ? openCommunityReportsCount : null,
    },
    {
      id: "educationHub",
      label: "Education Hub",
      icon: "📚",
      badge: null,
    },
    {
      id: "socialOnly",
      label: "Social Posts",
      icon: "📱",
      badge: null,
    },
  ];
  const handleNavTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    if (tabId === "pipeline") {
      setSelectedRun(null);
      setRunDetailTab("draft");
      setEditingPlatform(null);
    }
    if (tabId === "clinicalReview") {
      setSelectedReviewPageId(null);
    }
  };

  const handleAdminLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/portal/business/login";
  };

  const handleAdminPasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminPasswordError("");
    setAdminPasswordMessage("");

    if (adminPassword.length < 8) {
      setAdminPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (adminPassword !== adminPasswordConfirm) {
      setAdminPasswordError("Passwords do not match.");
      return;
    }

    setAdminPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: adminPassword });

      if (error) {
        setAdminPasswordError(error.message);
        return;
      }

      setAdminPassword("");
      setAdminPasswordConfirm("");
      setAdminPasswordMessage("Dashboard password updated.");
    } catch (err) {
      console.error(err);
      setAdminPasswordError("Network error. Please try again.");
    } finally {
      setAdminPasswordSaving(false);
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
              <button
                type="button"
                onClick={() => setIsAdminPasswordOpen((value) => !value)}
                className="bg-dark-overlay-navy hover:bg-white/5 border border-white/10 text-white/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="col-span-2 bg-dark-overlay-navy hover:bg-white/5 border border-white/10 text-white/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                Sign Out
              </button>
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
              <button
                type="button"
                onClick={() => setIsAdminPasswordOpen((value) => !value)}
                className="bg-dark-overlay-navy hover:bg-white/5 border border-white/10 text-white/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="bg-dark-overlay-navy hover:bg-white/5 border border-white/10 text-white/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {isAdminPasswordOpen && (
            <form
              onSubmit={handleAdminPasswordChange}
              className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-deep-navy/70 p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="password"
                minLength={8}
                required
                placeholder="New password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="rounded-lg border border-white/10 bg-primary-navy px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-clinical-teal focus:outline-none"
              />
              <input
                type="password"
                minLength={8}
                required
                placeholder="Confirm password"
                value={adminPasswordConfirm}
                onChange={(event) => setAdminPasswordConfirm(event.target.value)}
                className="rounded-lg border border-white/10 bg-primary-navy px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-clinical-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={adminPasswordSaving}
                className="rounded-lg bg-clinical-teal px-4 py-2 text-xs font-bold text-deep-navy transition-colors hover:bg-clinical-teal-hover disabled:opacity-60"
              >
                {adminPasswordSaving ? "Saving..." : "Save Password"}
              </button>
              {(adminPasswordMessage || adminPasswordError) && (
                <p className={`text-xs md:col-span-3 ${adminPasswordError ? "text-status-error" : "text-clinical-teal"}`}>
                  {adminPasswordError || adminPasswordMessage}
                </p>
              )}
            </form>
          )}
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

          {/* Desktop/Tablet: horizontal-scrollable, never wraps */}
          <div className="hidden md:block relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center justify-center gap-1.5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleNavTabClick(tab.id)}
                    className={`py-1.5 px-2 rounded-lg text-[13px] transition-all flex items-center gap-1 cursor-pointer border shrink-0 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-clinical-teal text-deep-navy border-clinical-teal shadow-md"
                        : "bg-deep-navy text-white/70 hover:text-white border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[13px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-clinical-teal text-deep-navy text-[13px] font-bold px-1.5 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Scroll hints — justify-center means an overflowing bar can clip both edges at once, with no scrollbar (scrollbar-hide) to signal it */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-primary-navy to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-primary-navy to-transparent" />
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
                      {trendingTopics.length === 0 ? (
                        <div className="text-center text-white/40 text-xs py-8 border border-dashed border-white/10 rounded-xl">
                          No trending topics yet — these are drawn from real patient contact enquiries.
                        </div>
                      ) : (
                        trendingTopics.slice(0, 4).map((t: any, i: number) => (
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
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patient Content Poll Votes</h3>
                      <span className="text-[11px] text-white/60 font-mono">{Number(pollVotesTotal)} Total Votes</span>
                    </div>
                    <div className="space-y-3">
                      {Object.keys(pollResults.votes || {}).length === 0 ? (
                        <div className="text-center text-white/40 text-xs py-8 border border-dashed border-white/10 rounded-xl">
                          No poll votes yet.
                        </div>
                      ) : (
                        Object.entries(pollResults.votes || {}).map(([opt, count]: [string, any], idx: number) => {
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
                        })
                      )}
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
                    {trendingTopics.length === 0 ? (
                      <div className="text-center text-white/40 text-xs py-12 border border-dashed border-white/10 rounded-xl">
                        No trending topics yet — once patients submit contact enquiries, the most common themes will appear here for you to turn into content.
                      </div>
                    ) : (
                      trendingTopics.map((t: any, idx: number) => (
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
                      ))
                    )}
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
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white">Verified Subscriber Directory</h2>
                      <p className="text-xs text-white/60">Total signups: {totalSignups}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subscriberSearch}
                        onChange={(e) => setSubscriberSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-56"
                      />
                      <button
                        onClick={handleExportSubscribersCsv}
                        disabled={filteredSubscribers.length === 0}
                        className="bg-dark-overlay-navy hover:bg-white/5 text-clinical-teal border border-clinical-teal/40 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        ⬇ Export CSV
                      </button>
                    </div>
                  </div>

                  {subscribersList.length === 0 ? (
                    <div className="text-center text-white/40 text-xs py-12 border border-dashed border-white/10 rounded-xl">
                      No subscribers yet.
                    </div>
                  ) : filteredSubscribers.length === 0 ? (
                    <div className="text-center text-white/40 text-xs py-12 border border-dashed border-white/10 rounded-xl">
                      No subscribers match "{subscriberSearch}".
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="min-w-full divide-y divide-white/10 text-xs">
                        <thead className="bg-dark-overlay-navy">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-bold text-white/70 uppercase tracking-wider text-[10px]">Name</th>
                            <th className="px-4 py-2.5 text-left font-bold text-white/70 uppercase tracking-wider text-[10px]">Email</th>
                            <th className="px-4 py-2.5 text-left font-bold text-white/70 uppercase tracking-wider text-[10px]">Primary Interest</th>
                            <th className="px-4 py-2.5 text-left font-bold text-white/70 uppercase tracking-wider text-[10px]">Consent Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredSubscribers.map((s, idx) => (
                            <tr key={s.id || s.email || idx} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-2.5 text-white/90 font-medium whitespace-nowrap">{s.name || "—"}</td>
                              <td className="px-4 py-2.5 text-white/70 whitespace-nowrap">{s.email || "—"}</td>
                              <td className="px-4 py-2.5 text-white/70 whitespace-nowrap">{s.primaryInterest || "—"}</td>
                              <td className="px-4 py-2.5 text-white/50 font-mono whitespace-nowrap">
                                {s.consentGivenAt ? formatDateSafe(s.consentGivenAt) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: NEWSLETTER CREATOR */}
            {activeTab === "newsletterCreator" && (
              <div className="space-y-6">
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-white">Clinical Newsletter Creator</h2>
                    <p className="text-xs text-white/60 mt-1">
                      Draft evidence-based patient newsletters using PubMed research and distribute directly to your subscribed audience.
                    </p>
                  </div>
                  <div className="bg-dark-overlay-navy border border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-clinical-teal tracking-wider block">Audience Size</span>
                    <span className="text-lg font-mono font-bold text-white">{activeSubscribersCount} active subscribers</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Topic Planner and List column */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Monthly Digest Generator */}
                    <div className="bg-primary-navy border border-clinical-teal/30 rounded-2xl p-5 shadow-lg space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">Monthly Digest</h3>
                        <p className="text-[11px] text-white/60 mt-1">
                          Auto-composed from this month's blog posts, top patient questions, and the newsletter poll — plus one rotating educational tip.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateDigestNewsletter}
                        disabled={isGeneratingDigest}
                        className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all ${
                          isGeneratingDigest
                            ? "bg-white/10 text-white/40 cursor-not-allowed"
                            : "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
                        }`}
                      >
                        {isGeneratingDigest ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            Composing Digest...
                          </>
                        ) : (
                          "✨ Generate Monthly Digest"
                        )}
                      </button>
                    </div>

                    {/* Draft Generator Form */}
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-white">Generate Single-Topic Draft</h3>

                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-white/80">Newsletter Topic / Clinical Question</label>
                        <textarea
                          rows={3}
                          value={newNewsletterTopic}
                          onChange={(e) => setNewNewsletterTopic(e.target.value)}
                          placeholder="e.g., Viscosupplementation vs Steroids for Knee OA, or recovery tips after Meniscus rehab"
                          className="w-full bg-dark-overlay-navy border border-white/15 text-white placeholder-white/40 text-xs rounded-xl p-3 focus:outline-none focus:border-clinical-teal resize-none"
                        />
                      </div>

                      <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                        <input
                          type="checkbox"
                          checked={newsletterIncludeResearch}
                          onChange={(e) => setNewsletterIncludeResearch(e.target.checked)}
                          className="w-4 h-4 accent-clinical-teal cursor-pointer"
                        />
                        <span className="text-xs text-white/90">Perform PubMed Research & Cite Studies</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleGenerateNewsletter}
                        disabled={isGeneratingNewsletter || !newNewsletterTopic.trim()}
                        className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all ${
                          isGeneratingNewsletter || !newNewsletterTopic.trim()
                            ? "bg-white/10 text-white/40 cursor-not-allowed"
                            : "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
                        }`}
                      >
                        {isGeneratingNewsletter ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            Analyzing PubMed & Writing...
                          </>
                        ) : (
                          "✨ Generate Newsletter Draft"
                        )}
                      </button>
                    </div>

                    {/* Suggested Patient Topics */}
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
                      <h3 className="text-xs uppercase font-bold text-clinical-teal tracking-wider">Suggested Clinic Topics</h3>
                      <div className="space-y-2">
                        {[
                          "PRP Injections vs Cortisone for Knee Osteoarthritis",
                          "Arthrosamid for Knee Joint Preservation",
                          "Timeline and Exercises for ACL Post-Op Recovery",
                          "How to Manage Baker's Cyst Pain at Home",
                          "Understanding Meniscus Tears: Surgery vs Rehab",
                          "General Knee Health & Preservation Tips"
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewNewsletterTopic(t)}
                            className="w-full text-left bg-dark-overlay-navy hover:bg-white/5 border border-white/5 hover:border-white/10 text-white/90 text-xs p-2.5 rounded-xl transition-all block cursor-pointer"
                          >
                            💡 {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* History & Drafts List */}
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
                      <h3 className="text-xs uppercase font-bold text-clinical-teal tracking-wider">Newsletter History & Drafts</h3>
                      {newsletterLoading ? (
                        <div className="text-center text-white/40 text-xs py-8">Loading history...</div>
                      ) : newsletterEditions.length === 0 ? (
                        <div className="text-center text-white/40 text-xs py-8 border border-dashed border-white/10 rounded-xl">
                          No drafts or sent editions.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {newsletterEditions.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => selectNewsletterForEdit(item)}
                              className={`p-3 border rounded-xl transition-all cursor-pointer text-left ${
                                selectedNewsletter?.id === item.id
                                  ? "bg-clinical-teal/10 border-clinical-teal"
                                  : "bg-dark-overlay-navy border-white/5 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-center text-[9px] text-white/50 mb-1.5">
                                <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                                  item.status === "sent" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                                }`}>
                                  {item.status}
                                </span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-white text-xs truncate">{item.subject}</h4>
                              <p className="text-[10px] text-white/60 truncate mt-1">Topic: {item.topic}</p>
                              {item.status === "sent" && (
                                <p className="text-[9px] text-emerald-400 font-mono mt-1">✓ Sent to {item.recipientsCount} patients</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Side-by-Side Live Editor & Preview */}
                  <div className="lg:col-span-8">
                    {selectedNewsletter ? (
                      <div className="bg-primary-navy border border-white/10 rounded-2xl p-5 shadow-lg space-y-6">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <div>
                            <span className="text-[10px] font-bold text-clinical-teal uppercase tracking-wider block">Editing Newsletter Draft</span>
                            <span className="text-white text-xs font-mono font-bold">{selectedNewsletter.id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteNewsletter(selectedNewsletter.id)}
                              className="text-white/60 hover:text-rose-400 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                            >
                              Discard Draft
                            </button>
                            {selectedNewsletter.status === "draft" && (
                              <button
                                type="button"
                                onClick={() => setShowNewsletterSendConfirm(true)}
                                className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
                              >
                                🚀 Send Newsletter
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subject Editor */}
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-white/80">Email Subject Line</label>
                          <input
                            type="text"
                            value={newsletterEditSubject}
                            onChange={(e) => handleUpdateNewsletterContent(e.target.value, newsletterEditMarkdown)}
                            disabled={selectedNewsletter.status === "sent"}
                            className="w-full bg-dark-overlay-navy border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-clinical-teal"
                          />
                        </div>

                        {/* Markdown / Live HTML Preview Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                          {/* Markdown Text Area */}
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-white/80">Newsletter Body (Markdown)</label>
                            <textarea
                              rows={16}
                              value={newsletterEditMarkdown}
                              onChange={(e) => handleUpdateNewsletterContent(newsletterEditSubject, e.target.value)}
                              disabled={selectedNewsletter.status === "sent"}
                              placeholder="Draft your newsletter text here..."
                              className="w-full h-[400px] bg-dark-overlay-navy border border-white/15 text-white placeholder-white/30 text-xs font-mono rounded-xl p-4 focus:outline-none focus:border-clinical-teal"
                            />
                          </div>

                          {/* Live HTML Inbox Preview */}
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-white/80">Inbox Preview (HTML Rendering)</label>
                            <div className="w-full h-[400px] bg-[#f8fafc] border border-white/10 rounded-xl overflow-y-auto">
                              {newsletterHtmlPreview ? (
                                <div dangerouslySetInnerHTML={{ __html: newsletterHtmlPreview }} />
                              ) : (
                                <div className="text-center text-slate-400 text-xs py-20">Preview renders dynamically as you type.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[400px] bg-primary-navy border border-white/10 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center text-center space-y-3">
                        <span className="text-4xl">✉️</span>
                        <h3 className="font-bold text-white text-sm">No Newsletter Selected</h3>
                        <p className="text-xs text-white/60 max-w-sm">
                          Select a newsletter draft from the history list or generate a new one from the generator panel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Newsletter Campaign Distribution Confirmation Modal */}
                {showNewsletterSendConfirm && selectedNewsletter && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-primary-navy border border-white/10 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
                      <div className="text-center space-y-2">
                        <span className="text-4xl block">📣</span>
                        <h3 className="font-serif text-lg font-bold text-white">Confirm Campaign Distribution</h3>
                        <p className="text-xs text-white/70">
                          You are about to distribute the newsletter **"{selectedNewsletter.subject}"** to all subscribed patients.
                        </p>
                      </div>

                      <div className="bg-dark-overlay-navy border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/60">Campaign Topic:</span>
                          <span className="text-white font-bold">{selectedNewsletter.topic}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/60">Recipient Count:</span>
                          <span className="text-clinical-teal font-mono font-bold">{activeSubscribersCount} active subscribers</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/60">Includes PubMed citations:</span>
                          <span className="text-white font-semibold">{selectedNewsletter.includeResearch ? "Yes (Stage 1 scan)" : "No (Lay update)"}</span>
                        </div>
                      </div>

                      <div className="bg-teal-500/10 border border-teal-500/25 text-teal-400 text-[10px] leading-relaxed p-3.5 rounded-xl">
                        🔒 **Clinical Guidelines Enforcement**: The newsletter contents utilize layman's terms with jargon-control filters and direct consultation booking links for patient safety.
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowNewsletterSendConfirm(false)}
                          className="flex-1 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSendNewsletter}
                          disabled={isSendingNewsletter}
                          className="flex-1 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSendingNewsletter ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                              Distributing...
                            </>
                          ) : (
                            "Confirm Send"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CLINICAL REVIEW */}
            {activeTab === "clinicalReview" && (
              <div className="space-y-8">
                <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Clinical Review Status</h2>
                    <p className="text-xs text-white/60 mt-1">
                      Manage the &quot;Clinically Reviewed&quot; status shown on symptom, condition, treatment and injection pages.
                    </p>
                  </div>
                  {selectedReviewPageId && (
                    <button
                      onClick={() => setSelectedReviewPageId(null)}
                      className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      ← Back to List
                    </button>
                  )}
                </div>

                {clinicalReviewLoading ? (
                  <div className="text-center text-white/50 text-sm py-12">Loading pages…</div>
                ) : selectedReviewPageId ? (
                  (() => {
                    const page = clinicalReviewPages.find((p) => p.pageId === selectedReviewPageId);
                    if (!page) return null;
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
                            {page.contentType}
                          </span>
                          <h3 className="text-base font-bold text-white">{page.name}</h3>
                          <Link href={page.url} target="_blank" className="text-xs text-clinical-teal hover:underline">
                            View page →
                          </Link>
                        </div>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reviewFormReviewed}
                            onChange={(e) => setReviewFormReviewed(e.target.checked)}
                            className="w-4 h-4 accent-clinical-teal cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-white">Mark as clinically reviewed</span>
                        </label>

                        <div>
                          <div className="text-xs text-clinical-teal mb-1 font-semibold">Reviewer Name</div>
                          <input
                            type="text"
                            value={reviewFormReviewerName}
                            onChange={(e) => setReviewFormReviewerName(e.target.value)}
                            className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-clinical-teal mb-1 font-semibold">Reviewer Title</div>
                          <input
                            type="text"
                            value={reviewFormReviewerTitle}
                            onChange={(e) => setReviewFormReviewerTitle(e.target.value)}
                            className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-clinical-teal mb-1 font-semibold">Last Reviewed Date</div>
                          <input
                            type="text"
                            placeholder="e.g. July 2026"
                            value={reviewFormLastReviewedDate}
                            onChange={(e) => setReviewFormLastReviewedDate(e.target.value)}
                            className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-clinical-teal mb-1 font-semibold">Evidence Sources</div>
                          <textarea
                            rows={3}
                            placeholder="e.g. NICE clinical knowledge summaries and British Orthopaedic Association (BOA) guidelines."
                            value={reviewFormEvidenceSource}
                            onChange={(e) => setReviewFormEvidenceSource(e.target.value)}
                            className="w-full bg-primary-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveReview}
                            disabled={isSavingReview}
                            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {isSavingReview ? "Saving…" : "Save"}
                          </button>
                          {reviewFormReviewed && (
                            <button
                              onClick={() => setReviewFormReviewed(false)}
                              className="border border-orange-500/30 hover:border-orange-500/50 text-orange-400 hover:bg-orange-500/5 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              Reset to Awaiting Review
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReviewPageId(null)}
                            className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-white">Suggested Evidence Sources</h3>
                            <p className="text-[11px] text-white/50 mt-0.5">
                              Web search results for &quot;{page.name}&quot;. Tick any references to move them into Evidence Sources.
                            </p>
                          </div>
                          <button
                            onClick={handleRefreshSearch}
                            disabled={searchLoading}
                            className="shrink-0 bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {searchLoading ? "Searching…" : "Refresh Search"}
                          </button>
                        </div>

                        {addedResults.length > 0 && (
                          <div className="space-y-2 border-b border-white/10 pb-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
                              Added to Evidence Sources ({addedResults.length})
                            </h4>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {addedResults.map((result) => (
                                <button
                                  key={result.url}
                                  type="button"
                                  onClick={() => handleUndoSearchResult(result)}
                                  className="w-full flex items-start gap-2.5 bg-dark-overlay-navy/60 border border-white/5 rounded-xl p-2.5 cursor-pointer hover:border-amber-400/40 transition-colors text-left"
                                >
                                  <span className="w-4 h-4 rounded-sm bg-clinical-teal flex items-center justify-center mt-0.5 shrink-0">
                                    <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l3 3 7-7" />
                                    </svg>
                                  </span>
                                  <div className="min-w-0">
                                    {result.source && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">
                                        {result.source}
                                      </span>
                                    )}
                                    <span className="text-xs font-semibold text-white/50 line-through block truncate">
                                      {result.title}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-white/40">Click a reference above to move it back to Suggested.</p>
                          </div>
                        )}

                        {searchLoading ? (
                          <div className="text-center text-white/50 text-xs py-10">Searching…</div>
                        ) : searchError ? (
                          <div className="text-center text-xs py-10 space-y-2">
                            <p className="text-amber-400">{searchError}</p>
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="text-center text-white/50 text-xs py-10">No results found.</div>
                        ) : (
                          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                            {searchResults.map((result) => (
                              <label
                                key={result.url}
                                className="flex items-start gap-2.5 bg-dark-overlay-navy border border-white/5 rounded-xl p-3 cursor-pointer hover:border-clinical-teal/40 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  onChange={() => handleTickSearchResult(result)}
                                  className="w-4 h-4 accent-clinical-teal cursor-pointer mt-0.5 shrink-0"
                                />
                                <div className="space-y-1 min-w-0">
                                  {result.source && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">
                                      {result.source}
                                    </span>
                                  )}
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-semibold text-clinical-teal hover:underline block"
                                  >
                                    {result.title}
                                  </a>
                                  <p className="text-[11px] text-white/60 leading-relaxed">{result.summary}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const searchTerm = clinicalReviewSearch.trim().toLowerCase();
                      const visiblePages = searchTerm
                        ? clinicalReviewPages.filter((p) => p.name.toLowerCase().includes(searchTerm))
                        : clinicalReviewPages;
                      const visibleIds = visiblePages.map((p) => p.pageId);
                      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => bulkReviewSelection.has(id));

                      const toggleSelectAllVisible = () => {
                        setBulkReviewSelection((prev) => {
                          const next = new Set(prev);
                          if (allVisibleSelected) {
                            visibleIds.forEach((id) => next.delete(id));
                          } else {
                            visibleIds.forEach((id) => next.add(id));
                          }
                          return next;
                        });
                      };

                      const togglePageSelected = (pageId: string) => {
                        setBulkReviewSelection((prev) => {
                          const next = new Set(prev);
                          if (next.has(pageId)) next.delete(pageId);
                          else next.add(pageId);
                          return next;
                        });
                      };

                      return (
                        <>
                          <div className="bg-primary-navy border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3">
                            <input
                              type="text"
                              value={clinicalReviewSearch}
                              onChange={(e) => setClinicalReviewSearch(e.target.value)}
                              placeholder="Search pages by name…"
                              className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-64"
                            />
                            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={allVisibleSelected}
                                onChange={toggleSelectAllVisible}
                                className="w-4 h-4 accent-clinical-teal cursor-pointer"
                              />
                              Select all visible ({visiblePages.length})
                            </label>
                            {bulkReviewSelection.size > 0 && (
                              <div className="sm:ml-auto flex items-center gap-2">
                                <span className="text-xs text-clinical-teal font-semibold">{bulkReviewSelection.size} selected</span>
                                <button
                                  onClick={() => setIsBulkReviewFormOpen(true)}
                                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Bulk Mark Reviewed
                                </button>
                                <button
                                  onClick={() => setBulkReviewSelection(new Set())}
                                  className="text-xs text-white/50 hover:text-white/80 cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          {isBulkReviewFormOpen && (
                            <div className="bg-primary-navy border border-clinical-teal/40 rounded-2xl p-5 shadow-lg space-y-3">
                              <h4 className="text-sm font-bold text-white">
                                Mark {bulkReviewSelection.size} page{bulkReviewSelection.size === 1 ? "" : "s"} as clinically reviewed
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  value={bulkReviewerName}
                                  onChange={(e) => setBulkReviewerName(e.target.value)}
                                  placeholder="Reviewer name"
                                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={bulkReviewerTitle}
                                  onChange={(e) => setBulkReviewerTitle(e.target.value)}
                                  placeholder="Reviewer title"
                                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={bulkReviewDate}
                                  onChange={(e) => setBulkReviewDate(e.target.value)}
                                  placeholder="e.g. August 2026"
                                  className="bg-dark-overlay-navy border border-white/20 text-white rounded-lg p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setIsBulkReviewFormOpen(false)}
                                  className="border border-white/20 text-white/80 hover:bg-white/5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveBulkReview}
                                  disabled={isSavingBulkReview}
                                  className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {isSavingBulkReview ? "Saving…" : "Confirm & Save"}
                                </button>
                              </div>
                            </div>
                          )}

                          {visiblePages.length === 0 ? (
                            <div className="text-center text-white/40 text-xs py-12 border border-dashed border-white/10 rounded-xl">
                              No pages match "{clinicalReviewSearch}".
                            </div>
                          ) : (
                            (["symptoms", "conditions", "treatments", "injections"] as const).map((contentType) => {
                              const pagesOfType = visiblePages.filter((p) => p.contentType === contentType);
                              if (pagesOfType.length === 0) return null;
                              return (
                                <div
                                  key={contentType}
                                  className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-3"
                                >
                                  <h3 className="text-sm font-bold text-white uppercase tracking-wider capitalize">
                                    {contentType}
                                  </h3>
                                  <div className="space-y-2">
                                    {pagesOfType.map((page) => (
                                      <div
                                        key={page.pageId}
                                        className="w-full bg-dark-overlay-navy border border-white/5 rounded-xl p-3.5 flex items-center gap-3 hover:border-clinical-teal/40 transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={bulkReviewSelection.has(page.pageId)}
                                          onChange={() => togglePageSelected(page.pageId)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-4 h-4 accent-clinical-teal cursor-pointer shrink-0"
                                        />
                                        <button
                                          onClick={() => handleSelectReviewPage(page)}
                                          className="flex-1 text-left flex items-center justify-between gap-4 cursor-pointer"
                                        >
                                          <span className="text-xs text-white/90 font-medium">{page.name}</span>
                                          {page.review.reviewed ? (
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/30 shrink-0">
                                              Reviewed{page.review.lastReviewedDate ? ` — ${page.review.lastReviewedDate}` : ""}
                                            </span>
                                          ) : page.review.staleReview ? (
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 shrink-0">
                                              ⚠ Needs Re-Review{page.review.lastReviewedDate ? ` (was: ${page.review.lastReviewedDate})` : ""}
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                                              Awaiting review
                                            </span>
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMMUNITY MODERATION */}
            {activeTab === "community" && (
              <CommunityReportsTab
                reports={communityReports}
                loading={communityReportsLoading}
                error={communityActionError}
                onAction={handleCommunityReportAction}
              />
            )}

            {/* TAB: EDUCATION HUB ARTICLE MANAGEMENT */}
            {activeTab === "educationHub" && (
              <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Education Hub Articles</h3>
                    <p className="text-xs text-white/60 mt-1">
                      Remove an article if it's outdated or the underlying evidence has changed — it disappears from the
                      live site within a few minutes, no code deploy needed. Restoring it is just as instant.
                      Use Update to revise an article's content through the normal draft editor (references, images,
                      wording) — approving it publishes the changes live the same way.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={educationSearch}
                    onChange={(e) => setEducationSearch(e.target.value)}
                    placeholder="Search articles…"
                    className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-64 shrink-0"
                  />
                </div>

                {(() => {
                  const searchTerm = educationSearch.trim().toLowerCase();
                  const visibleArticles = searchTerm
                    ? educationArticles.filter(
                        (a) => a.title.toLowerCase().includes(searchTerm) || (a.category || "").toLowerCase().includes(searchTerm)
                      )
                    : educationArticles;

                  if (educationArticlesLoading) {
                    return <div className="py-8 text-center text-white/60 text-xs">Loading articles…</div>;
                  }
                  if (educationArticles.length === 0) {
                    return <div className="py-8 text-center text-white/60 text-xs">No Education Hub articles found.</div>;
                  }
                  if (visibleArticles.length === 0) {
                    return <div className="py-8 text-center text-white/40 text-xs">No articles match "{educationSearch}".</div>;
                  }
                  return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleArticles.map((article) => (
                      <div
                        key={article.slug}
                        className={`p-4 rounded-xl border space-y-2 ${
                          article.removed
                            ? "bg-dark-overlay-navy border-white/10 opacity-60"
                            : "bg-dark-overlay-navy border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-clinical-teal font-semibold">
                            {article.categoryLabel}
                          </span>
                          {article.removed && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-status-error/40 text-status-error">
                              Removed
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">{article.title}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/50 font-medium">
                          <span>Created: {formatDateSafe(article.datePublished)}</span>
                          {article.updatedAt && <span>Last Updated: {formatDateSafe(article.updatedAt)}</span>}
                          {article.removedAt && (
                            <span className="text-status-error/80">Removed: {formatDateSafe(article.removedAt)}</span>
                          )}
                          <span>{article.views.toLocaleString()} views</span>
                          {(article.feedbackUp > 0 || article.feedbackDown > 0) && (
                            <span>👍 {article.feedbackUp} · 👎 {article.feedbackDown}</span>
                          )}
                        </div>
                        <div className="flex justify-end items-center gap-2 pt-1 flex-wrap">
                          {!article.removed && (
                            <button
                              onClick={() => handleStartArticleUpdate(article)}
                              disabled={isStartingArticleUpdate === article.slug}
                              className="border border-white/20 text-white/80 hover:bg-white/5 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer font-medium disabled:opacity-50"
                            >
                              {isStartingArticleUpdate === article.slug ? "Starting…" : "✎ Update"}
                            </button>
                          )}
                          {article.removed ? (
                            <button
                              onClick={() => setArticlePendingRemoval(article)}
                              className="border border-clinical-teal/40 text-clinical-teal hover:bg-clinical-teal/10 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                            >
                              Restore to Education Hub
                            </button>
                          ) : (
                            <button
                              onClick={() => setArticlePendingRemoval(article)}
                              className="border border-status-error/40 text-status-error hover:bg-status-error/10 text-[11px] px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                            >
                              Remove from Education Hub
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: STANDALONE SOCIAL MEDIA POSTS */}
            {activeTab === "socialOnly" && (
              <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Media Posts</h3>
                    <p className="text-xs text-white/60 mt-1">
                      Generate Instagram, Facebook &amp; LinkedIn posts from a topic — no blog article needed. Edit,
                      regenerate, attach or generate an image, then approve and post manually using the download +
                      copy steps on each card.
                    </p>
                  </div>
                  {!selectedSocialOnlyPost && (
                    <button
                      onClick={() => setIsSocialOnlyModalOpen(true)}
                      className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>✨</span>
                      <span>New Social Post</span>
                    </button>
                  )}
                </div>

                {selectedSocialOnlyPost ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSocialOnlyPost(null)}
                        className="bg-dark-overlay-navy hover:bg-white/5 text-white/80 border border-white/20 text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        ← Back to List
                      </button>
                      <h4 className="font-serif text-sm font-bold text-white">{selectedSocialOnlyPost.topic}</h4>
                    </div>
                    <div className="space-y-4">
                      {/* Sub-Tab Navigation for Standalone Social Posts */}
                      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
                        {(["feed", "story", "carousel", "reel", "brandkit"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveSocialOnlySubTab(tab)}
                            className={`text-xs font-semibold px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                              activeSocialOnlySubTab === tab
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

                      {activeSocialOnlySubTab === "feed" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
                          <PlatformCard
                            platformKey="instagram"
                            platformLabel="Instagram Post"
                            icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.instagram.caption}
                            status={selectedSocialOnlyPost.instagram.status}
                            isPublished={false}
                            attachedImageUrl={selectedSocialOnlyPost.instagram.imageUrl}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "instagram")}
                            onSaveEdit={(newCaption) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "instagram", newCaption)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "instagram")}
                            onCopy={() => handleCopySocialOnly(selectedSocialOnlyPost.instagram.caption, "social-only-ig")}
                            isCopied={socialOnlyCopiedKey === "social-only-ig"}
                            onAttachImage={(url) => handleAttachSocialImage(selectedSocialOnlyPost.id, "instagram", url)}
                            imagePromptSuggestion={selectedSocialOnlyPost.instagram.imagePromptSuggestion}
                            onGenerateImage={(prompt) => handleGenerateSocialImage(selectedSocialOnlyPost.id, "instagram", prompt)}
                            isGeneratingImage={generatingSocialImageKey === `${selectedSocialOnlyPost.id}-instagram`}
                            showManualUploadGuide
                          />
                          <PlatformCard
                            platformKey="facebook"
                            platformLabel="Facebook Post"
                            icon={<FaFacebook className="w-4 h-4 text-[#1877F2]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.facebook.caption}
                            status={selectedSocialOnlyPost.facebook.status}
                            isPublished={false}
                            attachedImageUrl={selectedSocialOnlyPost.facebook.imageUrl}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "facebook")}
                            onSaveEdit={(newCaption) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "facebook", newCaption)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "facebook")}
                            onCopy={() => handleCopySocialOnly(selectedSocialOnlyPost.facebook.caption, "social-only-fb")}
                            isCopied={socialOnlyCopiedKey === "social-only-fb"}
                            onAttachImage={(url) => handleAttachSocialImage(selectedSocialOnlyPost.id, "facebook", url)}
                            imagePromptSuggestion={selectedSocialOnlyPost.facebook.imagePromptSuggestion}
                            onGenerateImage={(prompt) => handleGenerateSocialImage(selectedSocialOnlyPost.id, "facebook", prompt)}
                            isGeneratingImage={generatingSocialImageKey === `${selectedSocialOnlyPost.id}-facebook`}
                            showManualUploadGuide
                          />
                          <PlatformCard
                            platformKey="linkedin"
                            platformLabel="LinkedIn Post"
                            icon={<FaLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.linkedin.caption}
                            status={selectedSocialOnlyPost.linkedin.status}
                            isPublished={false}
                            attachedImageUrl={selectedSocialOnlyPost.linkedin.imageUrl}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "linkedin")}
                            onSaveEdit={(newCaption) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "linkedin", newCaption)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "linkedin")}
                            onCopy={() => handleCopySocialOnly(selectedSocialOnlyPost.linkedin.caption, "social-only-li")}
                            isCopied={socialOnlyCopiedKey === "social-only-li"}
                            onAttachImage={(url) => handleAttachSocialImage(selectedSocialOnlyPost.id, "linkedin", url)}
                            imagePromptSuggestion={selectedSocialOnlyPost.linkedin.imagePromptSuggestion}
                            onGenerateImage={(prompt) => handleGenerateSocialImage(selectedSocialOnlyPost.id, "linkedin", prompt)}
                            isGeneratingImage={generatingSocialImageKey === `${selectedSocialOnlyPost.id}-linkedin`}
                            showManualUploadGuide
                          />
                        </div>
                      )}

                      {activeSocialOnlySubTab === "story" && (
                        <div className="max-w-md mx-auto animate-fadeIn">
                          <PlatformCard
                            platformKey="instagramStory"
                            platformLabel="Instagram Story"
                            icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.instagramStory?.caption || `Check out our latest update about "${selectedSocialOnlyPost.topic}"!`}
                            status={selectedSocialOnlyPost.instagramStory?.status || "pending"}
                            isPublished={false}
                            attachedImageUrl={selectedSocialOnlyPost.instagramStory?.imageUrl}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "instagramStory")}
                            onSaveEdit={(newCaption) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "instagramStory", newCaption)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "instagramStory")}
                            onCopy={() => handleCopySocialOnly(selectedSocialOnlyPost.instagramStory?.caption || "", "social-only-story")}
                            isCopied={socialOnlyCopiedKey === "social-only-story"}
                            onAttachImage={(url) => handleAttachSocialImage(selectedSocialOnlyPost.id, "instagramStory", url)}
                            imagePromptSuggestion={selectedSocialOnlyPost.instagramStory?.imagePromptSuggestion || `A premium vertical 9:16 background image for "${selectedSocialOnlyPost.topic}"`}
                            onGenerateImage={(prompt) => handleGenerateSocialImage(selectedSocialOnlyPost.id, "instagramStory", prompt)}
                            isGeneratingImage={generatingSocialImageKey === `${selectedSocialOnlyPost.id}-instagramStory`}
                            showManualUploadGuide
                          />
                        </div>
                      )}

                      {activeSocialOnlySubTab === "carousel" && (
                        <div className="max-w-xl mx-auto animate-fadeIn">
                          <PlatformCard
                            platformKey="instagramCarousel"
                            platformLabel="Instagram Carousel"
                            icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.instagramCarousel?.caption || ""}
                            status={selectedSocialOnlyPost.instagramCarousel?.status || "pending"}
                            isPublished={false}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "instagramCarousel")}
                            onSaveEdit={(newCaption) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "instagramCarousel", newCaption)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "instagramCarousel")}
                            onCopy={() => {
                              const carousel = selectedSocialOnlyPost.instagramCarousel;
                              const textToCopy = carousel?.slides
                                ? carousel.slides.map(s => `Slide ${s.slideNumber}: ${s.text}`).join("\n\n")
                                : carousel?.caption || "";
                              handleCopySocialOnly(textToCopy, "social-only-carousel");
                            }}
                            isCopied={socialOnlyCopiedKey === "social-only-carousel"}
                            slides={selectedSocialOnlyPost.instagramCarousel?.slides}
                            onAttachImage={(url, slideIndex) => {
                              const slides = [...(selectedSocialOnlyPost.instagramCarousel?.slides || [])];
                              if (slideIndex !== undefined && slides[slideIndex]) {
                                slides[slideIndex] = { ...slides[slideIndex], imageUrl: url };
                              }
                              handleSaveSocialCaption(selectedSocialOnlyPost.id, "instagramCarousel", {
                                slides: slides,
                                caption: selectedSocialOnlyPost.instagramCarousel?.caption || ""
                              });
                            }}
                            onGenerateImage={(prompt, slideIndex) => handleGenerateSocialImage(selectedSocialOnlyPost.id, "instagramCarousel", prompt, slideIndex)}
                            isGeneratingImage={generatingSocialImageKey === `${selectedSocialOnlyPost.id}-instagramCarousel`}
                            showManualUploadGuide
                          />
                        </div>
                      )}

                      {activeSocialOnlySubTab === "reel" && (
                        <div className="max-w-xl mx-auto animate-fadeIn">
                          <PlatformCard
                            platformKey="instagramReel"
                            platformLabel="Instagram Reel Script"
                            icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                            color=""
                            borderColor=""
                            caption={selectedSocialOnlyPost.instagramReel?.caption || ""}
                            status={selectedSocialOnlyPost.instagramReel?.status || "pending"}
                            isPublished={false}
                            onApprove={() => handleApproveSocialCaption(selectedSocialOnlyPost.id, "instagramReel")}
                            onSaveEdit={(newScript) => handleSaveSocialCaption(selectedSocialOnlyPost.id, "instagramReel", { script: newScript } as any)}
                            onRequestRevision={() => handleRequestSocialRevision(selectedSocialOnlyPost.id, "instagramReel")}
                            onCopy={() => handleCopySocialOnly(selectedSocialOnlyPost.instagramReel?.script || "", "social-only-reel")}
                            isCopied={socialOnlyCopiedKey === "social-only-reel"}
                            script={selectedSocialOnlyPost.instagramReel?.script}
                            topic={selectedSocialOnlyPost.topic}
                            attachedVideoUrl={selectedSocialOnlyPost.instagramReel?.videoUrl}
                            videoSource={selectedSocialOnlyPost.instagramReel?.videoSource}
                            onAttachVideo={(url, source) => handleAttachSocialVideo(selectedSocialOnlyPost.id, url, source)}
                            showManualUploadGuide
                          />
                        </div>
                      )}

                      {activeSocialOnlySubTab === "brandkit" && (
                        <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 shadow-lg animate-fadeIn space-y-6 text-left">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-white mb-2">LKC Branded Template Backgrounds</h4>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Download these premium, pre-styled background templates with clinic margins and watermarks. Use them as background layers in Canva or directly in social media apps to overlay the generated caption text.
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
                ) : socialOnlyPostsLoading ? (
                  <div className="py-8 text-center text-white/60 text-xs">Loading social posts…</div>
                ) : socialOnlyPosts.length === 0 ? (
                  <div className="py-8 text-center text-white/60 text-xs">
                    No social posts yet — click "New Social Post" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialOnlyPosts.map((post) => {
                      const allApproved =
                        post.instagram.status === "approved" &&
                        post.facebook.status === "approved" &&
                        post.linkedin.status === "approved";
                      return (
                        <div
                          key={post.id}
                          className="p-4 bg-dark-overlay-navy border border-white/10 hover:border-clinical-teal/40 rounded-xl transition-all space-y-2 cursor-pointer"
                          onClick={() => setSelectedSocialOnlyPost(post)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                allApproved
                                  ? "border-clinical-teal/40 text-clinical-teal"
                                  : "border-white/20 text-white/60"
                              }`}
                            >
                              {allApproved ? "✓ All Approved" : "Needs Review"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSocialOnlyPost(post.id);
                              }}
                              className="text-[10px] text-status-error/80 hover:text-status-error cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">{post.topic}</h4>
                          <span className="text-[10px] text-white/40 font-mono block">
                            {formatDateSafe(post.updated_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* NEW SOCIAL POST MODAL */}
            {isSocialOnlyModalOpen && (
              <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-primary-navy border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>✨</span>
                      <span>New Social Media Post</span>
                    </h3>
                    <button
                      onClick={() => !isGeneratingSocialOnly && setIsSocialOnlyModalOpen(false)}
                      disabled={isGeneratingSocialOnly}
                      className="text-white/60 hover:text-white text-sm cursor-pointer disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleGenerateSocialOnly} className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/80 mb-1">Topic / Patient Question</label>
                      <input
                        type="text"
                        value={newSocialOnlyTopic}
                        onChange={(e) => setNewSocialOnlyTopic(e.target.value)}
                        disabled={isGeneratingSocialOnly}
                        placeholder="e.g. 5 signs your knee pain needs a specialist"
                        className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50"
                        autoFocus
                      />
                      <p className="text-[11px] text-white/60 mt-1.5">
                        Generates an Instagram, Facebook, and LinkedIn post — each written for that platform's tone,
                        length, and hashtag conventions.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSocialOnlyModalOpen(false)}
                        disabled={isGeneratingSocialOnly}
                        className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isGeneratingSocialOnly || !newSocialOnlyTopic.trim()}
                        className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isGeneratingSocialOnly && (
                          <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {isGeneratingSocialOnly ? "Generating…" : "Generate Posts"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* CONFIRM REMOVE/RESTORE ARTICLE MODAL */}
            {articlePendingRemoval && (
              <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-primary-navy border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white">
                    {articlePendingRemoval.removed ? "Restore this article?" : "Remove this article?"}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {articlePendingRemoval.removed
                      ? <>Confirm you want to restore <strong className="text-white">&ldquo;{articlePendingRemoval.title}&rdquo;</strong> to the Education Hub. It will become visible on the live site again within a few minutes.</>
                      : <>Confirm you want to remove <strong className="text-white">&ldquo;{articlePendingRemoval.title}&rdquo;</strong> from the Education Hub. It will disappear from the live site within a few minutes. You can restore it at any time from this screen.</>}
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setArticlePendingRemoval(null)}
                      disabled={isUpdatingArticleVisibility}
                      className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmArticleVisibility(articlePendingRemoval.removed ? "restore" : "remove")}
                      disabled={isUpdatingArticleVisibility}
                      className={`text-xs px-4 py-2 rounded-xl cursor-pointer font-medium disabled:opacity-50 ${
                        articlePendingRemoval.removed
                          ? "bg-clinical-teal hover:bg-clinical-teal-hover text-white"
                          : "bg-status-error hover:bg-status-error/90 text-white"
                      }`}
                    >
                      {isUpdatingArticleVisibility
                        ? "Saving…"
                        : articlePendingRemoval.removed
                        ? "Restore Article"
                        : "Remove Article"}
                    </button>
                  </div>
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
                                    onClick={handleApproveDraft}
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
                                        setEditBody(cleanHeadingBugs(latestDraft.body_markdown || latestDraft.body || ""));
                                        setEditCategory(latestDraft.category || "");
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
                                      <label className="block text-xs text-clinical-teal mb-1 font-semibold">Education Hub Category</label>
                                      <select
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value)}
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
                                          onClick={handleUndo}
                                          disabled={historyIndex <= 0}
                                          className="text-[10px] text-white/80 hover:bg-white/5 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                          title="Undo (Ctrl+Z)"
                                        >
                                          ↩ Undo
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleRedo}
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
                                        onChange={(e) => handleTextareaChange(e.target.value)}
                                        onKeyDown={handleTextareaKeyDown}
                                        
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
                                        <p className="text-[9px] text-white/70 italic border-l-2 border-clinical-teal pl-3 py-1">
                                          {editExcerpt}
                                        </p>
                                      )}
                                      <div className="border-t border-white/10 pt-4">
                                        <FormattedContent
                                           body={editBody}
                                           suggestedImages={editSuggestedImages}
                                          onAttachPlaceholder={(placeholderId, label, url, isFeatured) => handleAttachPlaceholderImage(placeholderId, label, url, isFeatured)}
                                          references={selectedRun.blog_drafts[0]?.references}
                                          generatingPlaceholderId={generatingImagePlaceholderId}
                                          pendingPreview={generatedImagePreview}
                                          onGenerateImage={(placeholderId, label, isFeatured) => handleGenerateImage(placeholderId, label, isFeatured)}
                                          onResetPlaceholder={handleResetPlaceholderImage}
                                          onRemovePlaceholder={handleRemovePlaceholder}
                                          onRemoveResolvedImage={handleRemoveResolvedImage}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between gap-3 pt-4 border-t border-white/10">
                                  <button
                                     onClick={handleDiscardChanges}
                                     className="border border-status-error/40 text-status-error hover:bg-status-error/10 text-xs px-4 py-2 rounded-xl cursor-pointer font-medium"
                                   >
                                     Discard Changes
                                   </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={handleFinishEditing}
                                      className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
                                      title="Close the editor and return to read-only view. Your changes are preserved locally."
                                    >
                                      Finish Editing
                                    </button>
                                    <button
                                      onClick={() => handleReviewSubmission("blog", "save_progress", undefined, undefined, true)}
                                      disabled={isSubmittingReview}
                                      className="border border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60 font-medium"
                                      title="Save your changes to the database without approving the draft, so you can resume on other devices."
                                    >
                                      {isSubmittingReview ? "Saving..." : "Save Progress"}
                                    </button>
                                    <button
                                      onClick={handleApproveDraft}
                                      disabled={isSubmittingReview}
                                      className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60 font-medium"
                                    >
                                      {isSubmittingReview ? "Saving..." : "Save & Approve Edited Draft"}
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
                                      suggestedImages={editSuggestedImages.length > 0 ? editSuggestedImages : selectedRun.blog_drafts[0]?.suggested_images}
                                      onAttachPlaceholder={(placeholderId, label, url, isFeatured) => handleAttachPlaceholderImage(placeholderId, label, url, isFeatured)}
                                      references={selectedRun.blog_drafts[0]?.references}
                                      generatingPlaceholderId={generatingImagePlaceholderId}
                                      pendingPreview={generatedImagePreview}
                                      onGenerateImage={(placeholderId, label, isFeatured) => handleGenerateImage(placeholderId, label, isFeatured)}
                                      onResetPlaceholder={handleResetPlaceholderImage}
                                      onRemovePlaceholder={handleRemovePlaceholder}
                                      onRemoveResolvedImage={handleRemoveResolvedImage}
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
                                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-white/5" style={{ aspectRatio: "16 / 9" }}>
                                  <img
                                    src={getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images)!}
                                    alt="Attached Blog Visual"
                                    className="w-full h-full object-contain"
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
                          <div className="space-y-6">
                            {selectedRunHasSocial ? (
                              <>
                                {/* Social Formats Sub-Tab Navigation */}
                                <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
                                  {(["feed", "story", "carousel", "reel", "brandkit"] as const).map((tab) => (
                                    <button
                                      key={tab}
                                      onClick={() => setActiveSocialSubTab(tab)}
                                      className={`text-xs font-semibold px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                        activeSocialSubTab === tab
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
                                {activeSocialSubTab === "feed" && (
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
                                      imagePromptSuggestion={selectedRun.social_drafts[0]?.instagram?.imagePromptSuggestion}
                                      onGenerateImage={async (prompt) => {
                                        setGeneratingSocialImageKey(`${selectedRun.id}-instagram`);
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
                                                imageUrl: data.url
                                              }
                                            };
                                            await handleReviewSubmission("social", "edited", customPayload, "instagram");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setGeneratingSocialImageKey("");
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
                                      imagePromptSuggestion={selectedRun.social_drafts[0]?.facebook?.imagePromptSuggestion}
                                      onGenerateImage={async (prompt) => {
                                        setGeneratingSocialImageKey(`${selectedRun.id}-facebook`);
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
                                                imageUrl: data.url
                                              }
                                            };
                                            await handleReviewSubmission("social", "edited", customPayload, "facebook");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setGeneratingSocialImageKey("");
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
                                      imagePromptSuggestion={selectedRun.social_drafts[0]?.linkedin?.imagePromptSuggestion}
                                      onGenerateImage={async (prompt) => {
                                        setGeneratingSocialImageKey(`${selectedRun.id}-linkedin`);
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
                                                imageUrl: data.url
                                              }
                                            };
                                            await handleReviewSubmission("social", "edited", customPayload, "linkedin");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setGeneratingSocialImageKey("");
                                        }
                                      }}
                                      isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-linkedin`}
                                      showManualUploadGuide
                                    />
                                  </div>
                                )}

                                {activeSocialSubTab === "story" && (
                                  <div className="max-w-md mx-auto animate-fadeIn">
                                    <PlatformCard
                                      platformKey="instagramStory"
                                      platformLabel="Instagram Story"
                                      icon={<FaInstagram className="w-4 h-4 text-[#E1306C]" />}
                                      color=""
                                      borderColor=""
                                      caption={selectedRun.social_drafts[0]?.instagramStory?.caption || `New guide: ${selectedRun.blog_drafts[0]?.title || selectedRun.topic}!`}
                                      status={selectedRun.social_drafts[0]?.instagramStory?.status || "pending"}
                                      isPublished={selectedRun.status === "published"}
                                      attachedImageUrl={selectedRun.social_drafts[0]?.instagramStory?.imageUrl}
                                      isExternalEditing={editingPlatform === "instagramStory"}
                                      onCancelExternalEdit={() => setEditingPlatform(null)}
                                      onApprove={() => handleReviewSubmission("social", "approved", undefined, "instagramStory")}
                                      onSaveEdit={(newCaption) =>
                                        handleReviewSubmission("social", "edited", { caption: newCaption }, "instagramStory")
                                      }
                                      onRequestRevision={() => {
                                        setRevisionStage("social");
                                        setRevisionPlatform("instagramStory");
                                        setIsRevisionModalOpen(true);
                                      }}
                                      onCopy={() =>
                                        handleCopyToClipboard(
                                          selectedRun.social_drafts[0]?.instagramStory?.caption || "",
                                          "story"
                                        )
                                      }
                                      isCopied={copiedKey === "story"}
                                      onAttachImage={(url) => {
                                        const latestSocial = selectedRun.social_drafts[0];
                                        const customPayload = {
                                          ...latestSocial,
                                          instagramStory: {
                                            ...(latestSocial.instagramStory || { caption: "", status: "pending" }),
                                            imageUrl: url
                                          }
                                        };
                                        handleReviewSubmission("social", "edited", customPayload, "instagramStory");
                                      }}
                                      imagePromptSuggestion={selectedRun.social_drafts[0]?.instagramStory?.imagePromptSuggestion || `A premium vertical 9:16 background image for "${selectedRun.topic}"`}
                                      onGenerateImage={async (prompt) => {
                                        setGeneratingSocialImageKey(`${selectedRun.id}-instagramStory`);
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
                                                imageUrl: data.url
                                              }
                                            };
                                            await handleReviewSubmission("social", "edited", customPayload, "instagramStory");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setGeneratingSocialImageKey("");
                                        }
                                      }}
                                      isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-instagramStory`}
                                      showManualUploadGuide
                                    />
                                  </div>
                                )}

                                {activeSocialSubTab === "carousel" && (selectedRun.social_drafts[0]?.instagramCarousel?.slides?.length || 0) === 0 && (
                                  renderMissingFormatCta("Instagram Carousel")
                                )}

                                {activeSocialSubTab === "carousel" && (selectedRun.social_drafts[0]?.instagramCarousel?.slides?.length || 0) > 0 && (
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
                                      onCancelExternalEdit={() => setEditingPlatform(null)}
                                      onApprove={() => handleReviewSubmission("social", "approved", undefined, "instagramCarousel")}
                                      onSaveEdit={(newCaption) =>
                                        handleReviewSubmission("social", "edited", { caption: newCaption }, "instagramCarousel")
                                      }
                                      onRequestRevision={() => {
                                        setRevisionStage("social");
                                        setRevisionPlatform("instagramCarousel");
                                        setIsRevisionModalOpen(true);
                                      }}
                                      onCopy={() => {
                                        const carousel = selectedRun.social_drafts[0]?.instagramCarousel;
                                        const textToCopy = carousel?.slides
                                          ? carousel.slides.map(s => `Slide ${s.slideNumber}: ${s.text}`).join("\n\n")
                                          : carousel?.caption || "";
                                        handleCopyToClipboard(textToCopy, "carousel");
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
                                            ...(latestSocial.instagramCarousel || { caption: "", imagePromptSuggestion: "", slides: [], status: "pending" }),
                                            slides
                                          }
                                        };
                                        handleReviewSubmission("social", "edited", customPayload, "instagramCarousel");
                                      }}
                                      onGenerateImage={async (prompt, slideIndex) => {
                                        setGeneratingSocialImageKey(`${selectedRun.id}-instagramCarousel`);
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
                                                ...(latestSocial.instagramCarousel || { caption: "", imagePromptSuggestion: "", slides: [], status: "pending" }),
                                                slides
                                              }
                                            };
                                            await handleReviewSubmission("social", "edited", customPayload, "instagramCarousel");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setGeneratingSocialImageKey("");
                                        }
                                      }}
                                      isGeneratingImage={generatingSocialImageKey === `${selectedRun.id}-instagramCarousel`}
                                      showManualUploadGuide
                                    />
                                  </div>
                                )}

                                {activeSocialSubTab === "reel" && !selectedRun.social_drafts[0]?.instagramReel?.script?.trim() && (
                                  renderMissingFormatCta("Instagram Reel Script")
                                )}

                                {activeSocialSubTab === "reel" && selectedRun.social_drafts[0]?.instagramReel?.script?.trim() && (
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
                                      onCancelExternalEdit={() => setEditingPlatform(null)}
                                      onApprove={() => handleReviewSubmission("social", "approved", undefined, "instagramReel")}
                                      onSaveEdit={(newScript) =>
                                        handleReviewSubmission("social", "edited", { script: newScript }, "instagramReel")
                                      }
                                      onRequestRevision={() => {
                                        setRevisionStage("social");
                                        setRevisionPlatform("instagramReel");
                                        setIsRevisionModalOpen(true);
                                      }}
                                      onCopy={() =>
                                        handleCopyToClipboard(
                                          selectedRun.social_drafts[0]?.instagramReel?.script || "",
                                          "reel"
                                        )
                                      }
                                      isCopied={copiedKey === "reel"}
                                      script={selectedRun.social_drafts[0]?.instagramReel?.script}
                                      topic={selectedRun.topic}
                                      attachedVideoUrl={selectedRun.social_drafts[0]?.instagramReel?.videoUrl}
                                      videoSource={selectedRun.social_drafts[0]?.instagramReel?.videoSource}
                                      onAttachVideo={(url, source) =>
                                        handleReviewSubmission("social", "edited", { videoUrl: url, videoSource: source }, "instagramReel")
                                      }
                                      showManualUploadGuide
                                    />
                                  </div>
                                )}

                                {activeSocialSubTab === "brandkit" && (
                                  <div className="bg-dark-overlay-navy border border-white/10 rounded-xl p-6 shadow-lg animate-fadeIn space-y-6 text-left">
                                    <div>
                                      <h4 className="font-serif text-sm font-bold text-white mb-2">LKC Branded Template Backgrounds</h4>
                                      <p className="text-xs text-white/70 leading-relaxed">
                                        Download these premium, pre-styled background templates with clinic margins and watermarks. Use them as background layers in Canva or directly in social media apps to overlay the generated caption text.
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
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-4 shadow-lg">
                      <input
                        type="text"
                        value={pipelineSearch}
                        onChange={(e) => setPipelineSearch(e.target.value)}
                        placeholder="Search runs by topic or ID…"
                        className="bg-dark-overlay-navy border border-white/20 text-white text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-72"
                      />
                    </div>

                    {/* SECTION 1: Needs Your Review */}
                    <div className="bg-primary-navy border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-clinical-teal animate-ping" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Needs Your Attention ({visibleReviewNeededRuns.length})
                          </h3>
                        </div>
                        <span className="text-[11px] text-clinical-teal font-mono">Action Required</span>
                      </div>

                      {reviewNeededRuns.length === 0 ? (
                        <div className="py-8 text-center text-white/60 text-xs">
                          🎉 No pending drafts require clinical review at this time.
                        </div>
                      ) : visibleReviewNeededRuns.length === 0 ? (
                        <div className="py-8 text-center text-white/40 text-xs">
                          No runs match "{pipelineSearch}".
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {visibleReviewNeededRuns.map((run) => (
                            <div
                              key={run.id}
                              onClick={() => fetchRunDetail(run.run_id)}
                              className="p-5 bg-dark-overlay-navy border border-white/10 hover:border-clinical-teal/50 rounded-xl transition-all shadow-md space-y-3 cursor-pointer group"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="font-serif text-sm font-bold text-white group-hover:text-clinical-teal transition-colors">
                                  {run.topic}
                                </h4>
                                <StatusBadge status={run.status} isContinueEditing={isBlogEditInProgress(run)} />
                              </div>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[10px] font-mono text-white/40">{run.run_id}</span>
                                <span className="text-[11px] text-white/60 font-mono" title={`Created ${new Date(run.created_at).toLocaleString()}`}>
                                  Last saved: {new Date(run.updated_at).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>

                              {run.blog_drafts?.[0]?.flags && run.blog_drafts[0].flags.length > 0 && (
                                <div className="text-[11px] text-amber-300/90 bg-primary-navy border border-amber-500/40 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                                  <span>⚠️</span>
                                  <span>{run.blog_drafts[0].flags.length} Clinical Review Flag(s)</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePipelineRun(run.run_id, run.topic);
                                  }}
                                  className="text-[11px] text-status-error/80 hover:text-status-error cursor-pointer"
                                >
                                  Delete
                                </button>
                                <div className="flex text-xs text-clinical-teal items-center gap-1">
                                  <span>Open Review Workspace</span>
                                  <span>→</span>
                                </div>
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
                          In Progress, Published &amp; Archived Runs ({visibleOtherRuns.length})
                        </h3>
                      </div>

                      {otherRuns.length > 0 && visibleOtherRuns.length === 0 ? (
                        <div className="py-8 text-center text-white/40 text-xs">
                          No runs match "{pipelineSearch}".
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {visibleOtherRuns.map((run) => (
                            <div
                              key={run.id}
                              onClick={() => fetchRunDetail(run.run_id)}
                              className="p-4 bg-dark-overlay-navy border border-white/10 hover:border-white/20 rounded-xl transition-all space-y-2 cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs text-white/90 font-semibold line-clamp-2">{run.topic}</h4>
                                <StatusBadge status={run.status} isContinueEditing={isBlogEditInProgress(run)} />
                              </div>
                              <div className="text-[10px] font-mono text-white/30">{run.run_id}</div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 font-mono">
                                  Last saved: {new Date(run.updated_at).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePipelineRun(run.run_id, run.topic);
                                  }}
                                  className="text-[10px] text-status-error/80 hover:text-status-error cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                  onClick={() => (isTriggering ? handleBackgroundTriggerRun() : setIsTriggerModalOpen(false))}
                  className="text-white/60 hover:text-white text-sm cursor-pointer"
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
                      Please wait while our AI clinical agents analyze medical literature and synthesize your draft — or close this
                      window and it'll keep generating in the background; check the run list shortly.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => (isTriggering ? handleBackgroundTriggerRun() : setIsTriggerModalOpen(false))}
                    className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
                  >
                    {isTriggering ? "Run in Background" : "Cancel"}
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
function StatusBadge({ status, isContinueEditing }: { status: string; isContinueEditing?: boolean }) {
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

  if (isContinueEditing) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-dark-overlay-navy border-amber-400/50 text-amber-300">
        ✎ Continue Editing
      </span>
    );
  }

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
function FormattedContent({
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
  onRemoveResolvedImage
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
        <div className="mt-6 border-t border-white/10 pt-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
            References
          </span>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] text-white/70 leading-relaxed">
            {references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ol>
        </div>
      )}
      <ArticleFooterTemplate />

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

// Subcomponent: Social Platform Card
// Fetches an image (even cross-origin, e.g. Supabase Storage) as a blob and triggers
// a real download — a plain <a download> is silently ignored by browsers for
// cross-origin URLs, so this is needed for the "Download Image" manual-upload step.
async function downloadImageFile(url: string, filenameHint: string, onError?: (message: string) => void) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    const extension = blob.type.split("/")[1] || "png";
    link.download = `${filenameHint}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Image download failed:", err);
    const message = "Couldn't download the image automatically — right-click the image above and choose \"Save image as...\" instead.";
    if (onError) onError(message);
    else alert(message);
  }
}

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
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(caption);
  const isCardEditing = isEditing || isExternalEditing;

  const isStory = platformKey === "instagramStory";
  const isCarousel = platformKey === "instagramCarousel";
  const isReel = platformKey === "instagramReel";

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
                Save &amp; Approve
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
