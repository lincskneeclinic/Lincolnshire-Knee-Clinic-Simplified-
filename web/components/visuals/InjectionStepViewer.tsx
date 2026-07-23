"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import { PlaceholderVisual } from "./PlaceholderVisual";

// Static imports to support automated cache-busting of step visuals
import step1ConsentImg from "@/public/images/injections/steps/step-1-consent.svg";
import step2PreparationImg from "@/public/images/injections/steps/step-2-preparation.jpg";
import step3ProbeImg from "@/public/images/injections/steps/step-3-probe.jpg";
import step4NeedleImg from "@/public/images/injections/steps/step-4-needle.jpg";
import step5InjectionImg from "@/public/images/injections/steps/step-5-injection.jpg";
import step6AftercareImg from "@/public/images/injections/steps/step-6-aftercare.jpg";

const stepImages = [
  step1ConsentImg,
  step2PreparationImg,
  step3ProbeImg,
  step4NeedleImg,
  step5InjectionImg,
  step6AftercareImg,
];

// ============================================================
// InjectionStepViewer
//
// Step-by-step educational viewer for injection procedures.
// Educational only — no claims of guaranteed placement or outcome.
//
// SAFETY RULES (enforced in copy):
// - No claim of 100% accuracy
// - No guaranteed placement
// - No guaranteed benefit
// - No cartilage regeneration claim
// - No permanent pain relief claim
// - Uses: "Ultrasound may allow real-time visualisation..."
//
// Interaction:
// - Next / Previous keyboard and touch navigation
// - ARIA live region announces current step
// - Reduced-motion: static numbered list
// - Each step has a placeholder visual slot
// ============================================================

export interface InjectionStep {
  stepNumber: number;
  title: string;
  description: string;
  educationalNote?: string;
  imagePath?: string;
  altText?: string;
  placeholderLabel: string;
}

interface InjectionStepViewerProps {
  injectionName: string;
  steps?: InjectionStep[];
  disclaimer?: string;
  className?: string;
}

const defaultUltrasoundSteps: InjectionStep[] = [
  {
    stepNumber: 1,
    title: "Consultation and Consent",
    description: "The clinician reviews your symptoms, relevant imaging, and medical history. The procedure, potential benefits, risks, and alternatives are discussed. You will be asked to provide written informed consent before proceeding.",
    educationalNote: "Consent is a process, not just a signature. You may ask questions at any stage.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
  {
    stepNumber: 2,
    title: "Preparation and Positioning",
    description: "You will be positioned comfortably — typically lying or semi-reclined. The knee area is cleaned with an antiseptic solution. A sterile field is established around the injection site.",
    educationalNote: "Sterile preparation reduces the risk of infection. A small amount of local anaesthetic may be applied to the skin surface if appropriate.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
  {
    stepNumber: 3,
    title: "Ultrasound Probe Placement",
    description: "A water-based transmission gel is applied to the skin. The ultrasound probe (transducer) is positioned over the knee to generate a real-time image of the joint structures and surrounding soft tissues.",
    educationalNote: "Ultrasound may allow real-time visualisation of the needle and surrounding structures. It does not guarantee a particular clinical outcome.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
  {
    stepNumber: 4,
    title: "Needle Placement — Educational Concept",
    description: "Under real-time ultrasound guidance, the needle is introduced through the skin. The clinician monitors the needle position relative to the target joint space or soft tissue structure on the ultrasound screen.",
    educationalNote: "This is an educational representation. Actual needle depth, angle, and approach are determined by the clinician at the time of the procedure based on your individual anatomy. No diagram can represent guaranteed placement.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
  {
    stepNumber: 5,
    title: "Injection of Therapeutic Substance",
    description: "Once the needle position is confirmed as satisfactory, the therapeutic substance is slowly injected into the target space. You may feel a sensation of pressure or mild discomfort during this stage.",
    educationalNote: "The injected substance depends on your clinical indication — this may be a corticosteroid, hyaluronic acid, PRP, or Arthrosamid®.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
  {
    stepNumber: 6,
    title: "Dressing and Aftercare Instructions",
    description: "A small sterile dressing is applied to the injection site. You will receive specific aftercare instructions for your injection type, including rest, activity modification, and warning signs to monitor.",
    educationalNote: "Most patients can return home shortly after the procedure. Specific activity restrictions depend on the substance used. Contact the clinic if you experience increasing warmth, significant swelling, fever, or severe pain.",
    placeholderLabel: "Injection procedure visual pending clinical review",
  },
];

export const InjectionStepViewer: React.FC<InjectionStepViewerProps> = ({
  injectionName,
  steps = defaultUltrasoundSteps,
  disclaimer = "This step viewer is for patient education only. It is a general representation and does not describe your specific procedure. Individual steps, techniques, and aftercare may differ based on clinical circumstances, the substance used, and clinician judgement. This content does not constitute medical advice.",
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const liveId = useId();
  const step = steps[currentStep];

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Educational Procedure Guide
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          {injectionName} — Step-by-Step Overview
        </h4>
        <p className="text-xs text-text-secondary mt-1">
          A general educational overview. Individual procedures vary. This is not a clinical protocol.
        </p>
      </div>

      {/* Interactive step viewer — hidden for reduced-motion, list shown instead */}
      <div className="motion-reduce:hidden space-y-4">
        {/* Progress bar */}
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={currentStep + 1} aria-label="Procedure step progress">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              aria-label={`Go to step ${idx + 1}: ${steps[idx].title}`}
              aria-current={idx === currentStep ? "step" : undefined}
              className={`flex-1 h-1.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal ${
                idx <= currentStep ? "bg-clinical-teal" : "bg-border-clinical/60"
              }`}
            />
          ))}
        </div>

        {/* Step card */}
        <div className="bg-white border border-border-clinical rounded-xl overflow-hidden shadow-sm">
          {/* Step image slot */}
          <div className="relative w-full h-[220px] sm:h-[300px] bg-pale-clinical-blue/20 overflow-hidden border-b border-border-clinical">
            <Image
              src={stepImages[currentStep]}
              alt={step.altText || step.title}
              fill
              sizes="(max-w-7xl) 100vw, 800px"
              className="object-cover"
              priority={currentStep === 0}
            />
            <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
              Step {step.stepNumber} Visual
            </span>
            <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
              Clinical Approved
            </span>
          </div>

          {/* Step content */}
          <div
            id={liveId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="p-5 md:p-6 space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-clinical-teal text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
                  Step {step.stepNumber} of {steps.length}
                </span>
              </div>
              <h5 className="font-serif text-base md:text-lg font-bold text-deep-navy">
                {step.title}
              </h5>
            </div>

            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-semibold">
              {step.description}
            </p>

            {step.educationalNote && (
              <div className="bg-pale-clinical-blue/30 border border-clinical-teal/20 rounded-lg p-3 flex gap-2.5 text-xs text-text-secondary font-semibold">
                <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{step.educationalNote}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border-clinical/30 px-5 py-3 bg-pale-clinical-blue/10">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentStep === 0}
              aria-label="Previous step"
              className="flex items-center gap-1.5 text-xs font-bold text-deep-navy disabled:opacity-30 disabled:cursor-not-allowed hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {currentStep + 1} / {steps.length}
            </span>

            <button
              type="button"
              onClick={goNext}
              disabled={currentStep === steps.length - 1}
              aria-label="Next step"
              className="flex items-center gap-1.5 text-xs font-bold text-deep-navy disabled:opacity-30 disabled:cursor-not-allowed hover:text-clinical-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal rounded"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reduced-motion / no-JS fallback: static numbered list */}
      <div className="motion-safe:hidden space-y-4">
        <ol className="space-y-4 border-l-2 border-border-clinical pl-5 ml-3">
          {steps.map((s) => (
            <li key={s.stepNumber} className="relative space-y-1">
              <span className="absolute -left-[30px] top-1 w-5 h-5 rounded-full bg-clinical-teal text-white text-[10px] font-bold flex items-center justify-center">
                {s.stepNumber}
              </span>
              <h5 className="font-sans font-bold text-xs text-deep-navy">{s.title}</h5>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">{s.description}</p>
              {s.educationalNote && (
                <p className="text-[11px] italic text-text-muted">{s.educationalNote}</p>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-4 rounded-xl text-xs text-text-secondary leading-relaxed font-semibold flex gap-3">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="font-bold text-deep-navy block uppercase tracking-wider text-[10px] mb-1">
            Important — Educational Content Only
          </span>
          {disclaimer}
        </div>
      </div>
    </div>
  );
};
