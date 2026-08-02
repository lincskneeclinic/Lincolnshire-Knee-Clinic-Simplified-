import { createAdminClient } from "@/lib/supabase/admin";
import { getAccountForPlatform, MetaPlatform } from "@/lib/metaAccounts";
import {
  getRecentInstagramMedia,
  getRecentFacebookPosts,
  getInstagramMediaInsights,
  getFacebookPostInsights,
  GraphMetrics,
} from "@/lib/metaGraphApi";

export type PostSourceType = "pipeline" | "social_only";

export interface PostMetricsSnapshot {
  media_id?: string;
  fetched_at: string;
  reach: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  engagement_rate: number | null;
}

function computeEngagementRate(m: GraphMetrics): number | null {
  if (!m.reach || m.reach <= 0) return null;
  const engaged = (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0);
  return Math.round((engaged / m.reach) * 1000) / 10; // percent, one decimal place
}

/** Resolves a manually pasted live post URL to a real media/post ID and stores the link. Throws on failure. */
export async function linkPostToPermalink(
  sourceType: PostSourceType,
  sourceId: string,
  platform: MetaPlatform,
  permalinkUrl: string
): Promise<void> {
  const account = await getAccountForPlatform(platform);
  if (!account) throw new Error(`No connected ${platform} account. Connect one first.`);

  const normalizedPermalink = permalinkUrl.trim().replace(/\/$/, "");
  let mediaId: string | null = null;

  if (platform === "instagram") {
    const media = await getRecentInstagramMedia(account.account_id, account.access_token);
    mediaId = media.find((m) => m.permalink.replace(/\/$/, "") === normalizedPermalink)?.id || null;
  } else {
    const posts = await getRecentFacebookPosts(account.account_id, account.access_token);
    mediaId = posts.find((p) => p.permalink_url.replace(/\/$/, "") === normalizedPermalink)?.id || null;
  }

  if (!mediaId) {
    const noun = platform === "instagram" ? "media" : "posts";
    throw new Error(
      `Couldn't find that post among the connected account's recent ${noun}. Double-check the URL, and that it was posted from the connected account.`
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("meta_post_links").upsert(
    {
      source_type: sourceType,
      source_id: sourceId,
      platform,
      permalink: normalizedPermalink,
      media_id: mediaId,
      linked_at: new Date().toISOString(),
    },
    { onConflict: "source_type,source_id,platform" }
  );
  if (error) throw new Error(`Failed to save post link: ${error.message}`);
}

/** Fetches current metrics from the Graph API and stores a new timestamped snapshot. Throws on failure. */
export async function fetchAndStoreMetrics(
  sourceType: PostSourceType,
  sourceId: string,
  platform: MetaPlatform,
  postType: string
): Promise<PostMetricsSnapshot> {
  const admin = createAdminClient();
  const { data: link, error: linkError } = await admin
    .from("meta_post_links")
    .select("media_id")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .eq("platform", platform)
    .maybeSingle();
  if (linkError || !link) throw new Error("This post hasn't been linked to a live post yet.");

  const account = await getAccountForPlatform(platform);
  if (!account) throw new Error(`No connected ${platform} account. Connect one first.`);

  const metrics =
    platform === "instagram"
      ? await getInstagramMediaInsights(link.media_id, account.access_token)
      : await getFacebookPostInsights(link.media_id, account.access_token);

  const engagementRate = computeEngagementRate(metrics);

  const { error: insertError } = await admin.from("meta_post_metrics").insert({
    media_id: link.media_id,
    platform,
    post_type: postType,
    reach: metrics.reach ?? null,
    views: metrics.views ?? null,
    likes: metrics.likes ?? null,
    comments: metrics.comments ?? null,
    shares: metrics.shares ?? null,
    saves: metrics.saves ?? null,
    engagement_rate: engagementRate,
    raw: metrics.raw,
  });
  if (insertError) throw new Error(`Failed to store metrics: ${insertError.message}`);

  return {
    media_id: link.media_id,
    fetched_at: new Date().toISOString(),
    reach: metrics.reach ?? null,
    views: metrics.views ?? null,
    likes: metrics.likes ?? null,
    comments: metrics.comments ?? null,
    shares: metrics.shares ?? null,
    saves: metrics.saves ?? null,
    engagement_rate: engagementRate,
  };
}

export async function getLatestMetrics(
  sourceType: PostSourceType,
  sourceId: string,
  platform: MetaPlatform
): Promise<PostMetricsSnapshot | null> {
  const admin = createAdminClient();
  const { data: link } = await admin
    .from("meta_post_links")
    .select("media_id")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .eq("platform", platform)
    .maybeSingle();
  if (!link) return null;

  const { data } = await admin
    .from("meta_post_metrics")
    .select("fetched_at, reach, views, likes, comments, shares, saves, engagement_rate")
    .eq("media_id", link.media_id)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as PostMetricsSnapshot) || null;
}

export async function isPostLinked(sourceType: PostSourceType, sourceId: string, platform: MetaPlatform): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("meta_post_links")
    .select("media_id")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .eq("platform", platform)
    .maybeSingle();
  return !!data;
}

/** The account's own trailing average engagement rate for this post type — the real-data benchmark AI suggestions are grounded against. */
export async function getAccountAverageEngagementRate(
  platform: MetaPlatform,
  postType: string,
  excludeMediaId?: string
): Promise<{ average: number | null; sampleSize: number }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("meta_post_metrics")
    .select("engagement_rate, media_id")
    .eq("platform", platform)
    .eq("post_type", postType)
    .not("engagement_rate", "is", null)
    .order("fetched_at", { ascending: false })
    .limit(20);
  if (!data || data.length === 0) return { average: null, sampleSize: 0 };
  // One snapshot per media_id (its most recent) so re-checking the same post
  // repeatedly doesn't skew its own account average.
  const latestPerMedia = new Map<string, number>();
  for (const row of data) {
    if (excludeMediaId && row.media_id === excludeMediaId) continue;
    if (!latestPerMedia.has(row.media_id)) latestPerMedia.set(row.media_id, row.engagement_rate || 0);
  }
  const rows = [...latestPerMedia.values()];
  if (rows.length === 0) return { average: null, sampleSize: 0 };
  const sum = rows.reduce((acc, r) => acc + r, 0);
  return { average: Math.round((sum / rows.length) * 10) / 10, sampleSize: rows.length };
}
