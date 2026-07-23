"use client";

import React, { useState, useRef, useCallback, useId } from "react";
import { PlaceholderVisual } from "./PlaceholderVisual";

// ============================================================
// BeforeAfterComparison
//
// Interactive slider comparing two illustration panels.
// - Drag / touch / keyboard (range input with ARIA)
// - Both panels labelled — not relying on position alone
// - Disclaimer: educational illustrations only
// - prefers-reduced-motion: shows both panels statically, no animation
// - Keyboard: ArrowLeft / ArrowRight adjust slider
// - Accessible range input with ARIA label
// ============================================================

interface BeforeAfterComparisonProps {
  /** Left panel — typically "normal" or "before" */
  leftLabel?: string;
  leftCaption?: string;
  leftImageSrc?: string;
  leftAltText?: string;
  leftPlaceholderLabel?: string;
  /** Right panel — typically "affected" or "after" */
  rightLabel?: string;
  rightCaption?: string;
  rightImageSrc?: string;
  rightAltText?: string;
  rightPlaceholderLabel?: string;
  title?: string;
  subtitle?: string;
  disclaimer?: string;
  className?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  leftLabel = "Normal Anatomy",
  leftCaption,
  leftImageSrc,
  leftAltText = "Normal anatomy illustration",
  leftPlaceholderLabel = "Normal anatomy illustration pending clinical review",
  rightLabel = "Affected Anatomy",
  rightCaption,
  rightImageSrc,
  rightAltText = "Affected anatomy illustration",
  rightPlaceholderLabel = "Affected anatomy illustration pending clinical review",
  title = "Anatomy Comparison",
  subtitle,
  disclaimer = "Both panels are educational illustrations. They do not represent any individual patient's anatomy.",
  className = "",
}) => {
  const [sliderValue, setSliderValue] = useState(50);
  const sliderId = useId();
  const leftApproved = !!leftImageSrc;
  const rightApproved = !!rightImageSrc;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(Number(e.target.value));
    },
    []
  );

  const placeholderDims = { width: 500, height: 350 };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Anatomy Comparison
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">{title}</h4>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Slider comparison — hidden for reduced-motion, static panels shown instead */}
      <div className="motion-reduce:hidden space-y-4">
        {/* Split view container */}
        <div
          className="relative w-full overflow-hidden rounded-xl border border-border-clinical bg-white"
          style={{ minHeight: "300px" }}
          aria-hidden="true"
        >
          {/* Left panel — clipped by slider */}
          <div
            className="absolute inset-0 overflow-hidden z-10"
            style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
          >
            <div className="absolute inset-0">
              {leftApproved ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={leftImageSrc}
                  alt={leftAltText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaceholderVisual
                  title={leftLabel}
                  type="comparison"
                  placeholderLabel={leftPlaceholderLabel}
                  dimensions={placeholderDims}
                  status="pending"
                  clinicalReviewStatus="pending-clinical-review"
                />
              )}
            </div>
            {/* Left label */}
            <span className="absolute top-3 left-3 bg-deep-navy/80 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase">
              {leftLabel}
            </span>
          </div>

          {/* Right panel */}
          <div className="absolute inset-0">
            {rightApproved ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rightImageSrc}
                alt={rightAltText}
                className="w-full h-full object-cover"
              />
            ) : (
              <PlaceholderVisual
                title={rightLabel}
                type="comparison"
                placeholderLabel={rightPlaceholderLabel}
                dimensions={placeholderDims}
                status="pending"
                clinicalReviewStatus="pending-clinical-review"
              />
            )}
            {/* Right label */}
            <span className="absolute top-3 right-3 bg-orange-700/80 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase">
              {rightLabel}
            </span>
          </div>

          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20"
            style={{ left: `${sliderValue}%` }}
            aria-hidden="true"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-border-clinical flex items-center justify-center">
              <svg className="w-4 h-4 text-deep-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Accessible range slider */}
        <div className="space-y-1">
          <label htmlFor={sliderId} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Drag to compare — {leftLabel} / {rightLabel}
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={handleSliderChange}
            aria-label={`Comparison slider: drag to reveal ${leftLabel} on the left and ${rightLabel} on the right`}
            aria-valuetext={`${Math.round(sliderValue)}% ${leftLabel} visible`}
            className="w-full accent-clinical-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal rounded"
          />
        </div>
      </div>

      {/* Reduced-motion / no-JS fallback: static side-by-side panels */}
      <div className="motion-safe:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-xs font-bold text-deep-navy bg-deep-navy/5 px-2 py-0.5 rounded inline-block">
            {leftLabel}
          </span>
          {leftApproved ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={leftImageSrc} alt={leftAltText} className="w-full rounded-xl border border-border-clinical" />
          ) : (
            <PlaceholderVisual
              title={leftLabel}
              type="comparison"
              placeholderLabel={leftPlaceholderLabel}
              dimensions={placeholderDims}
              status="pending"
              clinicalReviewStatus="pending-clinical-review"
            />
          )}
          {leftCaption && <p className="text-xs italic text-text-muted">{leftCaption}</p>}
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded inline-block">
            {rightLabel}
          </span>
          {rightApproved ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={rightImageSrc} alt={rightAltText} className="w-full rounded-xl border border-border-clinical" />
          ) : (
            <PlaceholderVisual
              title={rightLabel}
              type="comparison"
              placeholderLabel={rightPlaceholderLabel}
              dimensions={placeholderDims}
              status="pending"
              clinicalReviewStatus="pending-clinical-review"
            />
          )}
          {rightCaption && <p className="text-xs italic text-text-muted">{rightCaption}</p>}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-3 rounded-lg text-[11px] text-text-secondary leading-relaxed font-semibold flex gap-2">
        <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {disclaimer}
      </div>
    </div>
  );
};
