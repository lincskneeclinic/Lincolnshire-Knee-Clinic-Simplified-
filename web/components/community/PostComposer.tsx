"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CommunityDisclaimerStrip } from "./CommunityDisclaimerStrip";

interface PostComposerProps {
  roomSlug: string;
}

export const PostComposer: React.FC<PostComposerProps> = ({ roomSlug }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomSlug, title, body }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create post.");
        return;
      }

      router.push(`/community/${roomSlug}/${data.postId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
      <CommunityDisclaimerStrip />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="post-title" className="text-xs font-semibold text-text-secondary">
            Title
          </label>
          <input
            id="post-title"
            type="text"
            required
            minLength={3}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tips for the first few weeks after knee replacement?"
            className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="post-body" className="text-xs font-semibold text-text-secondary">
            Your Post
          </label>
          <textarea
            id="post-body"
            required
            minLength={10}
            maxLength={8000}
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your question or experience..."
            className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal resize-y"
          />
        </div>

        {error && (
          <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post to Community"}
        </button>
      </form>
    </div>
  );
};
