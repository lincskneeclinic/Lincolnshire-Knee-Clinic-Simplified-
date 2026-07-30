import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { Button } from "@/components/Button";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { ReferencesList } from "@/components/ReferencesList";
import { FaqAccordion } from "@/components/FaqAccordion";
import { injectionsData } from "@/data/injections";
import { getClinicalReviewStatus } from "@/lib/clinicalReview";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { InjectionExplanationBlock } from "@/components/visuals/InjectionExplanationBlock";
import { getVisualAsset } from "@/data/visualsInventory";
import { SITE_URL } from "@/lib/site";

interface InjectionPageProps {
  slug: string;
}

export function getInjectionMetadata(slug: string): Metadata {
  const injection = injectionsData.find((inj) => inj.slug === slug);
  if (!injection) return {};
  
  const siteUrl = SITE_URL;
  
  return {
    title: injection.metaTitle,
    description: injection.metaDescription,
    alternates: {
      canonical: `${siteUrl}/injections/${slug}`,
    },
    openGraph: {
      title: injection.metaTitle,
      description: injection.metaDescription,
      url: `${siteUrl}/injections/${slug}`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/injections/${slug}-anatomy.png`,
          width: 800,
          height: 600,
          alt: injection.metaTitle,
        }
      ]
    },
    twitter: {
      title: injection.metaTitle,
      description: injection.metaDescription,
      card: "summary_large_image",
    },
  };
}

export const InjectionPage = async ({ slug }: InjectionPageProps) => {
  const injection = injectionsData.find((inj) => inj.slug === slug);
  if (!injection) {
    notFound();
  }
  const clinicalReview = await getClinicalReviewStatus(`injections/${slug}`);

  const tableOfContents = [
    { label: "Overview", id: "overview" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Suitability", id: "suitability" },
    { label: "Benefits & Risks", id: "benefits-risks" },
    { label: "Procedure", id: "procedure" },
    { label: "Aftercare", id: "aftercare" },
    { label: "Frequently Asked Questions", id: "faqs" },
    { label: "Related Resources", id: "related-resources" },
    { label: "References", id: "references" },
  ];

  const visualAsset = getVisualAsset(`injections/${slug}`, "anatomy");

  // Dynamic JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${SITE_URL}/injections/${injection.slug}#webpage`,
        "url": `${SITE_URL}/injections/${injection.slug}`,
        "name": injection.metaTitle,
        "headline": injection.title,
        "description": injection.metaDescription,
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
              "name": "Injections",
              "item": `${SITE_URL}/injections`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": injection.title
            }
          ]
        },
        "about": {
          "@id": `${SITE_URL}/injections/${injection.slug}#procedure`
        }
      },
      {
        "@type": "MedicalProcedure",
        "@id": `${SITE_URL}/injections/${injection.slug}#procedure`,
        "name": injection.title,
        "description": injection.oneSentenceDescription,
        "bodyLocation": "Knee joint",
        "relevantSpecialty": "Orthopedic",
        "mainEntityOfPage": `${SITE_URL}/injections/${injection.slug}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": injection.faqs.map((faq) => ({
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs
          items={[
            { label: "Injections", href: "/injections" },
            { label: injection.title },
          ]}
        />
      </div>

      {/* Page Hero */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 relative overflow-hidden w-full border-b border-border-clinical/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Injection Therapy
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4">
            {injection.title}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed">
            {injection.oneSentenceDescription}
          </p>
        </div>
      </section>

      {/* Shared Layout Structure */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start font-sans">
        
        {/* On This Page Navigation Index */}
        <TableOfContents items={tableOfContents} />

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-12">
          
          {/* Section 2: What is this injection? */}
          <section id="overview" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              What is a {injection.title}?
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              <p>{injection.description}</p>
              
              {/* Injection Explanation Block */}
              <div className="my-6">
                <InjectionExplanationBlock
                  injectionName={injection.title}
                  injectionSlug={injection.slug}
                  procedureSteps={injection.procedureSteps}
                  aftercareSteps={injection.aftercareSteps}
                  comparisonProps={(() => {
                    switch (injection.slug) {
                      case "corticosteroid":
                        return {
                          onset: "24-48 hours",
                          duration: "6-12 weeks",
                          primaryEffect: "Rapid anti-inflammatory action",
                          suitability: "Acute osteoarthritis flares & synovitis"
                        };
                      case "hyaluronic-acid":
                        return {
                          onset: "2-4 weeks",
                          duration: "6-9 months",
                          primaryEffect: "Joint lubrication & viscosupplementation",
                          suitability: "Mild-to-moderate knee osteoarthritis"
                        };
                      case "prp":
                        return {
                          onset: "4-6 weeks",
                          duration: "6-12 months",
                          primaryEffect: "Growth factor cell signaling",
                          suitability: "Mild osteoarthritis or chronic tendinopathy"
                        };
                      case "arthrosamid":
                        return {
                          onset: "4-8 weeks",
                          duration: "12-24 months+",
                          primaryEffect: "Synovial cushion hydrogel integration",
                          suitability: "Moderate-to-severe knee osteoarthritis"
                        };
                      default:
                        return {
                          onset: "Varies",
                          duration: "Varies",
                          primaryEffect: "Targeted direct-to-joint therapy",
                          suitability: "Orthopaedic assessment indicators"
                        };
                    }
                  })()}
                />
              </div>

              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted">
                This information is for general patient education and does not replace an individual clinical assessment.
              </div>

              {slug === "arthrosamid" && (
                <div className="mt-8 bg-gradient-to-br from-pale-clinical-blue/20 to-warm-off-white/40 border border-border-clinical/60 p-6 rounded-2xl">
                  <h3 className="font-serif text-lg font-bold text-deep-navy mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-clinical-teal shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Clinical Presentation: 5-Year Patient Updates
                  </h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-4">
                    Watch this clinical patient presentation highlighting the latest 5-year updates and long-term joint outcomes for Arthrosamid® hydrogel treatment.
                  </p>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-border-clinical">
                    <video
                      src="/videos/arthrosamid-patient-video.mp4"
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: How does it work? */}
          <section id="how-it-works" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              How does it work?
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              {injection.howItWorks}
            </p>
          </section>

          {/* Sections 4 & 5: Suitability */}
          <section id="suitability" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Who is this suitable for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Indications */}
              <div className="bg-warm-off-white/40 border border-border-clinical/30 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-4 text-base border-b border-border-clinical/20 pb-2">
                  Patients Who May Be Considered
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {injection.whoConsidered.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contraindications */}
              <div className="bg-warm-off-white/40 border border-border-clinical/30 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-4 text-base border-b border-border-clinical/20 pb-2">
                  Who May Not Be Suitable
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {injection.whoNotSuitable.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-status-error/85 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </section>

          {/* Sections 6 & 7: Benefits & Risks */}
          <section id="benefits-risks" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Potential Benefits &amp; Risks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Benefits */}
              <div className="bg-pale-clinical-blue/20 border border-clinical-teal/15 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-4 text-base border-b border-border-clinical/20 pb-2">
                  Potential Benefits
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {injection.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-clinical-teal shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="bg-warm-off-white/40 border border-border-clinical/30 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-4 text-base border-b border-border-clinical/20 pb-2">
                  Risks &amp; Limitations
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {injection.risksLimitations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#D97706] shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </section>

          {/* Section 8: What happens during the procedure? */}
          <section id="procedure" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              What happens during the procedure?
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-4 font-medium">
              Knee injections are outpatient procedures completed in our sterile clinical rooms. The step-by-step process is detailed in the interactive guide above, including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-border-clinical p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-deep-navy block mb-1">1. Preparation & Cleaning</span>
                <span className="text-[11px] text-text-secondary font-medium">Joint positioning, skin disinfection, and local anaesthetic.</span>
              </div>
              <div className="bg-white border border-border-clinical p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-deep-navy block mb-1">2. Needle Insertion</span>
                <span className="text-[11px] text-text-secondary font-medium">Precise injection, often under ultrasound guidance.</span>
              </div>
              <div className="bg-white border border-border-clinical p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-deep-navy block mb-1">3. Dressing & Monitoring</span>
                <span className="text-[11px] text-text-secondary font-medium">Sterile dressing applied and post-procedure check.</span>
              </div>
            </div>
            <div className="bg-pale-clinical-blue/30 border border-border-clinical/40 px-4 py-3 rounded-lg text-xs md:text-sm font-semibold mt-4 text-deep-navy flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>Needle placement may be performed under real-time imaging guidance depending on clinical indication.</span>
              <Link href="/injections/ultrasound-guided-knee-injections" className="text-clinical-teal hover:underline shrink-0 font-bold">
                Learn about ultrasound-guided knee injections &rarr;
              </Link>
            </div>
          </section>

          {/* Section 9: After the injection */}
          <section id="aftercare" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              After the injection
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-4 font-medium">
              Aftercare is focused on protecting the joint and monitoring for rare complications. Guidelines are outlined in the interactive tabs above. Remember to rest the joint for the first 48 hours and avoid unaccustomed heavy loads.
            </p>
          </section>

          {/* Section 10: Frequently Asked Questions */}
          <section id="faqs" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={injection.faqs} />
          </section>

          {/* Sections 11, 12, 13: Related Resources */}
          <section id="related-resources" className="scroll-mt-8 space-y-6 border-t border-border-clinical/30 pt-8">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Related Clinical Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Related Conditions */}
              <div className="space-y-3">
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Related Conditions</span>
                <div className="flex flex-col gap-2.5">
                  {injection.relatedConditions.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-sm font-semibold text-deep-navy hover:text-clinical-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                    >
                      {item.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Symptoms */}
              <div className="space-y-3">
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Related Symptoms</span>
                <div className="flex flex-col gap-2.5">
                  {injection.relatedSymptoms.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-sm font-semibold text-deep-navy hover:text-clinical-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                    >
                      {item.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Treatments */}
              <div className="space-y-3">
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Other Treatments</span>
                <div className="flex flex-col gap-2.5">
                  {injection.relatedTreatments.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-sm font-semibold text-deep-navy hover:text-clinical-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                    >
                      {item.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Shared Educational Section: Choosing an injection */}
          <section className="bg-pale-clinical-blue/30 border border-border-clinical/40 rounded-xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl font-bold text-deep-navy">Which injection may be appropriate?</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Choosing an injection therapy requires an individualized clinical assessment. The choice depends upon several factors, including:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-text-secondary list-disc pl-5">
              <li>Verified clinical diagnosis</li>
              <li>Type and severity of symptoms</li>
              <li>Diagnostic imaging findings (X-ray, MRI, Ultrasound)</li>
              <li>Patient activity levels and functional goals</li>
              <li>Previous conservative treatments attempted</li>
              <li>Individual medical history, medications, and allergies</li>
              <li>Potential clinical risks versus patient-specific benefits</li>
              <li>Available non-injection treatment alternatives</li>
            </ul>
            <p className="text-sm text-text-secondary font-semibold leading-relaxed border-t border-border-clinical/20 pt-4 mt-2">
              ⚠️ <span className="text-deep-navy">Only an individual consultation with our consultant orthopaedic surgeon can determine whether a knee injection is clinically appropriate for your condition.</span>
            </p>
          </section>

          {/* Section 14: Book Appointment */}
          <section className="bg-soft-blue border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-1.5">
                Schedule a Clinical Consultation
              </h3>
              <p className="text-xs md:text-sm text-text-secondary">
                To evaluate your knee symptoms and discuss whether an injection therapy is indicated, arrange a specialist consultation.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Button href="tel:07770473437" variant="secondary" className="text-sm py-2">
                Call Clinic
              </Button>
              <Button href="/book-appointment" variant="primary" className="text-sm py-2">
                Book Assessment
              </Button>
            </div>
          </section>

          {/* Section 15: Clinical Review */}
          <section className="pt-4">
            <ClinicalMetadataBlock
              {...(clinicalReview.reviewed
                ? {
                    reviewerName: clinicalReview.reviewerName,
                    reviewerTitle: clinicalReview.reviewerTitle,
                    lastReviewedDate: clinicalReview.lastReviewedDate,
                    evidenceSource: clinicalReview.evidenceSource,
                  }
                : {})}
            />
          </section>

          {/* Section 16: References */}
          <ReferencesList
            staticReferences={injection.references}
            evidenceSource={clinicalReview.evidenceSource}
            title="Evidence & References"
          />

          {/* Section 17: Medical Disclaimer */}
          <section className="pt-4">
            <MedicalDisclaimerBlock />
          </section>

        </main>

      </div>
    </div>
  );
};
