"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { clinicLocations, ClinicLocation } from "@/data/clinics";
import { ClinicInfoMapBlock } from "@/components/visuals/ClinicInfoMapBlock";
import { Button } from "@/components/Button";
import { SITE_URL } from "@/lib/site";

export default function Clinics() {
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation>(clinicLocations[0]);

  const handleSelectClinic = (clinic: ClinicLocation) => {
    setSelectedClinic(clinic);
    // Smooth scroll to the clinic card
    const element = document.getElementById(clinic.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": clinicLocations.map((clinic) => ({
      "@type": "MedicalClinic",
      "@id": `${SITE_URL}/clinics#${clinic.id}`,
      "name": clinic.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinic.address.split(",")[0],
        "addressLocality": clinic.address.split(",")[1]?.trim() || "",
        "addressRegion": "Lincolnshire",
        "postalCode": clinic.address.split(",").pop()?.trim() || "",
        "addressCountry": "UK"
      },
      "telephone": clinic.phone,
      "url": `${SITE_URL}/clinics`,
      "image": `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
      "medicalSpecialty": "Orthopaedic",
      "availableService": [
        {
          "@type": "MedicalTherapy",
          "name": "Knee Surgery Consultations"
        },
        {
          "@type": "MedicalTherapy",
          "name": "Joint Injections"
        }
      ]
    }))
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-10 md:py-16 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Clinics" }]} />

      <PageHeader
        category="Practising Privileges & Professional Affiliations"
        title="Private Practice Locations"
        subtitle="Mr Ricardo J Pacheco consults privately at several independent hospitals and clinics across Lincolnshire and neighbouring regions. He holds practising privileges and professional affiliations at these locations, allowing patients to choose the most convenient location for their consultation."
      />

      {/* Main Grid: Cards on the Left, Interactive Directory on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
        
        {/* Left Side: Clinic Cards (7 columns on large screens) */}
        <div className="lg:col-span-7 space-y-8">
          {clinicLocations.map((clinic, index) => (
            <ClinicInfoMapBlock
              key={index}
              clinic={clinic}
              isActive={selectedClinic.id === clinic.id}
              onSelect={() => handleSelectClinic(clinic)}
            />
          ))}
        </div>

        {/* Right Side: Sticky Maps Embed / Interactive Directory (5 columns on large screens) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-soft-blue border border-border-clinical rounded-xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[520px]">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-clinical-teal mb-2 block">
                Interactive Directory
              </span>
              <h3 className="font-sans text-lg font-bold text-deep-navy mb-4">
                Regional Map Directory
              </h3>

              {/* Location Selectors */}
              <div className="flex flex-wrap gap-2 mb-4">
                {clinicLocations.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => handleSelectClinic(clinic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedClinic.id === clinic.id
                        ? "bg-clinical-teal text-white border-clinical-teal shadow-sm"
                        : "bg-white text-text-secondary border-border-clinical hover:bg-pale-clinical-blue"
                    }`}
                  >
                    {clinic.name.replace(" Hospital", "").replace(" Private", "")}
                  </button>
                ))}
              </div>
              
              {/* Map embed box */}
              <div className="w-full h-64 rounded-lg bg-deep-navy/5 border border-border-clinical relative overflow-hidden shadow-inner">
                {selectedClinic.mapEmbedCode ? (
                  <div
                    className="absolute inset-0 w-full h-full"
                    dangerouslySetInnerHTML={{ __html: selectedClinic.mapEmbedCode }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
                    <svg className="w-10 h-10 text-clinical-teal/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-sans text-sm font-bold text-deep-navy mb-1">
                      {selectedClinic.name} Map Pending
                    </span>
                    <p className="text-[11px] text-text-secondary font-semibold">
                      Google Maps view with all locations.
                    </p>
                  </div>
                )}
              </div>

              {/* Active Clinic Details summary in Sidebar */}
              <div className="mt-4 p-3 bg-white/70 border border-border-clinical/30 rounded-lg text-xs">
                <p className="font-bold text-deep-navy mb-1">{selectedClinic.name}</p>
                <p className="text-text-secondary leading-relaxed">{selectedClinic.address}</p>
                <p className="text-text-muted mt-1 font-semibold">Tel: {selectedClinic.phone}</p>
              </div>
            </div>

            <Button
              href={selectedClinic.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              className="w-full mt-4"
            >
              Open {selectedClinic.name} in Google Maps
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
