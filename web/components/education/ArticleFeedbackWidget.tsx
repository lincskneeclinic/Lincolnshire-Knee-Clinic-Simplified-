"use client";

import { useState } from "react";

// Same de-dupe trick as ArticleViewCounter.tsx: one vote per visitor per article,
// tracked in localStorage rather than requiring an account.
const STORAGE_KEY = "lkc_article_feedback_given";

function hasAlreadyVoted(slug: string): boolean {
  try {
    const voted: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return voted.includes(slug);
  } catch {
    return false;
  }
}

function markVoted(slug: string): void {
  try {
    const voted: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!voted.includes(slug)) {
      voted.push(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(voted));
    }
  } catch {
    // Silent — worst case is a visitor can vote more than once.
  }
}

export function ArticleFeedbackWidget({ slug }: { slug: string }) {
  const [alreadyVoted] = useState(() => hasAlreadyVoted(slug));
  const [submitted, setSubmitted] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (helpful: boolean, commentText?: string) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/education-feedback/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful, comment: commentText }),
      });
      markVoted(slug);
      setSubmitted(true);
    } catch {
      // Silent — a failed feedback beacon shouldn't disrupt the reading experience.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbsUp = () => submitFeedback(true);
  const handleThumbsDown = () => setShowCommentBox(true);
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(false, comment.trim() || undefined);
  };

  if (alreadyVoted || submitted) {
    return (
      <section className="border-t border-border-clinical/30 pt-8 mt-2">
        <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-deep-navy">Thanks for your feedback!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border-clinical/30 pt-8 mt-2">
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 rounded-xl p-5">
        {!showCommentBox ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-deep-navy">Was this article helpful?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleThumbsUp}
                disabled={isSubmitting}
                className="bg-white border border-border-clinical hover:border-clinical-teal text-deep-navy text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={handleThumbsDown}
                disabled={isSubmitting}
                className="bg-white border border-border-clinical hover:border-clinical-teal text-deep-navy text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              >
                👎 No
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <label className="block text-sm font-bold text-deep-navy">
              Sorry to hear that — what could we improve? (optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Let us know what was missing or unclear..."
              className="w-full px-3 py-2.5 text-sm bg-white border border-border-clinical rounded-lg text-text-main focus:outline-none focus:border-clinical-teal resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-deep-navy hover:bg-clinical-teal text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
