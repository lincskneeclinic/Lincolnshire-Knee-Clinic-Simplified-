import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";
import { attachDisplayNames } from "@/lib/community";

export default async function CommunityRoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room: roomSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: room } = await supabase
    .from("community_rooms")
    .select("id, slug, name, description")
    .eq("slug", roomSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!room) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, title, body, author_id, created_at")
    .eq("room_id", room.id)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  const postIds = (posts || []).map((post) => post.id);
  let replyCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: replies } = await supabase
      .from("community_replies")
      .select("post_id")
      .eq("status", "visible")
      .in("post_id", postIds);
    replyCounts = (replies || []).reduce((acc: Record<string, number>, reply: { post_id: string }) => {
      acc[reply.post_id] = (acc[reply.post_id] || 0) + 1;
      return acc;
    }, {});
  }

  const postsWithAuthors = await attachDisplayNames(supabase, posts || []);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: room.name }]} />

      <PageHeader category="Community Room" title={room.name} subtitle={room.description} />

      <div className="flex justify-end mb-6">
        {user ? (
          <Button href={`/community/${room.slug}/new`} variant="teal">
            Start a New Post
          </Button>
        ) : (
          <Button href="/community/login" variant="secondary">
            Log in to post
          </Button>
        )}
      </div>

      {postsWithAuthors.length === 0 ? (
        <div className="bg-soft-blue border border-border-clinical rounded-2xl p-8 text-center text-sm text-text-secondary">
          No posts here yet. Be the first to start a discussion.
        </div>
      ) : (
        <div className="space-y-3">
          {postsWithAuthors.map((post) => (
            <Link
              key={post.id}
              href={`/community/${room.slug}/${post.id}`}
              className="block bg-white border border-border-clinical hover:border-clinical-teal rounded-xl p-5 transition-colors"
            >
              <h3 className="font-serif text-lg font-bold text-deep-navy mb-1">{post.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mb-2">{post.body}</p>
              <div className="text-xs text-text-muted flex gap-3">
                <span>{post.authorDisplayName}</span>
                <span>&bull;</span>
                <span>{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
                <span>&bull;</span>
                <span>{replyCounts[post.id] || 0} {replyCounts[post.id] === 1 ? "reply" : "replies"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
