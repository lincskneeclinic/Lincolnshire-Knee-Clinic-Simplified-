import React from "react";
import Link from "next/link";

interface ContinueYourKneeJourneyProps {
  currentStage: "symptom" | "condition" | "treatment" | "recovery";
}

export const ContinueYourKneeJourney: React.FC<ContinueYourKneeJourneyProps> = ({ currentStage }) => {
  const getNextStageDetails = () => {
    switch (currentStage) {
      case "symptom":
        return {
          title: "Next Step: Explore Possible Conditions",
          description: "Similar symptoms can occur with several different knee conditions. Learn about common diagnoses, how they are assessed, and how force transmission affects joint health.",
          buttonText: "Explore Conditions",
          href: "/conditions",
        };
      case "condition":
        return {
          title: "Next Step: Explore Treatment Options",
          description: "Treatment pathways range from physiotherapy and bracing to injections or surgical procedures, tailored to your symptoms, diagnosis, and physical goals.",
          buttonText: "Explore Treatments",
          href: "/treatments",
        };
      case "treatment":
        return {
          title: "Next Step: Recovery & Rehabilitation",
          description: "Understand recovery milestones, physical therapy timelines, and guidelines for returning to daily activities, driving, work, or sports safely.",
          buttonText: "Explore Recovery",
          href: "/recovery",
        };
      case "recovery":
        return {
          title: "Next Step: Arrange an Assessment",
          description: "If you would like to discuss symptoms, possible diagnoses, or treatment options, you can book an individual consultation with our specialist knee surgeon.",
          buttonText: "Book Appointment",
          href: "/book-appointment",
        };
      default:
        return null;
    }
  };

  const details = getNextStageDetails();
  if (!details) return null;

  return (
    <div className="w-full bg-pale-clinical-blue/20 border border-border-clinical/60 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)] my-8 text-left font-sans">
      <div className="max-w-2xl space-y-2">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-clinical-teal block">
          Continue Your Knee Journey
        </span>
        <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy">
          {details.title}
        </h3>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
          {details.description}
        </p>
      </div>
      <Link
        href={details.href}
        className="shrink-0 bg-clinical-teal hover:bg-clinical-teal/90 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-lg shadow-sm transition-colors text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-2"
      >
        {details.buttonText} &rarr;
      </Link>
    </div>
  );
};
