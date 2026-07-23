"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ============================================================
// PainLocationMap
//
// Upgraded Pass 2 (Textbook Style) — High-fidelity educational pain
// location map. Renders real photographic knee silhouettes for all
// views (Front, Back, Inner, Outer) and overlays interactive hotspot
// buttons for localizing symptoms.
//
// STRICT RULES:
// - Must display: "Pain location alone cannot determine the cause of knee symptoms."
// - Educational links to symptom pages only — not diagnoses
// - No automated triage
// - Keyboard navigable regions
// ============================================================

type KneeView = "front" | "back" | "inner" | "outer";

interface PainRegion {
  id: string;
  view: KneeView;
  label: string;
  shortLabel: string;
  description: string;
  structures: string[];
  presentations: string[];
  conditions: { name: string; slug: string }[];
  top: string;
  left: string;
}

const painRegions: PainRegion[] = [
  // FRONT VIEW
  {
    id: "front-patella",
    view: "front",
    label: "Around the Kneecap (Anterior)",
    shortLabel: "Kneecap Region",
    description: "Pain around or behind the kneecap (patella). Often worsened by stairs, squatting, or prolonged sitting.",
    structures: ["Patella", "Patellar tendon", "Quadriceps tendon", "Patellofemoral joint"],
    presentations: ["Aching behind kneecap", "Grinding when bending", "Stiffness after sitting"],
    conditions: [
      { name: "Patellofemoral Pain", slug: "patellofemoral-pain" },
      { name: "Patellar Instability", slug: "patellar-instability" },
      { name: "Knee Tendinopathy", slug: "knee-tendinopathy" },
    ],
    top: "42%",
    left: "50%",
  },
  {
    id: "front-lateral",
    view: "front",
    label: "Outer Joint Line (Lateral)",
    shortLabel: "Outer Side",
    description: "Pain along the outer joint line. Often related to sports injuries, pivoting movements, or lateral compartment problems.",
    structures: ["Lateral meniscus", "Lateral collateral ligament", "IT band attachment"],
    presentations: ["Outer joint line pain", "Sharp pain with pivoting", "Snapping on the outer knee"],
    conditions: [
      { name: "Lateral Meniscal Tear", slug: "meniscal-tear" },
      { name: "Knee Instability", slug: "knee-instability" },
      { name: "Cartilage Injury", slug: "cartilage-injury" },
    ],
    top: "52%",
    left: "35%",
  },
  {
    id: "front-medial",
    view: "front",
    label: "Inner Joint Line (Medial)",
    shortLabel: "Inner Side",
    description: "Pain along the inner side of the knee joint line. The medial compartment bears the majority of weight-bearing load.",
    structures: ["Medial meniscus", "Medial collateral ligament", "Medial femoral condyle"],
    presentations: ["Joint line tenderness on the inside", "Pain on twisting", "Clicking on the inner side"],
    conditions: [
      { name: "Medial Meniscal Tear", slug: "meniscal-tear" },
      { name: "Knee Arthritis", slug: "knee-arthritis" },
      { name: "Cartilage Injury", slug: "cartilage-injury" },
    ],
    top: "52%",
    left: "65%",
  },

  // BACK VIEW
  {
    id: "back-popliteal",
    view: "back",
    label: "Behind the Knee (Posterior)",
    shortLabel: "Back of Knee",
    description: "Pain, swelling, or fullness in the hollow behind the knee (popliteal fossa). Often secondary to an internal joint problem.",
    structures: ["Popliteal fossa", "Posterior meniscal horns", "Baker's cyst pocket", "Hamstring tendons"],
    presentations: ["Visible swelling behind knee", "Discomfort at full knee bending", "Tightness or pressure"],
    conditions: [
      { name: "Baker's Cyst", slug: "bakers-cyst" },
      { name: "Meniscal Tear (Posterior Horn)", slug: "meniscal-tear" },
      { name: "Knee Arthritis", slug: "knee-arthritis" },
    ],
    top: "50%",
    left: "50%",
  },

  // INNER VIEW
  {
    id: "inner-medial",
    view: "inner",
    label: "Medial (Inner) Compartment",
    shortLabel: "Inner Compartment",
    description: "Pain along the inner side of the knee. The medial compartment is the most commonly affected by arthritis and meniscal tears.",
    structures: ["Medial meniscus", "Medial tibial plateau", "MCL", "Pes anserinus tendons"],
    presentations: ["Weight-bearing pain on the inside", "Stiffness in the morning", "Tenderness along inner joint line"],
    conditions: [
      { name: "Knee Arthritis (Medial)", slug: "knee-arthritis" },
      { name: "Medial Meniscal Tear", slug: "meniscal-tear" },
      { name: "Cartilage Injury", slug: "cartilage-injury" },
    ],
    top: "50%",
    left: "50%",
  },

  // OUTER VIEW
  {
    id: "outer-lateral",
    view: "outer",
    label: "Lateral (Outer) Compartment",
    shortLabel: "Outer Compartment",
    description: "Pain along the outer knee compartment. Lateral problems are less common but frequently sports-related.",
    structures: ["Lateral meniscus", "LCL", "IT band", "Lateral femoral condyle"],
    presentations: ["Lateral joint line pain", "Running-related outer knee pain", "Feeling of instability"],
    conditions: [
      { name: "Lateral Meniscal Tear", slug: "meniscal-tear" },
      { name: "Knee Instability", slug: "knee-instability" },
      { name: "Patellofemoral Pain", slug: "patellofemoral-pain" },
    ],
    top: "50%",
    left: "50%",
  },
];

interface PainLocationMapProps {
  className?: string;
  /** Pre-select a view for symptom-specific pages */
  defaultView?: KneeView;
}

export const PainLocationMap: React.FC<PainLocationMapProps> = ({
  className = "",
  defaultView = "front",
}) => {
  const [activeView, setActiveView] = useState<KneeView>(defaultView);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const currentViewRegions = painRegions.filter((r) => r.view === activeView);
  const selectedRegion = painRegions.find((r) => r.id === selectedRegionId && r.view === activeView);

  const handleRegionClick = useCallback((id: string) => {
    setSelectedRegionId((prev) => (prev === id ? null : id));
  }, []);

  const handlePrevRegion = useCallback(() => {
    const idx = currentViewRegions.findIndex((r) => r.id === selectedRegionId);
    if (idx === -1) {
      setSelectedRegionId(currentViewRegions[0].id);
    } else {
      const prevIdx = (idx - 1 + currentViewRegions.length) % currentViewRegions.length;
      setSelectedRegionId(currentViewRegions[prevIdx].id);
    }
  }, [currentViewRegions, selectedRegionId]);

  const handleNextRegion = useCallback(() => {
    const idx = currentViewRegions.findIndex((r) => r.id === selectedRegionId);
    if (idx === -1) {
      setSelectedRegionId(currentViewRegions[0].id);
    } else {
      const nextIdx = (idx + 1) % currentViewRegions.length;
      setSelectedRegionId(currentViewRegions[nextIdx].id);
    }
  }, [currentViewRegions, selectedRegionId]);

  const viewLabels: Record<KneeView, string> = {
    front: "Front (Anterior)",
    back: "Back (Posterior)",
    inner: "Inner (Medial)",
    outer: "Outer (Lateral)",
  };

  const getKneeImageSrc = (view: KneeView) => {
    switch (view) {
      case "front":
        return "/images/illustrations/real-knee-front-v2.png";
      case "back":
        return "/images/illustrations/real-knee-back-v2.png";
      case "inner":
        return "/images/illustrations/real-knee-medial-v2.png";
      case "outer":
        return "/images/illustrations/real-knee-lateral-v2.png";
    }
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* MANDATORY DISCLAIMER */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
          Important — Educational Information Only
        </p>
        <p className="text-xs text-amber-900 font-semibold leading-relaxed">
          <strong>Pain location alone cannot determine the cause of knee symptoms.</strong> This map provides educational information about anatomical structures and possible associations. It is not a diagnostic tool. A clinical examination by a qualified specialist is required to determine the cause of your knee pain.
        </p>
      </div>

      {/* Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Educational Pain Location Map
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          Knee Pain Location — Educational Guide
        </h4>
        <p className="text-xs text-text-secondary mt-1">
          Select a view and tap a numbered hotspot on the photograph to view associated educational information.
        </p>
      </div>

      {/* View selector tabs with 44px tap target height */}
      <div className="flex flex-wrap gap-2 animate-none" role="tablist" aria-label="Knee view selector">
        {(Object.keys(viewLabels) as KneeView[]).map((view) => (
          <button
            key={view}
            role="tab"
            type="button"
            aria-selected={activeView === view}
            onClick={() => {
              setActiveView(view);
              setSelectedRegionId(null);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal min-h-[44px] ${
              activeView === view
                ? "bg-deep-navy border-deep-navy text-white"
                : "bg-white border-border-clinical text-text-secondary hover:border-clinical-teal hover:text-deep-navy"
            }`}
          >
            {viewLabels[view]}
          </button>
        ))}
      </div>

      {/* Main Diagram Area with Dynamic Stacking & Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Knee Photo Visual Container */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3">
          <div className="bg-white border border-border-clinical rounded-xl p-4 w-full flex justify-center relative overflow-hidden shadow-sm">
            {/* Responsive Silhouette Sizes */}
            <div className="relative w-full h-[260px] md:h-[320px] lg:h-[260px] max-w-[200px] md:max-w-[240px] lg:max-w-[200px]">
              <Image
                src={getKneeImageSrc(activeView)}
                alt={`Photograph of human leg showing the ${viewLabels[activeView]} view of the knee`}
                fill
                sizes="(max-width: 768px) 200px, (max-width: 1024px) 240px, 200px"
                className="object-contain"
                loading="lazy"
              />

              {/* Hotspot buttons - 44px tap targets on mobile/tablet, 32px on desktop */}
              {currentViewRegions.map((region, idx) => (
                <div
                  key={region.id}
                  style={{ top: region.top, left: region.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    aria-label={`Select region: ${region.label}`}
                    aria-pressed={selectedRegionId === region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className={`w-11 h-11 lg:w-8 lg:h-8 rounded-full border-2 border-white text-white text-xs lg:text-[10px] font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                      selectedRegionId === region.id
                        ? "bg-clinical-teal scale-110"
                        : "bg-orange-500/90 hover:bg-clinical-teal"
                    }`}
                  >
                    {idx + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-text-muted text-center font-semibold">
            Tap or click a numbered hotspot
          </p>
        </div>

        {/* Desktop & Tablet Detail Panel - Hidden on Mobile */}
        <div className="hidden md:block lg:col-span-7 bg-white border border-border-clinical rounded-xl p-5 md:p-6 text-left space-y-5 min-h-[260px] shadow-sm w-full">
          {selectedRegion ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block">
                  Selected Region — Educational Information
                </span>
                <h5 className="font-serif text-base md:text-lg font-bold text-deep-navy mt-0.5">
                  {selectedRegion.label}
                </h5>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold mt-2">
                  {selectedRegion.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-clinical/30 pt-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                    Key Structures in this Area
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-secondary font-medium">
                    {selectedRegion.structures.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                    Common Presentations
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-secondary font-medium">
                    {selectedRegion.presentations.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50/60 border border-orange-100 rounded-lg p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block">
                  Possible Educational Associations
                </span>
                <p className="text-[10px] text-orange-700 font-semibold leading-relaxed">
                  These are educational associations only. Pain in this location can arise from many different conditions. A clinical assessment is required.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedRegion.conditions.map((cond, idx) => (
                    <Link
                      key={idx}
                      href={`/conditions/${cond.slug}`}
                      className="bg-white border border-orange-200 text-orange-800 text-[11px] font-bold px-3 py-1 rounded-md hover:bg-orange-50 hover:border-orange-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 min-h-[32px] flex items-center justify-center"
                    >
                      {cond.name} →
                    </Link>
                  ))}
                </div>
              </div>

              {/* Touch-Friendly Prev/Next Navigation Controls for Tablets */}
              <div className="flex justify-between items-center pt-4 border-t border-border-clinical/30">
                <button
                  type="button"
                  onClick={handlePrevRegion}
                  className="px-3.5 py-2 rounded-lg border border-border-clinical text-xs font-bold text-text-secondary hover:bg-pale-clinical-blue/20 flex items-center gap-1.5 min-h-[44px] min-w-[110px] justify-center transition-colors"
                >
                  ← Prev Region
                </button>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Region {currentViewRegions.findIndex((r) => r.id === selectedRegionId) + 1 || 1} of {currentViewRegions.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextRegion}
                  className="px-3.5 py-2 rounded-lg border border-border-clinical text-xs font-bold text-text-secondary hover:bg-pale-clinical-blue/20 flex items-center gap-1.5 min-h-[44px] min-w-[110px] justify-center transition-colors"
                >
                  Next Region →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
              <div className="w-10 h-10 rounded-full bg-pale-clinical-blue/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <p className="text-xs text-text-muted font-semibold animate-pulse">
                Select a numbered hotspot on the {viewLabels[activeView]} photograph or use the Prev/Next buttons below to browse.
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={handlePrevRegion}
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
          Symptom Details by Region
        </span>
        {currentViewRegions.map((region, idx) => {
          const isExpanded = selectedRegionId === region.id;
          return (
            <div key={region.id} className="border border-border-clinical rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedRegionId(isExpanded ? null : region.id)}
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

                  <div className="space-y-3 border-t border-border-clinical/30 pt-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                        Key Structures
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

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">
                        Common Presentations
                      </span>
                      <ul className="space-y-1 text-xs text-text-secondary font-medium">
                        {region.presentations.map((p, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-orange-50/60 border border-orange-100 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block">
                      Possible Educational Associations
                    </span>
                    <p className="text-[9px] text-orange-700 font-semibold leading-relaxed">
                      These are educational associations only. Pain in this location can arise from many different conditions. A clinical assessment is required.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {region.conditions.map((cond, idx) => (
                        <Link
                          key={idx}
                          href={`/conditions/${cond.slug}`}
                          className="bg-white border border-orange-200 text-orange-800 text-[10px] font-bold px-2.5 py-1 rounded hover:bg-orange-50 transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          {cond.name} →
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Non-interactive text fallback */}
      <details className="border border-border-clinical/40 rounded-xl overflow-hidden text-xs">
        <summary className="bg-pale-clinical-blue/20 px-4 py-3 font-bold text-deep-navy cursor-pointer hover:bg-pale-clinical-blue/40 transition-colors">
          View all regions as text (accessible fallback)
        </summary>
        <div className="divide-y divide-border-clinical/20">
          {(Object.keys(viewLabels) as KneeView[]).map((view) => (
            <div key={view} className="px-4 py-4 space-y-3">
              <h5 className="font-bold text-deep-navy uppercase tracking-wider text-[11px]">
                {viewLabels[view]} View
              </h5>
              {painRegions.filter((r) => r.view === view).map((region) => (
                <div key={region.id} className="space-y-1 pl-3 border-l border-clinical-teal/30">
                  <p className="font-bold text-deep-navy">{region.label}</p>
                  <p className="text-text-secondary leading-relaxed">{region.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {region.conditions.map((c, i) => (
                      <Link
                        key={i}
                        href={`/conditions/${c.slug}`}
                        className="text-clinical-teal text-[11px] font-bold hover:underline"
                      >
                        → {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
