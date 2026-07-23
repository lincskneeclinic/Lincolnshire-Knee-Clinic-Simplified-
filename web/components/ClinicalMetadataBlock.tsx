import React from "react";

interface ClinicalMetadataBlockProps {
  reviewerName?: string;
  reviewerTitle?: string;
  lastReviewedDate?: string;
  evidenceSource?: string;
  className?: string;
}

export const ClinicalMetadataBlock: React.FC<ClinicalMetadataBlockProps> = ({
  reviewerName = "Mr Ricardo J Pacheco (GMC 4145976)",
  reviewerTitle = "Consultant Trauma & Orthopaedic Surgeon",
  lastReviewedDate = "Awaiting clinical review",
  evidenceSource = "Awaiting clinical review",
  className = "",
}) => {
  return (
    <div
      className={`bg-white border border-border-clinical p-5 rounded-xl shadow-[0_2px_10px_rgba(8,47,73,0.01)] flex items-start gap-3.5 text-left font-sans max-w-sm ${className}`}
    >
      {/* Small Teal Icon Accent */}
      <div className="w-8 h-8 rounded-lg bg-clinical-teal/10 flex items-center justify-center shrink-0 mt-0.5 text-clinical-teal">
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
        <span className="block font-bold text-clinical-teal uppercase tracking-widest text-[9px]">
          Clinically Reviewed
        </span>
        <div>
          <strong className="block text-sm text-deep-navy font-bold">{reviewerName}</strong>
          <span className="text-text-muted font-medium block">{reviewerTitle}</span>
        </div>
        <div className="pt-2 border-t border-border-clinical/30 space-y-1 mt-1">
          <div>
            <span className="font-semibold text-text-primary">Last reviewed: </span>
            <span className="text-text-muted">{lastReviewedDate}</span>
          </div>
          <div>
            <span className="font-semibold text-text-primary">Evidence sources: </span>
            <span className="text-text-muted">{evidenceSource}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
