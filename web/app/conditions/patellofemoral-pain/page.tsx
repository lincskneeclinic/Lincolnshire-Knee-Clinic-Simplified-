import React from "react";
import { Metadata } from "next";
import { ConditionPage, getConditionMetadata } from "@/components/conditions/ConditionPage";

const SLUG = "patellofemoral-pain";

export function generateMetadata(): Metadata {
  return getConditionMetadata(SLUG);
}

export default function Page() {
  // Force hot reload revalidation for new visual assets
  return <ConditionPage slug={SLUG} />;
}
