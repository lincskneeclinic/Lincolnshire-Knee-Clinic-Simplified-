"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PainRegion {
  id: "front" | "back" | "inner" | "outer";
  label: string;
  structures: string[];
  symptoms: string[];
  conditions: { name: string; slug: string }[];
  description: string;
}

interface PainLocationDiagramBlockProps {
  className?: string;
}

export const PainLocationDiagramBlock: React.FC<PainLocationDiagramBlockProps> = ({
  className = "",
}) => {
  const [selectedRegion, setSelectedRegion] = useState<"front" | "back" | "inner" | "outer">("front");

  const regions: Record<string, PainRegion> = {
    front: {
      id: "front",
      label: "Front of Knee (Anterior)",
      description: "Pain located around, behind, or directly below the kneecap (patella). This area is highly loaded during bending and stair climbing.",
      structures: ["Patella (Kneecap)", "Patellar Tendon", "Quadriceps Tendon", "Patellofemoral Joint Space"],
      symptoms: ["Aching behind kneecap after sitting", "Grinding or clicking when bending", "Stiffness climbing stairs", "Tenderness below kneecap"],
      conditions: [
        { name: "Patellofemoral Pain Syndrome", slug: "patellofemoral-pain" },
        { name: "Knee Arthritis", slug: "knee-arthritis" },
        { name: "Knee Tendinopathy (Patellar)", slug: "knee-tendinopathy" },
        { name: "Patellar Instability", slug: "patellar-instability" }
      ]
    },
    back: {
      id: "back",
      label: "Back of Knee (Posterior)",
      description: "Pain or fullness located in the hollow behind the knee (popliteal space). Often associated with fluid build-up secondary to internal joint issues.",
      structures: ["Popliteal Fossa", "Posterior Meniscus Horns", "Hamstring Tendons", "Baker's Cyst Pocket"],
      symptoms: ["Visible or feelable swelling behind knee", "Discomfort at full knee bending", "Tightness or pressure in popliteal space", "Aching radiating to calf"],
      conditions: [
        { name: "Baker's Cyst", slug: "bakers-cyst" },
        { name: "Meniscal Tear (Posterior Horn)", slug: "meniscal-tear" },
        { name: "Knee Arthritis", slug: "knee-arthritis" }
      ]
    },
    inner: {
      id: "inner",
      label: "Inner Side of Knee (Medial)",
      description: "Pain along the inner joint line. The medial compartment carries the majority of weight-bearing forces during normal gait.",
      structures: ["Medial Meniscus", "Medial Collateral Ligament (MCL)", "Medial Femoral Condyle Articular Cartilage"],
      symptoms: ["Localized joint line tenderness", "Pain twisting on a planted foot", "Clicking or catching on the inner side", "Mild local swelling"],
      conditions: [
        { name: "Medial Meniscal Tear", slug: "meniscal-tear" },
        { name: "Medial Compartment Arthritis", slug: "knee-arthritis" },
        { name: "Cartilage Injury", slug: "cartilage-injury" }
      ]
    },
    outer: {
      id: "outer",
      label: "Outer Side of Knee (Lateral)",
      description: "Pain along the outer joint line. Frequently related to sports injuries, pivoting strains, or lateral tracking forces.",
      structures: ["Lateral Meniscus", "Lateral Collateral Ligament (LCL)", "Iliotibial (IT) Band Attachment", "Lateral Trochlear Ridge"],
      symptoms: ["Joint line pain aggravated by running", "Sharp pain with pivoting or landing", "Snapping sensation outer knee", "Tenderness to touch"],
      conditions: [
        { name: "Lateral Meniscal Tear", slug: "meniscal-tear" },
        { name: "Knee Instability", slug: "knee-instability" },
        { name: "Cartilage Injury (Lateral compartment)", slug: "cartilage-injury" },
        { name: "Patellofemoral Tracking Issues", slug: "patellofemoral-pain" }
      ]
    }
  };

  const current = regions[selectedRegion];

  return (
    <div className={`space-y-6 ${className} font-sans`}>
      {/* Block Header */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Educational Pain Map Selector
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          Symptom Location Diagram
        </h4>
        <p className="text-xs text-text-secondary mt-1">
          Select a quadrant below to identify common anatomical structures and educational information.
        </p>
      </div>

      {/* Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Diagram / Buttons */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Target Diagram Indicator (Stylized SVG Knee Selector) */}
          <div className="bg-pale-clinical-blue/20 border border-border-clinical rounded-xl p-5 flex flex-col justify-center items-center h-48 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#00afc8_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
            
            {/* Minimal SVG Knee Indicator representing regions */}
            <svg className="w-20 h-20 text-deep-navy/35 relative z-10" fill="none" viewBox="0 0 100 100" stroke="currentColor" strokeWidth={1.5}>
              {/* Outer Knee Outline */}
              <path d="M50 15c-15 0-25 15-25 35 0 25 15 35 25 35s25-10 25-35c0-20-10-35-25-35z" />
              {/* Patella */}
              <circle cx="50" cy="45" r="10" strokeDasharray="3,3" />
              
              {/* Conditional highlights on SVG based on active tab */}
              {selectedRegion === "front" && <circle cx="50" cy="45" r="12" className="stroke-orange-500 fill-orange-500/10 animate-pulse" strokeWidth={2} />}
              {selectedRegion === "back" && <circle cx="50" cy="45" r="22" className="stroke-orange-500 fill-orange-500/10 animate-pulse" strokeWidth={2} />}
              {selectedRegion === "inner" && <path d="M25 50a8 8 0 110-16" className="stroke-orange-500 fill-orange-500/10 animate-pulse" strokeWidth={2.5} />}
              {selectedRegion === "outer" && <path d="M75 50a8 8 0 100-16" className="stroke-orange-500 fill-orange-500/10 animate-pulse" strokeWidth={2.5} />}
            </svg>

            {/* Quick Active Label */}
            <span className="text-[10px] font-bold text-deep-navy mt-3 uppercase tracking-widest relative z-10">
              Active: {current.label}
            </span>
          </div>

          {/* Region Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(regions) as Array<"front" | "back" | "inner" | "outer">).map((regId) => {
              const isActive = selectedRegion === regId;
              return (
                <button
                  key={regId}
                  type="button"
                  onClick={() => setSelectedRegion(regId)}
                  className={`py-3 px-3 rounded-lg border text-xs font-bold transition-all text-center focus-visible:outline-2 focus-visible:outline-clinical-teal ${
                    isActive
                      ? "bg-deep-navy border-deep-navy text-white shadow-xs"
                      : "bg-white border-border-clinical text-text-secondary hover:border-clinical-teal/60 hover:text-deep-navy hover:bg-pale-clinical-blue/20"
                  }`}
                >
                  {regions[regId].label.split(" (")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Informational Detail Card */}
        <div className="lg:col-span-7 bg-white border border-border-clinical rounded-xl p-5 md:p-6 text-left space-y-4 min-h-[300px] shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal">
              Anatomical Quadrant Analysis
            </span>
            <h5 className="font-serif text-base md:text-lg font-bold text-deep-navy mt-0.5">
              {current.label}
            </h5>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold mt-1">
              {current.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-clinical/30 pt-4">
            {/* Involved structures */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">Key Structures</span>
              <ul className="space-y-1.5 text-xs text-text-secondary font-medium">
                {current.structures.map((struct, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal" />
                    <span>{struct}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common presentation signs */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-deep-navy tracking-wider block">Common Presentations</span>
              <ul className="space-y-1.5 text-xs text-text-secondary font-medium">
                {current.symptoms.map((sym, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal" />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Associated conditions links (using coral ONLY for pathology highlights) */}
          <div className="border-t border-border-clinical/30 pt-4 space-y-2 bg-orange-50/10 p-3 rounded-lg border border-orange-100/50">
            <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block">
              Possible Related Pathologies
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {current.conditions.map((cond, idx) => (
                <Link
                  key={idx}
                  href={`/conditions/${cond.slug}`}
                  className="bg-white border border-orange-200 text-orange-800 text-[11px] font-bold px-3 py-1 rounded-md hover:bg-orange-50 hover:border-orange-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                >
                  {cond.name} &gt;
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pathway/Diagnostic Disclaimer */}
      <div className="bg-pale-clinical-blue/20 border border-border-clinical/40 p-4 rounded-xl text-left flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
        <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="space-y-0.5">
          <span className="font-bold text-deep-navy block uppercase tracking-wider text-[10px]">Educational Disclaimer</span>
          <span>
            This symptom location map is purely educational and non-diagnostic. Similar symptoms can arise from a wide range of mechanical, degenerative, or inflammatory causes. A full clinical examination and dynamic orthopedic assessment are required to determine a clinical diagnosis.
          </span>
        </div>
      </div>
    </div>
  );
};
