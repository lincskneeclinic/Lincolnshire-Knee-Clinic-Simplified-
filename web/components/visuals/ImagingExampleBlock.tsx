"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getVisualAsset } from "@/data/visualsInventory";
import { PlaceholderVisual } from "./PlaceholderVisual";
import { VisualCaption } from "./VisualCaption";

interface ImagingExampleBlockProps {
  pageSlug: string;
  section: string;
  className?: string;
}

export const ImagingExampleBlock: React.FC<ImagingExampleBlockProps> = ({
  pageSlug,
  section,
  className = "",
}) => {
  const asset = getVisualAsset(pageSlug, section);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  if (!asset) {
    return null;
  }

  const isApproved = asset.status === "approved" && !asset.imagePath.includes("placeholder");

  return (
    <figure className={`space-y-4 ${className}`}>
      {/* Radiology View Frame (Dark mode lightbox appearance) */}
      <div className="relative overflow-hidden rounded-xl bg-[#030712] border-2 border-[#1F2937] p-2 shadow-lg">
        {/* Top Console Bar */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-2 mb-2 px-2 text-[10px] font-sans font-bold text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="uppercase tracking-widest">LKC Imaging Console v1.0</span>
          </div>
          <div className="text-right uppercase">
            <span>Status: {asset.clinicalReviewStatus.replace(/-/g, " ")}</span>
          </div>
        </div>

        {isApproved ? (
          <div className="relative w-full h-[320px] md:h-[420px] bg-black">
            <Image
              src={asset.imagePath}
              alt={asset.altText}
              fill
              sizes="(max-w-7xl) 100vw, 800px"
              className="object-contain filter grayscale"
              loading="lazy"
            />
            {/* Annotation Overlay */}
            {asset.annotations?.map((ann) => {
              const isPathology = ann.highlightColor === "coral";
              const colorClasses = isPathology
                ? "bg-orange-500 ring-orange-200 text-white"
                : "bg-clinical-teal ring-cyan-100 text-white";

              return (
                <div
                  key={ann.id}
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group/marker z-20"
                >
                  <button
                    type="button"
                    aria-label={`Annotation: ${ann.label}`}
                    onClick={() => setActiveAnnotation(activeAnnotation === ann.id ? null : ann.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer animate-pulse ring-4 transition-all hover:scale-110 ${colorClasses}`}
                  >
                    {ann.label.charAt(0)}
                  </button>
                  {/* Tooltip */}
                  {(activeAnnotation === ann.id || typeof window === "undefined") && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-deep-navy text-white rounded-lg p-2.5 text-xs shadow-lg z-30 border border-border-clinical/30">
                      <span className="font-bold block mb-0.5">{ann.label}</span>
                      {ann.description && <p className="text-[10px] text-pale-clinical-blue">{ann.description}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Placeholder View (Pass 1) */
          <div className="relative rounded-lg overflow-hidden bg-black/40">
            <PlaceholderVisual
              title={asset.title}
              type={asset.type}
              placeholderLabel={asset.placeholderLabel}
              dimensions={asset.requiredDimensions}
              status={asset.status}
              clinicalReviewStatus={asset.clinicalReviewStatus}
              fallbackText={asset.altText}
            />

            {/* Render annotation markers overlay on placeholder */}
            {asset.annotations && asset.annotations.length > 0 && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {asset.annotations.map((ann) => {
                  const isPathology = ann.highlightColor === "coral";
                  const colorClasses = isPathology
                    ? "bg-orange-500 border-white text-white shadow-orange-500/50"
                    : "bg-clinical-teal border-white text-white shadow-cyan-500/50";

                  return (
                    <div
                      key={ann.id}
                      style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    >
                      <div className="relative group/pin">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold shadow-lg animate-pulse ${colorClasses}`}>
                          {ann.label.charAt(0)}
                        </span>
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-deep-navy text-white rounded-md p-2 text-[10px] shadow-lg opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-30">
                          <span className="font-bold block mb-0.5">{ann.label}</span>
                          {ann.description && <span className="text-text-muted">{ann.description}</span>}
                          {isPathology && <span className="block mt-1 text-[8px] text-orange-400 font-bold uppercase tracking-wider">Pathology Highlight</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <VisualCaption>
        {asset.caption}. {asset.annotations && asset.annotations.length > 0 && (
          <span className="text-[10px] uppercase font-bold text-clinical-teal tracking-wider ml-1 not-italic">
            (Weight-bearing views are standard diagnostic protocols)
          </span>
        )}
      </VisualCaption>

      {/* Render annotation legends on light container for WCAG contrast compliance */}
      {asset.annotations && asset.annotations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {asset.annotations.map((ann) => {
            const isPathology = ann.highlightColor === "coral";
            const borderClasses = isPathology
              ? "border-orange-200 bg-orange-50/20"
              : "border-border-clinical/60 bg-white";
            const dotColor = isPathology ? "bg-orange-500" : "bg-clinical-teal";

            return (
              <div
                key={ann.id}
                className={`p-3 rounded-lg border text-left shadow-xs flex items-start gap-2.5 transition-colors hover:shadow-sm ${borderClasses}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`} />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-deep-navy flex items-center gap-1.5">
                    {ann.label}
                    {isPathology && (
                      <span className="text-[8px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 px-1 rounded">
                        Pathology
                      </span>
                    )}
                  </span>
                  {ann.description && (
                    <p className="text-[11px] text-text-secondary leading-normal font-medium">
                      {ann.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </figure>
  );
};
