import React from "react";

export interface TimelinePhase {
  timeframe: string;
  title: string;
  focus: string;
  guidelines: string[];
  weightBearing?: string;
  drivingText?: string;
}

interface RecoveryTimelineBlockProps {
  title: string;
  subtitle?: string;
  phases: TimelinePhase[];
  disclaimer?: string;
  className?: string;
}

export const RecoveryTimelineBlock: React.FC<RecoveryTimelineBlockProps> = ({
  title,
  subtitle,
  phases,
  disclaimer = "Recovery timelines are indicative. Individual rehabilitation progression depends on surgical findings, tissue quality, and the specific guidance of your consultant orthopaedic surgeon and physiotherapist.",
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className} font-sans`}>
      {/* Title */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Rehabilitation Milestones
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">{title}</h4>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-border-clinical pl-6 md:pl-8 ml-3 space-y-8 py-2">
        {phases.map((phase, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Indicator */}
            <span className="absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-clinical-teal flex items-center justify-center font-sans text-[10px] font-bold text-deep-navy shadow-xs group-hover:bg-clinical-teal group-hover:text-white transition-colors">
              {idx + 1}
            </span>

            <div className="bg-white border border-border-clinical/80 p-5 rounded-xl shadow-xs space-y-3.5 text-left transition-all hover:shadow-md hover:border-clinical-teal/40">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-clinical/30 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal block">
                    {phase.timeframe}
                  </span>
                  <h5 className="font-serif text-sm md:text-base font-bold text-deep-navy">
                    {phase.title}
                  </h5>
                </div>
              </div>

              {/* Focus statement */}
              <div className="text-xs text-text-main font-bold">
                <span className="text-clinical-teal uppercase text-[9px] tracking-wider font-extrabold mr-1.5">Primary Focus:</span>
                {phase.focus}
              </div>

              {/* Guidelines list */}
              <ul className="space-y-2">
                {phase.guidelines.map((guide, gIdx) => (
                  <li key={gIdx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed font-semibold">
                    <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>

              {/* Parameters: Weight Bearing & Driving */}
              {(phase.weightBearing || phase.drivingText) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border-clinical/40 text-[11px] font-bold">
                  {phase.weightBearing && (
                    <div className="bg-pale-clinical-blue/45 p-2 rounded border border-border-clinical/40 flex items-center gap-2">
                      <svg className="w-4 h-4 text-deep-navy shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block leading-none font-bold">Weight Bearing</span>
                        <span className="text-deep-navy">{phase.weightBearing}</span>
                      </div>
                    </div>
                  )}
                  {phase.drivingText && (
                    <div className="bg-pale-clinical-blue/45 p-2 rounded border border-border-clinical/40 flex items-center gap-2">
                      <svg className="w-4 h-4 text-deep-navy shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block leading-none font-bold">Driving Status</span>
                        <span className="text-deep-navy">{phase.drivingText}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Notice */}
      <div className="bg-pale-clinical-blue/30 border border-border-clinical/40 p-4 rounded-xl text-left flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="space-y-1">
          <span className="font-bold text-deep-navy block uppercase tracking-wider text-[10px]">Important Clinical Advice</span>
          <span>{disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
