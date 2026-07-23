import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { ClinicalMetadataBlock } from "@/components/ClinicalMetadataBlock";
import { FaqAccordion } from "@/components/FaqAccordion";
import Link from "next/link";
import { InjectionStepViewer } from "@/components/visuals/InjectionStepViewer";

export const metadata: Metadata = {
  title: "Ultrasound-Guided Knee Injections | Lincolnshire Knee Clinic",
  description: "Learn when ultrasound guidance may be used for knee injections, how the procedure works, and its potential advantages and limitations.",
  alternates: {
    canonical: "https://lincolnshirekneeclinic.co.uk/injections/ultrasound-guided-knee-injections",
  },
  openGraph: {
    title: "Ultrasound-Guided Knee Injections | Lincolnshire Knee Clinic",
    description: "Learn when ultrasound guidance may be used for knee injections, how the procedure works, and its potential advantages and limitations.",
    url: "https://lincolnshirekneeclinic.co.uk/injections/ultrasound-guided-knee-injections",
    type: "website",
  },
};

export default function UltrasoundGuidedPage() {
  const tableOfContents = [
    { label: "Overview", id: "overview" },
    { label: "How It Works", id: "how-it-works" },
    { label: "When Used", id: "when-used" },
    { label: "When Not Necessary", id: "not-necessary" },
    { label: "Advantages & Limitations", id: "advantages-limitations" },
    { label: "Suitable Injections", id: "suitable-injections" },
    { label: "Procedure & Aftercare", id: "procedure-aftercare" },
    { label: "FAQs", id: "faqs" },
  ];

  const faqs = [
    {
      question: "Does every knee injection need ultrasound guidance?",
      answer: "No. Many knee injections can be performed accurately using physical anatomical landmarks. The decision depends on the target area, your anatomy, and clinician judgement."
    },
    {
      question: "Is ultrasound guidance more accurate?",
      answer: "Ultrasound provides real-time visualization of the joint recess or soft tissues, which can support needle placement accuracy in complex cases, though it does not guarantee a better clinical outcome."
    },
    {
      question: "Does ultrasound guidance make the injection less painful?",
      answer: "The guidance method itself does not alter the sensation of the injection. Pain levels typically depend on the use of local anaesthetic and individual patient factors."
    },
    {
      question: "Can fluid be removed at the same appointment?",
      answer: "Yes. If there is an excess collection of fluid (joint effusion), ultrasound can help guide joint aspiration (removal of fluid) before administering the treatment."
    },
    {
      question: "Which injections can be ultrasound guided?",
      answer: "Corticosteroids, Hyaluronic Acid, PRP, and Arthrosamid® can all be administered under ultrasound guidance depending on clinical suitability."
    },
    {
      question: "Is ultrasound the same as an MRI?",
      answer: "No. Ultrasound uses high-frequency sound waves to create real-time dynamic images. An MRI uses strong magnetic fields to create detailed, static cross-sectional structures."
    },
    {
      question: "Can I drive afterwards?",
      answer: "It is generally advised to arrange alternative transport, particularly if a local anaesthetic is administered, as it can temporarily affect joint sensation and control."
    },
    {
      question: "How do I know whether ultrasound guidance is appropriate for me?",
      answer: "Suitability is determined during a specialist consultation where your symptoms, anatomy, and diagnostic scans are reviewed to make a clinical recommendation."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": "https://lincolnshirekneeclinic.co.uk/injections/ultrasound-guided-knee-injections#webpage",
        "url": "https://lincolnshirekneeclinic.co.uk/injections/ultrasound-guided-knee-injections",
        "name": "Ultrasound-Guided Knee Injections | Lincolnshire Knee Clinic",
        "headline": "Ultrasound-Guided Knee Injections",
        "description": "Learn when ultrasound guidance may be used for knee injections, how the procedure works, and its potential advantages and limitations.",
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
              "item": "https://lincolnshirekneeclinic.co.uk/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Injections",
              "item": "https://lincolnshirekneeclinic.co.uk/injections"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Ultrasound Guided"
            }
          ]
        }
      },
      {
        "@type": "MedicalProcedure",
        "@id": "https://lincolnshirekneeclinic.co.uk/injections/ultrasound-guided-knee-injections#procedure",
        "name": "Ultrasound-Guided Knee Injection Guidance",
        "description": "The use of ultrasound imaging to assist in the delivery of intra-articular and soft-tissue knee injections.",
        "bodyLocation": "Knee joint",
        "relevantSpecialty": "Orthopedic"
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs
          items={[
            { label: "Injections", href: "/injections" },
            { label: "Ultrasound Guided" },
          ]}
        />
      </div>

      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white font-sans">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3">
            Injection Treatments
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4">
            Ultrasound-Guided Knee Injections
          </h1>
          <p className="text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed font-medium">
            Ultrasound guidance may be used during some knee injection procedures to help visualise the joint or surrounding structures and guide needle placement. It is not required for every injection.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start font-sans">
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
                  className="text-xs font-semibold text-text-secondary hover:text-clinical-teal transition-colors block py-0.5"
                >
                  {toc.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-12">
          
          <section id="overview" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              What is an ultrasound-guided knee injection?
            </h2>
            <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              <p>
                Ultrasound imaging uses high-frequency sound waves to create real-time dynamic images of soft tissues, tendons, ligaments, and joint spaces. During an ultrasound-guided injection, the clinician uses these real-time images to visualize the targeted joint anatomy and monitor the needle path.
              </p>
              <p>
                It is important to understand that ultrasound guidance is a method of delivery rather than an injection product. The injected substance itself may be a corticosteroid, hyaluronic acid, PRP, or Arthrosamid® depending on your clinical indication.
              </p>

              <InjectionStepViewer injectionName="Ultrasound-Guided Knee Injection" />

              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted">
                This information is for general patient education and does not replace an individual clinical assessment.
              </div>
            </div>
          </section>

          <section id="how-it-works" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              How ultrasound guidance works
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              The procedure is performed in a clean outpatient setting. A water-based transmission gel is applied to the skin over the knee. The clinician moves a hand-held probe (transducer) over the area to send sound waves into the knee, projecting a real-time structural image onto a screen. Under direct visualization, the needle is introduced and guided toward the target tissue recess before the therapeutic fluid is injected. Sterile prep is maintained throughout the process.
            </p>
          </section>

          <section id="when-used" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              When ultrasound guidance may be used
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              Ultrasound guidance may be considered under several clinical circumstances, such as:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-secondary font-medium list-disc pl-5">
              <li>Aspiration of fluid from a swollen knee or cyst</li>
              <li>Targeting specific soft-tissue structures or tendon sheaths</li>
              <li>Anatomical variants or difficult landmarks (e.g. after prior surgery)</li>
              <li>When previous landmark-guided attempts have been difficult</li>
              <li>Where visual verification of joint entry is clinically desired</li>
            </ul>
          </section>

          <section id="not-necessary" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              When it may not be necessary
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              Many knee joint injections can be performed safely and accurately using anatomical landmarks (palpating physical structures of the knee). Landmark-guided injections are standard clinical practice and do not require additional imaging equipment. The choice depends on clinician judgment, anatomical clarity, and individual patient variables.
            </p>
          </section>

          <section id="advantages-limitations" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Potential Advantages &amp; Limitations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-pale-clinical-blue/20 border border-clinical-teal/15 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-3 text-base border-b border-border-clinical/20 pb-2">
                  Potential advantages
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-text-secondary font-medium list-disc pl-5">
                  <li>Real-time visualization of needle path and structures</li>
                  <li>Direct targeting of small recesses or fluid pockets</li>
                  <li>Avoidance of adjacent blood vessels or nerves</li>
                  <li>Useful support for complex joint anatomy</li>
                </ul>
              </div>

              <div className="bg-warm-off-white/40 border border-border-clinical/30 p-6 rounded-xl">
                <h3 className="font-sans font-bold text-deep-navy mb-3 text-base border-b border-border-clinical/20 pb-2">
                  Limitations
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-text-secondary font-medium list-disc pl-5">
                  <li>Does not guarantee treatment success or pain relief</li>
                  <li>Not required for standard landmark-accessible injections</li>
                  <li>May increase appointment complexity or duration</li>
                  <li>May involve additional clinical fees</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="suitable-injections" className="scroll-mt-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Which injections may use ultrasound guidance?
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
              Ultrasound guidance may be used with some or all of these treatments depending on the clinical circumstances. It is not automatically required:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Corticosteroid", href: "/injections/corticosteroid" },
                { name: "Hyaluronic Acid", href: "/injections/hyaluronic-acid" },
                { name: "PRP", href: "/injections/prp" },
                { name: "Arthrosamid®", href: "/injections/arthrosamid" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white border border-border-clinical/80 hover:border-clinical-teal p-4 rounded-xl text-center font-bold text-xs md:text-sm text-deep-navy hover:bg-clinical-teal/5 transition-all block"
                >
                  {item.name} &rarr;
                </Link>
              ))}
            </div>
          </section>

          <section id="procedure-aftercare" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Procedure &amp; Aftercare
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-sans font-bold text-deep-navy text-base">Procedure Steps</h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                  The appointment involves a clinical check, confirming consent, cleaning the skin with antiseptic, applying ultrasound gel, scanning to locate landmarks, injecting under guidance, applying a sterile dressing, and providing aftercare instructions.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-sans font-bold text-deep-navy text-base">General Aftercare</h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                  Afterward, follow specific instructions for your injected product. Generally, rest the joint from heavy load for 48 hours, monitor for warning signs (warmth, swelling, severe pain, fever), and seek medical attention if concerns arise.
                </p>
              </div>
            </div>
          </section>

          <section id="faqs" className="scroll-mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-deep-navy">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={faqs} />
          </section>

          <section className="bg-warm-off-white/40 border border-border-clinical/30 p-6 md:p-8 rounded-xl space-y-6">
            <h2 className="font-serif text-xl font-bold text-deep-navy">Related Clinical Directories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Injection Treatments</span>
                <div className="flex flex-col gap-2">
                  <Link href="/injections" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Injection Treatments Hub</Link>
                  <Link href="/injections/corticosteroid" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Corticosteroid Injection</Link>
                  <Link href="/injections/hyaluronic-acid" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Hyaluronic Acid</Link>
                  <Link href="/injections/prp" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; PRP Therapy</Link>
                  <Link href="/injections/arthrosamid" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Arthrosamid®</Link>
                </div>
              </div>
              <div className="space-y-2">
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-widest">Knee Conditions</span>
                <div className="flex flex-col gap-2">
                  <Link href="/conditions/knee-arthritis" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Knee Arthritis</Link>
                  <Link href="/conditions/bakers-cyst" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Baker&apos;s Cyst</Link>
                  <Link href="/conditions/knee-tendinopathy" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Knee Tendinopathy</Link>
                  <Link href="/conditions/patellofemoral-pain" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Patellofemoral Pain</Link>
                  <Link href="/conditions/cartilage-injury" className="font-bold text-deep-navy hover:text-clinical-teal">&rarr; Cartilage Injury</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-soft-blue border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-1.5">
                Would you like to discuss knee injection options?
              </h3>
              <p className="text-xs md:text-sm text-text-secondary font-medium">
                A consultation can help determine whether an injection may be appropriate and whether ultrasound guidance would be useful.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Button href="/clinics" variant="secondary" className="text-sm py-2">
                Find a Clinic
              </Button>
              <Button href="/book-appointment" variant="primary" className="text-sm py-2">
                Book Appointment
              </Button>
            </div>
          </section>

          <section className="pt-4">
            <ClinicalMetadataBlock />
          </section>

          <section id="references" className="scroll-mt-8 space-y-3 pt-6 border-t border-border-clinical/30 text-xs text-text-muted leading-relaxed">
            <span className="font-bold text-text-secondary block">Evidence &amp; References</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>Royal College of Radiologists clinical standards for musculoskeletal ultrasound guided procedures.</li>
              <li>Societal guidelines on accuracy and efficacy comparison of landmark vs. guided intra-articular injections.</li>
              <li>Peer-reviewed articles in orthopaedic and rheumatology literature.</li>
            </ul>
          </section>

          <section className="pt-4">
            <MedicalDisclaimerBlock />
          </section>

        </main>
      </div>
    </div>
  );
}
