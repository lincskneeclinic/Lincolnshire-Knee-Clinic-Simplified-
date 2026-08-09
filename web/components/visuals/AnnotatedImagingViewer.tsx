"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import { ImagingAsset } from "@/types/visuals";
import { isImagingAssetPublishable } from "@/data/imagingAssets";

// ============================================================
// AnnotatedImagingViewer
//
// Viewer for approved X-ray / MRI / Ultrasound assets.
// Renders ONLY when publicationApprovalConfirmed AND
// anonymisationConfirmed are both true.
// Falls back to educational placeholder if not approved.
//
// Features:
// - Numbered annotation markers (number + colour — not colour alone)
// - Toggle annotations on/off (keyboard accessible)
// - Caption, modality, view label
// - Educational disclaimer (hardcoded)
// - Accessible annotation list (ARIA live on toggle)
// - Mobile layout supported
// ============================================================

interface AnnotatedImagingViewerProps {
  imagingAsset: ImagingAsset;
  className?: string;
}

export const AnnotatedImagingViewer: React.FC<AnnotatedImagingViewerProps> = ({
  imagingAsset,
  className = "",
}) => {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const liveId = useId();
  const titleId = useId();

  const canPublish = isImagingAssetPublishable(imagingAsset);

  return (
    <figure className={`space-y-4 font-sans ${className}`}>
      {/* Console-style header */}
      <div className="relative overflow-hidden rounded-xl bg-[#030712] border-2 border-[#1F2937] shadow-lg">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-2 mb-2 px-4 pt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${canPublish ? "bg-green-500" : "bg-orange-500 motion-safe:animate-pulse"}`}
              aria-hidden="true"
            />
            <span>LKC Imaging Viewer</span>
          </div>
          <div>
            <span className="text-gray-500">
              {imagingAsset.modality} · {imagingAsset.viewOrSequence}
            </span>
          </div>
        </div>

        {canPublish ? (
          <>
            {/* Approved imaging with annotations */}
            <div className="relative w-full h-[300px] md:h-[420px] bg-black mx-auto">
              <Image
                src={imagingAsset.filePath}
                alt={imagingAsset.altText}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className={`object-contain ${imagingAsset.modality !== "Arthroscopy" ? "filter grayscale" : ""}`}
                loading="lazy"
              />

              {/* Annotation markers overlay */}
              {showAnnotations && imagingAsset.annotationLabels.map((label, idx) => {
                // Marker sits at the finding's actual location in the image.
                // Falls back to a right-side column if no position is defined.
                const position = imagingAsset.annotationPositions?.[idx];
                const markerX = position?.x ?? 92;
                const markerY = position?.y ?? 20 + idx * 20;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Annotation ${idx + 1}: ${label}`}
                    aria-pressed={activeAnnotation === idx}
                    onClick={() => setActiveAnnotation(activeAnnotation === idx ? null : idx)}
                    style={{ top: `${markerY}%`, left: `${markerX}%`, transform: "translate(-50%, -50%)" }}
                    className="absolute w-7 h-7 rounded-full bg-clinical-teal text-white text-[11px] font-bold flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {idx + 1}
                  </button>
                );
              })}

              {/* Active annotation tooltip */}
              {activeAnnotation !== null && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute bottom-4 left-4 right-4 bg-deep-navy/90 text-white rounded-lg p-3 text-xs shadow-lg border border-border-clinical/30"
                >
                  <span className="font-bold block mb-0.5">
                    {activeAnnotation + 1}. {imagingAsset.annotationLabels[activeAnnotation]}
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1F2937]">
              <button
                type="button"
                onClick={() => {
                  setShowAnnotations((v) => !v);
                  setActiveAnnotation(null);
                }}
                aria-pressed={showAnnotations}
                className="text-[11px] font-bold text-clinical-teal hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal rounded"
              >
                {showAnnotations ? "Hide Annotations" : "Show Annotations"}
              </button>
              <span
                id={liveId}
                className="sr-only"
                role="status"
                aria-live="polite"
              >
                Annotations {showAnnotations ? "visible" : "hidden"}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Educational use only
              </span>
            </div>
          </>
        ) : (
          /* Placeholder when not approved for publication */
          <div className="flex flex-col items-center justify-center h-[280px] md:h-[380px] p-6 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-orange-300 text-xs font-bold uppercase tracking-wider">
                Annotated {imagingAsset.modality} example pending clinical approval
              </p>
              <p className="text-gray-500 text-[11px] max-w-sm leading-relaxed">
                {imagingAsset.modality} · {imagingAsset.viewOrSequence}
              </p>
              <p className="text-gray-600 text-[11px] italic max-w-sm">
                {imagingAsset.source}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <figcaption className="text-xs italic text-text-muted leading-relaxed px-1">
        {imagingAsset.caption}
      </figcaption>

      {/* Annotation list (always visible — non-interactive fallback) */}
      {imagingAsset.annotationLabels.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-deep-navy block">
            Annotation Reference
          </span>
          <ol className="space-y-2">
            {imagingAsset.annotationLabels.map((label, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                <span className="w-5 h-5 rounded-full bg-clinical-teal text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Educational disclaimer — hardcoded, always visible */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-4 rounded-xl text-xs text-text-secondary leading-relaxed font-semibold flex gap-3">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-bold text-deep-navy block uppercase tracking-wider text-[10px] mb-1">
            Educational Imaging Disclaimer
          </span>
          This imaging example is provided solely for educational purposes. It is not a diagnostic image and does not represent your own anatomy or pathology. All patients require individual clinical examination, history taking, and appropriate investigations to reach a diagnosis. The findings shown may not be present in your case.
        </div>
      </div>
    </figure>
  );
};
