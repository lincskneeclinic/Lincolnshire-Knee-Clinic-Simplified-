/**
 * Pulls trending Community forum discussion topics into the newsletter digest,
 * using direct REST calls with the service-role key (bypasses RLS — same
 * pattern as lib/supabase.ts) since this runs outside any member's session.
 */

export interface TrendingCommunityTopic {
  title: string;
  roomName: string;
  roomSlug: string;
  replyCount: number;
  postId: string;
}

const RECENT_DAYS = 30;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export async function getTrendingCommunityTopics(limit = 3): Promise<TrendingCommunityTopic[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  const headers = { apikey: config.key, Authorization: `Bearer ${config.key}` };

  try {
    const roomsRes = await fetch(`${config.url}/rest/v1/community_rooms?select=id,slug,name`, { headers });
    if (!roomsRes.ok) return [];
    const rooms: { id: string; slug: string; name: string }[] = await roomsRes.json();
    const roomById = new Map(rooms.map((r) => [r.id, r]));

    const cutoff = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const postsRes = await fetch(
      `${config.url}/rest/v1/community_posts?select=id,room_id,title,created_at&status=eq.visible&created_at=gte.${cutoff}&order=created_at.desc&limit=100`,
      { headers }
    );
    if (!postsRes.ok) return [];
    const posts: { id: string; room_id: string; title: string; created_at: string }[] = await postsRes.json();
    if (posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const repliesRes = await fetch(
      `${config.url}/rest/v1/community_replies?select=post_id&status=eq.visible&post_id=in.(${postIds.join(",")})`,
      { headers }
    );
    const replies: { post_id: string }[] = repliesRes.ok ? await repliesRes.json() : [];

    const replyCounts = new Map<string, number>();
    for (const reply of replies) {
      replyCounts.set(reply.post_id, (replyCounts.get(reply.post_id) || 0) + 1);
    }

    return posts
      .map((post) => {
        const room = roomById.get(post.room_id);
        return {
          title: post.title,
          roomName: room?.name || "Community",
          roomSlug: room?.slug || "",
          replyCount: replyCounts.get(post.id) || 0,
          postId: post.id,
        };
      })
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch trending community topics:", error);
    return [];
  }
}
