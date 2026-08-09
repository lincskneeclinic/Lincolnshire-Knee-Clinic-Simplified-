import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { ReferencesList } from "@/components/ReferencesList";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Button } from "@/components/Button";
import { UrgentAdviceBanner } from "@/components/UrgentAdviceBanner";
import Link from "next/link";
import { notFound } from "next/navigation";
import { conditionsData } from "@/data/conditions";
import { symptomsData } from "@/data/symptoms";
import { getVisualAsset } from "@/data/visualsInventory";
import { getClinicalReviewStatus } from "@/lib/clinicalReview";
import { getConditionWithOverrides } from "@/lib/contentFieldOverrides";
import { SITE_URL } from "@/lib/site";
import { ContinueYourKneeJourney } from "@/components/ContinueYourKneeJourney";
import { TopicNotifyWidget } from "@/components/TopicNotifyWidget";
import { MedicalIllustrationBlock } from "@/components/visuals/MedicalIllustrationBlock";
import { ComparisonDiagramBlock } from "@/components/visuals/ComparisonDiagramBlock";
import { ImagingExampleBlock } from "@/components/visuals/ImagingExampleBlock";
import { VisualPathwayBlock } from "@/components/visuals/VisualPathwayBlock";
import { InteractiveAnatomyDiagram } from "@/components/visuals/InteractiveAnatomyDiagram";
import { AnnotatedImagingViewer } from "@/components/visuals/AnnotatedImagingViewer";
import { BeforeAfterComparison } from "@/components/visuals/BeforeAfterComparison";
import { getImagingAsset } from "@/data/imagingAssets";

// Static imports for Knee Osteoarthritis comparison diagrams
import kneeArthritisNormal from "@/public/images/conditions/knee-arthritis-normal.png";
import kneeArthritisPathological from "@/public/images/conditions/knee-arthritis-pathological.png";
import aclIntact from "@/public/images/conditions/acl-intact.png";
import aclTorn from "@/public/images/conditions/acl-torn.png";
import meniscalTearComparison from "@/public/images/conditions/meniscal-tear-comparison.png";
import patellofemoralPainComparison from "@/public/images/conditions/patellofemoral-pain-comparison.png";
import cartilageInjuryComparison from "@/public/images/conditions/cartilage-injury-comparison.png";
import bakersCystComparison from "@/public/images/conditions/bakers-cyst-comparison.png";
import kneeInstabilityComparison from "@/public/images/conditions/knee-instability-comparison.png";
import patellarInstabilityComparison from "@/public/images/conditions/patellar-instability-comparison.png";
import kneeTendinopathyComparison from "@/public/images/conditions/knee-tendinopathy-comparison.png";
import looseBodiesComparison from "@/public/images/conditions/loose-bodies-comparison.png";

const conditionComparisonPoints: Record<string, { feature: string; normal: string; abnormal: string }[]> = {
  "knee-arthritis": [
    { feature: "Joint Space", normal: "Wide, even clearance between bone surfaces", abnormal: "Narrowed joint space due to tissue degradation" },
    { feature: "Structural Integrity", normal: "Smooth articular cartilage and strong stabilizing bands", abnormal: "Eroded surfaces, osteophytes (bone spurs), or exposed subchondral bone" }
  ],
  "acl-injury": [
    { feature: "Ligament Integrity", normal: "Taut, continuous Anterior Cruciate Ligament stabilizing the center of the joint", abnormal: "Disrupted, torn, or wavy ligament fibers lacking structural continuity" },
    { feature: "Joint Stability", normal: "Tibia remains aligned under load (no abnormal forward sliding)", abnormal: "Excessive forward translation of the tibia (joint laxity/giving way)" },
    { feature: "Secondary Structures", normal: "Intact surrounding bones and meniscus cartilage", abnormal: "Risk of bone bruising (contusion) or secondary meniscal tears from instability" }
  ],
  "meniscal-tear": [
    { feature: "Meniscus Structure", normal: "Smooth, continuous C-shaped cartilage discs (medial and lateral)", abnormal: "Frayed, torn, or displaced cartilage segment (e.g. bucket-handle or flap tear)" },
    { feature: "Shock Absorption", normal: "Distributes weight-bearing forces evenly across the joint", abnormal: "Concentrated pressure on articular cartilage, potentially leading to pain and wear" },
    { feature: "Mechanical Clearance", normal: "Glides smoothly during knee flexion and extension", abnormal: "Catching, clicking, or locking of the joint if a torn segment displaces" }
  ],
  "patellofemoral-pain": [
    { feature: "Kneecap Tracking", normal: "Patella slides smoothly in the center of the trochlear groove", abnormal: "Patella tracks laterally (off-center) causing increased pressure" },
    { feature: "Cartilage Loading", normal: "Even pressure distribution under the patellar facets", abnormal: "Localized overloading and irritation of subpatellar cartilage" }
  ],
  "cartilage-injury": [
    { feature: "Articular Surface", normal: "Smooth, continuous cartilage layer coating bone ends", abnormal: "Focal defect (chondral pothole) exposing subchondral bone" },
    { feature: "Joint Friction", normal: "Low friction, pain-free gliding during bending", abnormal: "Localized friction, grinding, or catching at the defect site" }
  ],
  "bakers-cyst": [
    { feature: "Popliteal Space", normal: "Flat, soft hollow behind the knee (popliteal fossa)", abnormal: "Fluid-filled swelling (Baker's cyst) protruding posteriorly" },
    { feature: "Synovial Fluid", normal: "Normal amount of lubricating fluid inside the joint cavity", abnormal: "Excess joint fluid escaping through a one-way valve into popliteal space" }
  ],
  "knee-instability": [
    { feature: "Ligament Tension", normal: "Taut, robust ligaments holding bones in correct alignment", abnormal: "Elongated, lax, or torn ligaments causing abnormal joint movement" },
    { feature: "Translation", normal: "Stable joint during twisting, pivoting, or weight-bearing", abnormal: "Joint giving way or sliding out of place under load" }
  ],
  "patellar-instability": [
    { feature: "Kneecap Position", normal: "Kneecap sits securely inside the trochlear groove", abnormal: "Kneecap displaces to the outside (lateral subluxation/dislocation)" },
    { feature: "Stabilizing Ligaments", normal: "Intact medial patellofemoral ligament (MPFL) preventing lateral slip", abnormal: "Stretched or torn MPFL allowing the patella to escape" }
  ],
  "knee-tendinopathy": [
    { feature: "Tendon Tissue", normal: "Strong, organized collagen fibers without inflammation", abnormal: "Disorganized, thickened fibers, micro-tears, or local tenderness" },
    { feature: "Loading Response", normal: "Pain-free force transfer during jumping, running, or stairs", abnormal: "Localized pain at the tendon insertion site under load" }
  ]
};

// Dynamic metadata helper for individual routes
export function getConditionMetadata(slug: string): Metadata {
  const condition = conditionsData[slug];
  if (!condition) {
    return {
      title: "Condition Details | Lincolnshire Knee Clinic",
    };
  }
  // Prefer the condition's own overview illustration for the share image; fall back
  // to the clinic logo if no real asset exists yet for this condition.
  const visualAsset = getVisualAsset(`conditions/${slug}`, "overview");
  const shareImage = visualAsset.status === "approved" && visualAsset.imagePath
    ? {
        url: `${SITE_URL}${visualAsset.imagePath}`,
        width: visualAsset.requiredDimensions.width,
        height: visualAsset.requiredDimensions.height,
        alt: visualAsset.altText,
      }
    : {
        url: `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
        width: 800,
        height: 800,
        alt: "Lincolnshire Knee Clinic logo",
      };
  return {
    title: condition.metadataTitle,
    description: condition.metadataDescription,
    alternates: {
      canonical: `${SITE_URL}/conditions/${condition.slug}`,
    },
    openGraph: {
      title: condition.metadataTitle,
      description: condition.metadataDescription,
      url: `${SITE_URL}/conditions/${condition.slug}`,
      type: "article",
      images: [shareImage],
    },
    twitter: {
      card: "summary",
      title: condition.metadataTitle,
      description: condition.metadataDescription,
    },
  };
}

interface ConditionPageProps {
  slug: string;
}

export const ConditionPage = async ({ slug }: ConditionPageProps) => {
  const condition = await getConditionWithOverrides(slug);
  const clinicalReview = await getClinicalReviewStatus(`conditions/${slug}`);

  if (!condition) {
    notFound();
  }

  // Anchor navigation index
  const tableOfContents = [
    { label: "Overview", id: "overview" },
    { label: "Symptoms", id: "symptoms" },
    { label: "Causes", id: "causes" },
    { label: "Assessment", id: "assessment" },
    { label: "Investigations", id: "investigations" },
    { label: "Treatment", id: "treatment" },
    { label: "Frequently asked questions", id: "faqs" },
    { label: "Related information", id: "related-info" },
    { label: "References", id: "references" },
  ];

  const visualAsset = getVisualAsset(`conditions/${slug}`, "overview");

  // Dynamic JSON-LD Schema - no unpopulated bracket placeholders included
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${SITE_URL}/conditions/${condition.slug}#webpage`,
        "url": `${SITE_URL}/conditions/${condition.slug}`,
        "name": condition.metadataTitle,
        "headline": condition.name,
        "description": condition.metadataDescription,
        "inLanguage": "en-GB",
        ...((visualAsset.status === "approved" && visualAsset.imagePath) ? { "image": `${SITE_URL}${visualAsset.imagePath}` } : {}),
        "medicalAudience": "Patient",
        "specialty": "Orthopedic",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${SITE_URL}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Conditions",
              "item": `${SITE_URL}/conditions`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": condition.name
            }
          ]
        },
        "about": {
          "@id": `${SITE_URL}/conditions/${condition.slug}#condition`
        }
      },
      {
        "@type": "MedicalCondition",
        "@id": `${SITE_URL}/conditions/${condition.slug}#condition`,
        "name": condition.name,
        ...(condition.alternateName ? { "alternateName": condition.alternateName } : {}),
        "description": condition.shortDescription,
        "associatedAnatomy": {
          "@type": "AnatomicalStructure",
          "name": "Knee joint"
        },
        "relevantSpecialty": "Orthopedic",
        "signOrSymptom": condition.symptoms.map((symptom) => ({
          "@type": "MedicalSignOrSymptom",
          "name": symptom
        })),
        "typicalTest": condition.investigations.map((test) => ({
          "@type": "MedicalTest",
          "name": test
        })),
        "possibleTreatment": condition.treatments.map((treatment) => ({
          "@type": "MedicalTherapy",
          "name": treatment
        })),
        "mainEntityOfPage": `${SITE_URL}/conditions/${condition.slug}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": condition.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  // Safe mapping of treatments to valid routes
  const getTreatmentLink = (name: string): string => {
    const cleanName = name.toLowerCase();
    if (cleanName.includes("injection")) return "/injections";
    if (cleanName.includes("appointment") || cleanName.includes("book")) return "/book-appointment";
    if (cleanName.includes("second opinion") || cleanName.includes("consultation")) return "/contact";
    if (cleanName.includes("physiotherapy") || cleanName.includes("rehab")) return "/treatments/physiotherapy";
    if (cleanName.includes("activity")) return "/treatments/activity-modification";
    if (cleanName.includes("pain")) return "/treatments/pain-management";
    if (cleanName.includes("brace") || cleanName.includes("bracing")) return "/treatments/knee-bracing";
    if (cleanName.includes("arthroscopy")) return "/treatments/knee-arthroscopy";
    if (cleanName.includes("meniscal") || cleanName.includes("meniscus")) return "/treatments/meniscal-surgery";
    if (cleanName.includes("acl")) return "/treatments/acl-reconstruction";
    if (cleanName.includes("cartilage")) return "/treatments/cartilage-procedures";
    if (cleanName.includes("stabilisation") || cleanName.includes("stabilization")) return "/treatments/patellar-stabilisation";
    if (cleanName.includes("partial knee")) return "/treatments/partial-knee-replacement";
    if (cleanName.includes("total knee")) return "/treatments/total-knee-replacement";
    if (cleanName.includes("revision")) return "/treatments/revision-knee-replacement";
    if (cleanName.includes("weight")) return "/treatments/weight-management";
    return "/treatments"; // Default safe hub
  };

  // Maps a condition's relatedSymptoms display name (free text) to a symptoms/*
  // slug. Data entries don't always match symptomsData's `name` field exactly
  // (e.g. "Locking Knee" vs "Locked Knee"), so this checks an exact match, then a
  // substring match, then a small alias table for known mismatches.
  const symptomNameAliases: Record<string, string> = {
    "locking knee": "locked-knee",
    "front of knee pain": "front-of-knee-pain",
    "knee pain after injury": "knee-pain-after-injury",
  };
  const getSymptomSlug = (name: string): string | null => {
    const normalized = name.toLowerCase();
    if (symptomNameAliases[normalized]) return symptomNameAliases[normalized];
    const exact = Object.values(symptomsData).find((s) => s.name.toLowerCase() === normalized);
    if (exact) return exact.slug;
    const partial = Object.values(symptomsData).find(
      (s) => s.name.toLowerCase().includes(normalized) || normalized.includes(s.name.toLowerCase())
    );
    return partial ? partial.slug : null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 25. Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 6. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs
          items={[
            { label: "Conditions", href: "/conditions" },
            { label: condition.name },
          ]}
        />
      </div>

      {/* 5. Page Hero */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 relative overflow-hidden w-full border-b border-border-clinical/10 animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Conditions
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4">
            {condition.name}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed">
            {condition.introduction}
          </p>
        </div>
      </section>

      {/* Shared Layout Structure */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start font-sans">
        
        {/* 7. On This Page Navigation Index */}
        <TableOfContents items={tableOfContents} />

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-12">
          
          {/* 4. What is the condition? */}
          <section id="overview" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              What is {condition.name}?
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              <p>{condition.whatIs}</p>
              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
                This information is for general patient education and does not replace an individual clinical assessment.
              </div>
            </div>
          </section>

          {/* Reusable Medical Illustration Block */}
          <section className="space-y-4">
            <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
              Anatomical Overview
            </h3>
            <MedicalIllustrationBlock pageSlug={`conditions/${slug}`} section="overview" />
          </section>

          {/* Normal vs Abnormal Comparison Block */}
          <section className="space-y-4">
            <ComparisonDiagramBlock
              title={`Healthy vs Affected Joint Comparison`}
              subtitle={`Understanding structural differences caused by ${condition.name.toLowerCase()}.`}
              leftPlaceholderLabel="Illustration of healthy knee structures and joint spacing"
              rightPlaceholderLabel={`Pathological modifications resulting from ${condition.name.toLowerCase()}`}
              comparisonPoints={
                conditionComparisonPoints[slug] || [
                  { feature: "Joint Space", normal: "Wide, even clearance between bone surfaces", abnormal: "Altered joint space due to injury or wear" },
                  { feature: "Structural Integrity", normal: "Intact healthy knee structures", abnormal: "Pathological modifications resulting from the condition" }
                ]
              }
              pathologyHighlightLabel={slug === "acl-injury" ? "Ligament Disruption" : "Clinical Highlight"}
              leftBadgeLabel={slug === "acl-injury" ? "Normal ACL" : undefined}
              rightBadgeLabel={slug === "acl-injury" ? "Torn ACL" : undefined}
              leftImageSrc={
                slug === "knee-arthritis"
                  ? kneeArthritisNormal
                  : slug === "acl-injury"
                  ? aclIntact
                  : undefined
              }
              rightImageSrc={
                slug === "knee-arthritis"
                  ? kneeArthritisPathological
                  : slug === "acl-injury"
                  ? aclTorn
                  : undefined
              }
              singleImageSrc={
                slug === "meniscal-tear"
                  ? meniscalTearComparison
                  : slug === "patellofemoral-pain"
                  ? patellofemoralPainComparison
                  : slug === "cartilage-injury"
                  ? cartilageInjuryComparison
                  : slug === "bakers-cyst"
                  ? bakersCystComparison
                  : slug === "knee-instability"
                  ? kneeInstabilityComparison
                  : slug === "patellar-instability"
                  ? patellarInstabilityComparison
                  : slug === "knee-tendinopathy"
                  ? kneeTendinopathyComparison
                  : slug === "loose-bodies"
                  ? looseBodiesComparison
                  : undefined
              }
            />
          </section>

          {/* Pass 2 — Interactive Anatomy Diagram (knee-arthritis demonstration) */}
          {slug === "knee-arthritis" && (
            <section className="space-y-4">
              <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
                Interactive Knee Anatomy
              </h3>
              <InteractiveAnatomyDiagram
                conditionContext="Osteoarthritis"
                activePathologyId="articular-cartilage"
              />
            </section>
          )}

          {/* Pass 2 — Annotated Imaging Viewer (arthritis, ACL, meniscus, cartilage injury) */}
          {[
            "knee-arthritis",
            "acl-injury",
            "meniscal-tear",
            "cartilage-injury",
            "knee-instability",
            "bakers-cyst",
            "knee-tendinopathy",
            "patellar-instability",
            "loose-bodies",
          ].includes(slug) && (() => {
            const imagingAssetMap: Record<string, string> = {
              "knee-arthritis": "imaging-knee-arthritis-ap-xray",
              "acl-injury": "imaging-acl-injury-mri-sagittal",
              "meniscal-tear": "imaging-meniscal-tear-mri-coronal",
              "cartilage-injury": "imaging-cartilage-injury-arthroscopy",
              "knee-instability": "imaging-knee-instability-mri",
              "bakers-cyst": "imaging-bakers-cyst-ultrasound",
              "knee-tendinopathy": "imaging-knee-tendinopathy-ultrasound",
              "patellar-instability": "imaging-patellar-instability-mri",
              "loose-bodies": "imaging-loose-bodies-xray",
            };
            const assetId = imagingAssetMap[slug];
            if (!assetId) return null;
            const imagingAsset = getImagingAsset(assetId);
            if (!imagingAsset) return null;
            return (
              <section className="space-y-4">
                <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
                  Annotated Imaging Example
                </h3>
                <AnnotatedImagingViewer imagingAsset={imagingAsset} />
              </section>
            );
          })()}

          {/* Pass 2 — Before/After Comparison (acl-injury demonstration) */}
          {slug === "acl-injury" && (
            <section className="space-y-4">
              <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
                Anatomy Comparison — Intact versus Torn ACL
              </h3>
              <BeforeAfterComparison
                title="Intact ACL vs Torn ACL"
                subtitle="Educational comparison of normal ligament integrity and disrupted anatomy."
                leftLabel="Intact ACL — Normal Anatomy"
                leftImageSrc={aclIntact.src}
                leftPlaceholderLabel="Intact ACL illustration pending clinical review"
                rightLabel="Torn ACL — Disrupted Anatomy"
                rightImageSrc={aclTorn.src}
                rightPlaceholderLabel="Torn ACL illustration pending clinical review"
                disclaimer="Both panels are educational illustrations. They do not represent any individual patient's anatomy. ACL injury diagnosis requires clinical examination and MRI."
              />
            </section>
          )}

          {/* 10. Symptoms section */}
          <section id="symptoms" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Common symptoms
            </h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">
              Symptoms vary, and similar symptoms can occur with other knee conditions. Commonly reported signs include:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {condition.symptoms.map((symptom, idx) => (
                <div key={idx} className="bg-white border border-border-clinical/80 p-4 rounded-xl shadow-sm flex items-center">
                  <span className="text-xs md:text-sm font-bold text-deep-navy">{symptom}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Causes and risk factors */}
          <section id="causes" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Causes and associated factors
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              The development or onset of this condition can be associated with several mechanical, biological, and lifestyle factors, including:
            </p>
            <ul className="list-disc pl-5 space-y-2.5 text-xs md:text-sm text-text-secondary font-medium">
              {condition.causes.map((cause, idx) => (
                <li key={idx}>{cause}</li>
              ))}
            </ul>
          </section>

          {/* 11. Urgent advice */}
          <UrgentAdviceBanner className="rounded-xl border" showDetails={true} />

          {/* 12. Assessment and diagnosis */}
          <section id="assessment" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Clinical assessment and diagnosis
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              A comprehensive clinical assessment is performed to understand the root cause of your symptoms and outline appropriate management options.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-text-secondary font-medium">
              {condition.assessment.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
              A diagnosis should not be made from website information alone.
            </div>
          </section>

          {/* 13. Investigations */}
          <section id="investigations" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Investigations
            </h2>
            <p className="text-sm md:text-base text-[#526D82] font-medium mb-4">
              Imaging and other investigations may be recommended depending on clinical presentation. Common assessments include:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {condition.investigations.map((test, idx) => (
                <div key={idx} className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-deep-navy mb-2">{test.split(" (")[0]}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4 font-medium">
                      {test.includes(" (") ? test.substring(test.indexOf("(") + 1, test.length - 1) : "Indicated where clinically appropriate following assessment."}
                    </p>
                  </div>
                  <Link href="/diagnostics" className="text-xs font-bold text-clinical-teal hover:underline block mt-2">
                    Diagnostics & Imaging &gt;
                  </Link>
                </div>
              ))}
            </div>

            {/* Diagnostic Imaging Example block */}
            <div className="mt-6">
              <ImagingExampleBlock pageSlug={`conditions/${slug}`} section="imaging" />
            </div>
          </section>

          {/* 14. Treatment options */}
          <section id="treatment" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Treatment options
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              We offer structured, staged treatment pathways, focusing on conservative and non-surgical approaches. Suitability depends on individual assessment.
            </p>

            <div className="space-y-4">
              {condition.treatments.map((treatment, idx) => (
                <div key={idx} className="bg-white border border-border-clinical/80 p-5 rounded-xl shadow-sm flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-clinical-teal/10 flex items-center justify-center font-bold text-clinical-teal shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-base font-bold text-deep-navy">{treatment.split(" (")[0]}</h3>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                      {treatment.includes(" (") ? treatment.substring(treatment.indexOf("(") + 1, treatment.length - 1) : "Indicated where clinically appropriate."}
                    </p>
                    <Link href={getTreatmentLink(treatment)} className="text-xs font-bold text-clinical-teal hover:underline block pt-2">
                      Explore Treatment &gt;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Treatment Pathway Block */}
            <div className="pt-4">
              <VisualPathwayBlock type="treatment" />
            </div>

            {/* 15. Surgery section */}
            {condition.surgeryTitle && condition.surgeryDetails && (
              <div className="bg-pale-clinical-blue/20 border border-border-clinical/50 rounded-2xl p-6 md:p-8 space-y-4">
                <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy">
                  When might surgery be considered?
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                  Surgical intervention may be discussed when non-operative treatments do not provide sufficient relief, symptoms significantly restrict daily function or quality of life, and clinical and imaging findings correlate.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {condition.surgeryDetails.map((surg, idx) => (
                    <div key={idx} className="bg-white border border-border-clinical p-4 rounded-xl shadow-sm">
                      <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{surg.split(" (")[0]}</h4>
                      <p className="text-[11px] text-text-secondary leading-normal font-medium">
                        {surg.includes(" (") ? surg.substring(surg.indexOf("(") + 1, surg.length - 1) : "Consultant orthopaedic procedure."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 16. Shared decision-making */}
          <section className="bg-soft-blue border border-transparent rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.01)] text-left">
            <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-3">
              Choosing the right treatment
            </h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
              Decisions depend on a detailed diagnosis, symptom severity, patient goals, activity expectations, and general health history. We support shared decision-making, ensuring you fully understand the expected benefits, risks, and alternatives of each pathway.
            </p>
          </section>

          {/* 17. FAQs */}
          <section id="faqs" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-2">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={condition.faqs} />
          </section>

          {/* 17/18. Related info & conditions */}
          <section id="related-info" className="scroll-mt-8 space-y-6">
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Conditions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {condition.relatedConditions.map((relatedSlug) => {
                  const relatedCond = conditionsData[relatedSlug];
                  if (!relatedCond) return null;
                  return (
                    <div key={relatedSlug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{relatedCond.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{relatedCond.shortDescription}</p>
                      </div>
                      <Link href={`/conditions/${relatedSlug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Condition &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related symptoms */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Symptoms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {condition.relatedSymptoms.map((symptomName) => {
                  const slug = getSymptomSlug(symptomName);
                  const relatedSymptom = slug ? symptomsData[slug] : undefined;
                  if (!relatedSymptom) return null;
                  return (
                    <div key={slug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{relatedSymptom.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{relatedSymptom.shortDescription}</p>
                      </div>
                      <Link href={`/symptoms/${slug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Symptom &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 19. Related treatments */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {condition.relatedTreatments.map((treatment, idx) => (
                  <div key={idx} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{treatment}</h4>
                      <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">
                        Standard clinical care option for {condition.name.toLowerCase()}.
                      </p>
                    </div>
                    <Link href={getTreatmentLink(treatment)} className="text-xs font-bold text-clinical-teal hover:underline">
                      Explore Treatment &gt;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 22. Clinical Review */}
          <ClinicalMetadataBlock
            className="w-full bg-pale-clinical-blue/20"
            {...(clinicalReview.reviewed
              ? {
                  reviewerName: clinicalReview.reviewerName,
                  reviewerTitle: clinicalReview.reviewerTitle,
                  lastReviewedDate: clinicalReview.lastReviewedDate,
                  evidenceSource: clinicalReview.evidenceSource,
                }
              : {})}
          />

          {/* 23. References */}
          <ReferencesList
            staticReferences={condition.references}
            evidenceSource={clinicalReview.evidenceSource}
          />

        </main>
      </div>

      {/* 21. Booking CTA */}
      <section className="bg-warm-off-white py-16 md:py-20 w-full border-t border-b border-border-clinical/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-4">
            Would you like an individual knee assessment?
          </h2>
          <p className="font-sans text-sm md:text-base text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            A consultation can help clarify the cause of your symptoms and discuss appropriate treatment options.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/book-appointment" variant="teal">
              Book Appointment
            </Button>
            <Button href="/clinics" variant="secondary">
              Find a Clinic
            </Button>
          </div>
          <p className="text-[11px] text-text-muted italic mt-3 max-w-md mx-auto">
            Face-to-face appointments are arranged through the reception team at the chosen clinic. Video consultations use Google Calendar where available.
          </p>
        </div>
      </section>

      {/* Continue Journey Step */}
      <section className="bg-white py-2 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ContinueYourKneeJourney currentStage="condition" />
        </div>
      </section>

      {/* Topic notify */}
      <section className="bg-white py-6 w-full">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <TopicNotifyWidget topicId={`condition:${slug}`} topicLabel={condition.name} />
        </div>
      </section>

      {/* 22. Medical Disclaimer */}
      <section className="bg-white py-6 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <MedicalDisclaimerBlock />
        </div>
      </section>
    </div>
  );
};
