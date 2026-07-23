import React from "react";
import Link from "next/link";

interface UrgentAdviceBannerProps {
  className?: string;
  showDetails?: boolean;
}

export const UrgentAdviceBanner: React.FC<UrgentAdviceBannerProps> = ({
  className = "",
  showDetails = true,
}) => {
  return (
    <div
      role="note"
      aria-label="Urgent medical advice disclaimer"
      className={`bg-status-error-bg border-b border-[#FAD8D8] text-status-error px-4 py-2 font-sans text-xs md:text-[13px] leading-relaxed ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-1.5">
        <div className="flex items-start md:items-center gap-2">
          <svg
            className="w-3.5 h-3.5 shrink-0 text-status-error mt-0.5 md:mt-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <span className="font-semibold text-text-main">Urgent symptoms? </span>
            <Link
              href="/urgent-advice"
              className="underline font-bold text-status-error hover:text-deep-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-status-error"
            >
              Read urgent advice.
            </Link>
            {showDetails && (
              <span className="hidden lg:inline ml-2 text-text-secondary">
                Lincolnshire Knee Clinic does not provide emergency medical care.
                For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
              </span>
            )}
          </div>
        </div>
        {showDetails && (
          <div className="lg:hidden text-[10px] md:text-xs text-text-secondary mt-0.5 md:mt-0 border-t border-[#FAD8D8]/40 pt-0.5 md:border-0 md:pt-0">
            Lincolnshire Knee Clinic does not provide emergency medical care.
            For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
          </div>
        )}
      </div>
    </div>
  );
};
