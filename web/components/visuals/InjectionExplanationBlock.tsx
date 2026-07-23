"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlaceholderVisual } from "./PlaceholderVisual";

// Static imports to force-bust Next.js image caching
import corticosteroidAnatomyImg from "@/public/images/injections/corticosteroid-anatomy.png";
import corticosteroidPathImg from "@/public/images/injections/corticosteroid-path.png";
import hyaluronicAcidAnatomyImg from "@/public/images/injections/hyaluronic-acid-anatomy.png";
import hyaluronicAcidPathImg from "@/public/images/injections/hyaluronic-acid-path.png";
import prpAnatomyImg from "@/public/images/injections/prp-anatomy.png";
import prpPathImg from "@/public/images/injections/prp-path.png";
import arthrosamidAnatomyImg from "@/public/images/injections/arthrosamid-anatomy.png";
import arthrosamidPathImg from "@/public/images/injections/arthrosamid-path.png";

const anatomyImages: Record<string, any> = {
  corticosteroid: corticosteroidAnatomyImg,
  "hyaluronic-acid": hyaluronicAcidAnatomyImg,
  prp: prpAnatomyImg,
  arthrosamid: arthrosamidAnatomyImg,
};

const pathImages: Record<string, any> = {
  corticosteroid: corticosteroidPathImg,
  "hyaluronic-acid": hyaluronicAcidPathImg,
  prp: prpPathImg,
  arthrosamid: arthrosamidPathImg,
};

interface InjectionExplanationBlockProps {
  injectionName: string;
  injectionSlug: string;
  procedureSteps: string[];
  aftercareSteps: string[];
  hasUltrasoundGuidance?: boolean;
  comparisonProps?: {
    onset: string;
    duration: string;
    primaryEffect: string;
    suitability: string;
  };
  className?: string;
}

export const InjectionExplanationBlock: React.FC<InjectionExplanationBlockProps> = ({
  injectionName,
  injectionSlug,
  procedureSteps,
  aftercareSteps,
  hasUltrasoundGuidance = true,
  comparisonProps,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"procedure" | "aftercare">("procedure");
  
  // Clean up name to prevent duplicate "Injection" words (e.g., "Corticosteroid Injection Injection Target")
  const baseName = injectionName.replace(/\s+Injection$/i, "");

  return (
    <div className={`space-y-6 ${className} font-sans`}>
      {/* Title */}
      <div className="border-b border-border-clinical/30 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/5 px-2.5 py-0.5 rounded-full">
          Procedure & Aftercare Details
        </span>
        <h4 className="text-sm md:text-base font-bold text-deep-navy mt-1.5">
          {injectionName} Explanation
        </h4>
      </div>

      {/* Anatomy and Needle Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Joint Anatomy Target */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-bold text-deep-navy uppercase tracking-wider block">1. Joint Anatomy Target</span>
          {["corticosteroid", "hyaluronic-acid", "prp", "arthrosamid"].includes(injectionSlug) ? (
            <div className="group relative w-full rounded-xl overflow-hidden bg-white border border-border-clinical shadow-sm flex flex-col p-3 hover:border-clinical-teal/50 transition-all duration-300">
              <div className="relative w-full aspect-[4/3] bg-pale-clinical-blue/20 rounded-lg overflow-hidden">
                <Image
                  src={anatomyImages[injectionSlug]}
                  alt={`${baseName} Injection Target`}
                  fill
                  sizes="(max-w-7xl) 50vw, 400px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
                  Anatomy
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
                  Clinical Approved
                </span>
              </div>
              <div className="pt-3 pb-1 px-1">
                <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy">
                  {baseName} Injection Target
                </h4>
                <p className="text-[11px] text-text-secondary leading-normal font-medium mt-1">
                  {(() => {
                    switch (injectionSlug) {
                      case "hyaluronic-acid":
                        return "Viscosupplementation gel lubricating and shock-absorbing in the joint space.";
                      case "prp":
                        return "Concentrated platelets and growth factors targeted to the intra-articular space.";
                      case "arthrosamid":
                        return "Permanent polyacrylamide hydrogel coating the inner synovium of the joint capsule.";
                      default:
                        return "Clinical illustration of knee joint showing intra-articular target space.";
                    }
                  })()}
                </p>
              </div>
            </div>
          ) : (
            <PlaceholderVisual
              title={`${baseName} Injection Target`}
              type="anatomy"
              placeholderLabel="Clinical illustration of knee joint showing target space"
              dimensions={{ width: 600, height: 450 }}
              status="pending"
              clinicalReviewStatus="pending-clinical-review"
            />
          )}
        </div>

        {/* Card 2: Injection Needle Path */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-bold text-deep-navy uppercase tracking-wider block">2. Injection Needle Path</span>
          {["corticosteroid", "hyaluronic-acid", "prp", "arthrosamid"].includes(injectionSlug) ? (
            <div className="group relative w-full rounded-xl overflow-hidden bg-white border border-border-clinical shadow-sm flex flex-col p-3 hover:border-clinical-teal/50 transition-all duration-300">
              <div className="relative w-full aspect-[4/3] bg-pale-clinical-blue/20 rounded-lg overflow-hidden">
                <Image
                  src={pathImages[injectionSlug]}
                  alt={`${baseName} Needle Access Path`}
                  fill
                  sizes="(max-w-7xl) 50vw, 400px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-deep-navy/80 px-2 py-0.5 rounded-full">
                  Needle Path
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white bg-clinical-teal px-2 py-0.5 rounded-full">
                  Clinical Approved
                </span>
              </div>
              <div className="pt-3 pb-1 px-1">
                <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy">
                  {baseName} Needle Access Path
                </h4>
                <p className="text-[11px] text-text-secondary leading-normal font-medium mt-1">
                  {(() => {
                    switch (injectionSlug) {
                      case "hyaluronic-acid":
                        return "Needle path for viscosupplementation injection under ultrasound guidance.";
                      case "prp":
                        return "Infographic of the PRP preparation process and targeted joint delivery.";
                      case "arthrosamid":
                        return "Strict aseptic injection path of permanent hydrogel under ultrasound guidance.";
                      default:
                        return "Needle trajectory for superolateral approach into the suprapatellar recess.";
                    }
                  })()}
                </p>
              </div>
            </div>
          ) : (
            <PlaceholderVisual
              title={`${baseName} Needle Access Path`}
              type="procedure"
              placeholderLabel="Injection procedure visual pending clinical review"
              dimensions={{ width: 600, height: 450 }}
              status="pending"
              clinicalReviewStatus="pending-clinical-review"
            />
          )}
        </div>
      </div>

      {/* Procedure vs Aftercare Tabs */}
      <div className="border border-border-clinical rounded-xl overflow-hidden bg-white shadow-xs text-left">
        <div className="flex border-b border-border-clinical bg-pale-clinical-blue/20">
          <button
            onClick={() => setActiveTab("procedure")}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-bold border-b-2 text-center transition-all ${
              activeTab === "procedure"
                ? "border-clinical-teal text-clinical-teal bg-white"
                : "border-transparent text-text-secondary hover:text-deep-navy hover:bg-pale-clinical-blue/40"
            }`}
          >
            📋 The Injection Procedure
          </button>
          <button
            onClick={() => setActiveTab("aftercare")}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-bold border-b-2 text-center transition-all ${
              activeTab === "aftercare"
                ? "border-clinical-teal text-clinical-teal bg-white"
                : "border-transparent text-text-secondary hover:text-deep-navy hover:bg-pale-clinical-blue/40"
            }`}
          >
            🏡 Aftercare Guidelines
          </button>
        </div>

        <div className="p-5 md:p-6">
          {activeTab === "procedure" ? (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                This outpatient procedure is conducted under strict sterile conditions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {procedureSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-pale-clinical-blue/10 p-3 rounded-lg border border-border-clinical/30">
                    <span className="w-6 h-6 rounded-full bg-clinical-teal/10 text-clinical-teal flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-text-secondary leading-relaxed font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Follow these postoperative guidelines to protect the joint and monitor healing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aftercareSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-warm-off-white/40 p-3 rounded-lg border border-border-clinical/30">
                    <span className="w-6 h-6 rounded-full bg-deep-navy/10 text-deep-navy flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-text-secondary leading-relaxed font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ultrasound Guidance Link */}
      {hasUltrasoundGuidance && (
        <div className="bg-pale-clinical-blue/30 border border-border-clinical/50 rounded-xl p-4 md:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal block">Clinical Accuracy</span>
            <span className="text-xs font-bold text-deep-navy block">Ultrasound-Guided Injections</span>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              We highly recommend executing injections under real-time ultrasound guidance to ensure precise placement within the joint space, maximizing therapeutic safety and efficacy.
            </p>
          </div>
          <Link
            href="/injections/ultrasound-guided-knee-injections"
            className="inline-block bg-white hover:bg-clinical-teal/5 border border-clinical-teal text-clinical-teal text-xs font-bold px-4 py-2 rounded-lg text-center shrink-0 self-start sm:self-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal"
          >
            Learn About Guidance &rarr;
          </Link>
        </div>
      )}

      {/* Comparison summary card */}
      {comparisonProps && (
        <div className="bg-white border border-border-clinical rounded-xl p-5 text-left space-y-4">
          <h5 className="font-serif text-sm font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
            Clinical Characteristics Summary
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-text-muted uppercase text-[9px] tracking-wider block font-bold">Onset of Action</span>
              <span className="text-deep-navy font-bold">{comparisonProps.onset}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase text-[9px] tracking-wider block font-bold">Typical Duration</span>
              <span className="text-deep-navy font-bold">{comparisonProps.duration}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase text-[9px] tracking-wider block font-bold">Primary Mechanism</span>
              <span className="text-deep-navy font-bold">{comparisonProps.primaryEffect}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase text-[9px] tracking-wider block font-bold">Main Indication</span>
              <span className="text-deep-navy font-bold">{comparisonProps.suitability}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
