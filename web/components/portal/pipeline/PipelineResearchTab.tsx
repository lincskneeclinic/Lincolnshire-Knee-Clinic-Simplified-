"use client";

import React from "react";
import { ContentPipelineRun } from "@/lib/contentPipeline";

interface PipelineResearchTabProps {
  researchBrief: ContentPipelineRun["research_brief"];
}

export function PipelineResearchTab({ researchBrief }: PipelineResearchTabProps) {
  return (
    <div className="bg-dark-overlay-navy p-5 rounded-xl border border-white/10 space-y-4 text-[9px]">
      {researchBrief ? (
        <>
          {(researchBrief.overall_evidence_grade || researchBrief.source_method) && (
            <div className="flex flex-wrap items-center gap-2">
              {researchBrief.overall_evidence_grade && (
                <span
                  className={`text-[9px] px-2 py-1 rounded-full border ${
                    researchBrief.overall_evidence_grade === "Conflicting Expert Opinion"
                      ? "border-amber-500/60 text-amber-300/90 bg-amber-500/10"
                      : "border-clinical-teal/50 text-clinical-teal bg-clinical-teal/10"
                  }`}
                >
                  Evidence grade: {researchBrief.overall_evidence_grade}
                </span>
              )}
              {researchBrief.source_method === "manual_skill_import" && (
                <span className="text-[9px] px-2 py-1 rounded-full border border-white/20 text-white/70 bg-white/5">
                  Manually researched &amp; imported
                </span>
              )}
            </div>
          )}

          <p className="text-white/80 leading-relaxed">{researchBrief.summary}</p>

          {researchBrief.key_points && researchBrief.key_points.length > 0 && (
            <div>
              <span className="text-clinical-teal block mb-1 text-[10px]">Key Clinical Findings:</span>
              <ul className="list-disc pl-5 text-white/80 space-y-1">
                {researchBrief.key_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.conflicting_findings && researchBrief.conflicting_findings.length > 0 && (
            <div className="bg-primary-navy/50 border-l-2 border-amber-500/70 p-3 rounded-r-lg space-y-1">
              <span className="text-amber-300/90 block mb-0.5 text-[10px]">Conflicting Findings &amp; Clinical Nuances:</span>
              <ul className="list-disc pl-4 text-amber-200/80 text-[9px] space-y-1">
                {researchBrief.conflicting_findings.map((cf, i) => (
                  <li key={i}>{cf}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.clinical_indications && researchBrief.clinical_indications.length > 0 && (
            <div>
              <span className="text-clinical-teal block mb-1 text-[10px]">Clinical Indication Criteria:</span>
              <ul className="list-disc pl-5 text-white/80 space-y-1">
                {researchBrief.clinical_indications.map((ci, i) => (
                  <li key={i}>{ci}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.guideline_sources && researchBrief.guideline_sources.length > 0 && (
            <div>
              <span className="text-clinical-teal block mb-1 text-[10px]">Clinical Guideline Sources:</span>
              <ul className="list-disc pl-5 text-white/80 space-y-1">
                {researchBrief.guideline_sources.map((gs, i) => (
                  <li key={i}>{gs}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.evidence_gaps && researchBrief.evidence_gaps.length > 0 && (
            <div className="bg-primary-navy/50 border-l-2 border-white/20 p-3 rounded-r-lg space-y-1">
              <span className="text-white/70 block mb-0.5 text-[10px]">Evidence Gaps / Open Questions:</span>
              <ul className="list-disc pl-4 text-white/60 text-[9px] space-y-1">
                {researchBrief.evidence_gaps.map((eg, i) => (
                  <li key={i}>{eg}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.web_sources && researchBrief.web_sources.length > 0 && (
            <div>
              <span className="text-clinical-teal block mb-1.5 text-[10px]">Verified Web &amp; Guideline Sources:</span>
              <div className="space-y-2">
                {researchBrief.web_sources.map((src, i) => (
                  <div key={i} className="bg-primary-navy p-3 rounded-lg border border-white/10 space-y-1">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-clinical-teal hover:underline flex items-center gap-1 leading-snug text-[10px]"
                    >
                      <span>{src.title}</span>
                      <span className="text-[8px] text-white/60">Open</span>
                    </a>
                    <div className="text-[9px] text-white/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{src.source}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                          src.searchPass === "guideline"
                            ? "border-clinical-teal/50 text-clinical-teal bg-clinical-teal/10"
                            : src.searchPass === "contradiction"
                            ? "border-amber-500/60 text-amber-300/90 bg-amber-500/10"
                            : "border-white/20 text-white/60 bg-white/5"
                        }`}
                      >
                        {src.searchPass}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {researchBrief.verification_notes && researchBrief.verification_notes.length > 0 && (
            <div className="bg-primary-navy/50 border-l-2 border-white/20 p-3 rounded-r-lg space-y-1">
              <span className="text-white/70 block mb-0.5 text-[10px]">Verification Notes:</span>
              <ul className="list-disc pl-4 text-white/60 text-[9px] space-y-1">
                {researchBrief.verification_notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {researchBrief.pubmed_articles && researchBrief.pubmed_articles.length > 0 && (
            <div>
              <span className="text-clinical-teal block mb-1.5 text-[10px]">Verified PubMed Literature (NCBI):</span>
              <div className="space-y-2">
                {researchBrief.pubmed_articles.map((art, i) => (
                  <div key={i} className="bg-primary-navy p-3 rounded-lg border border-white/10 space-y-1">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-clinical-teal hover:underline flex items-center gap-1 leading-snug text-[10px]"
                    >
                      <span>{art.title}</span>
                      <span className="text-[8px] text-white/60">Open</span>
                    </a>
                    <div className="text-[9px] text-white/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Authors: {art.authors}</span>
                      <span>Journal: {art.journal} ({art.pubdate})</span>
                      <span className="font-mono text-clinical-teal/80">PMID: {art.pmid}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {researchBrief.sources && researchBrief.sources.length > 0 && (
            <div>
              <span className="text-white/60 uppercase tracking-wider text-[10px] block mb-1">Source Citations Log:</span>
              <div className="space-y-1">
                {researchBrief.sources.map((src, i) => (
                  <div key={i} className="text-white/60 bg-primary-navy/40 p-2 rounded border border-white/10 font-mono text-[9px]">
                    {src}
                  </div>
                ))}
              </div>
            </div>
          )}

          {researchBrief.search_metadata && (
            <p className="text-white/40 text-[8px] italic pt-1">
              Searched {researchBrief.search_metadata.search_date} · {researchBrief.search_metadata.note}
            </p>
          )}
        </>
      ) : (
        <p className="text-white/50 italic">Research material is not available for this run yet.</p>
      )}
    </div>
  );
}
