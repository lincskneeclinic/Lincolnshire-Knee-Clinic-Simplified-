import { getStoreValue, setStoreValue } from "./dataStore";

// Standalone Instagram/Facebook/LinkedIn post creation — no blog article involved.
// Stored via the generic app_kv_store KV pattern (same as lib/educationArticles.ts)
// rather than a new fixed-schema Supabase table, since this session hit real, silent
// insert failures earlier when app-generated data didn't exactly match a table's
// column set. One KV entry holds every post, keyed by id.
export interface SocialOnlyPlatformPost {
  caption: string;
  imagePromptSuggestion?: string;
  imageUrl?: string;
  status: "pending" | "approved";
  script?: string;
}

export interface SocialOnlyPost {
  id: string;
  topic: string;
  instagram: SocialOnlyPlatformPost;
  facebook: SocialOnlyPlatformPost;
  linkedin: SocialOnlyPlatformPost;
  instagramStory?: SocialOnlyPlatformPost;
  instagramCarousel?: {
    caption: string;
    imagePromptSuggestion: string;
    slides: Array<{ slideNumber: number; text: string; imagePromptSuggestion: string; imageUrl?: string }>;
    status: "pending" | "approved";
  };
  instagramReel?: {
    caption: string;
    imagePromptSuggestion: string;
    script: string;
    status: "pending" | "approved";
    videoUrl?: string;
    videoSource?: "upload" | "ai-broll";
  };
  created_at: string;
  updated_at: string;
  /** Posted content parked out of the active review list for future reuse — see archivePost/unarchivePost. */
  archived?: boolean;
  archived_at?: string;
  /**
   * A companion blog/article auto-triggered alongside this post's captions
   * (via the Content Pipeline) so social traffic has somewhere real to land
   * — set by createSocialOnlyPost, filled in by syncLinkedSocialOnlyPosts
   * once the article clears clinical review and goes live.
   */
  linkedArticle?: {
    pipelineRunId: string;
    status: "pending_review" | "published";
    url?: string;
    title?: string;
  };
}

const SOCIAL_ONLY_POSTS_KEY = "social-only-posts";

export async function listSocialOnlyPosts(): Promise<SocialOnlyPost[]> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  return Object.values(posts).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getSocialOnlyPost(id: string): Promise<SocialOnlyPost | null> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  return posts[id] || null;
}

export async function createSocialOnlyPost(
  topic: string,
  captions: {
    instagram: { caption: string; imagePromptSuggestion?: string };
    facebook: { caption: string; imagePromptSuggestion?: string };
    linkedin: { caption: string; imagePromptSuggestion?: string };
    instagramStory?: { caption: string; imagePromptSuggestion?: string };
    instagramCarousel?: { caption: string; imagePromptSuggestion: string; slides?: any[] };
    instagramReel?: { caption: string; imagePromptSuggestion: string; script?: string };
  },
  linkedPipelineRunId?: string
): Promise<SocialOnlyPost> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  const now = new Date().toISOString();
  const post: SocialOnlyPost = {
    id: crypto.randomUUID(),
    topic,
    instagram: { ...captions.instagram, status: "pending" },
    facebook: { ...captions.facebook, status: "pending" },
    linkedin: { ...captions.linkedin, status: "pending" },
    instagramStory: captions.instagramStory ? { ...captions.instagramStory, status: "pending" } : undefined,
    instagramCarousel: captions.instagramCarousel ? {
      caption: captions.instagramCarousel.caption,
      imagePromptSuggestion: captions.instagramCarousel.imagePromptSuggestion,
      slides: captions.instagramCarousel.slides || [],
      status: "pending"
    } : undefined,
    instagramReel: captions.instagramReel ? {
      caption: captions.instagramReel.caption,
      imagePromptSuggestion: captions.instagramReel.imagePromptSuggestion,
      script: captions.instagramReel.script || "",
      status: "pending"
    } : undefined,
    created_at: now,
    updated_at: now,
    linkedArticle: linkedPipelineRunId ? { pipelineRunId: linkedPipelineRunId, status: "pending_review" } : undefined,
  };
  posts[post.id] = post;
  await setStoreValue(SOCIAL_ONLY_POSTS_KEY, posts);
  return post;
}

export async function updateSocialOnlyPost(
  id: string,
  updater: (post: SocialOnlyPost) => SocialOnlyPost
): Promise<SocialOnlyPost | null> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  const existing = posts[id];
  if (!existing) return null;
  const updated = updater(existing);
  updated.updated_at = new Date().toISOString();
  posts[id] = updated;
  await setStoreValue(SOCIAL_ONLY_POSTS_KEY, posts);
  return updated;
}

export async function deleteSocialOnlyPost(id: string): Promise<void> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  delete posts[id];
  await setStoreValue(SOCIAL_ONLY_POSTS_KEY, posts);
}

// Distinct from delete — parks already-posted content out of the active
// review list (so it stops competing with what still needs approving) while
// keeping every caption/image/script intact for a future refresh-and-repost,
// e.g. reusing an evergreen topic a year or two later.
export async function archiveSocialOnlyPost(id: string): Promise<SocialOnlyPost | null> {
  return updateSocialOnlyPost(id, (post) => ({
    ...post,
    archived: true,
    archived_at: new Date().toISOString(),
  }));
}

export async function unarchiveSocialOnlyPost(id: string): Promise<SocialOnlyPost | null> {
  return updateSocialOnlyPost(id, (post) => ({
    ...post,
    archived: false,
    archived_at: undefined,
  }));
}

// Called once a companion pipeline run's article clears clinical review and
// goes live (see contentPipeline.ts's publish_blog handling) — fills in the
// real URL/title on every social-only post that was auto-linked to that run
// at generation time, so reviewers have something to copy into a bio link,
// Facebook comment, or LinkedIn first comment when they post manually.
export async function syncLinkedSocialOnlyPosts(pipelineRunId: string, url: string, title: string): Promise<void> {
  const posts = await getStoreValue<Record<string, SocialOnlyPost>>(SOCIAL_ONLY_POSTS_KEY, {});
  let changed = false;
  for (const id of Object.keys(posts)) {
    const post = posts[id];
    if (post.linkedArticle?.pipelineRunId === pipelineRunId && post.linkedArticle.status !== "published") {
      posts[id] = {
        ...post,
        linkedArticle: { pipelineRunId, status: "published", url, title },
        updated_at: new Date().toISOString(),
      };
      changed = true;
    }
  }
  if (changed) await setStoreValue(SOCIAL_ONLY_POSTS_KEY, posts);
}
