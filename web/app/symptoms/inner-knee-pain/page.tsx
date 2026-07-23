import React from "react";
import { Metadata } from "next";
import { SymptomPage, getSymptomMetadata } from "@/components/symptoms/SymptomPage";

const SLUG = "inner-knee-pain";

export function generateMetadata(): Metadata {
  return getSymptomMetadata(SLUG);
}

export default function Page() {
  return <SymptomPage slug={SLUG} />;
}
