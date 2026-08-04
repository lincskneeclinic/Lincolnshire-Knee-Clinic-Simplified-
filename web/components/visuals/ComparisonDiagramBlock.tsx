import React from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { PlaceholderVisual } from "./PlaceholderVisual";

interface ComparisonItem {
  feature: string;
  normal: string;
  abnormal: string;
}

interface ComparisonDiagramBlockProps {
  title: string;
  subtitle?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftPlaceholderLabel?: string;
  rightPlaceholderLabel?: string;
  comparisonPoints?: ComparisonItem[];
  pathologyHighlightLabel?: string;
  dimensions?: { width: number; height: number };
  className?: string;
  leftImageSrc?: StaticImageData;
  rightImageSrc?: StaticImageData;
  singleImageSrc?: StaticImageData;
  leftBadgeLabel?: string;
  rightBadgeLabel?: string;
}

export const ComparisonDiagramBlock: React.FC<ComparisonDiagramBlockProps> = ({
  title,
  subtitle,
  leftTitle = "Normal Anatomy",
  rightTitle = "Pathological / Affected Anatomy",
  leftPlaceholderLabel = "Healthy structure illustration pending",
  rightPlaceholderLabel = "Affected structure illustration pending",
  comparisonPoints = [],
  pathologyHighlightLabel = "Degenerative Changes",
  dimensions = { width: 450, height: 350 },
  className = "",
  leftImageSrc,
  rightImageSrc,
  singleImageSrc,
  leftBadgeLabel = "Normal X-ray",
  rightBadgeLabel = "Arthritic X-ray",
}) => {
  return (
    <div className={`space-y-6 ${className} font-sans`}>
      {/* Title block */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Anatomy Comparison
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">{title}</h4>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Side-by-Side Image Placeholders / Single Comparison Image */}
      {singleImageSrc ? (
        <div className="group relative w-full rounded-xl overflow-hidden bg-white border border-border-clinical shadow-sm flex flex-col p-3 hover:border-clinical-teal/50 transition-all duration-300">
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] bg-[#0F172A] rounded-lg overflow-hidden">
            <Image
              src={singleImageSrc}
              alt={title}
              fill
              sizes="(max-w-7xl) 100vw, 900px"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
              Comparison Diagram
            </span>
            <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
              Clinical Reference
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Normal */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#003B5C] bg-[#003B5C]/5 px-2.5 py-1 rounded-md inline-block">
              {leftTitle}
            </span>
            {leftImageSrc ? (
              <div className="group relative w-full rounded-xl overflow-hidden bg-white border border-border-clinical shadow-sm flex flex-col p-3 hover:border-clinical-teal/50 transition-all duration-300">
                <div className="relative w-full aspect-[3/4] bg-[#0F172A] rounded-lg overflow-hidden">
                  <Image
                    src={leftImageSrc}
                    alt={leftTitle}
                    fill
                    sizes="(max-w-7xl) 50vw, 450px"
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
                    {leftBadgeLabel}
                  </span>
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
                    Clinical Reference
                  </span>
                </div>
              </div>
            ) : (
              <PlaceholderVisual
                title={leftTitle}
                type="comparison"
                placeholderLabel={leftPlaceholderLabel}
                dimensions={dimensions}
                status="pending"
                clinicalReviewStatus="pending-clinical-review"
              />
            )}
          </div>

          {/* Right: Abnormal (Pathology) */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md inline-block border border-orange-200">
              {rightTitle} ({pathologyHighlightLabel})
            </span>
            {rightImageSrc ? (
              <div className="group relative w-full rounded-xl overflow-hidden bg-white border border-border-clinical shadow-sm flex flex-col p-3 hover:border-clinical-teal/50 transition-all duration-300">
                <div className="relative w-full aspect-[3/4] bg-[#0F172A] rounded-lg overflow-hidden">
                  <Image
                    src={rightImageSrc}
                    alt={rightTitle}
                    fill
                    sizes="(max-w-7xl) 50vw, 450px"
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
                    {rightBadgeLabel}
                  </span>
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
                    Clinical Reference
                  </span>
                </div>
              </div>
            ) : (
              <PlaceholderVisual
                title={rightTitle}
                type="comparison"
                placeholderLabel={rightPlaceholderLabel}
                dimensions={dimensions}
                status="pending"
                clinicalReviewStatus="pending-clinical-review"
              />
            )}
          </div>
        </div>
      )}

      {/* Detailed Point-by-Point Comparison (WCAG Compliant Alternative) */}
      {comparisonPoints && comparisonPoints.length > 0 && (
        <div className="bg-white border border-border-clinical rounded-xl overflow-hidden shadow-xs">
          <div className="sm:hidden divide-y divide-border-clinical/30">
            {comparisonPoints.map((item, idx) => (
              <article key={idx} className="p-3.5 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wide text-deep-navy break-words">
                  {item.feature}
                </h5>
                <div className="space-y-2.5">
                  <div className="rounded-lg border border-[#003B5C]/10 bg-[#003B5C]/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#003B5C] break-words">
                      {leftTitle}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-text-secondary break-words">
                      {item.normal}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200/70 bg-orange-50/40 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-orange-800 break-words">
                      {rightTitle}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-orange-900 break-words">
                      {item.abnormal}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-pale-clinical-blue/40 border-b border-border-clinical">
                  <th className="w-1/4 p-3 text-xs font-bold uppercase text-deep-navy break-words">Anatomical Feature</th>
                  <th className="w-[37.5%] p-3 text-xs font-bold uppercase text-[#003B5C] border-l border-border-clinical/60 break-words">{leftTitle}</th>
                  <th className="w-[37.5%] p-3 text-xs font-bold uppercase text-orange-800 border-l border-border-clinical/60 break-words">{rightTitle}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonPoints.map((item, idx) => (
                  <tr key={idx} className="border-b border-border-clinical/30 last:border-0 hover:bg-pale-clinical-blue/10">
                    <td className="p-3 text-xs font-bold text-deep-navy align-top break-words">{item.feature}</td>
                    <td className="p-3 text-xs text-text-secondary font-medium border-l border-border-clinical/60 align-top break-words">{item.normal}</td>
                    <td className="p-3 text-xs text-text-secondary font-medium border-l border-border-clinical/60 bg-orange-50/10 align-top break-words">
                      <span className="text-orange-900 font-semibold">{item.abnormal}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
