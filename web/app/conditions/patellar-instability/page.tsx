import React from "react";
import { Metadata } from "next";
import { ConditionPage, getConditionMetadata } from "@/components/conditions/ConditionPage";

const SLUG = "patellar-instability";

export function generateMetadata(): Metadata {
  return getConditionMetadata(SLUG);
}

export default function Page() {
  return <ConditionPage slug={SLUG} />;
}
