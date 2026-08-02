"use client";

import React, { useEffect, useState } from "react";
import { PortalCard } from "@/components/portal/ui";

type FieldStatus = "idle" | "saving" | "saved" | "error";

const FIELD_LABELS: Record<string, string> = {
  introduction: "Introduction",
  whatIs: "What Is It",
  description: "Description",
  howItWorks: "How It Works",
  durationPattern: "Duration Pattern",
  commonPresentations: "Common Presentations",
  warningSigns: "Warning Signs (Red Flags)",
  assessment: "Assessment",
  investigations: "Investigations",
  initialManagement: "Initial Management",
  whenToConsult: "When To Consult",
  symptoms: "Symptoms",
  causes: "Causes",
  treatments: "Treatments",
  surgeryDetails: "Surgery Details",
  whatItInvolves: "What It Involves",
  suitability: "Suitability",
  notSuitable: "Not Suitable For",
  alternatives: "Alternatives",
  risks: "Risks",
  recovery: "Recovery",
  rehabilitation: "Rehabilitation",
  whoConsidered: "Who May Be Considered",
  whoNotSuitable: "Who May Not Be Suitable",
  benefits: "Benefits",
  risksLimitations: "Risks and Limitations",
  procedureSteps: "Procedure Steps",
  aftercareSteps: "Aftercare",
};

interface EditPageContentPanelProps {
  loading: boolean;
  available: boolean;
  fields: Record<string, string | string[]>;
  fieldTypes: Record<string, "string" | "string[]">;
  onSaveField: (fieldName: string, value: string | string[]) => Promise<boolean>;
}

function FieldEditor({
  fieldName,
  type,
  initialValue,
  onSave,
}: {
  fieldName: string;
  type: "string" | "string[]";
  initialValue: string | string[];
  onSave: (fieldName: string, value: string | string[]) => Promise<boolean>;
}) {
  const initialText = Array.isArray(initialValue) ? initialValue.join("\n") : initialValue || "";
  const [text, setText] = useState(initialText);
  // Tracks the last-known-saved value (starts as the page-load value, then
  // advances on every successful save) so "dirty" means "differs from what's
  // actually live," not "differs from what was loaded when the page opened" —
  // otherwise the Saved confirmation never shows and re-typing the original
  // text after a save looks like nothing changed.
  const [savedBaseline, setSavedBaseline] = useState(initialText);
  const [status, setStatus] = useState<FieldStatus>("idle");

  useEffect(() => {
    setText(initialText);
    setSavedBaseline(initialText);
    setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  const isDirty = text !== savedBaseline;

  const handleSave = async () => {
    setStatus("saving");
    const value: string | string[] =
      type === "string[]"
        ? text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
        : text.trim();
    const success = await onSave(fieldName, value);
    if (success) setSavedBaseline(text);
    setStatus(success ? "saved" : "error");
  };

  return (
    <div className="bg-dark-overlay-navy border border-white/5 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
          {FIELD_LABELS[fieldName] || fieldName}
        </span>
        {type === "string[]" && <span className="text-[9px] text-white/40">One item per line</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status !== "idle") setStatus("idle");
        }}
        rows={type === "string[]" ? 5 : 4}
        className="w-full bg-primary-navy border border-white/20 text-white text-xs rounded-lg p-2.5 focus:border-clinical-teal focus:outline-none font-sans leading-relaxed"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={status === "saving" || !isDirty}
          className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && !isDirty && (
          <span className="text-[11px] text-clinical-teal font-semibold">✓ Saved — now live on the page</span>
        )}
        {status === "error" && <span className="text-[11px] text-status-error">Failed to save — try again.</span>}
      </div>
    </div>
  );
}

export function EditPageContentPanel({ loading, available, fields, fieldTypes, onSaveField }: EditPageContentPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PortalCard className="space-y-3 shadow-xl">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="text-left">
          <h3 className="text-sm font-bold text-white">✏️ Edit Page Content</h3>
          <p className="text-[11px] text-white/50 mt-0.5">
            Directly rewrite any section yourself — changes go live immediately on Save.
          </p>
        </div>
        <span className="text-white/50 text-xs shrink-0">{expanded ? "▲ Collapse" : "▼ Expand"}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/10 pt-3 space-y-2.5">
          {loading ? (
            <p className="text-xs text-white/50 text-center py-4">Loading page content…</p>
          ) : !available ? (
            <p className="text-xs text-white/50 italic text-center py-4">
              Manual editing isn&apos;t available for this page — it has no structured content to edit.
            </p>
          ) : (
            Object.entries(fieldTypes).map(([fieldName, type]) => (
              <FieldEditor
                key={fieldName}
                fieldName={fieldName}
                type={type}
                initialValue={fields[fieldName]}
                onSave={onSaveField}
              />
            ))
          )}
        </div>
      )}
    </PortalCard>
  );
}
