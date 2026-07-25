import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import Link from "next/link";
import { Card } from "@/components/Card";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Clinical Knowledge Hub | Lincolnshire Knee Clinic",
  description: "Explore common knee symptoms, possible conditions, treatment options, recovery information and ways to arrange a consultation.",
  alternates: {
    canonical: "https://lincolnshirekneeclinic.co.uk/clinical-knowledge-hub",
  },
  openGraph: {
    title: "Clinical Knowledge Hub | Lincolnshire Knee Clinic",
    description: "Explore common knee symptoms, possible conditions, treatment options, recovery information and ways to arrange a consultation.",
    url: "https://lincolnshirekneeclinic.co.uk/clinical-knowledge-hub",
    type: "website",
    images: [
      {
        url: "https://lincolnshirekneeclinic.co.uk/brand/lkc-logo-k-transparent.png",
        width: 800,
        height: 800,
        alt: "Lincolnshire Knee Clinic logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Clinical Knowledge Hub | Lincolnshire Knee Clinic",
    description: "Explore common knee symptoms, possible conditions, treatment options, recovery information and ways to arrange a consultation.",
  },
};

export default function ClinicalKnowledgeHub() {
  const visualSteps = [
    {
      num: "1",
      title: "Symptoms",
      desc: "Identify how your knee presents (e.g. swelling, locking, locking stiffness).",
      href: "#symptoms-section",
      actionText: "Explore Symptoms",
    },
    {
      num: "2",
      title: "Possible Conditions",
      desc: "Understand structural knee issues and clinical assessment guidelines.",
      href: "#conditions-section",
      actionText: "Understand Conditions",
    },
    {
      num: "3",
      title: "Treatments",
      desc: "Explore non-surgical therapies, bracing, or keyhole/replacement surgeries.",
      href: "#treatments-section",
      actionText: "Explore Treatments",
    },
    {
      num: "4",
      title: "Recovery & Rehab",
      desc: "Read practical advice on driving, work, physical therapy, and home prep.",
      href: "#recovery-section",
      actionText: "Review Recovery",
    },
    {
      num: "5",
      title: "Arrange Assessment",
      desc: "Book a face-to-face or video consultation with our specialist knee surgeon.",
      href: "#booking-section",
      actionText: "Book Appointment",
    },
  ];

  // Dynamic JSON-LD structured data (CollectionPage + BreadcrumbList + ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": "https://lincolnshirekneeclinic.co.uk/clinical-knowledge-hub#webpage",
        "url": "https://lincolnshirekneeclinic.co.uk/clinical-knowledge-hub",
        "name": "Clinical Knowledge Hub | Lincolnshire Knee Clinic",
        "headline": "Understand Your Knee Journey",
        "description": "Explore common knee symptoms, possible conditions, treatment options, recovery information and ways to arrange a consultation.",
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
              "name": "Clinical Knowledge Hub"
            }
          ]
        }
      },
      {
        "@type": "ItemList",
        "@id": "https://lincolnshirekneeclinic.co.uk/clinical-knowledge-hub#itemList",
        "name": "Knee Patient Care Journey",
        "description": "Five stages of the patient journey at Lincolnshire Knee Clinic.",
        "numberOfItems": 5,
        "itemListElement": visualSteps.map((step, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": step.title,
          "description": step.desc
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 15. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs items={[{ label: "Clinical Knowledge Hub" }]} />
      </div>

      {/* 3. Hero Section */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-24 relative overflow-hidden w-full border-b border-border-clinical/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-white">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Educational Navigation Tool
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold !text-white leading-tight mb-4 animate-fade-in">
            Understand Your Knee Journey
          </h1>
          <p className="font-sans text-base md:text-lg text-[#DFF3F5]/90 max-w-3xl leading-relaxed">
            Explore symptoms, possible conditions, treatment options and recovery information, then choose the most appropriate way to arrange an assessment.
          </p>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg text-xs md:text-sm italic text-white/80 mt-6 max-w-xl">
            <strong>Important:</strong> This information is for general patient education and does not provide a diagnosis.
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 font-sans space-y-16">
        
        {/* 12. Search & Visual Filters */}
        <section className="text-center space-y-4">
          <h3 className="font-sans text-xs font-bold text-deep-navy uppercase tracking-wider">
            Quick Navigation Filters
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "I have a symptom", href: "#symptoms-section" },
              { label: "I know my condition", href: "#conditions-section" },
              { label: "I want to explore treatments", href: "#treatments-section" },
              { label: "I am preparing for recovery", href: "#recovery-section" },
              { label: "I want to book an assessment", href: "#booking-section" },
            ].map((filter, idx) => (
              <a
                key={idx}
                href={filter.href}
                className="bg-pale-clinical-blue/40 border border-border-clinical text-xs font-bold text-deep-navy px-4 py-2.5 rounded-full hover:bg-clinical-teal/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
              >
                {filter.label}
              </a>
            ))}
          </div>
        </section>

        {/* 4. Visual Patient Journey */}
        <section className="space-y-8 bg-pale-clinical-blue/20 border border-border-clinical/40 p-6 md:p-10 rounded-2xl">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy text-center">
            Your Knee Care Journey
          </h2>
          <p className="text-xs md:text-sm text-text-secondary text-center max-w-xl mx-auto font-medium">
            Click any step below to explore detailed clinical guides for each stage of your care journey.
          </p>

          {/* Connected step timeline layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative pt-4">
            {/* Connected Teal Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-clinical-teal/30 z-0"></div>

            {visualSteps.map((step, idx) => (
              <a
                key={idx}
                href={step.href}
                className="bg-white border border-border-clinical hover:border-clinical-teal rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center relative z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-2"
              >
                <div className="flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full bg-clinical-teal text-white flex items-center justify-center font-serif text-base font-bold mb-4 shadow-sm">
                    {step.num}
                  </span>
                  <h3 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-normal mb-4 font-medium">
                    {step.desc}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-clinical-teal tracking-wider uppercase">
                  {step.actionText} &darr;
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* 5. Step 1: Symptoms Section */}
        <section id="symptoms-section" className="scroll-mt-10 space-y-6 pt-4 border-t border-border-clinical/30">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
              Step 1 of the Journey
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Start with your symptoms
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium mt-2">
              Patients often know what they are experiencing before they know the cause. Explore common knee symptoms and learn when assessment may be appropriate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Knee Pain", desc: "Generalised or focal pain, range of aches to sharp sensations.", slug: "knee-pain" },
              { name: "Swollen Knee", desc: "Fluid accumulation within or around the joint.", slug: "swollen-knee" },
              { name: "Stiff Knee", desc: "Feeling of tightness or resistance throughout movement.", slug: "stiff-knee" },
              { name: "Clicking or Grinding", desc: "Audible snaps or grating sensations during articulation.", slug: "clicking-knee" },
              { name: "Locked Knee", desc: "A sudden, physical block where the knee cannot straighten.", slug: "locked-knee" },
              { name: "Knee Giving Way", desc: "Joint instability or sudden buckling during weight-bearing.", slug: "knee-giving-way" },
              { name: "Knee Pain After Injury", desc: "Pain that starts immediately or gradually following a trauma.", slug: "knee-pain-after-injury" },
            ].map((item, idx) => (
              <Card
                key={idx}
                category="Symptom Guide"
                title={item.name}
                description={item.desc}
                href={`/symptoms/${item.slug}`}
                linkText="Explore Symptom"
              />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button href="/symptoms" variant="secondary">
              Explore All Symptoms &rarr;
            </Button>
          </div>
        </section>

        {/* 6. Step 2: Possible Conditions Section */}
        <section id="conditions-section" className="scroll-mt-10 space-y-6 pt-6 border-t border-border-clinical/30">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
              Step 2 of the Journey
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Understand possible conditions
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium mt-2">
              Several different knee conditions can cause similar symptoms. These pages explain common diagnoses, how they may be assessed, and which treatment options may be considered.
            </p>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-3">
              Symptoms alone cannot confirm a diagnosis. An individual clinical assessment may be required.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Knee Arthritis", desc: "Degenerative wear of joint cartilage surfaces.", slug: "knee-arthritis" },
              { name: "Meniscal Tear", desc: "Tear of the knee's shock-absorbing meniscus cartilage.", slug: "meniscal-tear" },
              { name: "ACL Injury", desc: "Sprain or rupture of the Anterior Cruciate Ligament.", slug: "acl-injury" },
              { name: "Patellofemoral Pain", desc: "Discomfort or stiffness around the kneecap groove.", slug: "patellofemoral-pain" },
              { name: "Cartilage Injury", desc: "Localized focal defect or wear in the articular lining.", slug: "cartilage-injury" },
              { name: "Knee Instability", desc: "Ligament laxity leading to sensations of shifting.", slug: "knee-instability" },
              { name: "Baker's Cyst", desc: "Fluid collection in the popliteal space behind the knee.", slug: "bakers-cyst" },
              { name: "Knee Tendinopathy", desc: "Overuse or loading strain on tendons (e.g. patellar tendon).", slug: "knee-tendinopathy" },
              { name: "Patellar Instability", desc: "Kneecap displacement or dislocation from the trochlear groove.", slug: "patellar-instability" },
            ].map((item, idx) => (
              <Card
                key={idx}
                category="Condition Guide"
                title={item.name}
                description={item.desc}
                href={`/conditions/${item.slug}`}
                linkText="Explore Condition"
              />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button href="/conditions" variant="secondary">
              Explore All Conditions &rarr;
            </Button>
          </div>
        </section>

        {/* 7. Step 3: Treatment Options Section */}
        <section id="treatments-section" className="scroll-mt-10 space-y-6 pt-6 border-t border-border-clinical/30">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
              Step 3 of the Journey
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Explore treatment options
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium mt-2">
              Treatment may include self-management, rehabilitation, injections or surgery depending on the diagnosis, symptoms, and patient goals.
            </p>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-3">
              Suitability for any treatment depends on an individual consultation.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {/* Non-surgical Group */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
                Non-Surgical Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { name: "Physiotherapy & Rehab", href: "/treatments/physiotherapy" },
                  { name: "Activity Modification", href: "/treatments/activity-modification" },
                  { name: "Pain Management", href: "/treatments/pain-management" },
                  { name: "Knee Bracing", href: "/treatments/knee-bracing" },
                  { name: "Weight Management & Knee Health", href: "/treatments/weight-management" },
                  { name: "Knee Injections", href: "/injections" },
                ] as { name: string; href: string }[]).map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="bg-white border border-border-clinical/80 hover:border-clinical-teal p-4 rounded-xl shadow-sm block text-left font-bold text-xs md:text-sm text-deep-navy hover:bg-clinical-teal/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                  >
                    {item.name} &rarr;
                  </Link>
                ))}
              </div>
            </div>

            {/* Surgical Group */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-deep-navy border-b border-border-clinical/30 pb-2">
                Surgical Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Meniscal Surgery", slug: "meniscal-surgery" },
                  { name: "ACL Reconstruction", slug: "acl-reconstruction" },
                  { name: "Cartilage Procedures", slug: "cartilage-procedures" },
                  { name: "Patellar Stabilisation", slug: "patellar-stabilisation" },
                  { name: "Partial Knee Replacement", slug: "partial-knee-replacement" },
                  { name: "Total Knee Replacement", slug: "total-knee-replacement" },
                  { name: "Revision Knee Replacement", slug: "revision-knee-replacement" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/treatments/${item.slug}`}
                    className="bg-white border border-border-clinical/80 hover:border-clinical-teal p-4 rounded-xl shadow-sm block text-left font-bold text-xs md:text-sm text-deep-navy hover:bg-clinical-teal/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
                  >
                    {item.name} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button href="/treatments" variant="secondary">
              Explore All Treatments &rarr;
            </Button>
          </div>
        </section>

        {/* 8. Step 4: Recovery Section */}
        <section id="recovery-section" className="scroll-mt-10 space-y-6 pt-6 border-t border-border-clinical/30">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
              Step 4 of the Journey
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Recovery and rehabilitation guides
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium mt-2">
              Preparing for treatment and following a structured recovery plan are key to achieving a successful outcome. Learn about guidelines for daily activities, work, driving, and sports.
            </p>
            <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 px-4 py-3 rounded-lg text-xs italic text-text-muted mt-3">
              We do not provide fixed recovery guarantees. Formal medical clearance to return to driving, work, or sports must be obtained from your clinical team.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Preparing for Surgery", slug: "preparing-for-surgery" },
              { name: "Enhanced Recovery (ERAS)", slug: "enhanced-recovery" },
              { name: "Physiotherapy After Surgery", slug: "physiotherapy-after-surgery" },
              { name: "Returning to Driving", slug: "returning-to-driving" },
              { name: "Returning to Work", slug: "returning-to-work" },
              { name: "Returning to Sport", slug: "returning-to-sport" },
            ].map((item, idx) => (
              <Card
                key={idx}
                category="Recovery Guide"
                title={item.name}
                description="Clinical guidelines and safety measures for postoperative recovery."
                href={`/treatments/${item.slug}`}
                linkText="Explore Guide"
              />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button href="/recovery" variant="secondary">
              Explore Recovery Hub &rarr;
            </Button>
          </div>
        </section>

        {/* 9. Step 5: Arrange an Assessment Section */}
        <section id="booking-section" className="scroll-mt-10 space-y-6 pt-6 border-t border-border-clinical/30">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block mb-1">
              Step 5 of the Journey
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy">
              Arrange a professional assessment
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium mt-2">
              If you would like to clarify your knee symptoms, confirm a diagnosis, or discuss conservative and surgical treatment pathways, arrange a face-to-face consultation with our specialist knee consultant.
            </p>
          </div>

          <div className="bg-white border border-border-clinical rounded-2xl p-6 md:p-8 space-y-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="font-serif text-lg font-bold text-deep-navy">
                Face-to-Face Consultation
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                Available at modern private hospital facilities across Lincolnshire and surrounding areas. Choose your preferred clinic location and contact reception directly to schedule an appointment.
              </p>
            </div>
            <Link
              href="/book-appointment"
              className="inline-block bg-clinical-teal text-white text-center font-bold text-xs md:text-sm px-6 py-3 rounded-lg hover:bg-clinical-teal/90 transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-2"
            >
              Book Appointment
            </Link>
          </div>
        </section>

        {/* 10. Stay Informed Newsletter Section */}
        <section className="bg-pale-clinical-blue/30 border border-clinical-teal/20 p-6 md:p-10 rounded-2xl">
          <NewsletterSignup
            variant="light"
            title="Stay Informed on Knee Health"
            subtitle="Subscribe to receive patient education updates, clinical insights, and guidance on knee health from Lincolnshire Knee Clinic."
          />
        </section>

      </div>

      {/* 16. Medical Disclaimer */}
      <section className="bg-white py-6 w-full border-t border-border-clinical/30">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <MedicalDisclaimerBlock />
        </div>
      </section>
    </div>
  );
}
