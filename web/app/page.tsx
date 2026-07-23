import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { clinicLocations } from "@/data/clinics";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Rich Medical Navy-to-Blue Hero Section */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-20 md:py-28 border-b border-border-clinical relative overflow-hidden">
        {/* Decorative subtle background highlights for premium depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/15 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-soft-blue/5 rounded-full -translate-x-12 translate-y-12 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Hero Left: Text, CTAs, and Trust Markers */}
          <div className="lg:col-span-7 text-center sm:text-left">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3.5 font-sans">
              Specialist Orthopaedic Practice
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold !text-white leading-tight mb-6">
              Consultant-led knee care in Lincolnshire.
            </h1>
            <p className="font-sans text-lg md:text-xl text-[#DFF3F5] leading-relaxed mb-8">
              Specialist assessment and treatment for knee pain, arthritis, sports knee injuries,
              injections and knee replacement concerns.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Button href="/book-appointment" variant="teal">
                Book Appointment
              </Button>
              <Button href="/symptoms" className="text-white border-white hover:bg-white/10 bg-transparent border">
                Explore Symptoms
              </Button>
            </div>

            {/* Trust Markers (Verified placeholders) */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2.5 text-xs font-semibold text-[#DFF3F5]">
              <span className="flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                GMC Specialist Register: 4145976
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Consultant Orthopaedic Knee Surgeon
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Clinical Lead for Elective Orthopaedics
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-clinical-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Evidence-based practice
              </span>
              <span className="flex items-center gap-1.5 w-full sm:w-auto text-[#DFF3F5]/75 font-medium text-[11px] mt-1">
                Experience treating professional and recreational athletes across football, cycling, dance, motorsport and endurance sport.
              </span>
            </div>
          </div>

          {/* Hero Right: Premium Glassmorphic Clinical Panel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 group">
              <img
                src="/images/knee-clinic-hero.png"
                alt="Orthopaedic Consultation Room / Diagnostic Imaging Abstract Panel"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm border border-white/10 p-3 rounded-lg text-left shadow-sm">
                <span className="text-[10px] font-bold text-clinical-teal block uppercase tracking-widest">
                  Lincolnshire Knee Clinic
                </span>
                <span className="text-[11px] text-[#DFF3F5]/90 block mt-0.5 font-medium">
                  Specialist Assessment & Treatment
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Patient Assessment Pathways - White Background */}
      <section className="bg-white py-20 md:py-28 w-full border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Begin Your Evaluation
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Patient Assessment & Treatment Pathways
            </h2>
            <p className="font-sans text-base md:text-lg text-text-secondary leading-relaxed">
              Select the area that best matches what you are looking for. Explore symptoms, conditions, treatments and injection options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card
              category="Pathways"
              title="Symptoms Hub"
              description="Explore common knee concerns such as locking, pain on stairs, clicking, or swelling to learn about potential underlying issues."
              href="/symptoms"
              linkText="View symptoms"
            />
            <Card
              category="Pathways"
              title="Conditions Hub"
              description="Detailed explanations of knee arthritis, meniscus tears, ACL injuries, patellofemoral pain, and kneecap instability."
              href="/conditions"
              linkText="View conditions"
            />
            <Card
              category="Pathways"
              title="Treatments Hub"
              description="Learn about surgical and non-surgical procedures, from total knee replacements to arthroscopy and physiotherapy."
              href="/treatments"
              linkText="View treatments"
            />
            <Card
              category="Pathways"
              title="Injections Hub"
              description="Information about clinical knee injections including Cortisone, Hyaluronic Acid, PRP, and Arthrosamid therapies."
              href="/injections"
              linkText="View injections"
            />
          </div>
        </div>
      </section>

      {/* 3. Dedicated Consultant Section - Pale Clinical Blue Background */}
      <section className="bg-pale-clinical-blue py-20 md:py-28 border-b border-border-clinical w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Consultant Portrait Photo (using real path and cropped styling) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden border border-border-clinical shadow-[0_8px_30px_rgba(8,47,73,0.08)] bg-white group">
              <img
                src="/images/consultant/ricardo-pacheco.jpg"
                alt="Consultant Knee Surgeon"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-border-clinical p-3.5 rounded-lg text-left shadow-sm">
                <span className="text-[10px] font-bold text-clinical-teal block uppercase tracking-widest">
                  Lead Specialist
                </span>
                <span className="font-serif text-base font-bold text-deep-navy block mt-0.5">
                  Mr Ricardo J Pacheco
                </span>
                <span className="text-[10px] text-text-secondary block mt-0.5 font-medium">
                  FRCS (Tr & Orth)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Consultant Introduction Details */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block font-sans">
              Clinical Leadership
            </span>
            <h2 className="font-serif text-3xl font-bold text-deep-navy">
              Mr Ricardo J Pacheco
            </h2>
            <p className="text-sm font-bold text-clinical-teal uppercase tracking-wider leading-none">
              Consultant Trauma &amp; Orthopaedic Surgeon
            </p>
            <div className="text-xs text-text-secondary space-y-1 font-semibold">
              <p>GMC Specialist Register: 4145976</p>
              <p>Qualifications: MB BS, MRCS, FRCS (Tr &amp; Orth), PG Cert (Sports Injuries)</p>
            </div>

            <p className="font-sans text-base md:text-lg text-text-secondary leading-relaxed">
              Lincolnshire Knee Clinic is consultant-led and focused on specialist assessment and treatment of knee pain,
              knee arthritis, sports knee injuries, injections and knee replacement concerns.
            </p>

            <p className="font-sans text-base text-text-secondary leading-relaxed">
              All clinical investigations and surgical procedures are coordinated and performed under strict consultant
              governance. We outline the clinical evidence, risk rates, and rehabilitation pathways in full, ensuring
              shared, informed decision-making.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/about" variant="secondary">
                Meet Your Consultant
              </Button>
              <Button href="/professional-registrations" variant="secondary">
                Professional Registrations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Injection & Treatment Pathways - White Background */}
      <section className="bg-white py-20 md:py-28 w-full border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Advanced Clinical Care
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Advanced Knee Injections & Treatments
            </h2>
            <p className="font-sans text-base md:text-lg text-text-secondary leading-relaxed">
              We offer evidence-based non-surgical injections and joint preservation procedures
              alongside major reconstructive knee surgeries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
              <div>
                <h3 className="font-sans text-xl font-bold text-deep-navy mb-3">Injection Therapies</h3>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
                  Learn about joint lubrication and anti-inflammatory procedures, including Cortisone, Hyaluronic Acid,
                  Platelet-Rich Plasma (PRP), and Arthrosamid hydrogel injections.
                </p>
              </div>
              <Button href="/injections" variant="secondary" className="w-fit">
                Learn About Injections
              </Button>
            </div>

            <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
              <div>
                <h3 className="font-sans text-xl font-bold text-deep-navy mb-3">Surgical & Physical Treatments</h3>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
                  Information on total and partial knee replacement options, knee arthroscopy, patella realignment,
                  and structured physiotherapy rehabilitation paths.
                </p>
              </div>
              <Button href="/treatments" variant="secondary" className="w-fit">
                Explore Treatments
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clinic Locations - Pale Clinical Blue Background */}
      <section className="bg-pale-clinical-blue py-20 md:py-28 w-full border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Local Access
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Our Clinical Locations
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed">
              We consult face-to-face and administer injections at several private hospitals and clinics
              across Lincolnshire.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicLocations.map((clinic, idx) => (
              <div key={idx} className="bg-white border border-border-clinical rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-clinical-teal uppercase tracking-widest block mb-1">
                    Private Practice Location
                  </span>
                  <h3 className="font-sans text-base font-bold text-deep-navy mb-2">{clinic.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {clinic.services}
                  </p>
                </div>
                <Link href={`/clinics#${clinic.id}`} className="text-xs font-bold text-clinical-teal hover:underline flex items-center gap-1">
                  View clinic details &gt;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* 5.5. Patient Reviews & Experiences Section - White Background */}
      <section className="bg-white py-20 md:py-28 w-full border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Feedback & transparency
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Patient Reviews & Experiences
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed">
              We value patient feedback and continuously strive to provide high-quality, consultant-led care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Google Reviews Card */}
            <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-border-clinical text-blue-600 font-bold shrink-0">
                    G
                  </div>
                  <h3 className="font-sans text-lg font-bold text-deep-navy">Google Reviews</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Read verified patient reviews on Google.
                </p>
                <div className="text-xs text-text-muted italic bg-white/60 p-2.5 rounded border border-border-clinical/20 mb-6">
                  Reviews coming soon.
                </div>
              </div>
              <Button disabled variant="secondary" className="w-full text-xs py-2 h-10 min-h-[40px]">
                View Reviews
              </Button>
            </div>

            {/* Doctify Reviews Card */}
            <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(8,47,73,0.02)]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-border-clinical text-clinical-teal font-bold shrink-0">
                    D
                  </div>
                  <h3 className="font-sans text-lg font-bold text-deep-navy">Doctify Reviews</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Read verified patient reviews on Doctify.
                </p>
                <div className="text-xs text-text-muted italic bg-white/60 p-2.5 rounded border border-border-clinical/20 mb-6">
                  Reviews coming soon.
                </div>
              </div>
              <Button disabled variant="secondary" className="w-full text-xs py-2 h-10 min-h-[40px]">
                View Reviews
              </Button>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/patient-reviews" className="text-sm font-bold text-clinical-teal hover:underline flex items-center justify-center gap-1">
              Read our patient feedback and verification policy &gt;
            </Link>
          </div>
        </div>
      </section>

      {/* Your Knee Care Journey Section */}
      <section className="bg-pale-clinical-blue py-20 w-full border-b border-border-clinical">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Patient Care Pathway
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Your Knee Care Journey
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed">
              We guide you through a clear, educational patient journey from identifying symptoms to understanding recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { step: "1", title: "Symptoms", desc: "Identify joint presentation.", href: "/symptoms" },
              { step: "2", title: "Conditions", desc: "Learn about diagnoses.", href: "/conditions" },
              { step: "3", title: "Treatments", desc: "Explore care options.", href: "/treatments" },
              { step: "4", title: "Recovery", desc: "Understand rehab phases.", href: "/recovery" },
              { step: "5", title: "Booking", desc: "Arrange an assessment.", href: "/book-appointment" }
            ].map((journeyStep, idx) => (
              <Link
                key={idx}
                href={journeyStep.href}
                className="bg-white border border-border-clinical hover:border-clinical-teal rounded-xl p-5 text-center flex flex-col justify-between items-center shadow-sm hover:shadow transition-all group focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-2"
              >
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-clinical-teal text-white flex items-center justify-center font-serif text-sm font-bold mb-3">
                    {journeyStep.step}
                  </span>
                  <h3 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1 group-hover:text-clinical-teal transition-colors">
                    {journeyStep.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-normal mb-3 font-medium">
                    {journeyStep.desc}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-clinical-teal group-hover:underline">
                  View Guide &rarr;
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href="/clinical-knowledge-hub" variant="teal">
              Understand Your Knee Journey
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Booking CTA Section - Warm Off-White Background */}
      <section className="bg-warm-off-white py-20 md:py-28 w-full border-b border-border-clinical">
        <div className="max-w-3xl mx-auto bg-white border border-border-clinical p-8 md:p-16 rounded-xl shadow-[0_4px_20px_rgba(36,59,83,0.04)] text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-navy mb-4">
            Arrange Your Consultation
          </h2>
          <p className="font-sans text-base text-text-secondary leading-relaxed mb-8">
            Appointments are booked through Google Calendar appointment schedules. Payment, where required,
            is handled securely through Stripe. Contact our team for booking support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/book-appointment" variant="teal">
              Book Online
            </Button>
            <Button href="/contact" variant="secondary">
              Contact Admin Support
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Newsletter Sign-up Section */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-16 md:py-20 w-full">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <NewsletterSignup variant="dark" className="max-w-xl mx-auto" />
        </div>
      </section>
    </div>
  );
}
