import React from "react";
import { Metadata } from "next";
import { TreatmentPage, getTreatmentMetadata } from "@/components/treatments/TreatmentPage";

const SLUG = "patellar-stabilisation";

export function generateMetadata(): Metadata {
  return getTreatmentMetadata(SLUG);
}

export default function Page() {
  return <TreatmentPage slug={SLUG} />;
}
