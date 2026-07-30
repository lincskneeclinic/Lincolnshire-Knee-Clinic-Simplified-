"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ReplyComposerProps {
  postId: string;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({ postId }) => {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to post reply.");
        return;
      }

      setBody("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor={`reply-body-${postId}`} className="sr-only">
        Reply
      </label>
      <textarea
        id={`reply-body-${postId}`}
        required
        minLength={2}
        maxLength={4000}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply..."
        className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal resize-y"
      />
      {error && (
        <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer disabled:opacity-60"
      >
        {loading ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
};
