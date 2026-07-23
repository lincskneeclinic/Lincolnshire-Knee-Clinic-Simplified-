import React from "react";
import Link from "next/link";
import Image from "next/image";

// ============================================================
// ImageHotspotDiagram
//
// Hotspot overlay on an approved illustration.
// Falls back to static annotation list when no image or JS unavailable.
// Keyboard navigable hotspots with ARIA.
// Touch tap supported.
// ============================================================

export interface Hotspot {
  id: string;
  x: number; // percentage from left (0–100)
  y: number; // percentage from top (0–100)
  label: string;
  description: string;
  pathology?: boolean;
}

interface ImageHotspotDiagramProps {
  title: string;
  imageSrc?: string; // omit if not yet approved
  altText: string;
  hotspots: Hotspot[];
  caption?: string;
  className?: string;
}

// Client wrapper for interactivity — only rendered client-side
import { HotspotInteractive } from "./ImageHotspotDiagramInteractive";

export const ImageHotspotDiagram: React.FC<ImageHotspotDiagramProps> = ({
  title,
  imageSrc,
  altText,
  hotspots,
  caption,
  className = "",
}) => {
  return (
    <div className={`space-y-4 font-sans ${className}`}>
      <div className="border-b border-border-clinical/30 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Annotated Diagram
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">{title}</h4>
      </div>

      {/* Interactive version — client component */}
      <HotspotInteractive
        imageSrc={imageSrc}
        altText={altText}
        hotspots={hotspots}
        title={title}
      />

      {caption && (
        <p className="text-xs italic text-text-muted leading-relaxed">{caption}</p>
      )}

      {/* Non-interactive annotation list fallback (always visible) */}
      <details className="border border-border-clinical/40 rounded-xl overflow-hidden text-xs">
        <summary className="bg-pale-clinical-blue/20 px-4 py-3 font-bold text-deep-navy cursor-pointer hover:bg-pale-clinical-blue/40 transition-colors">
          View annotations as text list
        </summary>
        <ul className="divide-y divide-border-clinical/20">
          {hotspots.map((hs) => (
            <li key={hs.id} className="px-4 py-3 flex gap-3 items-start">
              <span className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${hs.pathology ? "bg-orange-500" : "bg-clinical-teal"}`} aria-hidden="true" />
              <div className="space-y-0.5">
                <span className="font-bold text-deep-navy block">{hs.label}</span>
                <p className="text-text-secondary leading-relaxed">{hs.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};
