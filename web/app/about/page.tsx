import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { CredentialsGlance } from "@/components/CredentialsGlance";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Meet Your Consultant | Mr Ricardo J Pacheco | Lincolnshire Knee Clinic",
  description: "Mr Ricardo J Pacheco is a Consultant Trauma & Orthopaedic Surgeon and Clinical Lead for Elective Orthopaedics at Humber Health Partnership. Read about his philosophy of care and specialist expertise.",
};

export default function MeetYourConsultant() {
  // FAQs data
  const faqItems = [
    {
      question: "Do I need a referral?",
      answer: "Generally, most private health insurance providers require a GP referral letter prior to authorizing consultation cover. However, self-paying patients can often schedule appointments without one. We recommend verifying specific policy terms with your insurer.",
    },
    {
      question: "Can I self-refer?",
      answer: "Yes, self-paying patients can self-refer directly to Lincolnshire Knee Clinic. While a formal GP referral letter is not mandatory for self-funding arrangements, we encourage patients to keep their general practitioner informed about their specialist care.",
    },
    {
      question: "Do you provide second opinions?",
      answer: "Yes, we offer comprehensive second opinions. If you have been recommended a treatment elsewhere or wish to review previous imaging and diagnostics, we can conduct a detailed review of your knee health and discuss alternative pathways.",
    },
    {
      question: "What should I bring to my appointment?",
      answer: "Please bring a list of your current medications, any previous scan results (such as X-rays or MRI reports), and comfortable clothing (such as shorts) to allow for a thorough physical examination of your knee joint.",
    },
    {
      question: "Do you treat sports injuries?",
      answer: "Yes, we diagnose and treat a wide range of sports-related knee injuries, including ligament sprains, meniscus tears, ACL ruptures, and kneecap instability. Our goal is to coordinate evidence-based recovery plans to help you return to sport safely.",
    },
    {
      question: "Can I bring previous imaging?",
      answer: "Absolutely. If you have had X-rays, MRI scans, or ultrasounds performed at another hospital or clinic, please let our team know or bring the imaging reports/CDs with you, as it provides invaluable clinical context.",
    },
  ];

  // Expertise data
  const expertiseItems = [
    {
      title: "Knee Arthritis",
      description: "Non-surgical joint preservation strategies, clinical injection therapies, and surgical options for joint wear.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Sports Knee Injuries",
      description: "Management of acute cartilage damage, tendon ruptures, and joint instability sustained during athletic activity.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Meniscal Tears",
      description: "Assessment of shock-absorbing meniscal cartilage damage, prioritising surgical repair or conservative management.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.02 12.02l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
    },
    {
      title: "ACL Injuries",
      description: "Anterior Cruciate Ligament reconstruction surgery and tailored physical rehabilitation for knee joint stability.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Knee Replacement",
      description: "Total joint replacement procedures to address end-stage osteoarthritis, restoring movement and relieving pain.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Partial Knee Replacement",
      description: "Uni-compartmental replacements targeting localized arthritis, preserving healthy bone and ligaments.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
    {
      title: "Knee Injections",
      description: "Cortisone, Hyaluronic Acid, PRP, and hydrogel (Arthrosamid) therapies for non-surgical pain management.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      title: "Second Opinions",
      description: "Thorough review of existing orthopaedic assessments and surgical proposals to discuss alternative pathways.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  // Timeline qualifications
  const timelineMilestones = [
    {
      period: "1988 – 1994",
      title: "Medical Degree (MB BS)",
      description: "School of Medicine, Cantabria University (Spain)",
      context: "Undergraduate medical training establishing core clinical and scientific foundations.",
    },
    {
      period: "1997 – 1999",
      title: "Basic Surgical Training",
      description: "Senior House Officer Surgical Rotation, Bradford Royal Infirmary",
      context: "Rotational surgical experience developing key procedural techniques and emergency care skills.",
    },
    {
      period: "2004 – 2009",
      title: "Higher Orthopaedic Training",
      description: "Specialist Registrar in Trauma & Orthopaedics, Yorkshire Rotation",
      context: "Specialist registrar training focusing extensively on trauma and orthopaedic surgery subspecialties.",
    },
    {
      period: "2009 – 2011",
      title: "Specialist Fellowships",
      description: "Senior Knee Fellow (Leicester & Bradford)",
      context: "Bradford Hospitals Senior Knee Fellowship in Soft Tissue Knee Surgery (with Mr S Bollen & Mr G Radcliffe); University Hospitals of Leicester Senior Knee Fellow (with Mr S Godsiff & Mr C Esler) and Senior Clinical Fellow in Lower Limb Arthroplasty (with Mr S Birtwistle & Mr R Power).",
    },
    {
      period: "2011 – Present",
      title: "Consultant Appointment",
      description: "Consultant Trauma & Orthopaedic Surgeon, Northern Lincolnshire & Goole Hospitals NHS Foundation Trust (NLAG)",
      context: "Formal consultant status in orthopaedic surgery, leading patient pathways in NHS and private sectors.",
    },
  ];

  // Professional Memberships
  const memberships = [
    { name: "General Medical Council (GMC)", code: "GMC", status: "Full, Specialist Register T&O (Ref: 4145976)" },
    { name: "Fellowship of the Royal College of Surgeons", code: "FRCS (Tr & Orth)", status: "RCS England (Ref: 2008)" },
    { name: "Royal College of Surgeons of Edinburgh", code: "MRCS", status: "Member (Ref: 2000)" },
    { name: "British Association for Surgery of the Knee", code: "BASK", status: "Active Member" },
    { name: "British Orthopaedic Association", code: "BOA", status: "Active Member" },
    { name: "British Trauma Society", code: "BTS", status: "Active Member" },
  ];

  // Why patients choose LKC (factual trust cards)
  const trustThemes = [
    {
      title: "Consultant-led Care",
      desc: "Every clinical assessment, diagnostic review, and treatment procedure is conducted directly by the consultant surgeon.",
    },
    {
      title: "Evidence-based Treatment",
      desc: "Clinical pathways conform strictly to verified medical literature, clinical guidelines, and peer-reviewed safety data.",
    },
    {
      title: "Shared Decision Making",
      desc: "We prioritize patient education, laying out non-surgical and surgical options transparently to reach a joint decision.",
    },
    {
      title: "Individual Treatment Plans",
      desc: "Diagnostic findings are combined with patient lifestyle goals to coordinate tailored joint care and rehabilitation plans.",
    },
    {
      title: "Clear Communication",
      desc: "Medical terminology, clinical diagnoses, and anticipated risk rates are explained in straightforward, clear English.",
    },
    {
      title: "Continuity of Care",
      desc: "Patients are reviewed by the same specialist at every milestone, from the initial assessment through post-treatment recovery.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": "Mr Ricardo J Pacheco",
        "alternateName": "Ricardo Javier Pacheco Castañera",
        "jobTitle": "Consultant Trauma & Orthopaedic Surgeon",
        "worksFor": [
          {
            "@type": "MedicalOrganization",
            "name": "Humber Health Partnership"
          },
          {
            "@type": "MedicalOrganization",
            "name": "Northern Lincolnshire and Goole Hospitals NHS Foundation Trust"
          }
        ],
        "alumniOf": [
          {
            "@type": "EducationalOrganization",
            "name": "Cantabria University"
          },
          {
            "@type": "EducationalOrganization",
            "name": "Royal College of Surgeons of England"
          },
          {
            "@type": "EducationalOrganization",
            "name": "Royal College of Surgeons of Edinburgh"
          }
        ],
        "knowsAbout": [
          "Knee Reconstruction",
          "Joint Preservation",
          "Knee Arthritis",
          "Sports Knee Injuries",
          "Meniscal Repair",
          "Anterior Cruciate Ligament (ACL)"
        ]
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

      {/* Breadcrumbs (Light background container) */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2 w-full font-sans">
        <Breadcrumbs items={[{ label: "Meet Your Consultant" }]} />
      </div>

      {/* 1. Meet Your Consultant (Hero Section) */}
      <section className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] py-20 md:py-28 relative overflow-hidden w-full border-b-4 border-clinical-teal">
        {/* Decorative subtle medical blue glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/15 rounded-full translate-x-12 -translate-y-12 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-soft-blue/5 rounded-full -translate-x-12 translate-y-12 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text content */}
          <div className="lg:col-span-7 text-left text-white">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3.5 font-sans">
              Meet Your Consultant
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold !text-white leading-tight mb-2">
              Mr Ricardo J Pacheco
            </h1>
            <p className="font-sans text-base md:text-lg font-bold text-[#DFF3F5]/90 uppercase tracking-wider leading-none">
              Consultant Trauma & Orthopaedic Surgeon
            </p>
            
            {/* Teal accent line */}
            <div className="w-20 h-1.5 bg-clinical-teal rounded-full mt-5 mb-7"></div>
            
            <p className="font-sans text-lg md:text-xl text-[#DFF3F5] leading-relaxed max-w-2xl">
              Specialist assessment and treatment for knee pain, sports injuries and knee arthritis with a focus on evidence-based care, clear communication and shared decision-making.
            </p>
          </div>

          {/* Right Portrait Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              {/* Soft glow decoration */}
              <div className="absolute inset-0 bg-clinical-teal/20 rounded-2xl blur-xl transition-all duration-300 group-hover:bg-clinical-teal/30"></div>
              {/* Premium image container */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-deep-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/consultant/ricardo-pacheco.jpg"
                  alt="Mr Ricardo J Pacheco - Consultant Trauma & Orthopaedic Surgeon"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Credentials at a Glance (Overlapping Panel) */}
      <section className="bg-white pb-12 w-full relative z-20">
        <CredentialsGlance isOverlapping={true} />
      </section>

      {/* 2b. Professional Biography */}
      <section className="bg-white py-14 md:py-20 w-full border-t border-border-clinical/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Biography
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Professional Biography
            </h2>
            <div className="w-16 h-1 bg-clinical-teal rounded-full mx-auto"></div>
          </div>
          <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed font-sans">
            <p>
              Mr Ricardo J Pacheco completed his medical degree (MB BS) at the School of Medicine, Cantabria University (Santander, Spain) in 1994. After moving to the UK, he undertook his basic surgical training at the Bradford Royal Infirmary, achieving Membership of the Royal College of Surgeons of Edinburgh (MRCS) in 2000. He subsequently completed a Postgraduate Certificate in Exercise and Sports Injuries Management at Leeds University in 2002.
            </p>
            <p>
              Mr Pacheco completed his Higher Orthopaedic Training on the Yorkshire Deanery rotation between 2004 and 2009, obtaining his Fellowship of the Royal College of Surgeons (FRCS Tr & Orth) in 2008. He further subspecialised by completing prestigious Senior Knee Fellowships in soft tissue knee surgery and arthroplasty in Bradford and Leicester, training under eminent knee and sports injury specialists.
            </p>
            <p>
              Since August 2011, Mr Pacheco has practiced as a Consultant Trauma and Orthopaedic Surgeon at the Northern Lincolnshire and Goole Hospitals NHS Foundation Trust (NLAG). He has established a specialist practice focusing on knee reconstruction, sports knee injuries, joint preservation, and arthritic knee care.
            </p>
            <p>
              An active leader in the NHS and private sectors, he has served as Clinical Lead for Orthopaedics at St Hugh&apos;s Hospital (2014-2021) and Chairman of the Medical Advisory Committee (MAC) at St Hugh&apos;s (2021-2025). In August 2024, he was appointed Clinical Lead for Elective Orthopaedics for the Humber Health Partnership, leading a team of over 45 consultant surgeons across 5 hospitals.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Philosophy of Care (Narrative Section) */}
      <section className="bg-pale-clinical-blue/20 py-14 md:py-20 w-full border-t border-border-clinical/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
            Core Beliefs
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-6">
            Philosophy of Care
          </h2>
          <div className="w-16 h-1 bg-clinical-teal rounded-full mx-auto mb-8"></div>
          
          <div className="space-y-6 text-base md:text-lg text-text-secondary leading-relaxed font-sans text-left bg-white border border-border-clinical/50 p-6 md:p-10 rounded-2xl">
            <p>
              Every clinical decision should be a shared journey between patient and surgeon. Our philosophy is rooted in listening to each individual&apos;s unique history and symptoms, providing clear and straightforward explanations of clinical diagnoses, and designing personalized management plans that align with your lifestyle goals.
            </p>
            <p>
              By adhering strictly to evidence-based practice and utilizing clinical treatments supported by robust clinical data, we prioritise joint preservation and non-surgical therapies, ensuring that surgical intervention is recommended only when conservative paths are fully explored.
            </p>
          </div>
        </div>
      </section>

      {/* 3b. Clinical Leadership */}
      <section className="bg-white py-14 md:py-20 w-full border-t border-border-clinical/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Clinical Quality &amp; Development
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Clinical Leadership
            </h2>
          </div>
          <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
            <p>
              Mr Ricardo J Pacheco has held significant leadership roles dedicated to governance, service development, and clinical quality improvement in both the NHS and private sectors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="border border-border-clinical/50 rounded-xl p-5 bg-pale-clinical-blue/20">
                <h3 className="font-sans font-bold text-deep-navy mb-2">Humber Health Partnership</h3>
                <p className="text-xs md:text-sm leading-relaxed">
                  <strong>Clinical Lead for Elective Orthopaedics</strong> since August 2024. Responsible for overseeing elective orthopaedic service delivery, clinical pathways, and operations across 5 hospitals, managing a team of over 45 Consultants.
                </p>
              </div>
              <div className="border border-border-clinical/50 rounded-xl p-5 bg-pale-clinical-blue/20">
                <h3 className="font-sans font-bold text-deep-navy mb-2">St Hugh&apos;s Hospital</h3>
                <p className="text-xs md:text-sm leading-relaxed mb-2">
                  <strong>MAC Chair</strong> (2021 – 2025) and <strong>Clinical Lead in Orthopaedics</strong> (2014 – 2021, managing 13 Consultants). Led clinical governance, tendering processes achieving 20-25% savings, and evaluated new procedure viability.
                </p>
              </div>
            </div>
            <p className="pt-2">
              Key leadership achievements include piloting and establishing the <strong>Virtual Fracture Clinic at Scunthorpe General Hospital</strong>, achieving a 50% reduction in face-to-face clinic pressure; implementing <strong>same-day discharge lower-limb arthroplasty pathways at Goole District Hospital</strong>, reducing length of stay (LOS) to a personal average of 0.87 days; and co-developing full electronic records systems at St Hugh&apos;s.
            </p>
            <p className="text-[11px] text-text-muted italic border-t border-border-clinical/30 pt-4">
              NHS leadership roles and hospital governance appointments are listed for professional context and do not constitute an endorsement of this private clinic.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Areas of Expertise (Grid of Icon Cards) */}
      <section className="bg-pale-clinical-blue/40 py-16 md:py-24 w-full border-t border-b border-border-clinical/40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Specialist Capabilities
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Areas of Expertise
            </h2>
            <p className="font-sans text-base text-text-secondary">
              Focused diagnosis, conservative management, and surgical repair techniques for knee conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {expertiseItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-border-clinical rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-clinical-teal/10 text-clinical-teal flex items-center justify-center mb-5 shrink-0 group-hover:bg-clinical-teal group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-sans text-base md:text-lg font-bold text-deep-navy mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Training & Qualifications (Professional Timeline) */}
      <section className="bg-white py-16 md:py-24 w-full">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Education & Pathways
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Training & Qualifications
            </h2>
            <p className="font-sans text-base text-text-secondary">
              A timeline of professional orthopaedic surgical training milestones.
            </p>
          </div>

          {/* Timeline list */}
          <div className="relative border-l-2 border-border-clinical/80 ml-4 md:ml-8 space-y-12">
            {timelineMilestones.map((milestone, idx) => (
              <div key={idx} className="relative pl-8 md:pl-10 group">
                {/* Timeline node dot */}
                <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-4 border-white bg-clinical-teal group-hover:scale-125 transition-transform duration-200 shadow-sm"></div>
                
                <div className="space-y-1.5">
                  <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-wider leading-none">
                    {milestone.period}
                  </span>
                  <h3 className="font-sans text-lg font-bold text-deep-navy">
                    {milestone.title}
                  </h3>
                  <p className="font-sans text-sm font-bold text-text-main">
                    {milestone.description}
                  </p>
                  <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                    {milestone.context}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Professional Memberships (Grid Cards) */}
      <section className="bg-pale-clinical-blue/40 py-16 md:py-24 w-full border-t border-b border-border-clinical/40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Governance & Registries
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Professional Memberships
            </h2>
            <p className="font-sans text-base text-text-secondary">
              Registrations and board memberships verifying clinical credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((member, idx) => (
              <div
                key={idx}
                className="bg-white border border-border-clinical rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold text-clinical-teal uppercase tracking-wider px-2 py-1 rounded bg-clinical-teal/10 mb-4">
                    {member.code}
                  </span>
                  <h3 className="font-sans text-base font-bold text-deep-navy mb-2">
                    {member.name}
                  </h3>
                </div>
                <div className="pt-4 border-t border-border-clinical/30 mt-4 flex items-center justify-between text-xs">
                  <span className="font-sans text-text-secondary font-semibold">Details</span>
                  <span className="font-sans text-clinical-teal font-bold">{member.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6b. Sports and Active Patient Experience */}
      <section className="bg-white py-16 md:py-24 w-full border-t border-border-clinical/30">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Active Patient Experience
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Sports and Active Patient Experience
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed">
              Mr Ricardo J Pacheco has experience assessing, treating and operating on professional and recreational athletes across a range of sports and performance disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { sport: "Football", detail: "Experience treating professional players up to Championship level." },
              { sport: "Cycling", detail: "Experience looking after professional cyclists, including Tour de France participants." },
              { sport: "Dance", detail: "Experience treating professional dancers where clinically appropriate." },
              { sport: "Motorsport", detail: "Experience treating professional motorcycle racers, including Isle of Man TT riders." },
              { sport: "Triathlon & Endurance", detail: "Experience treating triathletes and endurance athletes." },
              { sport: "Recreational Sport", detail: "Assessment and treatment of recreational athletes across a wide range of activities." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-pale-clinical-blue/30 border border-border-clinical/50 rounded-2xl p-6 shadow-sm"
              >
                <span className="block font-sans text-xs font-bold text-clinical-teal uppercase tracking-wider mb-2">
                  {item.sport}
                </span>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-medium">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-10 text-xs text-text-muted italic border-t border-border-clinical/30 pt-6 space-y-2">
            <p>
              Patient identities are not disclosed. No team, club, organisation, event or individual is named or identifiable.
              This information is provided as factual context only and does not imply formal team-doctor status, endorsement, or guaranteed outcomes.
            </p>
            <p>
              Not every patient listed above underwent surgical intervention. Treatment approach is always determined by the individual clinical assessment and shared decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* 7. NHS & Private Practice (Split Practice Details) */}
      <section className="bg-white py-16 md:py-24 w-full border-t border-border-clinical/30">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Clinical Affiliations
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              NHS & Private Practice
            </h2>
            <p className="font-sans text-base text-text-secondary">
              Active practicing privileges and clinical locations across the sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* NHS card */}
            <div className="bg-soft-blue border border-border-clinical/40 rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-clinical-teal/10 flex items-center justify-center text-clinical-teal shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-deep-navy">NHS Practice</h3>
                </div>
                <div className="font-sans text-sm md:text-base text-text-secondary leading-relaxed mb-6 font-medium space-y-3">
                  <p>Mr Ricardo J Pacheco maintains active clinical practice in the NHS sector. NHS services are conducted through:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">Northern Lincolnshire and Goole Hospitals NHS Foundation Trust (NLAG)</strong> — including Scunthorpe General Hospital and Goole District Hospital</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">Humber Health Partnership</strong> — elective orthopaedic hub</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="text-xs font-semibold text-text-muted bg-white/70 px-4 py-2.5 rounded-lg border border-border-clinical/30">
                GP Referral required for NHS clinical services.
              </div>
            </div>

            {/* Private card */}
            <div className="bg-soft-blue border border-border-clinical/40 rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-clinical-teal/10 flex items-center justify-center text-clinical-teal shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-deep-navy">Private Practice</h3>
                </div>
                <div className="font-sans text-sm md:text-base text-text-secondary leading-relaxed mb-6 font-medium space-y-3">
                  <p>Mr Ricardo J Pacheco holds practising privileges at several independent hospitals and clinics:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">St Hugh&apos;s Hospital</strong> — Grimsby</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">Inspire Health</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">Parkhill Hospital</strong> — Doncaster</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-clinical-teal shrink-0" aria-hidden="true" />
                      <span><strong className="text-deep-navy font-semibold">Lincoln Private Hospital</strong> — Lincoln</span>
                    </li>
                  </ul>
                  <p className="text-sm">Private consultations, injections, and surgical procedures are offered at these locations.</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-text-muted bg-white/70 px-4 py-2.5 rounded-lg border border-border-clinical/30">
                Self-referral accepted for private assessments.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Teaching & Research Summaries */}
      <section className="bg-pale-clinical-blue/40 py-16 md:py-24 w-full border-t border-b border-border-clinical/40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Clinical Contributions
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Teaching, Research &amp; Publications
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed max-w-2xl mx-auto animate-fade-in">
              Active dedication to clinical teaching, orthopaedic research, and peer-reviewed literature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-border-clinical/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-base font-bold text-deep-navy mb-3">Clinical Teaching</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Deanery Specialty Registrar Trainer at NLAG. Faculty member on external fixation courses, final year medical student examiner (Leeds University), and ATLS course instructor.
                </p>
              </div>
              <span className="text-xs font-bold text-clinical-teal">Leeds &amp; Yorkshire Faculty</span>
            </div>

            <div className="bg-white border border-border-clinical/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-base font-bold text-deep-navy mb-3">Academic Research</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Former Research Fellow at Sheffield University and Bassetlaw Hospital under Prof. Michael Saleh. Peer reviewer for the BASK affiliated journal, <em>The Knee</em>.
                </p>
              </div>
              <span className="text-xs font-bold text-clinical-teal">Sheffield University Fellow</span>
            </div>

            <div className="bg-white border border-border-clinical/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-base font-bold text-deep-navy mb-3">Publications &amp; Papers</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Author of 8 peer-reviewed articles and multiple published abstracts in journals including the <em>Journal of Bone and Joint Surgery (JBJS)</em> and <em>The Knee</em>.
                </p>
              </div>
              <Link href="/research" className="text-xs font-bold text-clinical-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal">
                View Publications &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Why Patients Choose Lincolnshire Knee Clinic (Factual Trust Cards) */}
      <section className="bg-white py-16 md:py-24 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Factual Quality Metrics
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Why Patients Choose Lincolnshire Knee Clinic
            </h2>
            <p className="font-sans text-base text-text-secondary">
              A clinic founded on transparent, evidence-based practices and personal continuity of care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trustThemes.map((theme, idx) => (
              <div
                key={idx}
                className="bg-soft-blue border border-transparent rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(8,47,73,0.02)] hover:bg-white hover:border-border-clinical/60 transition-all duration-200"
              >
                <h3 className="font-sans text-base md:text-lg font-bold text-deep-navy mb-3">
                  {theme.title}
                </h3>
                <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                  {theme.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Frequently Asked Questions (Accordion) */}
      <section className="bg-pale-clinical-blue/40 py-16 md:py-24 w-full border-t border-b border-border-clinical/40">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-3 font-sans">
              Answers at a Glance
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-sans text-base text-text-secondary">
              Quick, consultant-reviewed answers about referrals, scheduling, and diagnostic imaging.
            </p>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* 11. Call to Action (CTA) */}
      <section className="bg-white py-16 md:py-24 w-full">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-[#0B2D4D] via-[#003B5C] to-[#0A1F33] p-10 md:p-16 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
            
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-clinical-teal block mb-4 font-sans relative z-10">
              Arrange a Consultation
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold !text-white mb-6 relative z-10">
              Ready to Arrange a Consultation?
            </h2>
            <p className="font-sans text-base text-[#DFF3F5]/90 max-w-xl mx-auto mb-10 relative z-10">
              Schedule a face-to-face evaluation with Mr Ricardo J Pacheco or contact our clinic team for booking guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Button href="/book-appointment" variant="teal">
                Book Appointment
              </Button>
              <Button href="/clinics" className="text-white border-white hover:bg-white/10 bg-transparent border">
                Find a Clinic
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white pb-10 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <MedicalDisclaimerBlock />
        </div>
      </section>
    </div>
  );
}
