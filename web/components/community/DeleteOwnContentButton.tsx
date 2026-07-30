"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteOwnContentButtonProps {
  kind: "post" | "reply";
  id: string;
  /** Where to send the member after deleting their own post (ignored for replies, which just refresh in place). */
  redirectTo?: string;
}

export const DeleteOwnContentButton: React.FC<DeleteOwnContentButtonProps> = ({ kind, id, redirectTo }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const url = kind === "post" ? `/api/community/posts/${id}` : `/api/community/replies/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <span className="text-xs inline-flex items-center gap-2">
        <span className="text-text-secondary">Delete this {kind}?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-semibold text-status-error hover:underline cursor-pointer disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="font-semibold text-text-muted hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-text-muted hover:text-status-error font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
    >
      Delete
    </button>
  );
};
