import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { symptomsData } from "@/data/symptoms";

export const metadata: Metadata = {
  title: "Common Knee Symptoms | Lincolnshire Knee Clinic",
  description: "Learn about common knee symptoms like pain, swelling, stiffness, clicking, and giving way. Understand how they are clinically assessed.",
};

export default function SymptomsHub() {
  const symptoms = Object.values(symptomsData);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Symptoms" }]} />

      {/* Hero Header Block */}
      <div className="w-full bg-gradient-to-r from-[#003B5C] to-[#082F49] text-white py-10 md:py-14 border-b border-border-clinical/10 relative overflow-hidden rounded-xl mb-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="px-6 md:px-8 relative z-10">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-2 font-sans">
            Symptom-Led Education
          </span>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold !text-white leading-tight">
            Common Knee Symptoms
          </h1>
          <p className="font-sans text-sm md:text-base text-[#EAF6FA] leading-relaxed mt-3 max-w-3xl">
            Learn about the most common signs and symptoms of knee conditions. Understanding your symptoms helps you discuss them more clearly with your consultant during your clinical assessment.
          </p>
        </div>
      </div>

      <p className="text-xs text-text-secondary/70 italic border-t border-border-clinical/30 pt-4 mt-6">
        Content is consultant reviewed and intended for general patient education.
      </p>

      {/* Grid of symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {symptoms.map((symptom, index) => (
          <Card
            key={index}
            category="Symptom-Led Education"
            title={symptom.name}
            description={symptom.shortDescription}
            href={`/symptoms/${symptom.slug}`}
            linkText="Explore Symptom"
          />
        ))}
      </div>

      {/* Booking Prompt Card */}
      <div className="my-10 bg-pale-clinical-blue border border-border-clinical/30 p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
        <div className="max-w-2xl">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-2">
            Concerned about knee symptoms?
          </h2>
          <p className="text-sm text-text-secondary">
            Our consultant-led clinic can provide direct clinical evaluation, coordinate MRI scans, and recommend treatment plans tailored for your knee health.
          </p>
        </div>
        <Button href="/book-appointment" variant="primary" className="shrink-0">
          Book Appointment
        </Button>
      </div>

      <MedicalDisclaimerBlock />
    </div>
  );
}
