"use client";

import React, { useState } from "react";

interface ReportButtonProps {
  targetType: "post" | "reply";
  targetId: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ targetType, targetId }) => {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to submit report.");
        return;
      }
      setDone(true);
      setExpanded(false);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <span className="text-xs text-text-muted">Reported — thank you</span>;
  }

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="text-text-muted hover:text-status-error font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
      >
        Report
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-2 p-3 bg-warm-off-white border border-border-clinical rounded-lg space-y-2">
          <label htmlFor={`report-reason-${targetId}`} className="block text-text-secondary font-semibold">
            Why are you reporting this?
          </label>
          <textarea
            id={`report-reason-${targetId}`}
            required
            minLength={3}
            maxLength={500}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-border-clinical rounded-lg text-text-main focus:outline-none focus:border-clinical-teal resize-y"
          />
          {error && <p className="text-status-error">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-semibold rounded-lg cursor-pointer disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-3 py-1.5 border border-border-clinical rounded-lg font-semibold cursor-pointer hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
