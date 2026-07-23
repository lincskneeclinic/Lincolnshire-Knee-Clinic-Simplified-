import React from "react";
import { Metadata } from "next";
import { InjectionPage, getInjectionMetadata } from "@/components/injections/InjectionPage";

const SLUG = "arthrosamid";

export function generateMetadata(): Metadata {
  return getInjectionMetadata(SLUG);
}

export default function Page() {
  return <InjectionPage slug={SLUG} />;
}
