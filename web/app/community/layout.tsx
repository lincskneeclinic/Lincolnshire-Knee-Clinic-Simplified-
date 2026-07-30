import React from "react";
import { CommunityDisclaimerStrip } from "@/components/community/CommunityDisclaimerStrip";

export const metadata = {
  title: "Community | Lincolnshire Knee Clinic",
  description:
    "A discussion community for Lincolnshire Knee Clinic patients to share experiences about knee conditions, treatments and recovery.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 font-sans">
      <CommunityDisclaimerStrip className="mb-6" />
      {children}
    </div>
  );
}
