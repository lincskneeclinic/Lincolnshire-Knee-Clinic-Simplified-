import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";

export default function DiagnosticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Diagnostics" }]} />

      <PageHeader
        category="Clinical Support"
        title="Diagnostics"
        subtitle="Information about diagnostic imaging and related clinic-referred services."
      />

      <div className="my-8 bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-5 md:p-6 text-sm text-text-secondary leading-relaxed">
        <p className="text-base text-deep-navy font-semibold mb-2">Service Status</p>
        <p>
          Information about diagnostic imaging and related services will be added as provider arrangements are confirmed.
        </p>
      </div>

      {/* Grid of Imaging Services */}
      <div className="my-10">
        <h2 className="font-serif text-2xl font-bold text-deep-navy mb-6">Diagnostic Imaging Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MRI */}
          <div className="bg-soft-blue rounded-xl p-6 md:p-8 border border-border-clinical/30 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-clinical-teal/10 text-clinical-teal flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-deep-navy mb-2">MRI (Magnetic Resonance Imaging)</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Detailed scanning of the soft tissue structures of the knee joint, including ligaments (ACL/PCL), menisci, and articular cartilage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-clinical/30 text-xs text-text-muted italic">
              [MRI Provider &amp; Availability details pending confirmation]
            </div>
          </div>

          {/* X-ray */}
          <div className="bg-soft-blue rounded-xl p-6 md:p-8 border border-border-clinical/30 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-clinical-teal/10 text-clinical-teal flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-deep-navy mb-2">X-ray</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Standard weight-bearing views of the knee to evaluate bone structure, joint space narrowing, and the presence of osteoarthritis.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-clinical/30 text-xs text-text-muted italic">
              [X-ray Provider &amp; Availability details pending confirmation]
            </div>
          </div>

          {/* Ultrasound */}
          <div className="bg-soft-blue rounded-xl p-6 md:p-8 border border-border-clinical/30 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-clinical-teal/10 text-clinical-teal flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-deep-navy mb-2">Ultrasound</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Dynamic soft tissue imaging used to assess tendon health, fluid collections (e.g., Baker&apos;s cysts), and guide therapeutic injections.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-clinical/30 text-xs text-text-muted italic">
              [Ultrasound Provider &amp; Availability details pending confirmation]
            </div>
          </div>
        </div>
      </div>

      {/* Other Diagnostic Services and Referral Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Other Diagnostic Services */}
        <div className="bg-warm-off-white rounded-xl p-6 md:p-8 border border-border-clinical/40">
          <h3 className="font-sans text-xl font-bold text-deep-navy mb-4">Other Diagnostic Services</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Where clinically appropriate, further diagnostic modalities may be requested. These can include:
          </p>
          <ul className="list-disc pl-5 text-sm text-text-secondary space-y-2 mb-6">
            <li>CT (Computed Tomography) scans for detailed bone geometry.</li>
            <li>Diagnostic joint aspirations to analyse synovial fluid.</li>
            <li>Blood panels to screen for systemic or inflammatory joint conditions.</li>
          </ul>
          <p className="text-xs text-text-muted italic">
            Additional services will be detailed as provider partnerships are finalised.
          </p>
        </div>

        {/* How Referrals Work */}
        <div className="bg-warm-off-white rounded-xl p-6 md:p-8 border border-border-clinical/40">
          <h3 className="font-sans text-xl font-bold text-deep-navy mb-4">How Referrals Work</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Diagnostic imaging is conducted based on a clinical recommendation following a face-to-face or video consultation. Direct self-referral through this website is not enabled.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            If a scan is required, our consultant will issue a clinical referral to an approved imaging center. The provider will then contact you directly to schedule your scan.
          </p>
          <div className="bg-white border border-border-clinical/40 p-4 rounded-lg text-xs text-text-secondary">
            <span className="font-bold text-deep-navy block mb-1">Process Outline</span>
            1. Consultation &amp; Assessment &rarr; 2. Referral Issued (if indicated) &rarr; 3. Scan Conducted by Provider &rarr; 4. Results Reviewed with Consultant.
          </div>
        </div>
      </div>

      {/* Placeholders for Locations, Fees, Reports */}
      <div className="bg-soft-blue rounded-xl p-6 md:p-8 border border-border-clinical/30 space-y-6 my-8">
        <h3 className="font-sans text-xl font-bold text-deep-navy">Service Details &amp; Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-secondary">
          <div>
            <span className="font-bold text-deep-navy block mb-1">Provider Locations</span>
            <p className="text-xs text-text-muted italic">[Imaging provider facility locations pending confirmation]</p>
          </div>
          <div>
            <span className="font-bold text-deep-navy block mb-1">Fees &amp; Payment</span>
            <p className="text-xs text-text-muted italic">[Fee structures, self-pay details, and insurance recognition pending confirmation]</p>
          </div>
          <div>
            <span className="font-bold text-deep-navy block mb-1">Reports &amp; Follow-up</span>
            <p className="text-xs text-text-muted italic">[Turnaround times, reporting workflows, and follow-up schedules pending confirmation]</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-border-clinical/50 my-8">
        <h3 className="font-sans text-xl font-bold text-deep-navy mb-6">Frequently Asked Questions</h3>
        <div className="space-y-6 text-sm text-text-secondary">
          <div>
            <h4 className="font-bold text-deep-navy mb-1">Can I request an MRI scan without a consultation?</h4>
            <p className="leading-relaxed">
              No. To ensure diagnostic scans are clinically appropriate and that results can be properly interpreted, all scans require a clinical referral following an assessment with our consultant.
            </p>
          </div>
          <hr className="border-border-clinical/30" />
          <div>
            <h4 className="font-bold text-deep-navy mb-1">How will I receive my scan results?</h4>
            <p className="leading-relaxed">
              Once the imaging provider issues the formal radiologist report, it is sent to our clinical team. The findings will be reviewed and discussed with you during a follow-up consultation to plan your care.
            </p>
          </div>
          <hr className="border-border-clinical/30" />
          <div>
            <h4 className="font-bold text-deep-navy mb-1">Are scans covered by my private health insurance?</h4>
            <p className="leading-relaxed">
              Most major insurers cover diagnostic scans when referred by a specialist. However, you must contact your insurer to obtain pre-authorisation prior to attending your scan appointment.
            </p>
          </div>
        </div>
      </div>

      {/* Commercial Relationships & Transparency */}
      <div className="bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-6 md:p-8 my-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-clinical-teal/5 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
        
        <h3 className="font-serif text-lg font-bold text-deep-navy mb-3">Commercial relationships and transparency</h3>
        
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p className="font-medium text-clinical-teal">
            “Lincolnshire Knee Clinic may have commercial arrangements with selected diagnostic providers. Any relevant financial interest or referral arrangement will be disclosed clearly to patients. Referrals will be based on clinical appropriateness and patient choice.”
          </p>
          
          <div className="bg-white/80 border border-clinical-teal/15 p-4 rounded-lg text-xs font-semibold text-deep-navy italic">
            [Commercial Relationship Disclosure – legal and professional review required]
          </div>

          <div className="pt-2 space-y-3">
            <h4 className="font-bold text-deep-navy">Patient Choice &amp; Clinical Independence</h4>
            <p>
              We maintain strict clinical independence. If our consultant recommends diagnostic imaging, we will discuss the options with you. Patients always retain complete choice over where their scans are performed, and we do not rank or recommend specific providers because of any commercial relationship.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li><strong>Patient Choice:</strong> You are free to choose any accredited provider for your diagnostic imaging, whether local or national.</li>
              <li><strong>Alternative Providers:</strong> A list of available regional and national providers will be provided to help you make an informed decision.</li>
              <li><strong>Fees:</strong> Clear details of any differences in costs between provider options will be provided where known.</li>
              <li><strong>Financial Interests &amp; Commission:</strong> Any commission or financial arrangement with a provider will be fully disclosed prior to making a referral.</li>
              <li><strong>Clinical Independence:</strong> Referrals are based solely on your clinical needs and the appropriateness of the diagnostic test.</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-border-clinical/30 text-xs text-text-muted font-mono leading-normal bg-warm-off-white/40 p-3 rounded border">
            <p className="font-bold uppercase tracking-wider text-status-error mb-1">Governance Note:</p>
            “Draft wording requiring review against current GMC guidance, applicable contracts, tax/accounting requirements and legal advice before launch.”
          </div>
        </div>
      </div>

      <div className="mt-8">
        <MedicalDisclaimerBlock />
      </div>
    </div>
  );
}
