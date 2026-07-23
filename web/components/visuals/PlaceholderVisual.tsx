import React from "react";
import { VisualType } from "@/types/visuals";

interface PlaceholderVisualProps {
  title: string;
  type: VisualType;
  placeholderLabel?: string;
  dimensions: { width: number; height: number };
  status?: string;
  clinicalReviewStatus?: string;
  fallbackText?: string;
}

export const PlaceholderVisual: React.FC<PlaceholderVisualProps> = ({
  title,
  type,
  placeholderLabel = "Visual pending clinical review",
  dimensions,
  status = "pending",
  clinicalReviewStatus = "pending-clinical-review",
  fallbackText,
}) => {
  // Select matching SVG icon path for visual type
  const renderIcon = () => {
    const strokeWidth = 1.5;
    const sizeClasses = "w-12 h-12 text-clinical-teal/60 mb-3 transition-transform duration-300 group-hover:scale-105";

    switch (type) {
      case "anatomy":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Skeletal bone symbol */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15C10.5 4.5 9 6 9 7.5s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zm0 15c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3z" />
          </svg>
        );
      case "comparison":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Split layout view symbol */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5h6m-6 15h6m-3-15v15M4.5 7.5h15m-15 9h15" />
          </svg>
        );
      case "imaging":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Medical scan monitor/X-ray symbol */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5h-18M3 16.5h18M5.25 12h13.5M9 7.5v9m6-9v9" />
          </svg>
        );
      case "pathway":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Node flow diagram */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0h-5.25M6 5.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0h5.25m0 0v13.5m0-13.5L6 18.75M12 5.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        );
      case "timeline":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Clock and progress milestones */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "symptom-locator":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Target locator / human focal point */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0c0 5.25-6 10.5-6 10.5s-6-5.25-6-10.5a6 6 0 1112 0z" />
          </svg>
        );
      case "procedure":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Syringe/treatment symbol */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75" />
          </svg>
        );
      case "aftercare":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Shield/first aid cross */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        );
      case "clinic-map":
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Map and pin */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h6m-6 4h3m-3 4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {/* Default document symbol */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
    }
  };

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");

  return (
    <div
      role="figure"
      aria-label={`${title} (${placeholderLabel})`}
      className="group relative w-full rounded-xl overflow-hidden bg-pale-clinical-blue/30 border border-border-clinical shadow-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in hover:border-clinical-teal/50 hover:bg-pale-clinical-blue/50 transition-all duration-300 min-h-[260px] md:min-h-[300px]"
    >
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#00afc8_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none"></div>

      {renderIcon()}

      <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full mb-2">
        {formattedType} Visual
      </span>

      <h4 className="font-sans text-sm md:text-base font-bold text-deep-navy mb-1.5 px-4">
        {title}
      </h4>

      <p className="text-xs font-semibold text-text-secondary max-w-md px-6 leading-relaxed mb-4">
        {placeholderLabel}
      </p>

      {/* Footer Info: Dimensions and Status */}
      <div className="flex flex-wrap justify-center gap-3 border-t border-border-clinical/40 pt-3.5 w-full max-w-sm text-[10px] font-semibold text-text-muted">
        <span>Target Size: {dimensions.width} &times; {dimensions.height}px</span>
        <span className="text-border-clinical/80">&bull;</span>
        <span className="uppercase tracking-wide text-status-error">{clinicalReviewStatus.replace(/-/g, " ")}</span>
        <span className="text-border-clinical/80">&bull;</span>
        <span className="capitalize">{status}</span>
      </div>

      {/* Screen-reader accessible fallback */}
      {fallbackText && <span className="sr-only">{fallbackText}</span>}
    </div>
  );
};
