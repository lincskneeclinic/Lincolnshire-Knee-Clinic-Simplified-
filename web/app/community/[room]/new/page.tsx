import React from "react";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PostComposer } from "@/components/community/PostComposer";
import { createClient } from "@/lib/supabase/server";

export default async function NewCommunityPostPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room: roomSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/community/login?next=/community/${roomSlug}/new`);
  }

  const { data: room } = await supabase
    .from("community_rooms")
    .select("slug, name")
    .eq("slug", roomSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!room) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Community", href: "/community" },
          { label: room.name, href: `/community/${room.slug}` },
          { label: "New Post" },
        ]}
      />
      <PageHeader category="Community Room" title={`New Post in ${room.name}`} />
      <PostComposer roomSlug={room.slug} />
    </div>
  );
}
