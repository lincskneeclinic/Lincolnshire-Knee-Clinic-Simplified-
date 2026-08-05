import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { ReferencesList } from "@/components/ReferencesList";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Button } from "@/components/Button";
import Link from "next/link";
import { treatmentsData } from "@/data/treatments";
import { getClinicalReviewStatus } from "@/lib/clinicalReview";
import { getTreatmentWithOverrides } from "@/lib/contentFieldOverrides";
import { SITE_URL } from "@/lib/site";
import { conditionsData } from "@/data/conditions";
import { symptomsData } from "@/data/symptoms";
import { getVisualAsset } from "@/data/visualsInventory";
import { ContinueYourKneeJourney } from "@/components/ContinueYourKneeJourney";
import { TopicNotifyWidget } from "@/components/TopicNotifyWidget";
import { MedicalIllustrationBlock } from "@/components/visuals/MedicalIllustrationBlock";
import { ComparisonDiagramBlock } from "@/components/visuals/ComparisonDiagramBlock";
import { RecoveryTimelineBlock } from "@/components/visuals/RecoveryTimelineBlock";
import { VisualPathwayBlock } from "@/components/visuals/VisualPathwayBlock";
import { VisualSectionHeading } from "@/components/visuals/VisualSectionHeading";
import { TreatmentPathway } from "@/components/visuals/TreatmentPathway";
import { RecoveryPathway } from "@/components/visuals/RecoveryPathway";
import physiotherapyConservative from "@/public/images/treatments/physiotherapy-conservative.png";
import physiotherapyInterventional from "@/public/images/treatments/physiotherapy-interventional.png";

// Converts inline **bold** markdown to <strong> — treatment content
// (e.g. data/treatments.ts's "whatIs" field) is occasionally authored with
// it, but this page otherwise renders plain strings with no markdown support.
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-deep-navy">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

// Dynamic metadata helper for individual routes
export function getTreatmentMetadata(slug: string): Metadata {
  const treatment = treatmentsData[slug];
  if (!treatment) {
    return {
      title: "Treatment Details | Lincolnshire Knee Clinic",
    };
  }

  const visualAsset = getVisualAsset(`treatments/${slug}`, "overview");
  const shareImage = visualAsset.imagePath
    ? {
        url: `${SITE_URL}${visualAsset.imagePath}`,
        width: visualAsset.requiredDimensions?.width || 800,
        height: visualAsset.requiredDimensions?.height || 600,
        alt: visualAsset.altText || treatment.name,
      }
    : {
        url: `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
        width: 800,
        height: 800,
        alt: "Lincolnshire Knee Clinic logo",
      };

  return {
    title: `${treatment.name} | Lincolnshire Knee Clinic`,
    description: treatment.metadataDescription,
    alternates: {
      canonical: `${SITE_URL}/treatments/${treatment.slug}`,
    },
    openGraph: {
      title: `${treatment.name} | Lincolnshire Knee Clinic`,
      description: treatment.metadataDescription,
      url: `${SITE_URL}/treatments/${treatment.slug}`,
      type: "article",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${treatment.name} | Lincolnshire Knee Clinic`,
      description: treatment.metadataDescription,
      images: [shareImage.url],
    },
  };
}

interface TreatmentPageProps {
  slug: string;
}

export const TreatmentPage = async ({ slug }: TreatmentPageProps) => {
  const treatment = await getTreatmentWithOverrides(slug);
  const clinicalReview = await getClinicalReviewStatus(`treatments/${slug}`);

  if (!treatment) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center font-sans">
        <h1 className="text-2xl font-serif font-bold text-deep-navy">Treatment Not Found</h1>
        <p className="text-text-secondary mt-2 mb-6">The requested treatment page does not exist.</p>
        <Button href="/treatments">Back to Treatments Hub</Button>
      </div>
    );
  }

  // Anchor navigation index
  const isWeightManagement = slug === "weight-management";
  const tableOfContents = isWeightManagement
    ? [
        { label: "Overview", id: "overview" },
        { label: "Why weight affects knees", id: "weight-effect" },
        { label: "Who may benefit", id: "suitability" },
        { label: "Healthy weight management", id: "healthy-management" },
        { label: "Physical activity", id: "physical-activity" },
        { label: "Nutrition", id: "nutrition" },
        { label: "Additional support", id: "additional-support" },
        { label: "Frequently asked questions", id: "faqs" },
        { label: "Related information", id: "related-info" },
        { label: "References", id: "references" },
      ]
    : [
        { label: "Overview", id: "overview" },
        { label: "What it involves", id: "involves" },
        { label: "Suitability", id: "suitability" },
        { label: "Alternatives", id: "alternatives" },
        { label: "Risks", id: "risks" },
        { label: "Recovery & Rehab", id: "recovery-rehab" },
        { label: "Frequently asked questions", id: "faqs" },
        { label: "Related information", id: "related-info" },
        { label: "References", id: "references" },
      ];

  const visualAsset = getVisualAsset(`treatments/${slug}`, "overview");

  // Dynamic JSON-LD Schema (MedicalWebPage + MedicalProcedure + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${SITE_URL}/treatments/${treatment.slug}#webpage`,
        "url": `${SITE_URL}/treatments/${treatment.slug}`,
        "name": `${treatment.name} | Lincolnshire Knee Clinic`,
        "headline": treatment.name,
        "description": treatment.metadataDescription,
        "inLanguage": "en-GB",
        ...(visualAsset.imagePath ? { "image": `${SITE_URL}${visualAsset.imagePath}` } : {}),
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
              "name": "Treatments",
              "item": `${SITE_URL}/treatments`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": treatment.name
            }
          ]
        }
      },
      ...(treatment.category === "surgical" ? [
        {
          "@type": "MedicalProcedure",
          "@id": `${SITE_URL}/treatments/${treatment.slug}#procedure`,
          "name": treatment.name,
          "description": treatment.shortDescription,
          "relevantSpecialty": "Orthopedic",
          "associatedAnatomy": {
            "@type": "AnatomicalStructure",
            "name": "Knee joint"
          },
          "possibleTreatment": treatment.alternatives.map((alt) => ({
            "@type": "MedicalTherapy",
            "name": alt
          }))
        }
      ] : []),
      {
        "@type": "FAQPage",
        "mainEntity": treatment.faqs.map((faq) => ({
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
    
    // Check if name matches any treatment slug
    const match = Object.values(treatmentsData).find((t) => name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return `/treatments/${match.slug}`;
    return "/treatments"; // Default safe hub
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs
          items={[
            { label: "Treatments", href: "/treatments" },
            { label: treatment.name },
          ]}
        />
      </div>

      {/* 2. Page Hero */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 relative overflow-hidden w-full border-b border-border-clinical/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Treatments
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4 animate-fade-in">
            {treatment.name}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed">
            {treatment.shortDescription}
          </p>
        </div>
      </section>

      {/* Shared Layout Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start font-sans">
        
        {/* 3. On this page navigation */}
        <TableOfContents items={tableOfContents} />

        {/* Main Content Area - 9 cols */}
        <main className="lg:col-span-9 space-y-12">
          
          {/* 4. Treatment Overview */}
          <section id="overview" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Overview
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              <p>{renderBold(treatment.introduction)}</p>
              <p>{renderBold(treatment.whatIs)}</p>
              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
                This information is for general patient education and does not replace an individual clinical assessment. Suitability and outcomes depend on joint condition and physical health.
              </div>
            </div>
          </section>

          {/* Reusable Medical Illustration Block */}
          <section className="space-y-4">
            <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
              Clinical Overview Illustration
            </h3>
            <MedicalIllustrationBlock pageSlug={`treatments/${slug}`} section="overview" />
          </section>

          {isWeightManagement ? (
            <>
              {/* 3. Why body weight can affect the knee */}
              <section id="weight-effect" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Why body weight can affect the knee
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    During weight-bearing activities such as walking, running, or climbing stairs, the knee joints carry the mechanical load of the body. Force transmission across these joint surfaces is influenced by body weight, and load management can form an important part of conservative care.
                  </p>
                  <p>
                    Crucially, body weight is only one of many interconnected factors that contribute to knee discomfort, joint wear, or stiffness. Other factors that play a key role in joint symptoms include:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {[
                      { name: "Age & Joint Wear", desc: "Natural changes in joint tissues over time." },
                      { name: "Prior Injury", desc: "Past ligament sprains or meniscal tears." },
                      { name: "Joint Alignment", desc: "Individual anatomical tracking and load distribution." },
                      { name: "Muscle Strength", desc: "The support provided by the surrounding musculature." },
                      { name: "Activity Patterns", desc: "Unaccustomed activity or sudden changes in loading." },
                      { name: "Inflammation", desc: "Localized biochemical responses within the joint capsule." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-border-clinical/60 p-4 rounded-xl shadow-sm">
                        <h4 className="font-sans text-xs font-bold text-deep-navy mb-1">{item.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted italic bg-warm-off-white p-3 rounded-lg mt-2">
                    Our approach is supportive, objective, and collaborative. We focus on enhancing function and reducing pain rather than highlighting weight as a sole or isolated cause of knee symptoms.
                  </p>
                </div>
              </section>

              {/* 4. Who may benefit? */}
              <section id="suitability" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Who may benefit?
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    A discussion regarding healthy weight management is introduced when clinically appropriate and aligned with your individual goals. Suitability and approach are highly individual, depending upon:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Your primary knee diagnosis (e.g. osteoarthritis, patellofemoral tracking)",
                      "The severity of your joint symptoms and functional limitations",
                      "Your general physical health, metabolic status, and comorbidities",
                      "Your individual mobility, exercise capacity, and strength levels",
                      "Your personal goals, preferences, and lifestyle circumstances",
                      "Previous responses to conservative treatment options"
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-border-clinical/80 p-4 rounded-xl shadow-sm flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-clinical-teal mt-1.5 shrink-0"></span>
                        <span className="text-xs md:text-sm font-bold text-deep-navy leading-normal">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. Healthy weight management */}
              <section id="healthy-management" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Healthy weight management
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    Sustainable joint health improvements are best achieved through gradual, long-term lifestyle changes rather than rapid or restrictive methods. We advocate for a multi-faceted approach focusing on:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-text-secondary font-medium">
                    <li><strong>Gradual Lifestyle Changes:</strong> Focus on small, manageable adjustments to daily habits.</li>
                    <li><strong>Balanced Nutrition:</strong> Adopting a varied, whole-food dietary pattern that supports energy levels and joint tissues.</li>
                    <li><strong>Physical Activity:</strong> Preserving muscle mass and fitness through comfortable movement.</li>
                    <li><strong>Behaviour Change:</strong> Addressing habit cues, stress, and sleep hygiene.</li>
                    <li><strong>Realistic Goal-Setting:</strong> Prioritizing improvements in joint function, walking comfort, and general vitality over numbers on a scale.</li>
                  </ul>
                  <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
                    We do not prescribe calorie-restricted diets, recommend commercial weight-loss programs, or suggest nutritional supplements.
                  </div>
                </div>
              </section>

              {/* 6. Physical activity */}
              <section id="physical-activity" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Physical activity
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    Physical activity is highly beneficial for knee health, even in the presence of mild discomfort. Safe, low-impact activities help preserve joint range of motion, lubricate the joint surfaces, and strengthen the muscles that offload the joint.
                  </p>
                  <p>
                    Activity plans must be tailored to your current pain levels and mobility:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                    {[
                      { name: "Walking & Low-impact", desc: "Excellent weight-bearing exercise. Can be paced on flat ground." },
                      { name: "Cycling & Swimming", desc: "Non-weight-bearing exercises that maintain cardiovascular health and joint range of motion." },
                      { name: "Physiotherapy & Strengthening", desc: "Targeted quadriceps and gluteal exercises to improve joint stabilization under physical therapy guidance." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm">
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-2">{item.name}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 7. Nutrition */}
              <section id="nutrition" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Nutrition
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    Healthy eating supports overall tissue health, reduces systemic inflammatory markers, and provides the energy required for physical rehabilitation. A balanced approach focuses on nutrient-dense foods, adequate protein to preserve muscle mass, and healthy hydration.
                  </p>
                  <p>
                    Where structured nutritional support or dietary changes are required, we advise consulting an appropriately registered healthcare professional, such as a General Practitioner or a Registered Dietitian, to ensure suitability.
                  </p>
                </div>
              </section>

              {/* 8. When additional support may be appropriate */}
              <section id="additional-support" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  When additional support may be appropriate
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    Achieving healthy lifestyle changes can sometimes benefit from professional support, especially when other medical conditions are present. Options for additional care include:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-text-secondary font-medium">
                    <li><strong>Registered Dietitian Referral:</strong> For individual, evidence-based nutritional plans.</li>
                    <li><strong>Community Health Initiatives:</strong> Local lifestyle support groups and exercise referral schemes.</li>
                    <li><strong>NHS Services:</strong> Tier 2 and Tier 3 weight management pathways where clinically indicated.</li>
                    <li><strong>Specialist Weight Management Services:</strong> Multidisciplinary clinics addressing complex metabolic needs.</li>
                  </ul>
                  <p className="text-xs text-text-muted italic bg-warm-off-white p-3 rounded-lg">
                    [Placeholders: Information about dietitian referrals, community weight management services, and local NHS pathways will be completed following clinic validation.]
                  </p>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* 3. What does this treatment involve? */}
              <section id="involves" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  What does this treatment involve?
                </h2>
                <p className="text-sm md:text-base text-text-secondary font-medium">
                  Typical clinical stages of this treatment pathway include:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {treatment.whatItInvolves.map((step, idx) => (
                    <div key={idx} className="bg-white border border-border-clinical/80 p-4 rounded-xl shadow-sm flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-clinical-teal/10 flex items-center justify-center font-bold text-xs text-clinical-teal shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs md:text-sm font-bold text-deep-navy leading-normal">{step}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Suitability */}
              <section id="suitability" className="scroll-mt-8 space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Suitability
                </h2>
                <p className="text-sm md:text-base text-text-secondary font-medium">
                  Suitability depends entirely on an individual clinical examination, diagnostic imaging, medical history, and personal activity goals.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Who may benefit */}
                  <div className="bg-white border border-border-clinical/85 rounded-xl p-5 shadow-sm">
                    <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-3 border-b border-border-clinical/30 pb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Who may benefit?
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-text-secondary font-medium">
                      {treatment.suitability.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* When might it not be suitable */}
                  <div className="bg-white border border-border-clinical/85 rounded-xl p-5 shadow-sm">
                    <h3 className="font-sans text-sm font-bold text-status-error uppercase tracking-wider mb-3 border-b border-[#FAD8D8] pb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-status-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      When might it not be suitable?
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-text-secondary font-medium">
                      {treatment.notSuitable.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* 6. Alternatives */}
              <section id="alternatives" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Alternatives
                </h2>
                <p className="text-sm md:text-base text-text-secondary font-medium">
                  Alternative treatment pathways that may be considered depending on clinical severity:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {treatment.alternatives.map((alt, idx) => (
                    <div key={idx} className="bg-pale-clinical-blue/20 border border-border-clinical/50 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs md:text-sm font-bold text-deep-navy">{alt}</span>
                      <Link href={getTreatmentLink(alt)} className="text-xs font-semibold text-clinical-teal hover:underline block pt-3">
                        Explore Option &gt;
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Risks */}
              <section id="risks" className="scroll-mt-8 space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Risks
                </h2>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
                  <p>
                    As with any clinical intervention, risks and complications differ between patients. Suitability and risk profiles are discussed in detail during consultation. General risks associated with this procedure include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {treatment.risks.map((risk, idx) => (
                      <div key={idx} className="bg-white border border-[#FAD8D8] p-4 rounded-xl shadow-sm flex items-start gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-error mt-1.5 shrink-0"></span>
                        <span className="text-xs font-semibold text-text-main">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Pass 2 — TreatmentPathway + RecoveryPathway (total-knee-replacement demonstration) */}
              {slug === "total-knee-replacement" && (
                <>
                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                      Treatment Decision Pathway
                    </h2>
                    <TreatmentPathway
                      title="Total Knee Replacement — Decision Pathway"
                      subtitle="A general educational overview of the stages from first assessment to post-operative care."
                      showBranchLabels={true}
                      steps={[
                        {
                          id: "tkr-1",
                          label: "Initial Consultation",
                          description: "Clinical examination, X-rays, and symptom review to confirm diagnosis and discuss suitability.",
                          tag: "Assessment",
                          href: "/clinics",
                          branch: "both",
                        },
                        {
                          id: "tkr-2",
                          label: "Optimisation",
                          description: "Pre-operative preparation including health optimisation, anaesthetic assessment, and consent.",
                          tag: "Pre-op",
                          branch: "surgical",
                        },
                        {
                          id: "tkr-3",
                          label: "Surgery",
                          description: "Total knee replacement performed under general or spinal anaesthetic. Duration approximately 1-2 hours.",
                          tag: "Procedure",
                          branch: "surgical",
                          isCurrent: false,
                        },
                        {
                          id: "tkr-4",
                          label: "Inpatient Recovery",
                          description: "Typically 1-3 nights. Early mobilisation begins on the day of surgery.",
                          tag: "Acute Care",
                          branch: "surgical",
                        },
                        {
                          id: "tkr-5",
                          label: "Rehabilitation",
                          description: "Physiotherapy-led programme. Timeline varies by individual progress and clinical findings.",
                          tag: "Recovery",
                          href: "/treatments/physiotherapy",
                          branch: "surgical",
                        },
                      ]}
                    />
                  </section>

                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                      Phased Recovery Overview
                    </h2>
                    <RecoveryPathway
                      title="Total Knee Replacement Recovery Phases"
                      procedureName="TKR"
                      subtitle="A general educational guide. Your actual progression will be guided by your surgeon and physiotherapist."
                      phases={[
                        {
                          phaseNumber: 1,
                          title: "Initial Mobilisation",
                          timeframe: "Weeks 1–2",
                          focus: "Swelling control, initial knee extension, early activation of quadriceps and calf muscles.",
                          milestones: [
                            "Stand and walk short distances with mobility aids",
                            "Achieve full passive knee extension",
                            "Begin gentle ankle pump and quad set exercises",
                            "Wound inspection at 10–14 days",
                          ],
                          weightBearing: "Weight-bearing as tolerated",
                          mobilityAid: "Crutches or frame",
                          drivingStatus: "Not permitted",
                          warningNote: "Inform the clinical team if you notice increasing warmth, swelling, redness, offensive discharge, fever, or severe pain at any stage.",
                        },
                        {
                          phaseNumber: 2,
                          title: "Gait and Range Restoration",
                          timeframe: "Weeks 3–6",
                          focus: "Normal walking pattern, progressive knee flexion beyond 90°, reduced reliance on mobility aids.",
                          milestones: [
                            "Walking without aids on flat surfaces",
                            "Knee flexion progressing toward 100-110°",
                            "Introducing stair climbing with support",
                          ],
                          weightBearing: "Full weight-bearing (progress with physio guidance)",
                          mobilityAid: "Single crutch or stick as needed",
                          drivingStatus: "Discuss with your consultant — typically not before 6 weeks",
                        },
                        {
                          phaseNumber: 3,
                          title: "Function and Strength",
                          timeframe: "Weeks 6–12",
                          focus: "Strengthening quadriceps and glutes, improving functional capacity and walking endurance.",
                          milestones: [
                            "Managing stairs without support rails",
                            "Walking increasingly longer distances",
                            "Return to light social activities",
                          ],
                          weightBearing: "Full weight-bearing",
                          mobilityAid: "None for most patients",
                          drivingStatus: "With consultant approval only",
                        },
                        {
                          phaseNumber: 4,
                          title: "Long-Term Activity",
                          timeframe: "3–12 Months",
                          focus: "Consolidating strength, returning to appropriate low-impact activities, and longer-term joint maintenance.",
                          milestones: [
                            "Return to low-impact leisure activities (e.g. swimming, cycling)",
                            "Sustained improvements in pain and function",
                            "Annual review if recommended",
                          ],
                          weightBearing: "Full weight-bearing",
                          drivingStatus: "Permitted from appropriate stage with consultant clearance",
                          warningNote: "High-impact activities (running, contact sports, heavy jumping) are generally not recommended after total knee replacement. Discuss your activity goals with your surgeon.",
                        },
                      ]}
                    />
                  </section>
                </>
              )}

              {/* 7. Recovery & Rehabilitation */}
              <section id="recovery-rehab" className="scroll-mt-8 space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
                  Recovery & Rehabilitation
                </h2>
                <p className="text-sm md:text-base text-text-secondary font-medium">
                  Post-treatment rehabilitation and timelines are key to restoring joint health. We do not provide guaranteed recovery times.
                </p>

                {/* Suitability Pathway and Comparison System */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recovery Card */}
                  <div className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm">
                    <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-3 border-b border-border-clinical/30 pb-2">
                      Immediate Recovery
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-text-secondary font-medium">
                      {treatment.recovery.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Rehab Card */}
                  <div className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm">
                    <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-3 border-b border-border-clinical/30 pb-2">
                      Rehabilitation Pathway
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-text-secondary font-medium">
                      {treatment.rehabilitation.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Phased Timeline Visual */}
                <div className="pt-4">
                  <RecoveryTimelineBlock
                    title={`${treatment.name} Recovery Timeline`}
                    subtitle="Typical phase-based progression and return to functional activity guidelines."
                    phases={(() => {
                      if (slug === "total-knee-replacement" || slug === "partial-knee-replacement" || slug === "revision-knee-replacement" || slug === "acl-reconstruction") {
                        return [
                          {
                            timeframe: "Phase 1 (Weeks 1-2)",
                            title: "Initial Mobility & Healing",
                            focus: "Control swelling, achieve full extension, activate key stabilizing muscles.",
                            guidelines: [
                              "Use crutches or support frame for safety",
                              "Perform gentle range of motion exercises (0-90° flexion)",
                              "Regular elevation and icing to manage inflammatory response"
                            ],
                            weightBearing: "Weight-bearing as tolerated with aids",
                            drivingText: "Not permitted"
                          },
                          {
                            timeframe: "Phase 2 (Weeks 3-6)",
                            title: "Gait Normalisation & Range",
                            focus: "Restore normal walking gait, progress knee bending beyond 90°, and increase standing load.",
                            guidelines: [
                              "Gradually wean off walking aids as gait stabilizes",
                              "Introduce closed-chain exercises (squats, calf raises)",
                              "Increase active movement and daily walking distances"
                        ],
                        weightBearing: "Full weight-bearing",
                        drivingText: "Permitted once emergency stop is safe (approx. 6 weeks)"
                      },
                      {
                        timeframe: "Phase 3 (Weeks 6-12+)",
                        title: "Strengthening & Functional Return",
                        focus: "Restore leg strength, balance, and return to light work/recreation.",
                        guidelines: [
                          "Progress resistance training (leg press, cycling)",
                          "Incorporate balance and coordination drills",
                          "Gradual return to work, driving, and low-impact activity"
                        ],
                        weightBearing: "Unrestricted",
                        drivingText: "Permitted"
                      }
                    ];
                  }
                  return [
                    {
                      timeframe: "Phase 1 (Early Stage)",
                      title: "Immediate Recovery & Adaptation",
                      focus: "Pain control, local tissue protection, and load modification.",
                      guidelines: treatment.recovery
                    },
                    {
                      timeframe: "Phase 2 (Active Rehab)",
                      title: "Strength & Movement Restoration",
                      focus: "Targeted exercise to rebuild joint capacity and confidence.",
                      guidelines: treatment.rehabilitation
                    }
                  ];
                })()}
              />
            </div>

            {/* Surgical to Recovery Resource linking */}
            {treatment.category === "surgical" && (
              <div className="bg-pale-clinical-blue/20 border border-border-clinical/60 rounded-xl p-5 mt-4 space-y-3">
                <h4 className="font-sans text-xs font-bold text-deep-navy uppercase tracking-wider">
                  Surgical Recovery Resources
                </h4>
                <p className="text-xs text-text-secondary font-medium">
                  As this is a surgical procedure, you may find our recovery resources helpful. These explain how to prepare and what to expect:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  {[
                    { name: "Preparing for Surgery", slug: "preparing-for-surgery" },
                    { name: "Enhanced Recovery (ERAS)", slug: "enhanced-recovery" },
                    { name: "Physiotherapy After Surgery", slug: "physiotherapy-after-surgery" },
                    { name: "Returning to Driving", slug: "returning-to-driving" },
                    { name: "Returning to Work", slug: "returning-to-work" },
                    { name: "Returning to Sport", slug: "returning-to-sport" },
                  ].map((res, idx) => (
                    <Link
                      key={idx}
                      href={`/treatments/${res.slug}`}
                      className="bg-white border border-border-clinical/50 p-2.5 rounded text-center text-xs font-bold text-clinical-teal hover:bg-clinical-teal/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                    >
                      {res.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suitability Pathway mapping */}
            <div className="pt-6 border-t border-border-clinical/30">
              <VisualSectionHeading title="Clinical Pathway Map" subtitle="Staged treatment and recovery journey." />
              <VisualPathwayBlock type="recovery" className="mt-4" />
            </div>

            {/* Comparison Diagram showing treatments comparisons */}
            <div className="pt-6 border-t border-border-clinical/30">
              <ComparisonDiagramBlock
                title="Management Strategy Comparison"
                subtitle="Comparing conservative treatment with active intervention options."
                leftTitle="Conservative Path"
                rightTitle="Interventional Path"
                leftPlaceholderLabel="Non-operative pathway illustration"
                rightPlaceholderLabel="Operative/active intervention illustration"
                comparisonPoints={[
                  { feature: "Primary Focus", normal: "Symptom management, quad strength, offloading", abnormal: "Structural correction, joint resurfacing or repair" },
                  { feature: "Timeframe", normal: "Gradual ongoing adaptation over 3-6 months", abnormal: "Structured acute healing followed by targeted rehab" },
                  { feature: "Expected Outcome", normal: "Improved function and pain control, preserved anatomy", abnormal: "Restored mechanical stability, reconstructed tissue" }
                ]}
                pathologyHighlightLabel="Intervention Options"
                leftBadgeLabel="Conservative Path"
                rightBadgeLabel="Interventional Path"
                leftImageSrc={slug === "physiotherapy" ? physiotherapyConservative : undefined}
                rightImageSrc={slug === "physiotherapy" ? physiotherapyInterventional : undefined}
              />
            </div>
              </section>
            </>
          )}

          {/* 8. Frequently Asked Questions */}
          <section id="faqs" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-2">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={treatment.faqs} />
          </section>

          {/* Related information (conditions, symptoms, treatments) */}
          <section id="related-info" className="scroll-mt-8 space-y-6">
            
            {/* 9. Related Conditions */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Conditions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {treatment.relatedConditions.map((relatedSlug) => {
                  const cond = conditionsData[relatedSlug];
                  if (!cond) return null;
                  return (
                    <div key={relatedSlug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{cond.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{cond.shortDescription}</p>
                      </div>
                      <Link href={`/conditions/${relatedSlug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Condition Profile &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10. Related Symptoms */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Symptoms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {treatment.relatedSymptoms.map((relatedSlug) => {
                  const sym = symptomsData[relatedSlug];
                  if (!sym) return null;
                  return (
                    <div key={relatedSlug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{sym.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{sym.shortDescription}</p>
                      </div>
                      <Link href={`/symptoms/${relatedSlug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Symptom Profile &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 13. Related Treatments */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {treatment.relatedTreatments.map((relatedSlug) => {
                  const treat = treatmentsData[relatedSlug];
                  if (!treat) return null;
                  return (
                    <div key={relatedSlug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{treat.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{treat.shortDescription}</p>
                      </div>
                      <Link href={`/treatments/${relatedSlug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Treatment &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 18. Clinical Review card */}
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

          {/* References */}
          <ReferencesList
            staticReferences={treatment.references}
            evidenceSource={clinicalReview.evidenceSource}
          />

        </main>
      </div>

      {/* 17. Booking CTA */}
      <section className="bg-warm-off-white py-16 md:py-20 w-full border-t border-b border-border-clinical/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-4">
            Would you like to discuss your treatment options?
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
          <ContinueYourKneeJourney currentStage={treatment.category === "recovery" ? "recovery" : "treatment"} />
        </div>
      </section>

      {/* Topic notify */}
      <section className="bg-white py-6 w-full">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <TopicNotifyWidget topicId={`treatment:${slug}`} topicLabel={treatment.name} />
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="bg-white py-6 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <MedicalDisclaimerBlock />
        </div>
      </section>
    </div>
  );
};
