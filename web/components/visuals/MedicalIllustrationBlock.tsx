"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getVisualAsset } from "@/data/visualsInventory";
import { PlaceholderVisual } from "./PlaceholderVisual";
import { VisualCaption } from "./VisualCaption";

// Static imports for overview diagrams to bypass Next.js dev server public folder caching issues
import backOfKneePain from "@/public/images/symptoms/back-of-knee-pain-overview.png";
import clickingKnee from "@/public/images/symptoms/clicking-knee-overview.jpg";
import frontOfKneePain from "@/public/images/symptoms/front-of-knee-pain-overview.png";
import innerKneePain from "@/public/images/symptoms/inner-knee-pain-overview.png";
import kneeGivingWay from "@/public/images/symptoms/knee-giving-way-overview.jpg";
import kneePain from "@/public/images/symptoms/knee-pain-overview.png";
import kneePainAfterInjury from "@/public/images/symptoms/knee-pain-after-injury-overview.png";
import lockedKnee from "@/public/images/symptoms/locked-knee-overview.jpg";
import outerKneePain from "@/public/images/symptoms/outer-knee-pain-overview.svg";
import stiffKnee from "@/public/images/symptoms/stiff-knee-overview.png";
import swollenKnee from "@/public/images/symptoms/swollen-knee-overview.png";
import unableToStraightenKnee from "@/public/images/symptoms/unable-to-straighten-knee-overview.jpg";

import kneeArthritisOverview from "@/public/images/conditions/knee-arthritis-overview.png";
import meniscalTearOverview from "@/public/images/conditions/meniscal-tear-overview.png";
import aclInjuryOverview from "@/public/images/conditions/acl-injury-overview.png";
import physiotherapyOverview from "@/public/images/treatments/physiotherapy-overview.jpg";

const staticImages: Record<string, any> = {
  "symptoms/back-of-knee-pain-overview": backOfKneePain,
  "symptoms/clicking-knee-overview": clickingKnee,
  "symptoms/front-of-knee-pain-overview": frontOfKneePain,
  "symptoms/inner-knee-pain-overview": innerKneePain,
  "symptoms/knee-giving-way-overview": kneeGivingWay,
  "symptoms/knee-pain-overview": kneePain,
  "symptoms/knee-pain-after-injury-overview": kneePainAfterInjury,
  "symptoms/locked-knee-overview": lockedKnee,
  "symptoms/outer-knee-pain-overview": outerKneePain,
  "symptoms/stiff-knee-overview": stiffKnee,
  "symptoms/swollen-knee-overview": swollenKnee,
  "symptoms/unable-to-straighten-knee-overview": unableToStraightenKnee,
  
  "conditions/knee-arthritis-overview": kneeArthritisOverview,
  "conditions/meniscal-tear-overview": meniscalTearOverview,
  "conditions/acl-injury-overview": aclInjuryOverview,
  "treatments/physiotherapy-overview": physiotherapyOverview,
};

interface MedicalIllustrationBlockProps {
  pageSlug: string;
  section: string;
  className?: string;
}

export const MedicalIllustrationBlock: React.FC<MedicalIllustrationBlockProps> = ({
  pageSlug,
  section,
  className = "",
}) => {
  const asset = getVisualAsset(pageSlug, section);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  if (!asset) {
    return null;
  }

  // Check if final asset is approved and loaded (Pass 1 has status === "pending" for all)
  const isApproved = asset.status === "approved" && !asset.imagePath.includes("placeholder");

  return (
    <figure className={`space-y-4 ${className}`}>
      <div className="relative overflow-hidden rounded-xl bg-white border border-border-clinical/60 p-1">
        {isApproved ? (
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image
              src={staticImages[`${pageSlug}-${section}`] || asset.imagePath}
              alt={asset.altText}
              fill
              sizes="(max-w-7xl) 100vw, 800px"
              className="object-contain"
              loading="lazy"
            />
            {/* Interactive Annotations Overlay on Image */}
            {asset.annotations?.map((ann) => {
              const isPathology = ann.highlightColor === "coral";
              const colorClasses = isPathology
                ? "bg-orange-500 text-white ring-orange-200"
                : "bg-clinical-teal text-white ring-cyan-100";

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
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer animate-pulse ring-4 transition-all hover:scale-115 ${colorClasses}`}
                  >
                    {ann.label.charAt(0)}
                  </button>
                  {/* Tooltip */}
                  {(activeAnnotation === ann.id || typeof window === "undefined") && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-deep-navy text-white rounded-lg p-2.5 text-xs shadow-lg z-30 transition-opacity">
                      <span className="font-bold block mb-0.5">{ann.label}</span>
                      {ann.description && <p className="text-[10px] text-pale-clinical-blue">{ann.description}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Placeholder View (Default for Pass 1) */
          <div className="relative">
            <PlaceholderVisual
              title={asset.title}
              type={asset.type}
              placeholderLabel={asset.placeholderLabel}
              dimensions={asset.requiredDimensions}
              status={asset.status}
              clinicalReviewStatus={asset.clinicalReviewStatus}
              fallbackText={asset.altText}
            />

            {/* If annotations exist, show them as interactive pulsing pins on the placeholder grid to demonstrate system capability! */}
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

      {/* Render the caption */}
      <VisualCaption>
        {asset.caption}. {asset.annotations && asset.annotations.length > 0 && (
          <span className="block md:inline font-sans font-bold text-clinical-teal not-italic text-[10px] tracking-wider uppercase ml-1">
            (Pulsing letters show planned interactive annotation markers)
          </span>
        )}
      </VisualCaption>

      {/* Annotation Legend Cards */}
      {asset.annotations && asset.annotations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
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
