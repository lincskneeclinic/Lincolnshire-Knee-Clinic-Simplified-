// Low-level Meta (Facebook + Instagram) Graph API client. Every function throws a
// descriptive Error on failure so callers (API routes) can surface a clear message —
// there is no silent fallback here, unlike AI-generation code elsewhere in this repo.

const GRAPH_VERSION = "v25.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from environment variables.`);
  return value;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${GRAPH_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok || data.error) {
    const message = data?.error?.message || `Graph API request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function getOAuthDialogUrl(redirectUri: string, state: string): string {
  const clientId = requireEnv("META_APP_ID");
  const scope = [
    "pages_show_list",
    "pages_read_engagement",
    "read_insights",
    "instagram_basic",
    "instagram_manage_insights",
    "business_management",
  ].join(",");

  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const clientId = requireEnv("META_APP_ID");
  const clientSecret = requireEnv("META_APP_SECRET");

  const data = await graphGet<{ access_token: string }>("/oauth/access_token", {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  return data.access_token;
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
  const clientId = requireEnv("META_APP_ID");
  const clientSecret = requireEnv("META_APP_SECRET");

  const data = await graphGet<{ access_token: string }>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: shortLivedToken,
  });

  return data.access_token;
}

export interface ManagedPage {
  id: string;
  name: string;
  access_token: string;
}

export async function getManagedPages(longLivedUserToken: string): Promise<ManagedPage[]> {
  const data = await graphGet<{ data: ManagedPage[] }>("/me/accounts", {
    access_token: longLivedUserToken,
  });
  return data.data || [];
}

export async function getInstagramBusinessAccountId(pageId: string, pageToken: string): Promise<string | null> {
  const data = await graphGet<{ instagram_business_account?: { id: string } }>(`/${pageId}`, {
    fields: "instagram_business_account",
    access_token: pageToken,
  });
  return data.instagram_business_account?.id || null;
}

export interface RecentMediaItem {
  id: string;
  permalink: string;
  timestamp: string;
  media_type: string;
}

export async function getRecentInstagramMedia(igUserId: string, pageToken: string): Promise<RecentMediaItem[]> {
  const data = await graphGet<{ data: RecentMediaItem[] }>(`/${igUserId}/media`, {
    fields: "id,permalink,timestamp,media_type",
    limit: "50",
    access_token: pageToken,
  });
  return data.data || [];
}

export interface RecentFacebookPost {
  id: string;
  permalink_url: string;
  created_time: string;
}

export async function getRecentFacebookPosts(pageId: string, pageToken: string): Promise<RecentFacebookPost[]> {
  const data = await graphGet<{ data: RecentFacebookPost[] }>(`/${pageId}/posts`, {
    fields: "id,permalink_url,created_time",
    limit: "50",
    access_token: pageToken,
  });
  return data.data || [];
}

export interface GraphMetrics {
  reach?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  raw: unknown;
}

// Instagram's insight metric names have churned repeatedly (impressions -> views,
// several per-media-type restrictions) — request the full desired set first, and
// if the API rejects an unknown metric, retry with a conservative fallback rather
// than failing the whole fetch. The full raw response is always stored regardless.
export async function getInstagramMediaInsights(mediaId: string, pageToken: string): Promise<GraphMetrics> {
  const desired = ["reach", "views", "likes", "comments", "shares", "saves"];
  const fallback = ["reach", "views"];

  let raw: Record<string, unknown>;
  try {
    raw = await graphGet<Record<string, unknown>>(`/${mediaId}/insights`, {
      metric: desired.join(","),
      access_token: pageToken,
    });
  } catch {
    raw = await graphGet<Record<string, unknown>>(`/${mediaId}/insights`, {
      metric: fallback.join(","),
      access_token: pageToken,
    });
  }

  const values: Record<string, number> = {};
  const entries = (raw as { data?: Array<{ name: string; values?: Array<{ value: number }> }> }).data || [];
  for (const entry of entries) {
    const value = entry.values?.[0]?.value;
    if (typeof value === "number") values[entry.name] = value;
  }

  return {
    reach: values.reach,
    views: values.views,
    likes: values.likes,
    comments: values.comments,
    shares: values.shares,
    saves: values.saves,
    raw,
  };
}

export async function getFacebookPostInsights(postId: string, pageToken: string): Promise<GraphMetrics> {
  const post = await graphGet<{
    shares?: { count: number };
    reactions?: { summary: { total_count: number } };
    comments?: { summary: { total_count: number } };
  }>(`/${postId}`, {
    fields: "shares,reactions.summary(true),comments.summary(true)",
    access_token: pageToken,
  });

  let reach: number | undefined;
  let views: number | undefined;
  try {
    const insights = await graphGet<{ data?: Array<{ name: string; values?: Array<{ value: number }> }> }>(
      `/${postId}/insights`,
      { metric: "post_impressions_unique,post_impressions", access_token: pageToken }
    );
    for (const entry of insights.data || []) {
      const value = entry.values?.[0]?.value;
      if (entry.name === "post_impressions_unique") reach = value;
      if (entry.name === "post_impressions") views = value;
    }
  } catch {
    // Page post insights require the page to have enough public activity, and the
    // exact metric set changes over time — a failure here shouldn't block the
    // reaction/comment/share counts we already have from the post fields above.
  }

  return {
    reach,
    views,
    likes: post.reactions?.summary?.total_count,
    comments: post.comments?.summary?.total_count,
    shares: post.shares?.count,
    saves: undefined,
    raw: { post, reach, views },
  };
}
