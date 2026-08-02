"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";

// Educational routing only — this tool never diagnoses or triages. It just
// helps a visitor find the most relevant existing symptom page. Red-flag
// criteria are reused verbatim from app/urgent-advice/page.tsx's own
// established wording ("severe knee pain, cannot put weight on the leg,
// have a badly swollen or deformed knee, or have a fever, redness, or heat
// around the joint") rather than inventing new clinical criteria here.
const RED_FLAGS = [
  { id: "no-weight", label: "You cannot put any weight on the leg" },
  { id: "deformed", label: "The knee looks badly swollen or an unusual shape" },
  { id: "fever", label: "You have a fever, or the joint feels hot or looks red" },
  { id: "severe-pain", label: "The pain is severe" },
];

interface ComplaintOption {
  id: string;
  label: string;
  slug: string;
}

// Maps directly to the 12 existing pages under data/symptoms.ts — one
// complaint, one page. No location/duration scoring logic on top of this;
// duration and onset don't change which page is relevant, only how the
// content there should be read, which the symptom page itself already covers.
const COMPLAINT_OPTIONS: ComplaintOption[] = [
  { id: "front", label: "Pain at the front of the knee", slug: "front-of-knee-pain" },
  { id: "back", label: "Pain at the back of the knee", slug: "back-of-knee-pain" },
  { id: "inner", label: "Pain on the inside of the knee", slug: "inner-knee-pain" },
  { id: "outer", label: "Pain on the outside of the knee", slug: "outer-knee-pain" },
  { id: "general", label: "General ache or pain all over the knee", slug: "knee-pain" },
  { id: "swollen", label: "Visible swelling", slug: "swollen-knee" },
  { id: "clicking", label: "Clicking or grinding", slug: "clicking-knee" },
  { id: "stiff", label: "Stiffness or reduced movement", slug: "stiff-knee" },
  { id: "locking", label: "The knee locks or catches", slug: "locked-knee" },
  { id: "giving-way", label: "The knee feels like it's giving way or unstable", slug: "knee-giving-way" },
  { id: "cant-straighten", label: "You can't fully straighten the knee", slug: "unable-to-straighten-knee" },
  { id: "after-injury", label: "Pain that started after a specific injury", slug: "knee-pain-after-injury" },
];

type Step = "red-flags" | "complaint" | "result-urgent" | "result-routed";

export function SymptomCheckerClient() {
  const [step, setStep] = useState<Step>("red-flags");
  const [checkedFlags, setCheckedFlags] = useState<Set<string>>(new Set());
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintOption | null>(null);

  const toggleFlag = (id: string) => {
    setCheckedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRedFlagContinue = () => {
    setStep(checkedFlags.size > 0 ? "result-urgent" : "complaint");
  };

  const handleComplaintSelect = (option: ComplaintOption) => {
    setSelectedComplaint(option);
    setStep("result-routed");
  };

  const handleRestart = () => {
    setCheckedFlags(new Set());
    setSelectedComplaint(null);
    setStep("red-flags");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {step === "red-flags" && (
          <>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-navy mb-1">First, a few important questions</h2>
              <p className="text-xs text-text-secondary">Tick anything that applies to you right now.</p>
            </div>
            <div className="space-y-3">
              {RED_FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  className="flex items-start gap-3 cursor-pointer text-sm text-text-main p-3.5 bg-warm-off-white border border-border-clinical rounded-xl hover:border-clinical-teal/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checkedFlags.has(flag.id)}
                    onChange={() => toggleFlag(flag.id)}
                    className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleRedFlagContinue}
              className="w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
            >
              Continue
            </button>
          </>
        )}

        {step === "result-urgent" && (
          <>
            <div className="bg-status-error-bg border border-[#FAD8D8] rounded-xl p-5">
              <h2 className="font-serif text-lg font-bold text-status-error mb-2">Please seek medical advice promptly</h2>
              <p className="text-sm text-text-main leading-relaxed">
                Based on your answers, we'd recommend getting this looked at urgently rather than reading further here.
                Please see our urgent advice guidance for what to do next.
              </p>
            </div>
            <Button href="/urgent-advice" variant="primary" className="w-full text-center">
              View Urgent Advice
            </Button>
            <button
              type="button"
              onClick={handleRestart}
              className="w-full text-xs font-semibold text-text-secondary hover:text-deep-navy underline cursor-pointer"
            >
              Start again
            </button>
          </>
        )}

        {step === "complaint" && (
          <>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-navy mb-1">What best describes what you're experiencing?</h2>
              <p className="text-xs text-text-secondary">Choose the option that fits most closely.</p>
            </div>
            <div className="space-y-2.5">
              {COMPLAINT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleComplaintSelect(option)}
                  className="w-full text-left p-3.5 border border-border-clinical hover:border-clinical-teal bg-warm-off-white hover:bg-pale-clinical-blue rounded-xl text-sm font-semibold text-text-main transition-colors flex items-center justify-between group"
                >
                  <span>{option.label}</span>
                  <span className="text-clinical-teal opacity-0 group-hover:opacity-100 transition-opacity font-bold shrink-0 ml-2">
                    Select →
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("red-flags")}
              className="w-full text-xs font-semibold text-text-secondary hover:text-deep-navy underline cursor-pointer"
            >
              ← Back
            </button>
          </>
        )}

        {step === "result-routed" && selectedComplaint && (
          <>
            <div className="bg-pale-clinical-blue/40 border border-clinical-teal/20 rounded-xl p-5">
              <h2 className="font-serif text-lg font-bold text-deep-navy mb-2">Based on your answers, this page may be relevant:</h2>
              <p className="text-sm text-text-main leading-relaxed">{selectedComplaint.label}</p>
            </div>
            <Button href={`/symptoms/${selectedComplaint.slug}`} variant="primary" className="w-full text-center">
              View {selectedComplaint.label} →
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button href="/symptoms" variant="secondary" className="flex-1 text-center">
                Browse All Symptoms
              </Button>
              <Button href="/book-appointment" variant="secondary" className="flex-1 text-center">
                Book Appointment
              </Button>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="w-full text-xs font-semibold text-text-secondary hover:text-deep-navy underline cursor-pointer"
            >
              Start again
            </button>
          </>
        )}
      </div>

      <div className="mt-6">
        <MedicalDisclaimerBlock />
      </div>
    </div>
  );
}
