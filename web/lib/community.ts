/**
 * Shared helpers for the Community API routes — resolving the logged-in
 * member's profile, and attaching public display names to posts/replies
 * (community_profiles' base table is RLS-locked to each member's own row,
 * so cross-member display names are read from the community_profiles_public
 * view and merged in application code rather than via a PostgREST join).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CommunityProfile {
  user_id: string;
  display_name: string;
  newsletter_opt_in: boolean;
  is_admin: boolean;
  status: "active" | "suspended" | "banned";
}

export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<{ userId: string | null; profile: CommunityProfile | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, profile: null };

  const { data: profile } = await supabase
    .from("community_profiles")
    .select("user_id, display_name, newsletter_opt_in, is_admin, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, profile: profile as CommunityProfile | null };
}

export async function attachDisplayNames<T extends { author_id: string }>(
  supabase: SupabaseClient,
  rows: T[]
): Promise<(T & { authorDisplayName: string })[]> {
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
  if (authorIds.length === 0) return rows as (T & { authorDisplayName: string })[];

  const { data: profiles } = await supabase
    .from("community_profiles_public")
    .select("user_id, display_name")
    .in("user_id", authorIds);

  const nameByUserId = new Map((profiles || []).map((profile: { user_id: string; display_name: string }) => [profile.user_id, profile.display_name]));

  return rows.map((row) => ({
    ...row,
    authorDisplayName: nameByUserId.get(row.author_id) || "Deleted member",
  }));
}
