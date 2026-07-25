"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";

export default function DiagnosticsPage() {
  const [selectedModality, setSelectedModality] = useState<"mri" | "ultrasound" | "xray" | "ct" | "arthrogram">("mri");
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Enquiry form state
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [requestedScan, setRequestedScan] = useState("Standard MRI Scan (£360)");
  const [preferredLocation, setPreferredLocation] = useState("Lincoln (Newark Road, North Hykeham)");
  const [referralScheme, setReferralScheme] = useState("Self-Pay Direct");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
    setTimeout(() => {
      setIsEnquiryModalOpen(false);
      setEnquirySuccess(false);
      setPatientName("");
      setPatientEmail("");
      setPatientPhone("");
      setAdditionalDetails("");
    }, 4000);
  };

  const vistaLocations = [
    {
      city: "Lincoln",
      unitName: "Lincoln MRI Unit (Asda Newark Road)",
      address: "Newark Road, North Hykeham, Lincoln",
      postcode: "LN6 8JY",
      modalities: ["MRI", "Knee & Joint MRI"],
      access: "Local Lincoln Unit • Free Superstore Parking",
      primary: true,
    },
    {
      city: "Nottingham",
      unitName: "Nottingham City Hospital Diagnostic Center",
      address: "Gate 2, Hucknall Road, Nottingham",
      postcode: "NG5 1PB",
      modalities: ["3T MRI", "Full Body MRI", "Liver MultiScan"],
      access: "3T High-Field Imaging Suite",
      primary: true,
    },
    {
      city: "Peterborough",
      unitName: "Peterborough MRI Unit (Morrisons Walton)",
      address: "Lincoln Road, Walton, Peterborough",
      postcode: "PE4 6WS",
      modalities: ["MRI", "Joint Imaging"],
      access: "South Lincs Border • Easy Access",
      primary: true,
    },
    {
      city: "Boston",
      unitName: "Boston Health Clinic Suite",
      address: "Lincoln Lane, Boston, Lincolnshire",
      postcode: "PE21 8RU",
      modalities: ["Dynamic Ultrasound", "Echocardiogram"],
      access: "Fenland & East Lincs Catchment",
      primary: true,
    },
    {
      city: "Kingston upon Hull",
      unitName: "Hull Diagnostic Unit (Kingswood Park)",
      address: "Althorp Road, Kingswood Retail Park, Hull",
      postcode: "HU7 3DA",
      modalities: ["MRI", "Joint MRI"],
      access: "Humber Region • Free Parking",
      primary: false,
    },
    {
      city: "Nationwide (50+ Locations)",
      unitName: "Vista Health UK Diagnostic Network",
      address: "London Fitzrovia, Birmingham, Leeds, Manchester, Bristol, Cardiff, Edinburgh",
      postcode: "UK-WIDE",
      modalities: ["3T MRI", "Open/Upright MRI", "CT", "Ultrasound", "X-Ray", "DEXA"],
      access: "Fast-Track Access Across All 50+ UK Centers",
      primary: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Diagnostics" }]} />

      <PageHeader
        category="Clinical Partnerships & Diagnostic Imaging"
        title="Diagnostic Imaging & Radiography"
        subtitle="Specialist musculoskeletal MRI, dynamic ultrasound, weight-bearing X-rays, and CT scans delivered in official partnership with Vista Health across Lincolnshire and nationwide."
      />

      {/* Official Partnership Banner */}
      <div className="my-8 bg-gradient-to-r from-deep-navy via-slate-900 to-clinical-teal rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-clinical-teal text-deep-navy font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              Official Diagnostic Partner
            </span>
            <span className="bg-white/10 text-slate-200 border border-white/20 text-[10px] font-bold px-3 py-1 rounded-full">
              50+ UK Network Locations
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Vista Health Diagnostic Network &amp; Fast-Track Referral
          </h2>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            Lincolnshire Knee Clinic is partnered with <strong>Vista Health</strong> to provide rapid access to high-field 3T MRI, open MRI, ultrasound, X-ray, and CT scans with 24–48hr radiologist reports.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="px-6 py-3.5 bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer text-center inline-flex items-center justify-center gap-2"
          >
            <span>🔍 Enquire About Diagnostic Scan</span>
          </button>
        </div>
      </div>

      {/* Interactive Modality Selector & Official Vista Health Self-Pay Prices */}
      <div className="my-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-clinical/30 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-deep-navy">Vista Health Diagnostic Modalities &amp; Official Pricing</h2>
            <p className="text-sm text-text-secondary mt-1">
              Select a diagnostic service below to review official self-pay rates, fast-track availability, and clinical indications.
            </p>
          </div>
          <span className="text-xs text-clinical-teal font-bold bg-pale-clinical-blue px-3 py-1.5 rounded-lg border border-clinical-teal/20">
            ✓ Updated Vista Health Price Schedule (2026)
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "mri", label: "🧲 MRI Scan", price: "From £249 – £360" },
            { id: "ultrasound", label: "🔊 Ultrasound", price: "From £175 – £195" },
            { id: "xray", label: "🦴 Digital X-Ray", price: "From £99" },
            { id: "ct", label: "🖥️ CT Scan", price: "From £350 – £445" },
            { id: "arthrogram", label: "💉 MR Arthrogram", price: "£795 (Guided)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedModality(tab.id as any)}
              className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                selectedModality === tab.id
                  ? "bg-deep-navy text-white border-clinical-teal shadow-md"
                  : "bg-white text-deep-navy border-border-clinical/40 hover:border-clinical-teal/60"
              }`}
            >
              <div className="font-bold text-xs sm:text-sm mb-1">{tab.label}</div>
              <div className={`text-[11px] font-mono font-bold ${selectedModality === tab.id ? "text-clinical-teal" : "text-clinical-teal"}`}>
                {tab.price}
              </div>
            </button>
          ))}
        </div>

        {/* Active Modality Detail Panel */}
        <div className="bg-white border border-border-clinical/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {selectedModality === "mri" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-clinical-teal uppercase tracking-wider block mb-1">Conventional &amp; 3T Scanners</span>
                  <h3 className="text-xl font-bold font-serif text-deep-navy">MRI Scan (Magnetic Resonance Imaging)</h3>
                </div>
                <div className="bg-pale-clinical-blue border border-clinical-teal/30 p-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Vista Health Price</span>
                  <span className="font-mono text-base font-bold text-deep-navy">£360 <span className="text-xs text-text-muted font-normal">(Standard)</span> / £380 <span className="text-xs text-text-muted font-normal">(Fast-Track 7 days)</span></span>
                  <span className="text-[10px] text-emerald-700 block font-bold mt-0.5">Off-Peak Option: £249 (Fixed times)</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Sub-millimetre resolution scan evaluating cruciate ligaments (ACL/PCL), meniscal root tears, articular cartilage thickness, and bone marrow lesions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-soft-blue p-3.5 rounded-xl border border-border-clinical/30">
                  <span className="font-bold text-deep-navy block mb-1">Standard MRI (from 7 days):</span>
                  <span className="font-mono font-bold text-clinical-teal text-sm">£360</span>
                </div>
                <div className="bg-soft-blue p-3.5 rounded-xl border border-border-clinical/30">
                  <span className="font-bold text-deep-navy block mb-1">Fast Track MRI (within 7 days):</span>
                  <span className="font-mono font-bold text-clinical-teal text-sm">£380</span>
                </div>
                <div className="bg-soft-blue p-3.5 rounded-xl border border-border-clinical/30">
                  <span className="font-bold text-deep-navy block mb-1">Multi-Part Scans (2-Part):</span>
                  <span className="font-mono font-bold text-clinical-teal text-sm">£575</span>
                </div>
              </div>
            </div>
          )}

          {selectedModality === "ultrasound" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-clinical-teal uppercase tracking-wider block mb-1">Real-Time Musculoskeletal Sonography</span>
                  <h3 className="text-xl font-bold font-serif text-deep-navy">High-Resolution Joint Ultrasound</h3>
                </div>
                <div className="bg-pale-clinical-blue border border-clinical-teal/30 p-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Vista Health Price</span>
                  <span className="font-mono text-base font-bold text-deep-navy">£195 <span className="text-xs text-text-muted font-normal">(Within 7 days)</span> / £175 <span className="text-xs text-text-muted font-normal">(After 7 days)</span></span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Dynamic soft-tissue assessment for patellar/quadriceps tendon health, popliteal cyst assessment, and dynamic intra-articular injection guidance.
              </p>
            </div>
          )}

          {selectedModality === "xray" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-clinical-teal uppercase tracking-wider block mb-1">Weight-Bearing Alignment &amp; Bone Radiography</span>
                  <h3 className="text-xl font-bold font-serif text-deep-navy">Digital X-Ray (One Area / Joint)</h3>
                </div>
                <div className="bg-pale-clinical-blue border border-clinical-teal/30 p-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Vista Health Price</span>
                  <span className="font-mono text-base font-bold text-deep-navy">£99 <span className="text-xs text-text-muted font-normal">per area</span></span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Weight-bearing AP, lateral, and skyline views evaluating joint space narrowing, osteophyte growth, and mechanical axis alignment.
              </p>
            </div>
          )}

          {selectedModality === "ct" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-clinical-teal uppercase tracking-wider block mb-1">3D Cross-Sectional Bone Reconstruction</span>
                  <h3 className="text-xl font-bold font-serif text-deep-navy">CT Scan (One Part)</h3>
                </div>
                <div className="bg-pale-clinical-blue border border-clinical-teal/30 p-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Vista Health Price</span>
                  <span className="font-mono text-base font-bold text-deep-navy">£445 <span className="text-xs text-text-muted font-normal">(One Part)</span> / £350 <span className="text-xs text-text-muted font-normal">(Wholesale Rate)</span></span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Volumetric bone geometry scan for complex knee revision planning, patellar rotational malalignment, and post-traumatic bone mapping.
              </p>
            </div>
          )}

          {selectedModality === "arthrogram" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-clinical-teal uppercase tracking-wider block mb-1">Guided Contrast Articular Imaging</span>
                  <h3 className="text-xl font-bold font-serif text-deep-navy">MR Arthrogram (Fluoroscopy / US Guided)</h3>
                </div>
                <div className="bg-pale-clinical-blue border border-clinical-teal/30 p-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Vista Health Price</span>
                  <span className="font-mono text-base font-bold text-deep-navy">£795 <span className="text-xs text-text-muted font-normal">(Self-Pay)</span> / £600 <span className="text-xs text-text-muted font-normal">(Invoiced Wholesale)</span></span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Specialist intra-articular contrast MRI for complex meniscal repair re-tears, post-operative cartilage graft integrity, and loose body detection.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border-clinical/30 flex justify-end">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-5 py-2.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
            >
              Enquire About {selectedModality.toUpperCase()} Scan Referral →
            </button>
          </div>
        </div>
      </div>

      {/* Vista Health Regional & UK Network Locations */}
      <div className="my-12 space-y-6">
        <div className="border-b border-border-clinical/30 pb-4">
          <h2 className="font-serif text-2xl font-bold text-deep-navy">Vista Health Diagnostic Network Locations</h2>
          <p className="text-sm text-text-secondary mt-1">
            Access local diagnostic units across Lincolnshire or choose from over 50+ Vista Health centers nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vistaLocations.map((facility, idx) => (
            <div
              key={idx}
              className="bg-soft-blue border border-clinical-teal/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-clinical-teal/60 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-8 h-8 rounded-lg bg-clinical-teal/10 text-clinical-teal font-bold text-xs flex items-center justify-center">
                    📍
                  </span>
                  <span className="bg-clinical-teal text-white text-[9px] font-extrabold px-2 py-0.5 rounded">
                    {facility.primary ? "Lincolnshire & Regional Unit" : "UK-Wide Network"}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-deep-navy">{facility.unitName}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{facility.address} &bull; <strong>{facility.postcode}</strong></p>
                </div>
                <div className="space-y-1 text-xs text-text-secondary pt-2 border-t border-border-clinical/30">
                  <p><strong>Available Services:</strong> {facility.modalities.join(", ")}</p>
                  <p className="text-clinical-teal font-semibold">✓ {facility.access}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreferredLocation(`${facility.city} (${facility.postcode})`);
                  setIsEnquiryModalOpen(true);
                }}
                className="mt-6 w-full py-2.5 bg-white hover:bg-slate-50 border border-border-clinical text-deep-navy font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Select {facility.city} Location
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Service & Fee Transparency */}
      <div className="my-12 bg-pale-clinical-blue border border-clinical-teal/30 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-clinical-teal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Clinical Fee &amp; Administration Transparency
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-deep-navy">Diagnostic Referral &amp; Booking Administration Services</h3>
        
        <p className="text-xs text-text-secondary leading-relaxed font-medium">
          Diagnostic fees cover the comprehensive specialist clinical assessment, electronic PACS requisition letter issuance, specialist radiologist findings review, and diagnostic booking administration provided by Lincolnshire Knee Clinic.
        </p>

        <div className="bg-white p-4 rounded-xl border border-clinical-teal/20 space-y-2 text-xs text-text-secondary">
          <span className="font-bold text-deep-navy block text-sm">Patient Rights &amp; Right to Choose</span>
          <p>
            In accordance with General Medical Council (GMC) guidelines, patients always retain complete freedom of choice regarding where their diagnostic investigation is performed. We provide full fee transparency prior to referral, and alternative accredited facilities will be provided upon request.
          </p>
        </div>
      </div>

      {/* Interactive Enquiry Modal */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-clinical rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEnquiryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            {enquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto font-bold">
                  ✓
                </div>
                <h3 className="font-serif font-bold text-xl text-deep-navy">Vista Health Scan Request Sent!</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                  Thank you, <strong>{patientName}</strong>. Our medical team will review your diagnostic enquiry for <strong>{requestedScan}</strong> and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-border-clinical/30 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-clinical-teal block mb-1">
                    Vista Health Diagnostic Partner Referral
                  </span>
                  <h3 className="font-serif font-bold text-xl text-deep-navy">Enquire About Diagnostic Scan</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Select your scan type and preferred Vista Health diagnostic location.
                  </p>
                </div>

                <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold block mb-1 text-deep-navy">Full Patient Name</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Mr. John Smith"
                      className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-deep-navy">Email Address</label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="john.smith@example.com"
                        className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-deep-navy">Telephone Number</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="07700 900123"
                        className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-deep-navy">Requested Service / Scan</label>
                      <select
                        value={requestedScan}
                        onChange={(e) => setRequestedScan(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                      >
                        <option value="Standard MRI Scan (£360)">Standard MRI Scan (£360)</option>
                        <option value="Fast Track MRI Scan (£380)">Fast Track MRI Scan (£380)</option>
                        <option value="Off-Peak MRI Scan (£249)">Off-Peak MRI Scan (£249)</option>
                        <option value="MR Arthrogram (£795)">MR Arthrogram (£795)</option>
                        <option value="Dynamic Ultrasound (£195)">Dynamic Ultrasound (£195)</option>
                        <option value="Digital X-Ray (£99)">Digital X-Ray (£99)</option>
                        <option value="CT Scan (£445)">CT Scan (£445)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-deep-navy">Preferred Vista Location</label>
                      <select
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                      >
                        {vistaLocations.map((f, i) => (
                          <option key={i} value={`${f.city} (${f.postcode})`}>{f.city} — {f.unitName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-deep-navy">Knee Symptoms / Clinical Brief</label>
                    <textarea
                      rows={2}
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder="e.g. Inner knee pain, suspected meniscal tear following sports injury..."
                      className="w-full px-3.5 py-2.5 border border-border-clinical rounded-xl bg-slate-50 focus:outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors text-xs uppercase tracking-wider"
                  >
                    Submit Vista Health Diagnostic Enquiry
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <MedicalDisclaimerBlock />
    </div>
  );
}
