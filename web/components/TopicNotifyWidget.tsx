"use client";

import { useState } from "react";

export function TopicNotifyWidget({ topicId, topicLabel }: { topicId: string; topicLabel: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/topic-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 rounded-xl p-5 text-center">
        <p className="text-sm font-semibold text-deep-navy">
          Thanks — we'll email you when there's new content on {topicLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 rounded-xl p-5">
      <p className="text-sm font-bold text-deep-navy mb-1">Get notified about new content on {topicLabel}</p>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
        We'll only email you about updates on this specific topic — unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 px-3 py-2.5 text-sm bg-white border border-border-clinical rounded-lg text-text-main focus:outline-none focus:border-clinical-teal"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-deep-navy hover:bg-clinical-teal text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {submitting ? "Submitting..." : "Notify Me"}
        </button>
      </form>
      {error && <p className="text-status-error text-xs mt-2 font-medium">{error}</p>}
    </div>
  );
}
