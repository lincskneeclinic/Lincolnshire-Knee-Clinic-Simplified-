"use client";

import React from "react";
import { PortalModal } from "@/components/portal/ui";

interface PipelineTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackground: () => void;
  topic: string;
  onTopicChange: (value: string) => void;
  isTriggering: boolean;
  triggerProgress: number;
  triggerStep: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function PipelineTriggerModal({
  isOpen,
  onClose,
  onBackground,
  topic,
  onTopicChange,
  isTriggering,
  triggerProgress,
  triggerStep,
  onSubmit,
}: PipelineTriggerModalProps) {
  const handleClose = () => (isTriggering ? onBackground() : onClose());

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <span>✨</span>
          <span>Start New Content Automation Run</span>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/80 mb-1">Custom Topic / Patient Question (Optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={isTriggering}
            placeholder="e.g. Can I kneel after partial knee replacement?"
            className="w-full bg-dark-overlay-navy border border-white/20 text-white rounded-xl p-3 text-xs focus:border-clinical-teal focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-[11px] text-white/60 mt-1.5">
            If left blank, the pipeline will automatically select the highest-trending patient question from
            contact enquiries.
          </p>
        </div>

        {isTriggering && (
          <div className="bg-dark-overlay-navy p-4 rounded-xl border border-clinical-teal/30 space-y-3 my-2 shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="text-clinical-teal flex items-center gap-2 truncate pr-2">
                <span className="inline-block w-2 h-2 rounded-full bg-clinical-teal animate-ping shrink-0" />
                <span className="truncate">{triggerStep || "Initializing pipeline..."}</span>
              </span>
              <span className="text-white/80 font-mono shrink-0">{triggerProgress}%</span>
            </div>
            <div className="w-full bg-primary-navy h-2 rounded-full overflow-hidden">
              <div
                className="bg-clinical-teal h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${triggerProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60 italic text-center">
              Please wait while our AI clinical agents analyze medical literature and synthesize your draft — or
              close this window and it'll keep generating in the background; check the run list shortly.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="border border-white/20 text-white/70 hover:bg-white/5 text-xs px-4 py-2 rounded-xl cursor-pointer"
          >
            {isTriggering ? "Run in Background" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isTriggering}
            className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTriggering && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isTriggering ? "Initiating Pipeline..." : "Launch Automation Run"}
          </button>
        </div>
      </form>
    </PortalModal>
  );
}
