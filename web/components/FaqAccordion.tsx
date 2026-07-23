"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ items, className = "" }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="bg-white border border-border-clinical/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <button
              type="button"
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-sans font-bold text-deep-navy hover:text-clinical-teal hover:bg-pale-clinical-blue/20 transition-all focus:outline-none focus-visible:bg-pale-clinical-blue/40"
              onClick={() => toggleIndex(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              id={`faq-btn-${idx}`}
            >
              <span className="text-sm md:text-base leading-snug">{item.question}</span>
              <span className="shrink-0 text-clinical-teal">
                {isOpen ? (
                  <svg className="w-5 h-5 transition-transform duration-200 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
                  </svg>
                )}
              </span>
            </button>
            <div
              id={`faq-answer-${idx}`}
              aria-labelledby={`faq-btn-${idx}`}
              role="region"
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[500px] border-t border-border-clinical/40" : "max-h-0"
              }`}
            >
              <div className="px-6 py-5 font-sans text-sm md:text-base text-text-secondary leading-relaxed bg-pale-clinical-blue/10">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
