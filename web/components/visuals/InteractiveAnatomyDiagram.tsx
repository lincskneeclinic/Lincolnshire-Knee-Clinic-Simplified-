"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";

// ============================================================
// InteractiveAnatomyDiagram
//
// Upgraded Pass 2 (Textbook Style) — High-fidelity anatomy book picture
// knee diagram. Renders a realistic vintage engraving of the knee
// joint from the front and overlays interactive absolute-positioned
// hotspot buttons.
//
// Selectable regions via click / keyboard / touch.
// Reduced-motion: no pulse animations.
// Non-interactive fallback: static details list.
// Awaiting clinical review notice included.
// ============================================================

interface AnatomyRegion {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  structures: string[];
  pathologyRegion?: boolean;
}

interface InteractiveAnatomyDiagramProps {
  /** Highlight a pathology region by ID (e.g. "articular-cartilage") */
  activePathologyId?: string;
  /** Title for context (e.g. "Knee Arthritis") */
  conditionContext?: string;
  className?: string;
}

const anatomyRegions: AnatomyRegion[] = [
  {
    id: "femur",
    label: "Femur (Thigh Bone)",
    shortLabel: "Femur",
    description: "The lower end of the femur forms the upper part of the knee joint. The rounded medial and lateral condyles glide and pivot on the tibial plateau.",
    structures: ["Medial femoral condyle", "Lateral femoral condyle", "Trochlear groove", "Epicondyles"],
  },
  {
    id: "patella",
    label: "Patella (Kneecap)",
    shortLabel: "Patella",
    description: "A triangular sesamoid bone embedded in the quadriceps and patellar tendon complex. It glides through the trochlear groove, protecting the joint front and multiplying quadriceps leverage.",
    structures: ["Articular facets", "Base and apex", "Trochlear articulation zone"],
  },
  {
    id: "tibia",
    label: "Tibia (Shin Bone)",
    shortLabel: "Tibia",
    description: "The main weight-bearing shin bone. The flat tibial plateau forms the lower surface of the knee joint, carrying the menisci.",
    structures: ["Medial tibial plateau", "Lateral tibial plateau", "Tibial tuberosity (tendon attachment)"],
  },
  {
    id: "fibula",
    label: "Fibula (Calf Bone)",
    shortLabel: "Fibula",
    description: "The smaller outer shin bone. It does not carry joint weight directly but serves as an attachment point for the lateral collateral ligament (LCL) and biceps femoris muscle.",
    structures: ["Fibular head", "Proximal tibiofibular joint"],
  },
  {
    id: "articular-cartilage",
    label: "Articular Cartilage",
    shortLabel: "Cartilage",
    description: "Smooth, wear-resistant hyaline cartilage that caps the ends of the femur and tibia. It provides an extremely low-friction surface, distributing weight and protecting subchondral bone.",
    structures: ["Femoral hyaline cartilage", "Tibial plateau cartilage caps"],
    pathologyRegion: true,
  },
  {
    id: "medial-meniscus",
    label: "Medial Meniscus",
    shortLabel: "Med. Meniscus",
    description: "A thick, C-shaped fibrocartilage shock absorber on the inner side of the knee joint. It spreads load, improves bone congruency, and aids joint stability.",
    structures: ["Anterior horn", "Body", "Posterior horn"],
    pathologyRegion: true,
  },
  {
    id: "lateral-meniscus",
    label: "Lateral Meniscus",
    shortLabel: "Lat. Meniscus",
    description: "A circular fibrocartilage shock absorber on the outer side. It is slightly more mobile than the medial meniscus, assisting load transmission across the lateral joint compartment.",
    structures: ["Anterior horn", "Body", "Posterior horn"],
    pathologyRegion: true,
  },
  {
    id: "acl",
    label: "Anterior Cruciate Ligament (ACL)",
    shortLabel: "ACL",
    description: "A key stabilizing ligament running diagonally deep inside the joint. It prevents the tibia from sliding forward on the femur and controls knee pivoting rotation.",
    structures: ["Anteromedial bundle", "Posterolateral bundle"],
    pathologyRegion: true,
  },
  {
    id: "pcl",
    label: "Posterior Cruciate Ligament (PCL)",
    shortLabel: "PCL",
    description: "The strongest ligament inside the knee, crossing behind the ACL. It prevents the tibia from sliding backward on the femur.",
    structures: ["Anterolateral bundle", "Posteromedial bundle"],
  },
  {
    id: "patellar-tendon",
    label: "Patellar Tendon",
    shortLabel: "Patellar Tendon",
    description: "A strong fibrous band connecting the patella bottom to the tibial tuberosity on the shin bone, transmitting quadriceps extension force.",
    structures: ["Patellar tendon fibers", "Tibial tuberosity insertion"],
  },
  {
    id: "quadriceps-tendon",
    label: "Quadriceps Tendon",
    shortLabel: "Quad Tendon",
    description: "The thick tendon connecting the quadriceps muscles to the top of the patella. Essential for extending the knee joint.",
    structures: ["Quadriceps tendon fibers", "Patellar attachment"],
  },
];

// Absolute coordinates of hotspots mapped over /images/illustrations/knee-anatomy-book.png
const hotspotCoordinates: Record<string, { top: string; left: string }> = {
  femur: { top: "18%", left: "50%" },
  patella: { top: "38%", left: "50%" },
  tibia: { top: "82%", left: "50%" },
  fibula: { top: "82%", left: "70%" },
  "articular-cartilage": { top: "49%", left: "38%" },
  "medial-meniscus": { top: "58%", left: "30%" },
  "lateral-meniscus": { top: "58%", left: "70%" },
  acl: { top: "54%", left: "46%" },
  pcl: { top: "52%", left: "54%" },
  "patellar-tendon": { top: "62%", left: "47%" },
  "quadriceps-tendon": { top: "28%", left: "47%" },
};

type AnatomyCategory = "all" | "bones" | "cartilage-menisci" | "ligaments-tendons";

const categoryMap: Record<string, AnatomyCategory> = {
  femur: "bones",
  patella: "bones",
  tibia: "bones",
  fibula: "bones",
  "articular-cartilage": "cartilage-menisci",
  "medial-meniscus": "cartilage-menisci",
  "lateral-meniscus": "cartilage-menisci",
  acl: "ligaments-tendons",
  pcl: "ligaments-tendons",
  "patellar-tendon": "ligaments-tendons",
  "quadriceps-tendon": "ligaments-tendons",
};

const categories = [
  { id: "all", label: "Show All" },
  { id: "bones", label: "Bones" },
  { id: "cartilage-menisci", label: "Cartilage & Menisci" },
  { id: "ligaments-tendons", label: "Ligaments & Tendons" },
] as const;

export const InteractiveAnatomyDiagram: React.FC<InteractiveAnatomyDiagramProps> = ({
  activePathologyId,
  conditionContext,
  className = "",
}) => {
  const [activeCategory, setActiveCategory] = useState<AnatomyCategory>(() => {
    if (activePathologyId) {
      return categoryMap[activePathologyId] || "all";
    }
    return "all";
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRegions = activeCategory === "all"
    ? anatomyRegions
    : anatomyRegions.filter((r) => categoryMap[r.id] === activeCategory);

  const selected = anatomyRegions.find((r) => r.id === selectedId);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handlePrevAnatomy = useCallback(() => {
    const idx = filteredRegions.findIndex((r) => r.id === selectedId);
    if (idx === -1) {
      setSelectedId(filteredRegions[0].id);
    } else {
      const prevIdx = (idx - 1 + filteredRegions.length) % filteredRegions.length;
      setSelectedId(filteredRegions[prevIdx].id);
    }
  }, [filteredRegions, selectedId]);

  const handleNextAnatomy = useCallback(() => {
    const idx = filteredRegions.findIndex((r) => r.id === selectedId);
    if (idx === -1) {
      setSelectedId(filteredRegions[0].id);
    } else {
      const nextIdx = (idx + 1) % filteredRegions.length;
      setSelectedId(filteredRegions[nextIdx].id);
    }
  }, [filteredRegions, selectedId]);

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Educational Anatomy Illustration
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          Interactive Knee Anatomy (Textbook Engraving)
          {conditionContext && ` — ${conditionContext}`}
        </h4>
        <p className="text-xs text-text-secondary mt-1">
          Select any numbered hotspot on the anatomy book illustration below to view details. Use the category filters to simplify the view.
        </p>
      </div>

      {/* Clinical Review Notice */}
      <div className="flex items-center gap-2 text-[10px] text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-bold">Educational illustration — awaiting clinical review before use as a clinical reference.</span>
      </div>

      {/* Category Filter Tabs with 44px tap target height */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Anatomy category selector">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            type="button"
            aria-selected={activeCategory === cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedId(null);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal min-h-[44px] ${
              activeCategory === cat.id
                ? "bg-deep-navy border-deep-navy text-white"
                : "bg-white border-border-clinical text-text-secondary hover:border-clinical-teal hover:text-deep-navy"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Diagram Area with Dynamic Stacking & Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Textbook Image with Hotspots overlay */}
        <div className="lg:col-span-6 bg-white border border-border-clinical rounded-xl p-4 flex items-center justify-center relative overflow-hidden shadow-sm">
          <div className="relative w-full h-[320px] md:h-[400px] lg:h-[360px]">
            <Image
              src="/images/illustrations/knee-anatomy-book.png"
              alt="Anatomy book engraving of the human knee joint"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain filter contrast-[1.05]"
              loading="lazy"
            />

            {/* Hotspot buttons - 44px tap targets on mobile/tablet, 28px on desktop */}
            {filteredRegions.map((region) => {
              const coords = hotspotCoordinates[region.id];
              if (!coords) return null;

              const idx = anatomyRegions.findIndex((r) => r.id === region.id);
              const isSelected = selectedId === region.id;
              const isPathology = activePathologyId === region.id;

              return (
                <div
                  key={region.id}
                  style={{ top: coords.top, left: coords.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    aria-label={`Structure ${idx + 1}: ${region.label}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(region.id)}
                    className={`w-11 h-11 lg:w-7 lg:h-7 rounded-full border-2 border-white text-white text-xs lg:text-[10px] font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                      isSelected
                        ? "bg-clinical-teal scale-110"
                        : isPathology
                        ? "bg-orange-500 motion-safe:animate-pulse"
                        : "bg-deep-navy/80 hover:bg-clinical-teal"
                    }`}
                  >
                    {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel - Hidden on Mobile */}
        <div className="hidden md:block lg:col-span-6 bg-white border border-border-clinical rounded-xl p-5 md:p-6 text-left space-y-4 min-h-[260px] shadow-sm">
          {selected ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block">
                  Selected Structure
                </span>
                <h5 className="font-serif text-base md:text-lg font-bold text-deep-navy mt-0.5">
                  {selected.label}
                </h5>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold mt-2">
                  {selected.description}
                </p>
              </div>

              {selected.structures.length > 0 && (
                <div className="border-t border-border-clinical/30 pt-3 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                    Key Components
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-secondary font-medium">
                    {selected.structures.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.pathologyRegion && (
                <div className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded font-bold">
                  This structure may be affected by the selected condition.
                </div>
              )}

              {/* Touch-Friendly Prev/Next Navigation Controls for Tablets */}
              <div className="flex justify-between items-center pt-4 border-t border-border-clinical/30">
                <button
                  type="button"
                  onClick={handlePrevAnatomy}
                  className="px-3.5 py-2 rounded-lg border border-border-clinical text-xs font-bold text-text-secondary hover:bg-pale-clinical-blue/20 flex items-center gap-1.5 min-h-[44px] min-w-[110px] justify-center transition-colors"
                >
                  ← Prev Structure
                </button>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Structure {filteredRegions.findIndex((r) => r.id === selectedId) + 1 || 1} of {filteredRegions.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextAnatomy}
                  className="px-3.5 py-2 rounded-lg border border-border-clinical text-xs font-bold text-text-secondary hover:bg-pale-clinical-blue/20 flex items-center gap-1.5 min-h-[44px] min-w-[110px] justify-center transition-colors"
                >
                  Next Structure →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
              <div className="w-10 h-10 rounded-full bg-pale-clinical-blue/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <p className="text-xs text-text-muted font-semibold animate-pulse">
                Select a numbered hotspot on the illustration or use the Prev/Next buttons below to browse.
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={handlePrevAnatomy}
                  className="px-3 py-1.5 rounded-lg border border-border-clinical text-xs font-bold text-text-secondary hover:bg-pale-clinical-blue/20 min-h-[44px] min-w-[100px]"
                >
                  Start Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Only Accordion Selection List - Expandable Text Below Visual */}
      <div className="block md:hidden space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
          Anatomy Details by Structure
        </span>
        {filteredRegions.map((region) => {
          const idx = anatomyRegions.findIndex((r) => r.id === region.id);
          const isExpanded = selectedId === region.id;
          return (
            <div key={region.id} className="border border-border-clinical rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(isExpanded ? null : region.id);
                }}
                aria-expanded={isExpanded}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between font-bold text-deep-navy hover:bg-pale-clinical-blue/10 transition-colors min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-xs">
                  <span className={`w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center font-bold transition-colors ${
                    isExpanded ? "bg-clinical-teal" : "bg-deep-navy"
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{region.shortLabel}</span>
                </span>
                <svg
                  className={`w-4 h-4 text-clinical-teal transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border-clinical/30 space-y-4 text-left">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-deep-navy">
                      {region.label}
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold mt-1">
                      {region.description}
                    </p>
                  </div>

                  {region.structures.length > 0 && (
                    <div className="border-t border-border-clinical/30 pt-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                        Key Components
                      </span>
                      <ul className="space-y-1 text-xs text-text-secondary font-medium">
                        {region.structures.map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {region.pathologyRegion && (
                    <div className="text-[9px] text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded font-bold mt-1">
                      This structure may be affected by the selected condition.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Non-interactive fallback list (visible without JS) */}
      <details className="border border-border-clinical/40 rounded-xl overflow-hidden text-xs">
        <summary className="bg-pale-clinical-blue/20 px-4 py-3 font-bold text-deep-navy cursor-pointer hover:bg-pale-clinical-blue/40 transition-colors">
          View all structures as text list
        </summary>
        <ul className="divide-y divide-border-clinical/20">
          {anatomyRegions.map((region) => (
            <li key={region.id} className="px-4 py-3 space-y-0.5">
              <span className="font-bold text-deep-navy block">{region.label}</span>
              <p className="text-text-secondary leading-relaxed">{region.description}</p>
            </li>
          ))}
        </ul>
      </details>

      {/* Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-4 rounded-xl text-left flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Educational illustration only.</strong> This diagram is an educational representation of knee anatomy and is awaiting formal clinical review. It is not a clinical reference, does not represent any specific patient, and must not be used for diagnosis or treatment decisions.
        </span>
      </div>
    </div>
  );
};
