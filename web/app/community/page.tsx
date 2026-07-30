import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export default async function CommunityHubPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rooms } = await supabase
    .from("community_rooms")
    .select("id, slug, name, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  let postCounts: Record<string, number> = {};
  if (rooms && rooms.length > 0) {
    const { data: posts } = await supabase
      .from("community_posts")
      .select("room_id")
      .eq("status", "visible")
      .in(
        "room_id",
        rooms.map((room) => room.id)
      );
    postCounts = (posts || []).reduce((acc: Record<string, number>, post: { room_id: string }) => {
      acc[post.room_id] = (acc[post.room_id] || 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Community" }]} />

      <PageHeader
        category="Patient Community"
        title="Community Discussion"
        subtitle="Connect with other patients, share experiences and ask questions about knee conditions, treatments and recovery. This is peer discussion, not medical advice."
      />

      {!user && (
        <div className="bg-soft-blue border border-clinical-teal/20 rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-text-secondary max-w-xl">
            Join the community to start posting and replying. It only takes a minute, and
            you can choose to also receive our newsletter — entirely optional.
          </p>
          <div className="flex gap-3 shrink-0">
            <Button href="/community/login" variant="secondary">
              Log In
            </Button>
            <Button href="/community/register" variant="teal">
              Join the Community
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(rooms || []).map((room) => (
          <Card
            key={room.id}
            title={room.name}
            description={room.description}
            href={`/community/${room.slug}`}
            linkText={`${postCounts[room.id] || 0} ${postCounts[room.id] === 1 ? "post" : "posts"}`}
          />
        ))}
      </div>

      {user && (
        <p className="text-xs text-text-muted mt-8 text-center">
          Logged in.{" "}
          <Link href="/community/account" className="text-clinical-teal underline hover:text-deep-navy">
            Manage your account
          </Link>
        </p>
      )}
    </div>
  );
}
