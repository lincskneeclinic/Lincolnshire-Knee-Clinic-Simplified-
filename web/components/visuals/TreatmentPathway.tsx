import React from "react";
import Link from "next/link";

// ============================================================
// TreatmentPathway
//
// Enhanced configurable treatment pathway with optional branching.
// Keyboard navigable step cards.
// ARIA current step.
// Reduced-motion: no animated connector.
// Disclaimer: educational pathway, not a prescription.
// ============================================================

export interface TreatmentStep {
  id: string;
  label: string;
  description: string;
  tag?: string;
  href?: string;
  isCurrent?: boolean;
  branch?: "conservative" | "surgical" | "both";
}

interface TreatmentPathwayProps {
  title?: string;
  subtitle?: string;
  steps: TreatmentStep[];
  showBranchLabels?: boolean;
  disclaimer?: string;
  className?: string;
}

const branchColours: Record<string, string> = {
  conservative: "border-clinical-teal text-clinical-teal bg-clinical-teal/5",
  surgical: "border-orange-400 text-orange-700 bg-orange-50/50",
  both: "border-deep-navy text-deep-navy bg-deep-navy/5",
};

export const TreatmentPathway: React.FC<TreatmentPathwayProps> = ({
  title = "Clinical Treatment Pathway",
  subtitle,
  steps,
  showBranchLabels = false,
  disclaimer = "This pathway diagram is for patient education only and represents a general approach. Individual clinical decisions are made in consultation with your surgeon based on your specific circumstances.",
  className = "",
}) => {
  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Staged Clinical Pathway
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">{title}</h4>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Steps — horizontal on desktop, vertical on mobile */}
      <div className="relative">
        {/* Connector line (desktop only — hidden for reduced-motion sensitivity) */}
        <div className="hidden lg:block motion-safe:block motion-reduce:hidden absolute top-[28px] left-[5%] right-[5%] h-0.5 bg-border-clinical/50 z-0" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const branchClass = step.branch ? branchColours[step.branch] : "";
            const cardContent = (
              <div
                className={`flex flex-col items-center text-center p-4 bg-white border-2 rounded-xl shadow-xs transition-all duration-200 hover:shadow-md group h-full ${
                  step.isCurrent
                    ? "border-clinical-teal bg-clinical-teal/5"
                    : "border-border-clinical hover:border-clinical-teal"
                }`}
                aria-current={step.isCurrent ? "step" : undefined}
              >
                {/* Step number */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-3.5 z-10 transition-all ${
                    step.isCurrent
                      ? "bg-clinical-teal border-clinical-teal text-white"
                      : "bg-pale-clinical-blue border-border-clinical text-deep-navy group-hover:bg-clinical-teal group-hover:border-clinical-teal group-hover:text-white"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Tag */}
                {step.tag && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-clinical-teal bg-clinical-teal/5 px-2 py-0.5 rounded mb-2">
                    {step.tag}
                  </span>
                )}

                {/* Branch label */}
                {showBranchLabels && step.branch && (
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border mb-2 ${branchClass}`}>
                    {step.branch === "conservative" ? "Non-Surgical" : step.branch === "surgical" ? "Surgical" : "All Patients"}
                  </span>
                )}

                <span className="text-xs md:text-sm font-bold text-deep-navy group-hover:text-clinical-teal transition-colors mb-1.5 block">
                  {step.label}
                </span>

                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold flex-1">
                  {step.description}
                </p>

                {step.href && (
                  <span className="text-[10px] font-bold text-clinical-teal mt-3 flex items-center gap-1 group-hover:underline">
                    Learn more →
                  </span>
                )}
              </div>
            );

            return (
              <div key={step.id} className="relative z-10" role="listitem">
                {step.href ? (
                  <Link
                    href={step.href}
                    className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal rounded-xl"
                    aria-label={`${step.label} — ${step.description}`}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 p-3 rounded-lg flex items-start gap-2 text-[10px] text-text-muted leading-relaxed">
        <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Patient Education Pathway: </strong>{disclaimer}
        </span>
      </div>
    </div>
  );
};
