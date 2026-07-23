"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PlaceholderVisual } from "./PlaceholderVisual";
import type { Hotspot } from "./ImageHotspotDiagram";

interface HotspotInteractiveProps {
  imageSrc?: string;
  altText: string;
  hotspots: Hotspot[];
  title: string;
}

export const HotspotInteractive: React.FC<HotspotInteractiveProps> = ({
  imageSrc,
  altText,
  hotspots,
  title,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border-clinical bg-white">
      {imageSrc ? (
        <div className="relative w-full h-[280px] md:h-[380px]">
          <Image
            src={imageSrc}
            alt={altText}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-contain"
            loading="lazy"
          />
          {/* Hotspot markers */}
          {hotspots.map((hs) => (
            <div
              key={hs.id}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                aria-label={hs.label}
                aria-pressed={activeId === hs.id}
                aria-describedby={`desc-${hs.id}`}
                onClick={() => setActiveId(activeId === hs.id ? null : hs.id)}
                className={`w-7 h-7 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white motion-reduce:animate-none motion-safe:animate-pulse ${hs.pathology ? "bg-orange-500" : "bg-clinical-teal"}`}
              >
                {hs.label.charAt(0)}
              </button>
              {activeId === hs.id && (
                <div
                  id={`desc-${hs.id}`}
                  role="tooltip"
                  className="absolute bottom-9 left-1/2 -translate-x-1/2 w-52 bg-deep-navy text-white rounded-lg p-2.5 text-[11px] shadow-lg z-30 border border-border-clinical/30"
                >
                  <span className="font-bold block mb-0.5">{hs.label}</span>
                  <p className="text-pale-clinical-blue/90 leading-relaxed">{hs.description}</p>
                  {hs.pathology && (
                    <span className="block mt-1 text-[9px] font-bold uppercase tracking-wider text-orange-400">
                      Pathology highlight
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <PlaceholderVisual
          title={title}
          type="anatomy"
          placeholderLabel="Annotated illustration pending clinical review"
          dimensions={{ width: 700, height: 350 }}
          status="pending"
          clinicalReviewStatus="pending-clinical-review"
        />
      )}
    </div>
  );
};
