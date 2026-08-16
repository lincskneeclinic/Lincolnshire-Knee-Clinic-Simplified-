"use client";

import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import { ContentPipelineRun, ContentPipelineReview } from "@/lib/contentPipeline";
import { MIN_BLOG_BODY_LENGTH } from "@/lib/contentPipelineConstants";
import { ARTICLE_CATEGORIES } from "@/lib/articleCategories";
import { SocialOnlyPost } from "@/lib/socialOnlyPosts";
import { markdownToEmailHtml } from "@/lib/newsletterMarkdown";
import { DashboardFeedbackProvider, useToast, useConfirm, usePrompt } from "@/components/portal/DashboardFeedback";
import { PortalThemeProvider, usePortalTheme } from "@/components/portal/PortalThemeProvider";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { CommunityReportsTab, CommunityReport } from "@/components/portal/community/CommunityReportsTab";
import { OverviewTab, NeedsAttentionItem } from "@/components/portal/overview/OverviewTab";
import { SubscribersTab } from "@/components/portal/subscribers/SubscribersTab";
import { EducationHubTab, EducationArticleSummary } from "@/components/portal/education/EducationHubTab";
import { ClinicalReviewTab, ClinicalReviewListItem, SearchReference } from "@/components/portal/clinical-review/ClinicalReviewTab";
import { ClinicalContentReviewResult, ClinicalContentReviewFinding } from "@/lib/clinicalContentReviewAgent";
import { SocialPostsTab } from "@/components/portal/social/SocialPostsTab";
import { NewsletterCreatorTab } from "@/components/portal/newsletter/NewsletterCreatorTab";
import { PipelineTriggerModal } from "@/components/portal/pipeline/PipelineTriggerModal";
import { PipelineImportResearchModal } from "@/components/portal/pipeline/PipelineImportResearchModal";
import { PipelineRevisionModal } from "@/components/portal/pipeline/PipelineRevisionModal";
import { PipelineTab } from "@/components/portal/pipeline/PipelineTab";
import { formatDateSafe } from "@/lib/formatDate";
import { RunDetailTab, cleanHeadingBugs } from "@/lib/contentPipelineFormatting";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";

export default function BusinessDashboardPage() {
  return (
    <PortalThemeProvider>
      <DashboardFeedbackProvider>
        <BusinessDashboardPageInner />
      </DashboardFeedbackProvider>
    </PortalThemeProvider>
  );
}

function BusinessDashboardPageInner() {
  const toast = useToast();
  const confirmAction = useConfirm();
  const promptAction = usePrompt();
  const { theme, toggleTheme } = usePortalTheme();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "newsletter" | "newsletterCreator" | "pipeline" | "clinicalReview" | "community" | "educationHub" | "socialOnly">("overview");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [educationSearch, setEducationSearch] = useState("");
  const [isAdminPasswordOpen, setIsAdminPasswordOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [selectedSendTopic, setSelectedSendTopic] = useState("all");
  const [selectedSendPatient, setSelectedSendPatient] = useState("all");


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

  // Import Researched Brief Form State (lincoln-knee-clinic-blog-research skill output)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTopic, setImportTopic] = useState("");
  const [importBriefJson, setImportBriefJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState("");
  const importBackgroundedRef = React.useRef(false);

  // Review Actions State
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeDraftSubTab, setActiveDraftSubTab] = useState<"layman" | "technical">("layman");
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSuggestedImages, setEditSuggestedImages] = useState<any[]>([]);
  const [editArticleTitle, setEditArticleTitle] = useState("");
  const [editArticleExcerpt, setEditArticleExcerpt] = useState("");
  const [editArticleBody, setEditArticleBody] = useState("");
  const [editArticleSuggestedImages, setEditArticleSuggestedImages] = useState<any[]>([]);
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
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState<string | null>(null);
  const [aiReviewResult, setAiReviewResult] = useState<ClinicalContentReviewResult | null>(null);
  const [pageContentLoading, setPageContentLoading] = useState(false);
  const [pageContentAvailable, setPageContentAvailable] = useState(false);
  const [pageContentFields, setPageContentFields] = useState<Record<string, string | string[]>>({});
  const [pageContentFieldTypes, setPageContentFieldTypes] = useState<Record<string, "string" | "string[]">>({});

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
  const [socialOnlyBatchMode, setSocialOnlyBatchMode] = useState(false);
  const [newSocialOnlyBatchTopics, setNewSocialOnlyBatchTopics] = useState("");
  const [socialOnlyBatchProgress, setSocialOnlyBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [showArchivedSocialOnly, setShowArchivedSocialOnly] = useState(false);
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

  // Picks up ?tab=&metaConnect=&metaConnectDetail= after the Meta OAuth
  // callback redirects back here, then strips them so a refresh doesn't
  // re-show the toast or re-navigate.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const metaConnect = params.get("metaConnect");
    if (!tab && !metaConnect) return;

    const validTabs = ["overview", "newsletter", "newsletterCreator", "pipeline", "clinicalReview", "community", "educationHub", "socialOnly"] as const;
    if (tab && (validTabs as readonly string[]).includes(tab)) {
      setActiveTab(tab as (typeof validTabs)[number]);
    }
    if (metaConnect === "connected") {
      toast.success(`Meta account connected — ${params.get("metaConnectDetail") || "ready to link posts."}`);
    } else if (metaConnect === "error") {
      toast.error(params.get("metaConnectDetail") || "Failed to connect Meta account.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    url.searchParams.delete("metaConnect");
    url.searchParams.delete("metaConnectDetail");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (activeDraftSubTab === "technical") {
      setEditArticleBody(newVal);
    } else {
      setEditBody(newVal);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        pushHistory(newVal);
      }, 500);
    }
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
    }
  };

  // Publish Blog Only: publish the blog draft to the website directly.
  const handlePublishBlogOnly = async () => {
    const serverDraft = selectedRun?.blog_drafts?.[0];
    const hasLocalEdits =
      editTitle !== (serverDraft?.title || "") ||
      editExcerpt !== (serverDraft?.excerpt || "") ||
      editBody !== (serverDraft?.body_markdown || serverDraft?.body || "");
    if (hasLocalEdits) {
      if (editBody.trim().length < MIN_BLOG_BODY_LENGTH) {
        toast.error(
          `The article body is too short to publish (minimum ${MIN_BLOG_BODY_LENGTH} characters). Please write or restore the full article content before publishing.`
        );
        return;
      }
      const proceed = await confirmAction(
        "You have unsaved edits in the editor. Save and publish your edited version to the live website?",
        { confirmLabel: "Save & Publish" }
      );
      if (!proceed) return;
      handleReviewSubmission("blog", "publish_blog");
    } else {
      const proceed = await confirmAction(
        "Are you sure you want to publish this blog post to the live website?",
        { confirmLabel: "Publish Now" }
      );
      if (!proceed) return;
      handleReviewSubmission("blog", "publish_blog");
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

        setEditArticleTitle(blogDraft.article_title || "");
        setEditArticleExcerpt(blogDraft.article_excerpt || "");
        setEditArticleBody(cleanHeadingBugs(blogDraft.article_body_markdown || blogDraft.article_body || ""));
        setEditArticleSuggestedImages(blogDraft.article_suggested_images || []);
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
      if (activeDraftSubTab === "technical") {
        setEditArticleBody(newText);
      } else {
        setEditBody(newText);
        pushHistory(newText);
      }
      
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
      if (activeDraftSubTab === "technical") {
        setEditArticleBody(newText);
      } else {
        setEditBody(newText);
        pushHistory(newText);
      }
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }, 0);
      return;
    }

    if (type === "bold" || type === "italic" || type === "underline") {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      if (activeDraftSubTab === "technical") {
        setEditArticleBody(newText);
      } else {
        setEditBody(newText);
        pushHistory(newText);
      }
      
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

  // Rewrites only the highlighted passage (e.g. the exact sentence a "[NEEDS
  // CLINICAL REVIEW]" flag is about) instead of regenerating the whole
  // blog/article — captures the selection range up front since the AI call is
  // async and the textarea's live selectionStart/End would drift otherwise.
  const [isRevisingSelection, setIsRevisingSelection] = useState(false);
  const handleReviseSelection = async () => {
    const textarea = textareaRef.current;
    if (!textarea || !selectedRun) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText.trim()) {
      toast.error("Highlight the sentence or paragraph you want revised first.");
      return;
    }

    const instruction = await promptAction(
      "What should change about this passage? Pasting the clinical review flag's own wording works well.",
      {
        multiline: true,
        placeholder: "e.g. Soften this claim and mention the NICE guideline on conservative management first...",
      }
    );
    if (!instruction || !instruction.trim()) return;

    setIsRevisingSelection(true);
    try {
      const res = await fetch(
        `/api/portal/content-pipeline/runs/${encodeURIComponent(selectedRun.run_id)}/revise-selection`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isArticle: activeDraftSubTab === "technical",
            selectedText,
            instruction: instruction.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!data.success || !data.revisedText) {
        throw new Error(data.error || "Failed to revise the selected text.");
      }

      const fullText = textarea.value;
      const newText = fullText.substring(0, start) + data.revisedText + fullText.substring(end);

      if (activeDraftSubTab === "technical") {
        setEditArticleBody(newText);
      } else {
        setEditBody(newText);
        pushHistory(newText);
      }

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + data.revisedText.length);
      }, 0);

      toast.success("Passage revised — review the highlighted change, then Approve/Save when ready.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to revise the selected text.");
    } finally {
      setIsRevisingSelection(false);
    }
  };

  // Resolves a "[NEEDS CLINICAL REVIEW]" flag directly: flags are extracted
  // from the body via regex, so flagText is always a literal substring —
  // locate it, replace it with the AI's resolution, and stop. useOwnWording
  // prompts for the reviewer's decision first; the AI still writes it up as
  // proper prose rather than inserting the raw note verbatim.
  const [resolvingFlagText, setResolvingFlagText] = useState<string | null>(null);
  const applyFlagResolution = async (flagText: string, reviewerDecision?: string) => {
    if (!selectedRun) return;
    const isArticle = activeDraftSubTab === "technical";
    const currentBody = isArticle ? editArticleBody : editBody;
    const flagIndex = currentBody.indexOf(flagText);
    if (flagIndex === -1) {
      toast.error("Couldn't find that flag in the current draft text — it may already have been edited or resolved.");
      return;
    }

    setResolvingFlagText(flagText);
    try {
      const precedingContext = currentBody.slice(Math.max(0, flagIndex - 600), flagIndex);
      const res = await fetch(
        `/api/portal/content-pipeline/runs/${encodeURIComponent(selectedRun.run_id)}/resolve-flag`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArticle, flagText, precedingContext, reviewerDecision }),
        }
      );
      const data = await res.json();
      if (!data.success || !data.resolvedText) {
        throw new Error(data.error || "Failed to resolve the flag.");
      }

      const newText =
        currentBody.slice(0, flagIndex) + data.resolvedText + currentBody.slice(flagIndex + flagText.length);

      if (isArticle) {
        setEditArticleBody(newText);
      } else {
        setEditBody(newText);
        pushHistory(newText);
      }

      toast.success("Flag resolved — review the change, then Approve/Save when ready.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve the flag.");
    } finally {
      setResolvingFlagText(null);
    }
  };

  const handleResolveFlagWithAI = (flagText: string) => {
    applyFlagResolution(flagText);
  };

  const handleResolveFlagWithOwnWording = async (flagText: string) => {
    const decision = await promptAction(
      "What's your decision or wording for this? I'll turn it into well-written, properly formatted text that fits the surrounding paragraph.",
      {
        multiline: true,
        placeholder: "e.g. Yes, include the 10-year National Joint Registry revision rates for partial vs total knee replacement...",
      }
    );
    if (!decision || !decision.trim()) return;
    await applyFlagResolution(flagText, decision.trim());
  };

  const handleAttachPlaceholderImage = (placeholderId: string, label: string, url: string, isFeatured?: boolean) => {
    const isArticle = placeholderId.startsWith("article-");
    const imageMarkdown = `![${label}](${url})`;
    const currentBody = isArticle ? editArticleBody : editBody;
    let newBody = currentBody;

    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exactPattern = new RegExp(
      `\\[${isFeatured ? "FEATURED IMAGE PLACEHOLDER" : "IMAGE PLACEHOLDER"}:\\s*${escapedLabel}\\s*\\]`,
      "i"
    );
    if (exactPattern.test(currentBody)) {
      newBody = currentBody.replace(exactPattern, imageMarkdown);
    } else if (isFeatured) {
      const featuredPattern = /\[FEATURED IMAGE PLACEHOLDER:[^\]]*\]/i;
      newBody = currentBody.replace(featuredPattern, imageMarkdown);
    } else {
      const targetIndex = parseInt(placeholderId.replace(/[^0-9]/g, ""), 10) || 1;
      const inlinePattern = /\[IMAGE PLACEHOLDER:[^\]]*\]/gi;
      let occurrence = 0;
      newBody = currentBody.replace(inlinePattern, (matchText) => {
        occurrence += 1;
        return occurrence === targetIndex ? imageMarkdown : matchText;
      });
    }

    if (newBody === currentBody) {
      toast.error(
        `The image uploaded successfully, but couldn't be automatically placed in the draft (the placeholder marker may have been removed from the text). You can paste this URL manually where you want the image: ${url}`
      );
      return;
    }

    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }

    if (isArticle) {
      setEditArticleBody(newBody);
    } else {
      setEditBody(newBody);
      pushHistory(newBody);
    }

    const currentImages = isArticle ? editArticleSuggestedImages : editSuggestedImages;
    const withoutPlaceholder = currentImages.filter(
      (img: any) => !(typeof img === "object" && img !== null && img.placeholderId === placeholderId)
    );
    const updatedImages = isFeatured ? [url, ...withoutPlaceholder.filter((img: any) => img !== url)] : withoutPlaceholder;

    if (isArticle) {
      setEditArticleSuggestedImages(updatedImages);
    } else {
      setEditSuggestedImages(updatedImages);
    }

    setGeneratedImagePreview((prev) => (prev?.placeholderId === placeholderId ? null : prev));

    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: isArticle ? editBody : newBody,
        body: isArticle ? editBody : newBody,
        suggestedImages: isArticle ? editSuggestedImages : updatedImages,
        category: editCategory || currentDraft?.category,

        article_title: editArticleTitle || currentDraft?.article_title,
        article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
        article_body_markdown: isArticle ? newBody : editArticleBody,
        article_body: isArticle ? newBody : editArticleBody,
        article_suggested_images: isArticle ? updatedImages : editArticleSuggestedImages,
      }, undefined, true);
    }
  };


  const handleResetPlaceholderImage = (altText: string, srcUrl: string) => {
    const isArticle = activeDraftSubTab === "technical";
    const currentBody = isArticle ? editArticleBody : editBody;
    const currentImages = isArticle ? editArticleSuggestedImages : editSuggestedImages;
    const setBody = isArticle ? setEditArticleBody : setEditBody;
    const setImages = isArticle ? setEditArticleSuggestedImages : setEditSuggestedImages;

    const targetPattern = `![${altText}](${srcUrl})`;
    const targetIndex = currentBody.indexOf(targetPattern);
    
    if (targetIndex === -1) {
      const fallbackRegex = new RegExp(`!\\[(.*?)\\]\\(${srcUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, "i");
      const match = currentBody.match(fallbackRegex);
      if (match) {
        const matchedAlt = match[1];
        const isFeatured = currentBody.indexOf(match[0]) === currentBody.indexOf("![");
        const replacementPlaceholder = isFeatured
          ? `[FEATURED IMAGE PLACEHOLDER: ${matchedAlt}]`
          : `[IMAGE PLACEHOLDER: ${matchedAlt}]`;
        
        const newBody = currentBody.replace(match[0], replacementPlaceholder);
        if (livePreviewRef.current) {
          pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
        }
        setBody(newBody);
        if (!isArticle) pushHistory(newBody);
        
        if (isFeatured) {
          const updatedImages = currentImages.filter((img: any) => img !== srcUrl);
          setImages(updatedImages);
          if (!isEditMode && selectedRun) {
            const currentDraft = selectedRun.blog_drafts[0];
            handleReviewSubmission("blog", "save_progress", {
              title: editTitle || currentDraft?.title,
              excerpt: editExcerpt || currentDraft?.excerpt,
              body_markdown: isArticle ? editBody : newBody,
              body: isArticle ? editBody : newBody,
              suggestedImages: isArticle ? editSuggestedImages : updatedImages,
              category: editCategory || currentDraft?.category,

              article_title: editArticleTitle || currentDraft?.article_title,
              article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
              article_body_markdown: isArticle ? newBody : editArticleBody,
              article_body: isArticle ? newBody : editArticleBody,
              article_suggested_images: isArticle ? updatedImages : editArticleSuggestedImages,
            }, undefined, true);
          }
        } else if (!isEditMode && selectedRun) {
          const currentDraft = selectedRun.blog_drafts[0];
          handleReviewSubmission("blog", "save_progress", {
            title: editTitle || currentDraft?.title,
            excerpt: editExcerpt || currentDraft?.excerpt,
            body_markdown: isArticle ? editBody : newBody,
            body: isArticle ? editBody : newBody,
            suggestedImages: editSuggestedImages,
            category: editCategory || currentDraft?.category,

            article_title: editArticleTitle || currentDraft?.article_title,
            article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
            article_body_markdown: isArticle ? newBody : editArticleBody,
            article_body: isArticle ? newBody : editArticleBody,
            article_suggested_images: editArticleSuggestedImages,
          }, undefined, true);
        }
        return;
      }
      toast.error("Could not locate the image in the editor text. You can manually delete it from the editor tab.");
      return;
    }

    const firstImageIndex = currentBody.indexOf("![");
    const isFeatured = (firstImageIndex !== -1 && targetIndex === firstImageIndex);
    const replacementPlaceholder = isFeatured
      ? `[FEATURED IMAGE PLACEHOLDER: ${altText}]`
      : `[IMAGE PLACEHOLDER: ${altText}]`;

    const newBody = currentBody.replace(targetPattern, replacementPlaceholder);
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    
    setBody(newBody);
    if (!isArticle) pushHistory(newBody);

    const updatedImages = isFeatured
      ? currentImages.filter((img: any) => img !== srcUrl)
      : currentImages;

    if (isFeatured) {
      setImages(updatedImages);
    }

    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: isArticle ? editBody : newBody,
        body: isArticle ? editBody : newBody,
        suggestedImages: isArticle ? editSuggestedImages : updatedImages,
        category: editCategory || currentDraft?.category,

        article_title: editArticleTitle || currentDraft?.article_title,
        article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
        article_body_markdown: isArticle ? newBody : editArticleBody,
        article_body: isArticle ? newBody : editArticleBody,
        article_suggested_images: isArticle ? updatedImages : editArticleSuggestedImages,
      }, undefined, true);
    }
  };


  const handleRemovePlaceholder = async (placeholderId: string, label: string, isFeatured?: boolean) => {
    if (!(await confirmAction("Are you sure you want to permanently delete this image placeholder from the article?", { confirmLabel: "Delete", danger: true }))) return;
    
    const isArticle = activeDraftSubTab === "technical";
    const currentBody = isArticle ? editArticleBody : editBody;
    const currentImages = isArticle ? editArticleSuggestedImages : editSuggestedImages;
    const setBody = isArticle ? setEditArticleBody : setEditBody;
    const setImages = isArticle ? setEditArticleSuggestedImages : setEditSuggestedImages;

    const target = isFeatured
      ? `[FEATURED IMAGE PLACEHOLDER: ${label}]`
      : `[IMAGE PLACEHOLDER: ${label}]`;
    
    const escapedTarget = target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedTarget}\\s*`, "i");
    
    const newBody = currentBody.replace(regex, "\n\n").trim();
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setBody(newBody);
    if (!isArticle) pushHistory(newBody);
    
    const updatedImages = currentImages.filter(
      (img: any) => !(typeof img === "object" && img !== null && img.placeholderId === placeholderId)
    );
    setImages(updatedImages);
    setGeneratedImagePreview((prev) => (prev?.placeholderId === placeholderId ? null : prev));
    
    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: isArticle ? editBody : newBody,
        body: isArticle ? editBody : newBody,
        suggestedImages: isArticle ? editSuggestedImages : updatedImages,
        category: editCategory || currentDraft?.category,

        article_title: editArticleTitle || currentDraft?.article_title,
        article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
        article_body_markdown: isArticle ? newBody : editArticleBody,
        article_body: isArticle ? newBody : editArticleBody,
        article_suggested_images: isArticle ? updatedImages : editArticleSuggestedImages,
      }, undefined, true);
    }
  };


  const handleRemoveResolvedImage = async (altText: string, srcUrl: string) => {
    if (!(await confirmAction("Are you sure you want to permanently delete this image from the article?", { confirmLabel: "Delete", danger: true }))) return;

    const isArticle = activeDraftSubTab === "technical";
    const currentBody = isArticle ? editArticleBody : editBody;
    const currentImages = isArticle ? editArticleSuggestedImages : editSuggestedImages;
    const setBody = isArticle ? setEditArticleBody : setEditBody;
    const setImages = isArticle ? setEditArticleSuggestedImages : setEditSuggestedImages;

    const escapedSrc = srcUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedAlt = altText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`\\s*!\\[${escapedAlt}\\]\\(${escapedSrc}\\)\\s*`, "i");
    
    let newBody = currentBody.replace(pattern, "\n\n").trim();
    
    if (newBody === currentBody) {
      const fallbackRegex = new RegExp(`\\s*!\\[(.*?)\\]\\(${escapedSrc}\\)\\s*`, "i");
      newBody = currentBody.replace(fallbackRegex, "\n\n").trim();
    }
    
    if (livePreviewRef.current) {
      pendingScrollRestoreRef.current = livePreviewRef.current.scrollTop;
    }
    setBody(newBody);
    if (!isArticle) pushHistory(newBody);

    const firstImageIndex = currentBody.indexOf("![");
    const targetIndex = currentBody.indexOf(`![${altText}](${srcUrl})`);
    const isFeatured = (firstImageIndex !== -1 && targetIndex === firstImageIndex);
    
    const updatedImages = currentImages.filter(
      (img: any) => {
        if (typeof img === "string") return img !== srcUrl;
        return img.url !== srcUrl;
      }
    );

    if (isFeatured) {
      setImages(updatedImages);
    }

    if (!isEditMode && selectedRun) {
      const currentDraft = selectedRun.blog_drafts[0];
      handleReviewSubmission("blog", "save_progress", {
        title: editTitle || currentDraft?.title,
        excerpt: editExcerpt || currentDraft?.excerpt,
        body_markdown: isArticle ? editBody : newBody,
        body: isArticle ? editBody : newBody,
        suggestedImages: isArticle ? editSuggestedImages : updatedImages,
        category: editCategory || currentDraft?.category,

        article_title: editArticleTitle || currentDraft?.article_title,
        article_excerpt: editArticleExcerpt || currentDraft?.article_excerpt,
        article_body_markdown: isArticle ? newBody : editArticleBody,
        article_body: isArticle ? newBody : editArticleBody,
        article_suggested_images: isArticle ? updatedImages : editArticleSuggestedImages,
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

  // Fetch once on dashboard mount regardless of which tab is active — the
  // Overview tab's "Content Runs Needing Action" count reads from this same
  // pipelineRuns state, so without this it always shows 0 until the Pipeline
  // tab has been opened at least once in the session.
  useEffect(() => {
    fetchPipelineRuns();
  }, [fetchPipelineRuns]);

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

          setEditArticleTitle(blogDraft.article_title || "");
          setEditArticleExcerpt(blogDraft.article_excerpt || "");
          setEditArticleBody(cleanHeadingBugs(blogDraft.article_body_markdown || blogDraft.article_body || ""));
          setEditArticleSuggestedImages(blogDraft.article_suggested_images || []);
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
    // Always refetch on switching to this tab, not just when the list is
    // still empty — runs can appear in the background (weekly automation,
    // and now the Social Media Posts tab's auto-triggered companion articles)
    // while the reviewer is on a different tab, and the old "only if empty"
    // guard left the list stale until a full page reload.
    if (activeTab === "pipeline") {
      fetchPipelineRuns();
    }
  }, [activeTab, fetchPipelineRuns]);

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
        setSubscribers(data.subscribers || []);
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
              <a href="${SITE_URL}/book-appointment" target="_blank" style="background-color: #14b8a6; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; display: inline-block;">Book a Consultation</a>
              <p style="margin: 16px 0 0 0; color: #94a3b8;">
                You received this email because you opted into updates from Lincolnshire Knee Clinic.
                <br />
                <a href="${SITE_URL}/newsletter?unsubscribe=true&email=patient@example.com" target="_blank" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Unsubscribe Instantly</a>
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
        body: JSON.stringify({
          editionId: selectedNewsletter.id,
          targetTopic: selectedSendTopic,
          targetEmail: selectedSendPatient === "all" ? undefined : selectedSendPatient,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          selectedSendPatient !== "all"
            ? `Newsletter successfully sent to ${selectedSendPatient}!`
            : `Newsletter successfully distributed to ${data.sentCount} subscribed patients!`
        );
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
    const edition = newsletterEditions.find((e) => e.id === editionId);
    const confirmMessage =
      edition?.status === "sent"
        ? "Are you sure you want to permanently remove this newsletter? It will disappear from the public archive at lincsknee.com/newsletter immediately, and this cannot be undone."
        : "Are you sure you want to permanently discard this newsletter draft?";
    if (!(await confirmAction(confirmMessage, { confirmLabel: edition?.status === "sent" ? "Remove" : "Discard", danger: true }))) return;
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

  // Generates one topic at a time (looping client-side) rather than sending
  // the whole batch as one request — a single long-lived request generating
  // 5+ topics sequentially runs past Hostinger's reverse-proxy timeout and
  // comes back as an HTML error page instead of JSON. Looping keeps every
  // individual request as fast as the already-reliable single-topic path,
  // and shows progress as each one lands instead of one long silent wait.
  const generateOneSocialOnlyTopic = async (topic: string): Promise<SocialOnlyPost> => {
    const res = await fetch("/api/portal/social-only/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (!data.success || !data.post) {
      throw new Error(data.error || "Failed to generate social posts.");
    }
    return data.post;
  };

  const handleGenerateSocialOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    const batchTopics = newSocialOnlyBatchTopics
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const isBatch = socialOnlyBatchMode && batchTopics.length > 0;
    if (!isBatch && !newSocialOnlyTopic.trim()) return;

    setIsGeneratingSocialOnly(true);
    try {
      if (isBatch) {
        setSocialOnlyBatchProgress({ done: 0, total: batchTopics.length });
        const failures: Array<{ topic: string; error: string }> = [];
        let successCount = 0;
        for (const topic of batchTopics) {
          try {
            const post = await generateOneSocialOnlyTopic(topic);
            successCount++;
            setSocialOnlyPosts((prev) => [post, ...prev]);
          } catch (err: any) {
            failures.push({ topic, error: err?.message || "Failed to generate this topic." });
          }
          setSocialOnlyBatchProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        }
        setSelectedSocialOnlyPost(null);
        setIsSocialOnlyModalOpen(false);
        setNewSocialOnlyTopic("");
        setNewSocialOnlyBatchTopics("");
        setSocialOnlyBatchMode(false);
        toast.success(`Generated ${successCount} of ${batchTopics.length} post${batchTopics.length === 1 ? "" : "s"}.`);
        if (failures.length > 0) {
          toast.error(`${failures.length} topic${failures.length === 1 ? "" : "s"} failed: ${failures.map((f) => f.topic).join(", ")}`);
        }
      } else {
        const post = await generateOneSocialOnlyTopic(newSocialOnlyTopic.trim());
        setSocialOnlyPosts((prev) => [post, ...prev]);
        setSelectedSocialOnlyPost(post);
        setIsSocialOnlyModalOpen(false);
        setNewSocialOnlyTopic("");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while generating the social posts.");
    } finally {
      setIsGeneratingSocialOnly(false);
      setSocialOnlyBatchProgress(null);
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
          aspectRatio: platform === "instagramStory" ? "9:16" : undefined,
          format: "png"
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

  // Archive keeps everything (captions, images, script) for a future
  // refresh-and-repost — unlike Delete, which is permanent. patchSocialOnlyPost
  // already updates socialOnlyPosts/selectedSocialOnlyPost from the response;
  // archiving additionally clears the selection so the view returns to the list.
  const handleArchiveSocialOnlyPost = async (postId: string) => {
    try {
      await patchSocialOnlyPost(postId, { action: "archive" });
      setSelectedSocialOnlyPost(null);
      toast.success('Archived — find it under "Show archived" whenever you\'re ready to refresh and repost it.');
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive the post.");
    }
  };

  const handleUnarchiveSocialOnlyPost = async (postId: string) => {
    try {
      await patchSocialOnlyPost(postId, { action: "unarchive" });
      toast.success("Restored to the active list.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore the post.");
    }
  };

  // Jumps to a social post's auto-triggered companion article for clinical review.
  const handleGoToLinkedArticle = (runId: string) => {
    setActiveTab("pipeline");
    fetchRunDetail(runId);
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
    // Navigate to Pipeline tab, clear run selection (forcing the list view),
    // and pre-fill search with the article's title to find existing runs.
    setPipelineSearch(article.title);
    setSelectedRun(null);
    setRunDetailTab("draft");
    setEditingPlatform(null);
    setActiveTab("pipeline");
  };

  const [isStartingArticleRun, setIsStartingArticleRun] = useState<string | null>(null);
  const handleStartArticleRun = (article: EducationArticleSummary) => {
    // Pre-fill the topic with the article title and open the standard new-run
    // modal so the user can review/adjust the topic before starting the run.
    setNewRunTopic(article.title);
    setActiveTab("pipeline");
    setIsTriggerModalOpen(true);
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
    setAiReviewResult(null);
    setAiReviewError(null);
    fetchPageContent(page.pageId);
  };

  const fetchPageContent = async (pageId: string) => {
    setPageContentLoading(true);
    setPageContentFields({});
    setPageContentFieldTypes({});
    try {
      const res = await fetch(`/api/portal/clinical-review/page-content?pageId=${encodeURIComponent(pageId)}`);
      const data = await res.json();
      if (data.success) {
        setPageContentAvailable(!!data.available);
        setPageContentFields(data.fields || {});
        setPageContentFieldTypes(data.fieldTypes || {});
      } else {
        setPageContentAvailable(false);
      }
    } catch (err) {
      console.error("Failed to load page content for manual editing:", err);
      setPageContentAvailable(false);
    } finally {
      setPageContentLoading(false);
    }
  };

  const handleSaveFieldContent = (fieldName: string, value: string | string[]): Promise<boolean> =>
    handleApproveAiFinding({ severity: "low", category: "", note: "", field: fieldName, suggested_value: value });

  const handleRunAiReview = async () => {
    if (!selectedReviewPageId) return;
    setAiReviewLoading(true);
    setAiReviewError(null);
    try {
      const res = await fetch("/api/portal/clinical-review/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedReviewPageId }),
      });
      const data = await res.json();
      if (!data.success) {
        setAiReviewError(data.error || "AI review failed.");
        return;
      }
      setAiReviewResult(data.result);
    } catch (err) {
      console.error("AI content review failed:", err);
      setAiReviewError("AI review failed. Please check your connection and try again.");
    } finally {
      setAiReviewLoading(false);
    }
  };

  const handleApproveAiFinding = async (finding: ClinicalContentReviewFinding): Promise<boolean> => {
    if (!selectedReviewPageId || !finding.field || finding.suggested_value === undefined) return false;
    try {
      const res = await fetch("/api/portal/clinical-review/field-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedReviewPageId,
          fieldName: finding.field,
          value: finding.suggested_value,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to apply this change.");
        return false;
      }
      toast.success("Change applied — now live on the page.");
      return true;
    } catch (err) {
      console.error("Failed to apply AI-suggested field override:", err);
      toast.error("Failed to apply this change. Please check your connection and try again.");
      return false;
    }
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
      setTriggerStep("Stage 1: Searching PubMed, NICE, Cochrane & orthopaedic literature...");
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

  // Submit an externally-researched brief (e.g. from the lincoln-knee-clinic-blog-research
  // skill) — skips Stage 1 (PubMed/Gemini research) and drafts straight from the pasted
  // brief. Mirrors handleTriggerRun's fetch-then-poll pattern since both hand off to the
  // same background runPipelineGeneration() work and status contract.
  const handleImportResearchBrief = async (e: React.FormEvent) => {
    e.preventDefault();

    let parsedBrief: any;
    try {
      parsedBrief = JSON.parse(importBriefJson);
    } catch {
      toast.error("That's not valid JSON — paste the exact contents of research-brief.json.");
      return;
    }

    setIsImporting(true);
    setImportProgress(10);
    setImportStep("Submitting researched brief...");
    importBackgroundedRef.current = false;

    try {
      const res = await fetch("/api/portal/content-pipeline/research/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: importTopic.trim(), researchBrief: parsedBrief }),
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
        throw new Error(data.error || data.message || "Failed to import research brief.");
      }

      const runId = data.run.run_id;
      setImportProgress(30);
      setImportStep("Stage 2: AI Medical Writer drafting from your researched brief...");
      await fetchPipelineRuns();

      const POLL_INTERVAL_MS = 3000;
      const MAX_POLLS = 100; // ~5 minutes
      let finished = false;

      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (importBackgroundedRef.current) return; // user chose to keep it running and close the modal

        const pollRes = await fetch(`/api/portal/content-pipeline/runs/${encodeURIComponent(runId)}`);
        const pollData = await pollRes.json().catch(() => null);
        if (!pollData?.success || !pollData.run) continue;

        if (pollData.run.status !== "researching" && pollData.run.status !== "writing_blog") {
          finished = true;
          break;
        }
        setImportProgress((p) => Math.min(p + 3, 90));
      }

      if (importBackgroundedRef.current) return;

      if (!finished) {
        throw new Error(
          "This is taking longer than expected. The run is still generating in the background — check back in the run list shortly."
        );
      }

      setImportProgress(100);
      setImportStep("Draft ready! Loading review workspace...");
      await new Promise((r) => setTimeout(r, 400));
      setIsImportModalOpen(false);
      setImportTopic("");
      setImportBriefJson("");
      await fetchPipelineRuns();
      await fetchRunDetail(runId);
      setActionFeedback("🚀 Research imported and blog draft generated successfully!");
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      if (importBackgroundedRef.current) return;
      console.error("Error importing research brief:", err);
      toast.error(err?.message || "An error occurred while importing the research brief.");
    } finally {
      if (!importBackgroundedRef.current) {
        setIsImporting(false);
        setImportProgress(0);
        setImportStep("");
      }
    }
  };

  // Closes the "Import Research" modal while generation is in progress without
  // cancelling the actual server-side work — mirrors handleBackgroundTriggerRun.
  const handleBackgroundImportRun = () => {
    importBackgroundedRef.current = true;
    setIsImporting(false);
    setImportProgress(0);
    setImportStep("");
    setIsImportModalOpen(false);
    fetchPipelineRuns();
  };

  // Submit review decision (approved | edited | revision_requested | revert_to_blog | revert_to_social)
  const handleReviewSubmission = async (
    stage: "blog" | "social",
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social" | "save_progress" | "publish_blog",
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

      if (decision === "edited" || decision === "save_progress" || decision === "publish_blog") {
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
            article_title: editArticleTitle,
            article_excerpt: editArticleExcerpt,
            article_body_markdown: editArticleBody,
            article_body: editArticleBody,
            article_suggested_images: editArticleSuggestedImages,
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
    <div className="max-w-md mx-auto bg-portal-surface-alt border border-dashed border-portal-border/20 rounded-xl p-6 text-center space-y-3 animate-fadeIn">
      <p className="text-xs text-portal-text/60">
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
  const socialOnlyNeedsReviewCount = socialOnlyPosts.filter(
    (p) => !(p.instagram.status === "approved" && p.facebook.status === "approved" && p.linkedin.status === "approved")
  ).length;
  const newsletterDraftCount = newsletterEditions.filter((e) => e.status === "draft").length;
  const needsAttentionItems: NeedsAttentionItem[] = [
    {
      label: "Content Pipeline",
      description: "Runs awaiting draft or social review",
      count: reviewNeededRuns.length,
      tabId: "pipeline",
      icon: "📝",
    },
    {
      label: "Clinical Review",
      description: "Pages needing a reviewer sign-off",
      count: reviewNeededPages.length,
      tabId: "clinicalReview",
      icon: "🩺",
    },
    {
      label: "Community Reports",
      description: "Flagged posts or replies awaiting action",
      count: openCommunityReportsCount,
      tabId: "community",
      icon: "💬",
    },
  ];
  const navGroups: { label: string; tabs: { id: string; label: string; icon: string; badge?: number | null }[] }[] = [
    {
      label: "",
      tabs: [{ id: "overview", label: "Overview", icon: "📊" }],
    },
    {
      label: "Content",
      tabs: [
        {
          id: "pipeline",
          label: "Pipeline",
          icon: "📝",
          badge: reviewNeededRuns.length > 0 ? reviewNeededRuns.length : null,
        },
        {
          id: "newsletterCreator",
          label: "Newsletters",
          icon: "✉️",
          badge: newsletterDraftCount > 0 ? newsletterDraftCount : null,
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
          badge: socialOnlyNeedsReviewCount > 0 ? socialOnlyNeedsReviewCount : null,
        },
      ],
    },
    {
      label: "Engagement",
      tabs: [
        { id: "newsletter", label: "Subscribers", icon: "📧" },
        {
          id: "community",
          label: "Community",
          icon: "💬",
          badge: openCommunityReportsCount > 0 ? openCommunityReportsCount : null,
        },
      ],
    },
    {
      label: "Compliance",
      tabs: [
        {
          id: "clinicalReview",
          label: "Review",
          icon: "🩺",
          badge: reviewNeededPages.length > 0 ? reviewNeededPages.length : null,
        },
      ],
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

  useEffect(() => {
    document.body.setAttribute("data-portal-theme", theme);
    return () => {
      document.body.removeAttribute("data-portal-theme");
    };
  }, [theme]);

  return (
    <div data-portal-theme={theme} className="min-h-screen bg-portal-bg text-portal-text/80 font-sans flex flex-col md:flex-row">
      <PortalSidebar
        navGroups={navGroups}
        activeTab={activeTab}
        onNavTabClick={handleNavTabClick}
        mobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
      {/* Top Header */}
      <header className="bg-portal-surface border-b border-portal-border/10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-3.5">
          {/* Mobile Header (below md) */}
          <div className="flex md:hidden flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
                className="w-10 h-10 bg-portal-surface-alt border border-portal-border/10 rounded-xl flex items-center justify-center shrink-0 text-portal-text cursor-pointer"
              >
                ☰
              </button>
              <div className="w-10 h-10 bg-portal-surface-alt border border-clinical-teal/30 rounded-xl flex items-center justify-center shrink-0">
                <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-7 h-7 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <h1 className="font-serif text-base font-bold text-portal-text tracking-tight leading-tight">
                    Lincolnshire Knee Clinic
                  </h1>
                  <span className="bg-portal-surface-alt border border-clinical-teal/30 text-portal-accent-text text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                    Practice Intelligence
                  </span>
                </div>
                <p className="text-xs text-portal-text/60 leading-snug mt-0.5">
                  Visitor Engagement, Event Telemetry &amp; Content Automation Pipeline
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-clinical-teal/30 text-portal-accent-text text-[11px] py-1.5 px-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
              >
                ← Return to Website
              </Link>
              <button
                type="button"
                onClick={() => setIsAdminPasswordOpen((value) => !value)}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-[11px] py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Header (md and up) — unchanged */}
          <div className="hidden md:flex md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-portal-surface-alt border border-clinical-teal/30 rounded-xl flex items-center justify-center shrink-0">
                <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-base sm:text-lg font-bold text-portal-text tracking-tight">
                    Lincolnshire Knee Clinic
                  </h1>
                  <span className="bg-portal-surface-alt border border-clinical-teal/30 text-portal-accent-text text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Practice Intelligence
                  </span>
                </div>
                <p className="text-xs text-portal-text/60">
                  Visitor Engagement, Event Telemetry &amp; Content Automation Pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>
              <Link
                href="/"
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-clinical-teal/30 text-portal-accent-text text-xs py-1.5 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                ← Return to Website
              </Link>
              <button
                type="button"
                onClick={() => setIsAdminPasswordOpen((value) => !value)}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/10 text-portal-text/70 text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {isAdminPasswordOpen && (
            <form
              onSubmit={handleAdminPasswordChange}
              className="mt-3 grid gap-2 rounded-xl border border-portal-border/10 bg-portal-bg/70 p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="password"
                minLength={8}
                required
                placeholder="New password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="rounded-lg border border-portal-border/10 bg-portal-surface px-3 py-2 text-xs text-portal-text placeholder:text-portal-text/40 focus:border-clinical-teal focus:outline-none"
              />
              <input
                type="password"
                minLength={8}
                required
                placeholder="Confirm password"
                value={adminPasswordConfirm}
                onChange={(event) => setAdminPasswordConfirm(event.target.value)}
                className="rounded-lg border border-portal-border/10 bg-portal-surface px-3 py-2 text-xs text-portal-text placeholder:text-portal-text/40 focus:border-clinical-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={adminPasswordSaving}
                className="rounded-lg bg-clinical-teal px-4 py-2 text-xs font-bold text-deep-navy transition-colors hover:bg-clinical-teal-hover disabled:opacity-60"
              >
                {adminPasswordSaving ? "Saving..." : "Save Password"}
              </button>
              {(adminPasswordMessage || adminPasswordError) && (
                <p className={`text-xs md:col-span-3 ${adminPasswordError ? "text-status-error" : "text-portal-accent-text"}`}>
                  {adminPasswordError || adminPasswordMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </header>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-portal-surface border border-clinical-teal text-portal-accent-text px-4 py-3 rounded-xl shadow-2xl text-xs font-normal animate-bounce">
          {actionFeedback}
        </div>
      )}

      {actionError && (
        <div className="fixed top-20 right-6 z-50 bg-portal-surface border border-status-error text-status-error px-4 py-3 rounded-xl shadow-2xl text-xs font-normal flex items-center gap-2 max-w-sm animate-fadeIn">
          <span>⚠️</span>
          <div className="flex-1">{actionError}</div>
          <button onClick={() => setActionError(null)} className="text-portal-text/60 hover:text-portal-text cursor-pointer ml-2">✕</button>
        </div>
      )}

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-clinical-teal border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-portal-text/60 text-sm">Loading telemetry metrics...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <OverviewTab
                analyticsConnected={!!statsData?.analyticsConnected}
                needsAttention={needsAttentionItems}
                trendingTopics={trendingTopics}
                pollVotes={pollResults.votes || {}}
                pollVotesTotal={Number(pollVotesTotal) || 0}
                clickEvents={clickEvents}
                totalClicks={totalClicks}
                totalSignups={totalSignups}
                reviewNeededRunsCount={reviewNeededRuns.length}
                publishedAssetsCount={pipelineRuns.filter((r) => r.status === "published").length}
                onNavigate={handleNavTabClick}
                onTriggerTopic={(label) => {
                  setActiveTab("pipeline");
                  setNewRunTopic(label);
                  setIsTriggerModalOpen(true);
                }}
              />
            )}

            {/* TAB: NEWSLETTER */}
            {activeTab === "newsletter" && (
              <SubscribersTab
                totalSignups={totalSignups}
                search={subscriberSearch}
                onSearchChange={setSubscriberSearch}
                hasAnySubscribers={subscribersList.length > 0}
                filteredSubscribers={filteredSubscribers}
                onExportCsv={handleExportSubscribersCsv}
              />
            )}

            {/* TAB: NEWSLETTER CREATOR */}
            {activeTab === "newsletterCreator" && (
              <NewsletterCreatorTab
                activeSubscribersCount={activeSubscribersCount}
                isGeneratingDigest={isGeneratingDigest}
                onGenerateDigest={handleGenerateDigestNewsletter}
                newTopic={newNewsletterTopic}
                onNewTopicChange={setNewNewsletterTopic}
                includeResearch={newsletterIncludeResearch}
                onIncludeResearchChange={setNewsletterIncludeResearch}
                isGeneratingNewsletter={isGeneratingNewsletter}
                onGenerateNewsletter={handleGenerateNewsletter}
                loading={newsletterLoading}
                editions={newsletterEditions}
                selectedNewsletter={selectedNewsletter}
                onSelectForEdit={selectNewsletterForEdit}
                onDeleteNewsletter={handleDeleteNewsletter}
                editSubject={newsletterEditSubject}
                editMarkdown={newsletterEditMarkdown}
                onUpdateContent={handleUpdateNewsletterContent}
                htmlPreview={newsletterHtmlPreview}
                showSendConfirm={showNewsletterSendConfirm}
                onShowSendConfirmChange={setShowNewsletterSendConfirm}
                isSending={isSendingNewsletter}
                onSendNewsletter={handleSendNewsletter}
                subscribers={subscribers}
                selectedSendTopic={selectedSendTopic}
                onSelectedSendTopicChange={setSelectedSendTopic}
                selectedSendPatient={selectedSendPatient}
                onSelectedSendPatientChange={setSelectedSendPatient}
              />
            )}

            {/* TAB: CLINICAL REVIEW */}
            {activeTab === "clinicalReview" && (
              <ClinicalReviewTab
                loading={clinicalReviewLoading}
                pages={clinicalReviewPages}
                selectedPageId={selectedReviewPageId}
                onSelectPage={handleSelectReviewPage}
                onBackToList={() => setSelectedReviewPageId(null)}
                formReviewed={reviewFormReviewed}
                onFormReviewedChange={setReviewFormReviewed}
                formReviewerName={reviewFormReviewerName}
                onFormReviewerNameChange={setReviewFormReviewerName}
                formReviewerTitle={reviewFormReviewerTitle}
                onFormReviewerTitleChange={setReviewFormReviewerTitle}
                formLastReviewedDate={reviewFormLastReviewedDate}
                onFormLastReviewedDateChange={setReviewFormLastReviewedDate}
                formEvidenceSource={reviewFormEvidenceSource}
                onFormEvidenceSourceChange={setReviewFormEvidenceSource}
                onSaveReview={handleSaveReview}
                isSavingReview={isSavingReview}
                onRefreshSearch={handleRefreshSearch}
                searchLoading={searchLoading}
                addedResults={addedResults}
                onUndoSearchResult={handleUndoSearchResult}
                searchError={searchError}
                searchResults={searchResults}
                onTickSearchResult={handleTickSearchResult}
                search={clinicalReviewSearch}
                onSearchChange={setClinicalReviewSearch}
                bulkReviewSelection={bulkReviewSelection}
                onBulkReviewSelectionChange={setBulkReviewSelection}
                isBulkReviewFormOpen={isBulkReviewFormOpen}
                onBulkReviewFormOpenChange={setIsBulkReviewFormOpen}
                bulkReviewerName={bulkReviewerName}
                onBulkReviewerNameChange={setBulkReviewerName}
                bulkReviewerTitle={bulkReviewerTitle}
                onBulkReviewerTitleChange={setBulkReviewerTitle}
                bulkReviewDate={bulkReviewDate}
                onBulkReviewDateChange={setBulkReviewDate}
                onSaveBulkReview={handleSaveBulkReview}
                isSavingBulkReview={isSavingBulkReview}
                aiReviewLoading={aiReviewLoading}
                aiReviewError={aiReviewError}
                aiReviewResult={aiReviewResult}
                onRunAiReview={handleRunAiReview}
                onApproveAiFinding={handleApproveAiFinding}
                pageContentLoading={pageContentLoading}
                pageContentAvailable={pageContentAvailable}
                pageContentFields={pageContentFields}
                pageContentFieldTypes={pageContentFieldTypes}
                onSaveFieldContent={handleSaveFieldContent}
              />
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
              <EducationHubTab
                articles={educationArticles}
                loading={educationArticlesLoading}
                search={educationSearch}
                onSearchChange={setEducationSearch}
                isStartingUpdateSlug={isStartingArticleUpdate}
                isStartingRunSlug={isStartingArticleRun}
                onStartUpdate={handleStartArticleUpdate}
                onStartRun={handleStartArticleRun}
                onRequestRemoval={setArticlePendingRemoval}
              />
            )}

            {/* TAB: STANDALONE SOCIAL MEDIA POSTS */}
            {activeTab === "socialOnly" && (
              <SocialPostsTab
                loading={socialOnlyPostsLoading}
                posts={socialOnlyPosts}
                selectedPost={selectedSocialOnlyPost}
                onSelectPost={setSelectedSocialOnlyPost}
                activeSubTab={activeSocialOnlySubTab}
                onSubTabChange={setActiveSocialOnlySubTab}
                copiedKey={socialOnlyCopiedKey}
                generatingImageKey={generatingSocialImageKey}
                onApproveSocialCaption={handleApproveSocialCaption}
                onSaveSocialCaption={handleSaveSocialCaption}
                onRequestSocialRevision={handleRequestSocialRevision}
                onCopySocialOnly={handleCopySocialOnly}
                onAttachSocialImage={handleAttachSocialImage}
                onGenerateSocialImage={handleGenerateSocialImage}
                onAttachSocialVideo={handleAttachSocialVideo}
                onDeleteSocialOnlyPost={handleDeleteSocialOnlyPost}
                onArchiveSocialOnlyPost={handleArchiveSocialOnlyPost}
                onUnarchiveSocialOnlyPost={handleUnarchiveSocialOnlyPost}
                onGoToLinkedArticle={handleGoToLinkedArticle}
                showArchived={showArchivedSocialOnly}
                onShowArchivedChange={setShowArchivedSocialOnly}
                isModalOpen={isSocialOnlyModalOpen}
                onModalOpenChange={setIsSocialOnlyModalOpen}
                newTopic={newSocialOnlyTopic}
                onNewTopicChange={setNewSocialOnlyTopic}
                isGenerating={isGeneratingSocialOnly}
                onGenerateSubmit={handleGenerateSocialOnly}
                batchMode={socialOnlyBatchMode}
                onBatchModeChange={setSocialOnlyBatchMode}
                batchTopics={newSocialOnlyBatchTopics}
                onBatchTopicsChange={setNewSocialOnlyBatchTopics}
                batchProgress={socialOnlyBatchProgress}
              />
            )}

            {/* CONFIRM REMOVE/RESTORE ARTICLE MODAL */}
            {articlePendingRemoval && (
              <div className="fixed inset-0 z-50 bg-portal-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-portal-surface border border-portal-border/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <h3 className="text-sm font-bold text-portal-text">
                    {articlePendingRemoval.removed ? "Restore this article?" : "Remove this article?"}
                  </h3>
                  <p className="text-xs text-portal-text/70 leading-relaxed">
                    {articlePendingRemoval.removed
                      ? <>Confirm you want to restore <strong className="text-portal-text">&ldquo;{articlePendingRemoval.title}&rdquo;</strong> to the Education Hub. It will become visible on the live site again within a few minutes.</>
                      : <>Confirm you want to remove <strong className="text-portal-text">&ldquo;{articlePendingRemoval.title}&rdquo;</strong> from the Education Hub. It will disappear from the live site within a few minutes. You can restore it at any time from this screen.</>}
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setArticlePendingRemoval(null)}
                      disabled={isUpdatingArticleVisibility}
                      className="border border-portal-border/20 text-portal-text/70 hover:bg-portal-text/5 text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
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
              <PipelineTab
                reviewNeededCount={reviewNeededRuns.length}
                visibleReviewNeededRuns={visibleReviewNeededRuns}
                otherCount={otherRuns.length}
                visibleOtherRuns={visibleOtherRuns}
                search={pipelineSearch}
                onSearchChange={setPipelineSearch}
                onSelectRun={fetchRunDetail}
                onDeleteRun={handleDeletePipelineRun}
                isBlogEditInProgress={isBlogEditInProgress}
                selectedRun={selectedRun}
                onBackToList={() => {
                  setSelectedRun(null);
                  setRunDetailTab("draft");
                  setEditingPlatform(null);
                }}
                onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                isEditMode={isEditMode}
                onStartEdit={() => {
                  const latestDraft = selectedRun?.blog_drafts?.[0];
                  if (latestDraft) {
                    setEditTitle(latestDraft.title || "");
                    setEditExcerpt(latestDraft.excerpt || "");
                    setEditBody(cleanHeadingBugs(latestDraft.body_markdown || latestDraft.body || ""));
                    setEditCategory(latestDraft.category || "");

                    setEditArticleTitle(latestDraft.article_title || "");
                    setEditArticleExcerpt(latestDraft.article_excerpt || "");
                    setEditArticleBody(cleanHeadingBugs(latestDraft.article_body_markdown || latestDraft.article_body || ""));
                    setEditArticleSuggestedImages(latestDraft.article_suggested_images || []);
                  }
                  setActiveDraftSubTab("layman");
                  setRunDetailTab("draft");
                  setIsEditMode(true);
                }}
                onApproveDraft={handleApproveDraft}
                onPublishBlogOnly={handlePublishBlogOnly}
                isSubmittingReview={isSubmittingReview}
                onOpenBlogRevision={() => {
                  setRevisionStage("blog");
                  setIsRevisionModalOpen(true);
                }}
                onApproveAllSocial={() => handleReviewSubmission("social", "approved")}
                onOpenSocialRevision={() => {
                  setRevisionStage("social");
                  setRevisionPlatform(undefined);
                  setIsRevisionModalOpen(true);
                }}
                onRevertToBlog={() => handleReviewSubmission("blog", "revert_to_blog")}
                onApprovePlatform={(platform) => handleReviewSubmission("social", "approved", undefined, platform)}
                onEditPlatform={(platform) => {
                  setRunDetailTab("social");
                  setEditingPlatform(platform);
                }}
                onOpenPlatformRevision={(platform) => {
                  setRevisionStage("social");
                  setRevisionPlatform(platform);
                  setIsRevisionModalOpen(true);
                }}
                runDetailTab={runDetailTab}
                onRunDetailTabChange={setRunDetailTab}
                activeDraftSubTab={activeDraftSubTab}
                onActiveDraftSubTabChange={setActiveDraftSubTab}
                editTitle={editTitle}
                onEditTitleChange={setEditTitle}
                editExcerpt={editExcerpt}
                onEditExcerptChange={setEditExcerpt}
                editCategory={editCategory}
                onEditCategoryChange={setEditCategory}
                editBody={editBody}
                editSuggestedImages={editSuggestedImages}
                editArticleTitle={editArticleTitle}
                onEditArticleTitleChange={setEditArticleTitle}
                editArticleExcerpt={editArticleExcerpt}
                onEditArticleExcerptChange={setEditArticleExcerpt}
                editArticleBody={editArticleBody}
                editArticleSuggestedImages={editArticleSuggestedImages}
                textareaRef={textareaRef}
                livePreviewRef={livePreviewRef}
                onTextareaChange={handleTextareaChange}
                onTextareaKeyDown={handleTextareaKeyDown}
                insertMarkdown={insertMarkdown}
                onReviseSelection={handleReviseSelection}
                isRevisingSelection={isRevisingSelection}
                onResolveFlagWithAI={handleResolveFlagWithAI}
                onResolveFlagWithOwnWording={handleResolveFlagWithOwnWording}
                resolvingFlagText={resolvingFlagText}
                history={history}
                historyIndex={historyIndex}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onDiscardChanges={handleDiscardChanges}
                onFinishEditing={handleFinishEditing}
                onSaveProgress={() => handleReviewSubmission("blog", "save_progress", undefined, undefined, true)}
                generatingImagePlaceholderId={generatingImagePlaceholderId}
                generatedImagePreview={generatedImagePreview}
                onAttachPlaceholderImage={handleAttachPlaceholderImage}
                onGenerateImage={handleGenerateImage}
                onResetPlaceholder={handleResetPlaceholderImage}
                onRemovePlaceholder={handleRemovePlaceholder}
                onRemoveResolvedImage={handleRemoveResolvedImage}
                isUploadingImage={isUploadingImage}
                onFileUpload={handleFileUpload}
                imageUrlInput={imageUrlInput}
                onImageUrlInputChange={setImageUrlInput}
                onAttachImage={handleAttachImage}
                activeSocialSubTab={activeSocialSubTab}
                onSocialSubTabChange={setActiveSocialSubTab}
                editingPlatform={editingPlatform}
                onCancelExternalEdit={() => setEditingPlatform(null)}
                copiedKey={copiedKey}
                onCopy={handleCopyToClipboard}
                generatingSocialImageKey={generatingSocialImageKey}
                onGeneratingSocialImageKeyChange={setGeneratingSocialImageKey}
                onReviewSubmission={handleReviewSubmission}
                onOpenRevision={(platform) => {
                  setRevisionStage("social");
                  setRevisionPlatform(platform);
                  setIsRevisionModalOpen(true);
                }}
                isBackfillingFormats={isBackfillingFormats}
                onGenerateMissingFormats={handleGenerateMissingFormats}
                selectedRunReviews={selectedRunReviews}
                isVersionHistoryExpanded={isVersionHistoryExpanded}
                onToggleVersionHistory={() => setIsVersionHistoryExpanded(!isVersionHistoryExpanded)}
              />
            )}
          </>
        )}

        {/* START NEW RUN MODAL */}
        <PipelineTriggerModal
          isOpen={isTriggerModalOpen}
          onClose={() => setIsTriggerModalOpen(false)}
          onBackground={handleBackgroundTriggerRun}
          topic={newRunTopic}
          onTopicChange={setNewRunTopic}
          isTriggering={isTriggering}
          triggerProgress={triggerProgress}
          triggerStep={triggerStep}
          onSubmit={handleTriggerRun}
        />

        {/* IMPORT RESEARCHED BRIEF MODAL */}
        <PipelineImportResearchModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onBackground={handleBackgroundImportRun}
          topic={importTopic}
          onTopicChange={setImportTopic}
          researchBriefJson={importBriefJson}
          onResearchBriefJsonChange={setImportBriefJson}
          isImporting={isImporting}
          importProgress={importProgress}
          importStep={importStep}
          onSubmit={handleImportResearchBrief}
        />

        {/* REQUEST REVISION MODAL */}
        <PipelineRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => {
            setIsRevisionModalOpen(false);
            setRevisionPlatform(undefined);
          }}
          stage={revisionStage}
          platform={revisionPlatform}
          notes={revisionNotes}
          onNotesChange={setRevisionNotes}
          isSubmitting={isSubmittingReview}
          onSubmit={() => handleReviewSubmission(revisionStage, "revision_requested", undefined, revisionPlatform)}
        />
      </main>
      </div>
    </div>
  );
}
