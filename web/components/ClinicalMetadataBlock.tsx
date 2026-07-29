import React from "react";

interface ClinicalMetadataBlockProps {
  reviewerName?: string;
  reviewerTitle?: string;
  lastReviewedDate?: string;
  evidenceSource?: string;
  className?: string;
}

export const ClinicalMetadataBlock: React.FC<ClinicalMetadataBlockProps> = ({
  reviewerName,
  reviewerTitle,
  lastReviewedDate,
  evidenceSource,
  className = "",
}) => {
  // Only treat content as clinically reviewed when a reviewer name and date
  // were actually supplied. Callers pass no props at all for unreviewed
  // pages, so this must not fall back to a named-reviewer default — doing so
  // previously attributed a false clinical sign-off to a named GMC-registered
  // consultant on draft content.
  const isReviewed = Boolean(reviewerName && lastReviewedDate);

  return (
    <div
      className={`bg-white border border-border-clinical p-5 rounded-xl shadow-[0_2px_10px_rgba(8,47,73,0.01)] flex items-start gap-3.5 text-left font-sans max-w-sm ${className}`}
    >
      {/* Icon Accent — teal when reviewed, amber when still in draft */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isReviewed ? "bg-clinical-teal/10 text-clinical-teal" : "bg-amber-100 text-amber-700"
        }`}
      >
        {isReviewed ? (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
        <span
          className={`block font-bold uppercase tracking-widest text-[9px] ${
            isReviewed ? "text-clinical-teal" : "text-amber-700"
          }`}
        >
          {isReviewed ? "Clinically Reviewed" : "Awaiting Clinical Review"}
        </span>

        {isReviewed ? (
          <>
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
          </>
        ) : (
          <p className="text-text-muted font-medium">
            This page is in draft and has not yet been formally reviewed by our clinical team. Content may change
            following clinical review.
          </p>
        )}
      </div>
    </div>
  );
};
