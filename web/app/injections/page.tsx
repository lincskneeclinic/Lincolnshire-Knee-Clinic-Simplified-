import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { injectionsData } from "@/data/injections";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Knee Injection Treatments | Lincolnshire Knee Clinic",
  description: "Educational guide to corticosteroid, hyaluronic acid, PRP, and Arthrosamid knee injections. Factual patient guidance on joint injection choices.",
  alternates: {
    canonical: "https://lincolnshirekneeclinic.co.uk/injections",
  },
};

export default function InjectionsHub() {
  const genericFaqs = [
    {
      question: "Are knee injections a permanent cure for arthritis?",
      answer: "No. Knee injections (including steroid, hyaluronic acid, PRP, or hydrogels) do not cure osteoarthritis or repair damaged joint cartilage. Their purpose is to manage symptoms, reduce inflammation, or supplement joint lubrication to support function."
    },
    {
      question: "How long does a knee injection appointment take?",
      answer: "The appointment typically takes between 15 to 30 minutes (up to 45 minutes for PRP, which requires processing a blood draw). This covers the clinical check, sterile site preparation, consent, and administration."
    },
    {
      question: "Can I drive home after a knee injection?",
      answer: "It is generally advised to arrange for someone to drive you home. While some injections are well tolerated, if a local anaesthetic is used, it can temporarily affect the strength or sensation in your leg."
    },
    {
      question: "Can I exercise after having a joint injection?",
      answer: "You should rest the joint and avoid strenuous exercise or high-impact training (like running or heavy weight lifting) for at least 48 hours to prevent local irritation and allow the injectate to settle."
    },
    {
      question: "Are knee injections painful?",
      answer: "Most patients experience a brief sting from the skin preparation and local anaesthetic, followed by a pressure sensation as the fluid is injected. Clinicians take steps to minimize discomfort throughout the procedure."
    },
    {
      question: "Do I need to have scans or imaging done first?",
      answer: "Yes. An up-to-date diagnostic scan (an X-ray or MRI) is required before any injection. This confirms the diagnosis and ensures the treatment is targeted safely to your specific anatomy."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Injections" }]} />

      <PageHeader
        category="Treatment Pathways"
        title="Knee Injection Treatments"
        subtitle="Lincolnshire Knee Clinic provides evidence-aware educational guidance on commonly used knee injections. These procedures are outpatient treatments aimed at managing local joint symptoms."
      />

      {/* Introduction */}
      <section className="my-8 bg-pale-clinical-blue/40 border border-border-clinical/30 p-6 md:p-8 rounded-xl space-y-4">
        <h2 className="font-serif text-xl font-bold text-deep-navy">Introduction to Injection Therapy</h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
          Joint injections can be considered as part of a conservative management plan for knee pain, arthritis, or tendon issues. They are designed to deliver targeted medication or substances directly into the knee joint space or surrounding tissues. Suitability for any injection depends entirely on a comprehensive clinical assessment, diagnostic imaging, and individual patient factors.
        </p>
        <p className="text-xs text-text-muted italic">
          Please note: All injections carry potential risks and limitations, and individual responses vary. No treatment outcomes can be guaranteed.
        </p>
      </section>

      {/* Injection Cards */}
      <section className="my-12">
        <h2 className="font-serif text-2xl font-bold text-deep-navy mb-8 text-center md:text-left">
          Available Injection Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {injectionsData.map((injection, index) => {
            // Choose clean inline SVG icons for each card
            const icons = [
              // Corticosteroid
              <svg key="0" className="w-8 h-8 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>,
              // Hyaluronic Acid
              <svg key="1" className="w-8 h-8 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              // PRP
              <svg key="2" className="w-8 h-8 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9.75M3.284 14.253A8.966 8.966 0 0112 3c2.868 0 5.437 1.343 7.11 3.424M12 3a8.966 8.966 0 00-8.716 6.747m17.432 0A8.966 8.966 0 0012 3" />
              </svg>,
              // Arthrosamid
              <svg key="3" className="w-8 h-8 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-3.75-3.75m11.25-3.75a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ];

            return (
              <div
                key={index}
                className="bg-white border border-border-clinical p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-clinical-teal/5 flex items-center justify-center mb-4">
                    {icons[index] || icons[0]}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-deep-navy mb-2">
                    {injection.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
                    {injection.oneSentenceDescription}
                  </p>
                </div>
                <Button href={`/injections/${injection.slug}`} variant="teal" className="w-full text-xs py-2">
                  Explore Treatment
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supporting Guidance Section */}
      <section className="my-8 bg-gradient-to-r from-pale-clinical-blue/40 to-soft-blue/20 border border-border-clinical p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
        <div className="max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
            Procedure Guidance
          </span>
          <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-2">
            Ultrasound-Guided Knee Injections
          </h3>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
            Learn when ultrasound guidance may be used during knee injection procedures, its potential advantages and its limitations.
          </p>
        </div>
        <Button href="/injections/ultrasound-guided-knee-injections" variant="secondary" className="shrink-0 text-xs font-bold py-2.5">
          Learn More
        </Button>
      </section>

      {/* Choosing an Injection */}
      <section className="bg-warm-off-white/40 border border-border-clinical/30 p-6 md:p-8 rounded-xl my-12 space-y-4">
        <h2 className="font-serif text-xl font-bold text-deep-navy">Which injection may be appropriate?</h2>
        <p className="text-sm text-text-secondary leading-relaxed font-medium">
          The selection of a knee injection is a clinical decision tailored to your specific diagnostic results and overall health. Suitability depends on a variety of parameters:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-text-secondary list-disc pl-5">
          <div>• Verified clinical diagnosis (underlying pathology)</div>
          <div>• Severity and nature of your active symptoms</div>
          <div>• Findings from X-rays or MRI scans</div>
          <div>• Your physical activity demands and lifestyle goals</div>
          <div>• Response to previous conservative treatments</div>
          <div>• General medical history, current medications, and allergies</div>
          <div>• Potential clinical risks vs. patient-specific benefits</div>
          <div>• Non-injection alternatives (like physiotherapy or surgery)</div>
        </div>
        <p className="text-sm text-text-secondary font-semibold leading-relaxed border-t border-border-clinical/20 pt-4 mt-4">
          Only a face-to-face clinical assessment and consultation with our specialist orthopaedic surgeon can determine if an injection is appropriate for your knee condition. We do not recommend or prioritize any single injection treatment over another.
        </p>
      </section>

      {/* FAQs */}
      <section className="my-12">
        <h2 className="font-serif text-2xl font-bold text-deep-navy mb-6">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={genericFaqs} />
      </section>

      {/* Related Resources Navigation */}
      <section className="my-12 border-t border-border-clinical/30 pt-8">
        <h2 className="font-serif text-xl font-bold text-deep-navy mb-6">
          Related Content Directories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Related Conditions */}
          <div className="space-y-2">
            <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Knee Conditions</span>
            <div className="flex flex-col gap-2">
              <Link href="/conditions/knee-arthritis" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Knee Arthritis</Link>
              <Link href="/conditions/bakers-cyst" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Baker&apos;s Cyst</Link>
              <Link href="/conditions/patellofemoral-pain" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Patellofemoral Pain</Link>
              <Link href="/conditions/knee-tendinopathy" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Knee Tendinopathy</Link>
              <Link href="/conditions/cartilage-injury" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Cartilage Injury</Link>
            </div>
          </div>
          {/* Related Symptoms */}
          <div className="space-y-2">
            <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Knee Symptoms</span>
            <div className="flex flex-col gap-2">
              <Link href="/symptoms/knee-pain" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Knee Pain</Link>
              <Link href="/symptoms/swollen-knee" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Swollen Knee</Link>
              <Link href="/symptoms/stiff-knee" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Stiff Knee</Link>
              <Link href="/symptoms/front-of-knee-pain" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Front of Knee Pain</Link>
            </div>
          </div>
          {/* Related Treatments */}
          <div className="space-y-2">
            <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Other Treatments</span>
            <div className="flex flex-col gap-2">
              <Link href="/treatments/physiotherapy" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Physiotherapy</Link>
              <Link href="/treatments/weight-management" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Weight Management</Link>
              <Link href="/treatments/pain-management" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Pain Management</Link>
              <Link href="/treatments/total-knee-replacement" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Total Knee Replacement</Link>
              <Link href="/treatments/partial-knee-replacement" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Partial Knee Replacement</Link>
              <Link href="/treatments/activity-modification" className="text-xs font-bold text-deep-navy hover:text-clinical-teal hover:underline">&rarr; Activity Modification</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Book Appointment CTA */}
      <section className="my-10 bg-soft-blue border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
        <div className="max-w-2xl">
          <h2 className="font-serif text-xl font-bold text-deep-navy mb-2">
            Schedule an Injection Assessment
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            To explore whether an injection therapy is clinically indicated for your knee symptoms, book a specialist clinical consultation.
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

      {/* Clinical Review */}
      <section className="my-8">
        <ClinicalMetadataBlock />
      </section>

      {/* References */}
      <section className="my-8 border-t border-border-clinical/30 pt-6 text-xs text-text-muted leading-relaxed space-y-2">
        <span className="font-bold text-text-secondary block">Evidence &amp; Reference Guidelines</span>
        <ul className="list-disc pl-5 space-y-1">
          <li>National Institute for Health and Care Excellence (NICE) guidelines on osteoarthritis and joint injections.</li>
          <li>Consensus publications and guidelines from British Orthopaedic Association and Royal College of Radiologists.</li>
          <li>Peer-reviewed international literature on viscosupplementation, PRP, and polyacrylamide hydrogels.</li>
        </ul>
      </section>

      {/* Medical Disclaimer */}
      <MedicalDisclaimerBlock />
    </div>
  );
}
