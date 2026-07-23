import React from "react";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Research, Publications & Presentations | Mr Ricardo J Pacheco",
  description: "Explore the academic contributions, peer-reviewed publications, abstracts, and national and international presentations of Mr Ricardo J Pacheco, Consultant Trauma & Orthopaedic Surgeon.",
};

interface PublicationItem {
  authors: string;
  title: string;
  journal: string;
  date: string;
  details: string;
  pmidUrl?: string;
}

export default function ResearchPage() {
  const articles: PublicationItem[] = [
    {
      authors: "Sharkey S, Narang K, Pacheco RJ, Anthony C.",
      title: "Initial assessment of framework for delivery of elective orthopaedic surgery in the United Kingdom following the COVID-19 pandemic.",
      journal: "Musculoskelet Surg",
      date: "2022 Dec",
      details: "106(4):427-432",
      pmidUrl: "https://pubmed.ncbi.nlm.nih.gov/34109553/",
    },
    {
      authors: "Khan M.M, Pincher B, Pacheco RJ.",
      title: "Unnecessary magnetic resonance imaging of the knee. How much is really costing to the NHS?",
      journal: "Annals of Medicine and Surgery",
      date: "August 2021",
      details: "70(3): 102736",
      pmidUrl: "https://pubmed.ncbi.nlm.nih.gov/34603711/",
    },
    {
      authors: "Pacheco R.J, Ayre C.A, Bollen S.R.",
      title: "Posterolateral corner injuries of the knee: A serious injury commonly missed.",
      journal: "J Bone Joint Surg Br",
      date: "2011 Feb",
      details: "93(2):194-7",
      pmidUrl: "https://pubmed.ncbi.nlm.nih.gov/21282758/",
    },
    {
      authors: "Fogerty S, Pacheco R, McLaren CAN.",
      title: "Simultaneous fractures of the ulnar and radial sesamoid bones of the hand.",
      journal: "Journal of Hand Surgery [Br]",
      date: "2007",
      details: "32(3): 358-9",
    },
    {
      authors: "Kasis AG, Pacheco RJ, Farhan MJ, Smith DM, Ali AM.",
      title: "The precision and accuracy of templating the size of unicondylar knee arthroplasty.",
      journal: "Knee",
      date: "2004",
      details: "11(5): 395-98",
      pmidUrl: "https://pubmed.ncbi.nlm.nih.gov/15351416/",
    },
    {
      authors: "Pacheco RJ, Bradbury MD, Kasis AG, Saleh M.",
      title: "Management of non-union. A review paper.",
      journal: "Trauma",
      date: "2004",
      details: "6(3): 225-47",
    },
    {
      authors: "Pacheco RJ, Saleh M.",
      title: "The role of external fixators in trauma. A review paper.",
      journal: "Trauma",
      date: "2004",
      details: "6(2): 143-160",
    },
    {
      authors: "Pacheco RJ, Buckley S, Oxborrow NJ, Weeber AC, Allerton K.",
      title: "Gluteal compartment syndrome after total knee arthroplasty with epidural postoperative analgesia.",
      journal: "Journal of Bone and Joint Surgery [Br]",
      date: "2001",
      details: "83-B: 739-40",
      pmidUrl: "https://pubmed.ncbi.nlm.nih.gov/11476317/",
    },
  ];

  const abstracts = [
    {
      authors: "Kasis A.G, Pacheco R.J, and M. Saleh.",
      title: "Outcome following deformities secondary to growth plate arrest around the knee in adults.",
      journal: "J Bone Joint Surg Br Proceedings",
      date: "Mar 2006",
      details: "88-B: 125",
    },
    {
      authors: "Kasis A.G, Pacheco R.J, W. Hekal, and M.J. Farhan.",
      title: "The effect of the alignment of the tibial and femoral components on functional outcome following medial unicondylar knee arthroplasty.",
      journal: "J Bone Joint Surg Br Proceedings",
      date: "Mar 2006",
      details: "88-B: 100",
    },
    {
      authors: "Pacheco R.J, L. Yang, and M. Saleh.",
      title: "Study of the distraction forces and contact pressures of the ankle joint.",
      journal: "J Bone Joint Surg Br Proceedings",
      date: "Sep 2005",
      details: "87-B: 230 - 231",
    },
    {
      authors: "Saldanha KAN, Pacheco RJ, Haldar HS, Farhan MJ.",
      title: "Early results of a new custom-made prosthesis for the management of infected hip.",
      journal: "Hip International",
      date: "2002",
      details: "12(2): 193-4",
    },
    {
      authors: "McGregor-Riley J, Pacheco RJ, Chaudhary AK, Bajekal RA.",
      title: "Fixation of the lateral malleolus in unstable ankle fractures: is a neutralization plate always necessary?",
      journal: "Injury",
      date: "2002",
      details: "33(10): 881",
    },
  ];

  const presentations = [
    {
      date: "Sep 2010",
      authors: "Pacheco RJ, Ayre CA, Bollen SR.",
      title: "Posterolateral corner injuries of the knee: A serious injury commonly missed.",
      meeting: "British Orthopaedic Association (BOA)",
      location: "Glasgow",
    },
    {
      date: "Apr 2006",
      authors: "Gibbon AJ, Pacheco RJ, Farndon MA.",
      title: "Osseointegration of biocomposite screws used in ACL graft.",
      meeting: "11th Brazilian Congress of Knee Surgery",
      location: "Costa De Sauipe (Brazil)",
    },
    {
      date: "Apr 2006",
      authors: "Gibbon AJ, Farndon MA, Pacheco RJ.",
      title: "Hamstring ACL reconstruction using a biocomposite suspensory device.",
      meeting: "11th Brazilian Congress of Knee Surgery",
      location: "Costa De Sauipe (Brazil)",
    },
    {
      date: "Jun 2005",
      authors: "Kasis AG, Pacheco RJ, Hekal W, Farhan MJ.",
      title: "The effect of the alignment of the tibial and femoral components on the functional outcome following medial unicondylar knee arthroplasty.",
      meeting: "7th EFORT congress",
      location: "Lisbon",
    },
    {
      date: "Jun 2005",
      authors: "Kasis AG, Pacheco RJ, Saleh M.",
      title: "Tibial lengthening and deformity correction in children using the Sheffield Ring Fixator.",
      meeting: "7th EFORT congress",
      location: "Lisbon",
    },
    {
      date: "Jun 2005",
      authors: "Kasis AG, Pacheco RJ, Hekal W, Farhan MJ, Smith DM, Ali AM.",
      title: "The precision and accuracy of templating the size of unicondylar knee arthroplasty.",
      meeting: "7th EFORT congress",
      location: "Lisbon",
    },
    {
      date: "Jun 2004",
      authors: "Pacheco RJ, Kasis AG, Mace J, Saleh M.",
      title: "Tibial lengthening with simultaneous deformity correction in adults.",
      meeting: "ASAMI meeting",
      location: "Turkey",
    },
    {
      date: "Jun 2004",
      authors: "Kasis AG, Pacheco RJ, Pagden J, Mace J, Saleh M.",
      title: "Tibial lengthening with simultaneous deformity correction in children.",
      meeting: "ASAMI meeting",
      location: "Turkey",
    },
    {
      date: "Jun 2004",
      authors: "Kasis AG, Pacheco RJ, Saleh M.",
      title: "Outcome following deformity correction secondary to growth plate arrest around the knee in adults.",
      meeting: "ASAMI meeting",
      location: "Turkey",
    },
    {
      date: "Sep 2003",
      authors: "Pacheco RJ, El-Shazly M, Saleh M.",
      title: "Neutralization treatment of pilon fractures with the Sheffield Ring Fixator.",
      meeting: "British Orthopaedic Association (BOA)",
      location: "Birmingham",
    },
    {
      date: "Apr 2003",
      authors: "Pacheco RJ, Yang L, Saleh M.",
      title: "Study of the distraction forces and contact pressures of the ankle joint.",
      meeting: "British Orthopaedic Research Society (BORS)",
      location: "Nottingham",
    },
    {
      date: "Oct 2002",
      authors: "Pacheco RJ, El-Shazly M, Saleh M.",
      title: "Neutralization of pilon fractures with the Sheffield Ring Fixator.",
      meeting: "International Society for Fracture Repair (ISFR)",
      location: "Toronto (Canada)",
    },
    {
      date: "Jul 2002",
      authors: "Saleh M, Pacheco RJ.",
      title: "Management of 'stiff' joints. Hip and Ankle.",
      meeting: "International Society for Fracture Repair (ISFR) workshop",
      location: "Verona (Italy)",
    },
    {
      date: "Jun 2002",
      authors: "Saldanha KAN, Pacheco RJ, Haldar HS, Farhan MJ.",
      title: "Early results of a new custom made prosthesis for the management of infected hip.",
      meeting: "European Hip Society",
      location: "Baveno (Italy)",
    },
    {
      date: "May 2002",
      authors: "Saleh M, Pacheco RJ.",
      title: "Articulated ankle distraction.",
      meeting: "British Limb Reconstruction Society",
      location: "Bristol",
    },
    {
      date: "Oct 2001",
      authors: "McGregor-Riley J, Pacheco RJ, Chaudhary AK, Bajekal RA.",
      title: "Fixation of the lateral malleolus in unstable ankle fractures: is a neutralization plate always necessary?",
      meeting: "British Trauma Society (BTS)",
      location: "Leeds",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Meet Your Consultant", href: "/about" }, { label: "Research & Publications" }]} />

      <PageHeader
        category="Academic Contributions"
        title="Research, Publications & Presentations"
        subtitle="Explore the academic and scientific research contributions of Mr Ricardo J Pacheco, Consultant Trauma & Orthopaedic Surgeon. Discover peer-reviewed literature, clinical studies, and presentations delivered at national and international conferences."
      />

      {/* Research Background */}
      <div className="bg-pale-clinical-blue/40 border border-border-clinical/50 rounded-2xl p-6 md:p-8 my-8 space-y-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy">Academic Profile</h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Mr Ricardo J Pacheco maintains an active commitment to evidence-based medicine, clinical audit, and orthopaedic research to ensure treatment pathways conform with modern peer-reviewed advancements.
        </p>
        <p className="text-sm md:text-base text-[#003B5C] font-semibold">
          Key Research Involvement:
        </p>
        <ul className="list-disc pl-5 text-xs md:text-sm text-text-secondary space-y-2">
          <li><strong>Research Fellow in Orthopaedics & Trauma:</strong> Worked part-time as a researcher under the supervision of Professor Michael Saleh at Sheffield University and Bassetlaw District General Hospital, conducting laboratory and clinical research.</li>
          <li><strong>Peer Reviewer:</strong> Appointed reviewer for <em>The Knee</em> journal, published in conjunction with the British Association for the Surgery of the Knee (BASK).</li>
          <li><strong>GIRFT & Audits:</strong> Actively participates in national joint registries and quality improvement audits (such as monthly revision knee meetings aligned with GIRFT guidelines).</li>
        </ul>
      </div>

      {/* Peer-reviewed Articles */}
      <section className="space-y-6 my-12">
        <div className="border-b border-border-clinical/30 pb-3">
          <h2 className="font-serif text-2xl font-bold text-deep-navy">Peer-Reviewed Papers</h2>
          <p className="text-xs text-text-muted mt-1">Published research papers in major orthopaedic and medical journals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white border border-border-clinical rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-clinical-teal uppercase tracking-wider block mb-2">{art.journal} • {art.date}</span>
                <h3 className="font-sans text-sm md:text-base font-bold text-deep-navy mb-2 leading-snug">{art.title}</h3>
                <p className="text-xs text-text-secondary font-medium italic mb-2">Authors: {art.authors}</p>
                <p className="text-xs text-text-muted">Journal details: {art.journal}. {art.date}; {art.details}</p>
              </div>
              {art.pmidUrl && (
                <div className="mt-4 pt-3 border-t border-border-clinical/10 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-bold font-sans">Indexed on PubMed</span>
                  <a
                    href={art.pmidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-clinical-teal hover:underline flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal"
                  >
                    View on PubMed &rarr;
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Abstracts */}
      <section className="space-y-6 my-12">
        <div className="border-b border-border-clinical/30 pb-3">
          <h2 className="font-serif text-2xl font-bold text-deep-navy">Published Abstracts & Proceedings</h2>
          <p className="text-xs text-text-muted mt-1">Abstracts published in conference proceedings and journal supplements.</p>
        </div>

        <div className="space-y-4">
          {abstracts.map((ab, idx) => (
            <div key={idx} className="bg-pale-clinical-blue/20 border border-border-clinical/45 rounded-xl p-4 md:p-5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{ab.journal} • {ab.date}</span>
              <h3 className="font-sans text-xs md:text-sm font-bold text-deep-navy mb-1 leading-snug">{ab.title}</h3>
              <p className="text-[11px] text-text-secondary font-semibold italic">Authors: {ab.authors}</p>
              <p className="text-[10px] text-text-muted mt-1">Citation: {ab.journal}. {ab.date}; {ab.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Presentations */}
      <section className="space-y-6 my-12">
        <div className="border-b border-border-clinical/30 pb-3">
          <h2 className="font-serif text-2xl font-bold text-deep-navy">National &amp; International Presentations</h2>
          <p className="text-xs text-text-muted mt-1">Research papers presented at international conferences and orthopaedic societies.</p>
        </div>

        <div className="bg-white border border-border-clinical rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-pale-clinical-blue border-b border-border-clinical/60 font-semibold text-deep-navy">
                  <th className="p-4 w-24">Date</th>
                  <th className="p-4">Presentation Details</th>
                  <th className="p-4 w-48 md:w-64">Meeting &amp; Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-clinical/35 text-text-secondary font-medium">
                {presentations.map((pres, idx) => (
                  <tr key={idx} className="hover:bg-pale-clinical-blue/25 transition-colors">
                    <td className="p-4 align-top font-bold text-clinical-teal font-sans">{pres.date}</td>
                    <td className="p-4 align-top space-y-1">
                      <p className="text-deep-navy font-bold">{pres.title}</p>
                      <p className="text-[11px] text-text-muted">Authors: {pres.authors}</p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-bold text-text-main">{pres.meeting}</p>
                      <p className="text-[11px] text-text-muted italic">{pres.location}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <MedicalDisclaimerBlock />
    </div>
  );
}
