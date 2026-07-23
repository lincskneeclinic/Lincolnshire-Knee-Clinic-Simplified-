import React from "react";
import Link from "next/link";

interface PathwayStep {
  label: string;
  description: string;
  route?: string;
  statusText?: string;
}

interface VisualPathwayBlockProps {
  type: "patient-journey" | "treatment" | "recovery";
  customSteps?: PathwayStep[];
  className?: string;
}

export const VisualPathwayBlock: React.FC<VisualPathwayBlockProps> = ({
  type,
  customSteps,
  className = "",
}) => {
  // Pre-configured clinic pathways
  const getPathwaySteps = (): PathwayStep[] => {
    if (customSteps) return customSteps;

    switch (type) {
      case "patient-journey":
        return [
          {
            label: "1. Symptoms",
            description: "Identify location and severity of your knee symptoms.",
            route: "/symptoms",
            statusText: "Learn Signs"
          },
          {
            label: "2. Conditions",
            description: "Understand potential joint or soft tissue pathologies.",
            route: "/conditions",
            statusText: "Explore Conditions"
          },
          {
            label: "3. Treatments",
            description: "Review conservative and surgical clinical options.",
            route: "/treatments",
            statusText: "See Treatments"
          },
          {
            label: "4. Recovery",
            description: "Structured recovery and rehabilitation guides.",
            route: "/recovery",
            statusText: "View Guides"
          },
          {
            label: "5. Appointment",
            description: "Schedule a specialist consultant-led assessment.",
            route: "/book-appointment",
            statusText: "Book Clinic"
          }
        ];
      case "treatment":
        return [
          {
            label: "Assessment",
            description: "Specialist consultation, physical examination, and MRI/X-ray referrals.",
            route: "/contact",
            statusText: "Consultation"
          },
          {
            label: "Non-Surgical",
            description: "Physiotherapy, unloading bracing, weight, and load management.",
            route: "/treatments/physiotherapy",
            statusText: "Conservative"
          },
          {
            label: "Injections",
            description: "Ultrasound-guided injections for targeted pain and inflammation relief.",
            route: "/injections",
            statusText: "Joint Therapy"
          },
          {
            label: "Surgery",
            description: "Arthroscopy or joint replacements when conservative options fail.",
            route: "/treatments",
            statusText: "Surgical Options"
          },
          {
            label: "Recovery",
            description: "Surgeon-guided post-operative rehab and return to activity.",
            route: "/recovery",
            statusText: "Rehabilitation"
          }
        ];
      case "recovery":
        return [
          {
            label: "Preparation",
            description: "Pre-operative assessment, prehab exercises, and home safety setup.",
            route: "/treatments/preparing-for-surgery",
            statusText: "Prehab"
          },
          {
            label: "Treatment",
            description: "Clinical procedure, joint preservation, or replacement surgery.",
            route: "/treatments",
            statusText: "Clinical Stage"
          },
          {
            label: "Early Recovery",
            description: "Managing swelling, initial mobilization, and walking aids support.",
            route: "/treatments/enhanced-recovery",
            statusText: "Weeks 1-6"
          },
          {
            label: "Rehabilitation",
            description: "Progressive strength, balance training, and functional movements.",
            route: "/treatments/physiotherapy-after-surgery",
            statusText: "Months 2-6"
          },
          {
            label: "Activity",
            description: "Gradual return to work, driving, gardening, and low-impact sports.",
            route: "/treatments/returning-to-sport",
            statusText: "Return to Play"
          }
        ];
      default:
        return [];
    }
  };

  const steps = getPathwaySteps();
  const titleMap = {
    "patient-journey": "Standard Patient Journey Pathway",
    treatment: "Clinical Treatment Staged Pathway",
    recovery: "Phased Rehabilitation & Recovery Pathway",
  };

  return (
    <div className={`space-y-6 ${className} font-sans`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-clinical/40 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
            Staged Clinical Pathway
          </span>
          <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
            {titleMap[type]}
          </h4>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
        {/* Horizontal Connector Line (Large Screens) */}
        <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-border-clinical/60 z-0"></div>

        {steps.map((step, idx) => {
          const content = (
            <div className="flex flex-col items-center text-center p-4 bg-white border border-border-clinical/80 rounded-xl shadow-xs transition-all duration-300 hover:shadow-md hover:border-clinical-teal group h-full">
              {/* Step Circle */}
              <div className="w-10 h-10 rounded-full bg-pale-clinical-blue border-2 border-border-clinical flex items-center justify-center font-bold text-sm text-deep-navy mb-3.5 group-hover:bg-clinical-teal group-hover:border-clinical-teal group-hover:text-white transition-all z-10">
                {idx + 1}
              </div>

              {/* Tag */}
              {step.statusText && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-clinical-teal bg-clinical-teal/5 group-hover:bg-clinical-teal/10 px-2 py-0.5 rounded mb-2">
                  {step.statusText}
                </span>
              )}

              {/* Title */}
              <span className="text-xs md:text-sm font-bold text-deep-navy group-hover:text-clinical-teal transition-colors mb-1.5 block">
                {step.label}
              </span>

              {/* Description */}
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">
                {step.description}
              </p>

              {/* Interactive Indicator (If link exists) */}
              {step.route && (
                <span className="text-[10px] font-bold text-clinical-teal mt-auto pt-3 flex items-center gap-1 group-hover:underline">
                  Explore Phase &rarr;
                </span>
              )}
            </div>
          );

          return (
            <div key={idx} className="relative z-10">
              {step.route ? (
                <Link href={step.route} className="block h-full cursor-pointer focus-visible:outline-none">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {/* Pathway Footer Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/30 p-3 rounded-lg flex items-start gap-2 text-[10px] text-text-muted leading-relaxed">
        <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Patient Education Pathway:</strong> This pathway diagram is for patient educational purposes only. It is not a diagnostic, triage, or clinical decision-making tool. Individual care options are determined dynamically following consultation.
        </span>
      </div>
    </div>
  );
};
