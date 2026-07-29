import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Button } from "@/components/Button";
import { UrgentAdviceBanner } from "@/components/UrgentAdviceBanner";
import Link from "next/link";
import { symptomsData } from "@/data/symptoms";
import { conditionsData } from "@/data/conditions";
import { getVisualAsset } from "@/data/visualsInventory";
import { getClinicalReviewStatus } from "@/lib/clinicalReview";
import { SITE_URL } from "@/lib/site";
import { ContinueYourKneeJourney } from "@/components/ContinueYourKneeJourney";
import { MedicalIllustrationBlock } from "@/components/visuals/MedicalIllustrationBlock";
import { PainLocationMap } from "@/components/visuals/PainLocationMap";
import { VisualPathwayBlock } from "@/components/visuals/VisualPathwayBlock";
import MedialKneePainDiagram from "@/components/visuals/MedialKneePainDiagram";

// Dynamic metadata helper for individual routes
export function getSymptomMetadata(slug: string): Metadata {
  const symptom = symptomsData[slug];
  if (!symptom) {
    return {
      title: "Symptom Details | Lincolnshire Knee Clinic",
    };
  }
  // Prefer the symptom's own overview illustration for the share image; fall back
  // to the clinic logo if no real asset exists yet for this symptom.
  const visualAsset = getVisualAsset(`symptoms/${slug}`, "overview");
  const shareImage = visualAsset.imagePath
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
    title: symptom.metadataTitle,
    description: symptom.metadataDescription,
    alternates: {
      canonical: `${SITE_URL}/symptoms/${symptom.slug}`,
    },
    openGraph: {
      title: symptom.metadataTitle,
      description: symptom.metadataDescription,
      url: `${SITE_URL}/symptoms/${symptom.slug}`,
      type: "article",
      images: [shareImage],
    },
    twitter: {
      card: "summary",
      title: symptom.metadataTitle,
      description: symptom.metadataDescription,
      images: [shareImage.url],
    },
  };
}

interface SymptomPageProps {
  slug: string;
}

export const SymptomPage: React.FC<SymptomPageProps> = ({ slug }) => {
  const symptom = symptomsData[slug];
  const clinicalReview = getClinicalReviewStatus(`symptoms/${slug}`);

  if (!symptom) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center font-sans">
        <h1 className="text-2xl font-serif font-bold text-deep-navy">Symptom Not Found</h1>
        <p className="text-text-secondary mt-2 mb-6">The requested symptom page does not exist.</p>
        <Button href="/symptoms">Back to Symptoms Hub</Button>
      </div>
    );
  }

  // Anchor navigation index
  const tableOfContents = [
    { label: "Overview", id: "overview" },
    { label: "How it presents", id: "presents" },
    { label: "Possible causes", id: "causes" },
    { label: "Urgent advice", id: "urgent" },
    { label: "Assessment", id: "assessment" },
    { label: "Investigations", id: "investigations" },
    { label: "What may help", id: "help" },
    { label: "Frequently asked questions", id: "faqs" },
    { label: "Related information", id: "related-info" },
    { label: "References", id: "references" },
  ];

  // Dynamic JSON-LD Schema (WebPage + FAQPage, avoiding MedicalCondition classification)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${SITE_URL}/symptoms/${symptom.slug}#webpage`,
        "url": `${SITE_URL}/symptoms/${symptom.slug}`,
        "name": symptom.metadataTitle,
        "headline": symptom.name,
        "description": symptom.metadataDescription,
        "inLanguage": "en-GB",
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
              "name": "Symptoms",
              "item": `${SITE_URL}/symptoms`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": symptom.name
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": symptom.faqs.map((faq) => ({
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

  // Short, treatment-specific description shown on each Related Treatments card
  const getTreatmentBlurb = (name: string): string => {
    const cleanName = name.toLowerCase();
    if (cleanName.includes("injection")) return "Cortisone, hyaluronic acid, PRP and Arthrosamid options explained.";
    if (cleanName.includes("appointment") || cleanName.includes("book")) return "Arrange a specialist assessment to discuss your symptoms directly.";
    if (cleanName.includes("second opinion") || cleanName.includes("consultation")) return "Discuss previous imaging or treatment recommendations with our team.";
    if (cleanName.includes("physiotherapy") || cleanName.includes("rehab")) return "Structured, exercise-based rehabilitation to strengthen and stabilise the joint.";
    if (cleanName.includes("activity")) return "Guidance on adapting activity levels to reduce symptom flare-ups.";
    if (cleanName.includes("pain")) return "Approaches to help manage and reduce ongoing knee pain.";
    if (cleanName.includes("brace") || cleanName.includes("bracing")) return "Support options to stabilise the joint during activity or recovery.";
    if (cleanName.includes("arthroscopy")) return "Minimally invasive surgical assessment and treatment of joint problems.";
    if (cleanName.includes("meniscal") || cleanName.includes("meniscus")) return "Surgical repair or partial removal of a torn meniscus.";
    if (cleanName.includes("acl")) return "Surgical reconstruction of a torn anterior cruciate ligament.";
    if (cleanName.includes("cartilage")) return "Surgical options to repair or manage cartilage damage.";
    if (cleanName.includes("stabilisation") || cleanName.includes("stabilization")) return "Surgical options to address recurrent kneecap instability.";
    if (cleanName.includes("partial knee")) return "Replacing only the damaged compartment of the knee joint.";
    if (cleanName.includes("total knee")) return "Full joint replacement for advanced, widespread knee wear.";
    if (cleanName.includes("revision")) return "Revising a previous knee replacement that has worn or failed.";
    if (cleanName.includes("weight")) return "How body weight affects joint loading and long-term knee health.";
    return "Learn more about this treatment option.";
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
            { label: "Symptoms", href: "/symptoms" },
            { label: symptom.name },
          ]}
        />
      </div>

      {/* 2. Compact dark navy page hero */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 relative overflow-hidden w-full border-b border-border-clinical/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Symptoms
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4 animate-fade-in">
            {symptom.name}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed">
            {symptom.shortDescription}
          </p>
        </div>
      </section>

      {/* Shared Layout Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start font-sans">
        
        {/* 3. On this page navigation (Desktop Sticky) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-6">
          <div className="bg-pale-clinical-blue/30 border border-border-clinical/50 p-5 rounded-xl text-left">
            <h3 className="font-sans text-xs font-bold text-deep-navy uppercase tracking-wider mb-4 border-b border-border-clinical/40 pb-2">
              On this page
            </h3>
            <nav className="flex flex-col gap-3">
              {tableOfContents.map((toc, idx) => (
                <Link
                  key={idx}
                  href={`#${toc.id}`}
                  className="text-xs font-semibold text-text-secondary hover:text-clinical-teal transition-colors block py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                >
                  {toc.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Sections - 9 cols */}
        <main className="lg:col-span-9 space-y-12">
          
          {/* 4. What does this symptom mean? */}
          <section id="overview" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              What does this symptom mean?
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              <p>{symptom.whatIs}</p>
              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
                This information is for general patient education and does not provide a diagnosis. Similar symptoms can occur with several different knee conditions.
              </div>
            </div>
          </section>

          {/* Reusable Medical Illustration Block */}
          <section className="space-y-4">
            <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-2">
              Anatomical Overview
            </h3>
            {slug === "inner-knee-pain" ? (
              <MedialKneePainDiagram className="my-6" />
            ) : (
              <MedicalIllustrationBlock pageSlug={`symptoms/${slug}`} section="overview" />
            )}
          </section>

          {/* Interactive Pain Location Map */}
          <section className="space-y-4">
            <PainLocationMap
              defaultView={
                slug === "back-of-knee-pain"
                  ? "back"
                  : slug === "inner-knee-pain"
                  ? "inner"
                  : slug === "outer-knee-pain"
                  ? "outer"
                  : "front"
              }
            />
          </section>

          {/* Educational Journey Pathway */}
          <section className="space-y-4">
            <h3 className="font-sans text-base font-bold text-deep-navy uppercase tracking-wider border-b border-border-border-clinical/30 pb-2">
              Symptom-to-Recovery Pathway
            </h3>
            <VisualPathwayBlock type="patient-journey" />
          </section>

          {/* 5. How the symptom may present */}
          <section id="presents" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              How the symptom may present
            </h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">
              Patients describe this symptom in various ways depending on its trigger and severity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {symptom.commonPresentations.map((presentation, idx) => (
                <div key={idx} className="bg-white border border-border-clinical/80 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-clinical-teal mt-1.5 shrink-0"></span>
                  <span className="text-xs md:text-sm font-bold text-deep-navy leading-normal">{presentation}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-text-muted font-medium bg-warm-off-white p-4 rounded-lg mt-2">
              <strong>Pattern & Duration: </strong>{symptom.durationPattern}
            </div>
          </section>

          {/* 6. Possible causes */}
          <section id="causes" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Possible causes
            </h2>
            <div className="text-sm md:text-base text-text-secondary leading-relaxed font-medium space-y-4">
              <p>
                The possible causes listed below are not exhaustive. One symptom can have several underlying causes, and a clinical assessment is typically required to confirm a diagnosis.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {symptom.possibleCauses.map((causeSlug) => {
                  const condition = conditionsData[causeSlug];
                  if (!condition) return null;
                  return (
                    <div key={causeSlug} className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-sans text-sm font-bold text-deep-navy mb-2">{condition.name}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed mb-4">
                          {condition.shortDescription}
                        </p>
                      </div>
                      <Link href={`/conditions/${causeSlug}`} className="text-xs font-bold text-clinical-teal hover:underline block">
                        View Condition Profile &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 7. When to seek urgent advice */}
          <section id="urgent" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              When to seek urgent advice
            </h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">
              Certain symptoms (red flags) indicate the need for prompt clinical evaluation. Seek immediate assessment if you experience:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-text-secondary font-medium">
              {symptom.warningSigns.map((sign, idx) => (
                <li key={idx} className="text-status-error font-semibold">{sign}</li>
              ))}
            </ul>
            <UrgentAdviceBanner className="rounded-xl border mt-4" showDetails={true} />
          </section>

          {/* 8. How the symptom is assessed */}
          <section id="assessment" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              How the symptom is assessed
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              Your consultant will carry out a thorough assessment to understand the triggers, location, and functional impact of the symptom.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-text-secondary font-medium">
              {symptom.assessment.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
              A diagnosis should not be made from website information alone.
            </div>
          </section>

          {/* 9. Investigations that may be considered */}
          <section id="investigations" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Investigations that may be considered
            </h2>
            <p className="text-sm md:text-base text-text-secondary font-medium">
              Depending on the findings of your clinical assessment, your consultant may recommend imaging scans:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {symptom.investigations.map((test, idx) => (
                <div key={idx} className="bg-white border border-border-clinical rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-deep-navy mb-2">{test.split(" to ")[0]}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      {test.includes(" to ") ? test.split(" to ")[1] : "Indicated depending on clinical findings."}
                    </p>
                  </div>
                  <Link href="/diagnostics" className="text-xs font-bold text-clinical-teal hover:underline block mt-2">
                    Diagnostics & Imaging &gt;
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* 10. What may help initially */}
          <section id="help" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              What may help initially
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              For non-urgent presentations, simple self-care and load management can help settle symptoms:
            </p>
            <ul className="list-disc pl-5 space-y-2.5 text-xs md:text-sm text-text-secondary font-medium">
              {symptom.initialManagement.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-2">
              Advice depends on the cause of the symptom and an individual assessment may be required.
            </div>
          </section>

          {/* 11. When to arrange a consultation */}
          <section className="bg-pale-clinical-blue/20 border border-border-clinical/50 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy">
              When to arrange a professional consultation
            </h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
              You should arrange a specialist consultation if you experience any of the following:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary font-medium">
              {symptom.whenToConsult.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 12. Frequently asked questions */}
          <section id="faqs" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-2">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={symptom.faqs} />
          </section>

          {/* 13. Related information (symptoms, conditions, treatments) */}
          <section id="related-info" className="scroll-mt-8 space-y-6">
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Symptoms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {symptom.relatedSymptoms.map((relatedSlug) => {
                  const relSymptom = symptomsData[relatedSlug];
                  if (!relSymptom) return null;
                  return (
                    <div key={relatedSlug} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{relSymptom.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">{relSymptom.shortDescription}</p>
                      </div>
                      <Link href={`/symptoms/${relatedSlug}`} className="text-xs font-bold text-clinical-teal hover:underline">
                        View Symptom &gt;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 14. Possible related conditions */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Possible Related Conditions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {symptom.relatedConditions.map((relatedSlug) => {
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

            {/* 15. Related treatments */}
            <div className="border-t border-border-clinical/30 pt-6">
              <h3 className="font-sans text-sm font-bold text-deep-navy uppercase tracking-wider mb-4">
                Related Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {symptom.relatedTreatments.map((treatment, idx) => (
                  <div key={idx} className="bg-white border border-border-clinical rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1">{treatment}</h4>
                      <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">
                        {getTreatmentBlurb(treatment)}
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

          {/* 17. Clinical Review card */}
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

          {/* 18. References */}
          <section id="references" className="scroll-mt-8 border-t border-border-clinical/30 pt-6">
            <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
              References
            </span>
            {symptom.references && symptom.references.length > 0 ? (
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-text-muted font-medium">
                {symptom.references.map((reference, idx) => (
                  <li key={idx}>
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-clinical-teal hover:underline"
                    >
                      {reference.text}
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <>
                <ul className="list-decimal pl-5 space-y-1.5 text-xs text-text-muted font-medium">
                  <li>[Evidence Source 1]</li>
                  <li>[Evidence Source 2]</li>
                  <li>[Evidence Source 3]</li>
                </ul>
                <p className="text-[10px] text-text-muted italic mt-2.5">
                  References will be completed and clinically reviewed before publication.
                </p>
              </>
            )}
          </section>

        </main>
      </div>

      {/* 16. Booking CTA */}
      <section className="bg-warm-off-white py-16 md:py-20 w-full border-t border-b border-border-clinical/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-4">
            Would you like an individual knee assessment?
          </h2>
          <p className="font-sans text-sm md:text-base text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            A consultation can help clarify the possible cause of your symptoms and discuss appropriate next steps.
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
          <ContinueYourKneeJourney currentStage="symptom" />
        </div>
      </section>

      {/* 19. Medical Disclaimer */}
      <section className="bg-white py-6 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <MedicalDisclaimerBlock />
        </div>
      </section>
    </div>
  );
};
