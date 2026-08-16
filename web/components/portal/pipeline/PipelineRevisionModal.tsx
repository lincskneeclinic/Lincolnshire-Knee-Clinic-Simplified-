"use client";

import React from "react";
import { PortalModal } from "@/components/portal/ui";

type PlatformKey = "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";

interface PipelineRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: "blog" | "social";
  platform?: PlatformKey;
  notes: string;
  onNotesChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function PipelineRevisionModal({
  isOpen,
  onClose,
  stage,
  platform,
  notes,
  onNotesChange,
  isSubmitting,
  onSubmit,
}: PipelineRevisionModalProps) {
  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <span>🔄</span>
          <span>
            Request Revision ({stage.toUpperCase()}
            {platform ? ` — ${platform.toUpperCase()}` : ""})
          </span>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-amber-300/90 mb-1">Clinical Revision Notes (Required)</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            placeholder="Specify exact wording adjustments or clinical clarifications required..."
            className="w-full bg-portal-surface-alt border border-portal-border/20 text-portal-text rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-portal-border/20 text-portal-text/70 hover:bg-portal-text/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !notes.trim()}
            onClick={onSubmit}
            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Send Revision Request"}
          </button>
        </div>
      </div>
    </PortalModal>
  );
}
