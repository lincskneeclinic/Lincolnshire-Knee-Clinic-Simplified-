import React from "react";

// ============================================================
// RecoveryPathway
//
// Phase-based recovery component distinct from RecoveryTimelineBlock.
// Focused on post-operative and non-surgical recovery stages.
//
// MANDATORY DISCLAIMER (hardcoded):
// "Timelines are indicative. Individual progression depends on
//  surgical findings, tissue quality, and clinical guidance."
//
// Keyboard navigable.
// Per-phase optional outcome disclaimer.
// Reduced-motion safe.
// ============================================================

export interface RecoveryPhase {
  phaseNumber: number;
  title: string;
  timeframe: string;
  focus: string;
  milestones: string[];
  weightBearing?: string;
  mobilityAid?: string;
  drivingStatus?: string;
  warningNote?: string;
}

interface RecoveryPathwayProps {
  title?: string;
  subtitle?: string;
  phases: RecoveryPhase[];
  procedureName?: string;
  disclaimer?: string;
  className?: string;
}

const phaseColours = [
  "border-clinical-teal bg-clinical-teal/5",
  "border-sky-400 bg-sky-50/40",
  "border-blue-400 bg-blue-50/30",
  "border-indigo-400 bg-indigo-50/30",
  "border-violet-400 bg-violet-50/20",
];

export const RecoveryPathway: React.FC<RecoveryPathwayProps> = ({
  title = "Phased Recovery Pathway",
  subtitle,
  phases,
  procedureName,
  disclaimer = "Recovery timelines are indicative only. Individual rehabilitation progression depends on surgical findings, tissue quality, post-operative assessment, and the specific guidance of your consultant orthopaedic surgeon and physiotherapist. Do not make changes to your rehabilitation programme without clinical advice.",
  className = "",
}) => {
  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Recovery Pathway
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          {title}
          {procedureName && ` — ${procedureName}`}
        </h4>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Phase cards — vertical timeline */}
      <div className="relative border-l-2 border-border-clinical/60 pl-6 md:pl-8 ml-4 space-y-8 py-2">
        {phases.map((phase, idx) => {
          const colourClass = phaseColours[idx % phaseColours.length];
          return (
            <div key={phase.phaseNumber} className="relative">
              {/* Timeline node */}
              <span
                className="absolute -left-[35px] md:-left-[43px] top-2 w-7 h-7 rounded-full bg-white border-2 border-clinical-teal flex items-center justify-center font-bold text-xs text-deep-navy shadow-xs"
                aria-hidden="true"
              >
                {phase.phaseNumber}
              </span>

              <div className={`border-2 ${colourClass} p-5 rounded-xl shadow-xs space-y-4 transition-shadow hover:shadow-md`}>
                {/* Phase header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-clinical/30 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block">
                      {phase.timeframe}
                    </span>
                    <h5 className="font-serif text-sm md:text-base font-bold text-deep-navy mt-0.5">
                      {phase.title}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 px-2.5 py-1 rounded self-start sm:self-auto shrink-0">
                    Phase {phase.phaseNumber}
                  </span>
                </div>

                {/* Focus */}
                <div className="text-xs font-medium text-text-main">
                  <span className="text-clinical-teal font-bold uppercase text-[9px] tracking-wider mr-2">
                    Primary Focus:
                  </span>
                  {phase.focus}
                </div>

                {/* Milestones */}
                <ul className="space-y-2">
                  {phase.milestones.map((m, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed font-semibold">
                      <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {m}
                    </li>
                  ))}
                </ul>

                {/* Parameters grid */}
                {(phase.weightBearing || phase.mobilityAid || phase.drivingStatus) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border-clinical/30 text-[11px]">
                    {phase.weightBearing && (
                      <div className="bg-white/70 p-2 rounded border border-border-clinical/40 space-y-0.5">
                        <span className="text-[9px] text-text-muted uppercase font-bold block tracking-wide">Weight Bearing</span>
                        <span className="font-bold text-deep-navy">{phase.weightBearing}</span>
                      </div>
                    )}
                    {phase.mobilityAid && (
                      <div className="bg-white/70 p-2 rounded border border-border-clinical/40 space-y-0.5">
                        <span className="text-[9px] text-text-muted uppercase font-bold block tracking-wide">Mobility Aid</span>
                        <span className="font-bold text-deep-navy">{phase.mobilityAid}</span>
                      </div>
                    )}
                    {phase.drivingStatus && (
                      <div className="bg-white/70 p-2 rounded border border-border-clinical/40 space-y-0.5">
                        <span className="text-[9px] text-text-muted uppercase font-bold block tracking-wide">Driving</span>
                        <span className="font-bold text-deep-navy">{phase.drivingStatus}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Per-phase warning */}
                {phase.warningNote && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-[11px] text-orange-800 font-semibold flex gap-2">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {phase.warningNote}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Master disclaimer */}
      <div className="bg-pale-clinical-blue/30 border border-border-clinical/40 p-4 rounded-xl text-left flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="space-y-1">
          <span className="font-bold text-deep-navy block uppercase tracking-wider text-[10px]">
            Important Clinical Advice
          </span>
          <span>{disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
