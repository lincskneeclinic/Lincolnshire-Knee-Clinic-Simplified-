import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SITE_URL } from "@/lib/site";
import { SymptomCheckerClient } from "./SymptomCheckerClient";

const PAGE_TITLE = "Symptom Checker | Lincolnshire Knee Clinic";
const PAGE_DESCRIPTION =
  "Answer a few quick questions to find the most relevant knee symptom page for what you're experiencing.";
const PAGE_URL = `${SITE_URL}/symptom-checker`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
};

export default function SymptomCheckerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Symptoms", href: "/symptoms" }, { label: "Symptom Checker" }]} />
      <PageHeader
        category="Symptom-Led Education"
        title="Symptom Checker"
        subtitle="Answer a couple of quick questions and we'll point you to the most relevant page. This tool provides general guidance only and does not replace a clinical assessment."
      />
      <div className="mt-8">
        <SymptomCheckerClient />
      </div>
    </div>
  );
}
