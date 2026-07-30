import React from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { ReplyComposer } from "@/components/community/ReplyComposer";
import { ReportButton } from "@/components/community/ReportButton";
import { DeleteOwnContentButton } from "@/components/community/DeleteOwnContentButton";
import { createClient } from "@/lib/supabase/server";
import { attachDisplayNames } from "@/lib/community";

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ room: string; postId: string }>;
}) {
  const { room: roomSlug, postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: room } = await supabase
    .from("community_rooms")
    .select("id, slug, name")
    .eq("slug", roomSlug)
    .maybeSingle();

  if (!room) {
    notFound();
  }

  const { data: post } = await supabase
    .from("community_posts")
    .select("id, title, body, author_id, status, created_at")
    .eq("id", postId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  const { data: replies } = await supabase
    .from("community_replies")
    .select("id, body, author_id, status, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const visibleReplies = (replies || []).filter(
    (reply) => reply.status === "visible" || reply.author_id === user?.id
  );

  const [[postWithAuthor], repliesWithAuthors] = await Promise.all([
    attachDisplayNames(supabase, [post]),
    attachDisplayNames(supabase, visibleReplies),
  ]);

  const isOwnPost = user?.id === post.author_id;

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Community", href: "/community" },
          { label: room.name, href: `/community/${room.slug}` },
          { label: post.title },
        ]}
      />

      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        {post.status === "hidden" && (
          <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium mb-4">
            This post was hidden by a moderator and is only visible to you.
          </div>
        )}
        <h1 className="font-serif text-2xl font-bold text-deep-navy mb-2">{postWithAuthor.title}</h1>
        <div className="text-xs text-text-muted flex gap-3 mb-4">
          <span>{postWithAuthor.authorDisplayName}</span>
          <span>&bull;</span>
          <span>{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
        </div>
        <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{post.body}</p>
        <div className="mt-4 pt-4 border-t border-border-clinical/50 flex items-center gap-4">
          {isOwnPost ? (
            <DeleteOwnContentButton kind="post" id={post.id} redirectTo={`/community/${room.slug}`} />
          ) : (
            user && <ReportButton targetType="post" targetId={post.id} />
          )}
        </div>
      </div>

      <h2 className="font-serif text-lg font-bold text-deep-navy mb-4">
        {repliesWithAuthors.length} {repliesWithAuthors.length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="space-y-4 mb-8">
        {repliesWithAuthors.map((reply) => {
          const isOwnReply = user?.id === reply.author_id;
          return (
            <div key={reply.id} className="bg-white border border-border-clinical rounded-xl p-5">
              {reply.status === "hidden" && (
                <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-2 rounded-lg font-medium mb-3">
                  This reply was hidden by a moderator and is only visible to you.
                </div>
              )}
              <div className="text-xs text-text-muted flex gap-3 mb-2">
                <span className="font-semibold text-text-secondary">{reply.authorDisplayName}</span>
                <span>&bull;</span>
                <span>{new Date(reply.created_at).toLocaleDateString("en-GB")}</span>
              </div>
              <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{reply.body}</p>
              <div className="mt-3 pt-3 border-t border-border-clinical/50">
                {isOwnReply ? (
                  <DeleteOwnContentButton kind="reply" id={reply.id} />
                ) : (
                  user && <ReportButton targetType="reply" targetId={reply.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {user ? (
        <ReplyComposer postId={post.id} />
      ) : (
        <div className="bg-soft-blue border border-clinical-teal/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-text-secondary mb-4">Log in to join the discussion.</p>
          <Button href={`/community/login?next=/community/${room.slug}/${post.id}`} variant="teal">
            Log In
          </Button>
        </div>
      )}
    </div>
  );
}
