import React from "react";
import Link from "next/link";

interface MedicalDisclaimerBlockProps {
  className?: string;
}

export const MedicalDisclaimerBlock: React.FC<MedicalDisclaimerBlockProps> = ({
  className = "",
}) => {
  return (
    <div
      role="region"
      aria-label="Medical Disclaimer"
      className={`bg-pale-clinical-blue border-l-4 border-clinical-teal p-5 rounded-r-[4px] my-6 font-sans text-sm md:text-base ${className}`}
    >
      <div className="flex gap-3">
        <svg
          className="w-6 h-6 shrink-0 text-clinical-teal mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="font-serif text-base font-bold text-deep-navy mb-1.5">
            Medical Disclaimer
          </h4>
          <p className="text-text-secondary leading-relaxed">
            This website provides educational and general information about knee symptoms,
            conditions, and treatments. The content is for informational purposes only and
            does not constitute medical advice, diagnosis, or a treatment plan. It should
            not be used as a substitute for a professional consultation, examination, or
            clinical decision-making by a qualified orthopaedic specialist.
          </p>
          <p className="text-text-secondary leading-relaxed mt-2">
            If you are experiencing symptoms or are concerned about a knee problem, please
            arrange a clinical consultation. If you have urgent symptoms, severe pain,
            or are unable to put weight on your leg, please read our{" "}
            <Link
              href="/urgent-advice"
              className="font-semibold text-clinical-teal underline hover:text-deep-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
            >
              urgent advice
            </Link>{" "}
            guidance or contact emergency services immediately (dial 999 or NHS 111).
          </p>
        </div>
      </div>
    </div>
  );
};
