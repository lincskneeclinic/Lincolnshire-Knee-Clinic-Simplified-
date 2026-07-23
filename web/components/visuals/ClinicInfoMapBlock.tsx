import React from "react";
import { ClinicLocation } from "@/data/clinics";
import { Button } from "@/components/Button";

interface ClinicInfoMapBlockProps {
  clinic: ClinicLocation;
  className?: string;
  onSelect?: () => void;
  isActive?: boolean;
}

export const ClinicInfoMapBlock: React.FC<ClinicInfoMapBlockProps> = ({
  clinic,
  className = "",
  onSelect,
  isActive = false,
}) => {
  return (
    <div
      id={clinic.id}
      className={`bg-white border p-6 md:p-8 rounded-xl shadow-sm transition-all flex flex-col justify-between scroll-mt-24 ${className} font-sans ${
        isActive ? "border-clinical-teal shadow-md ring-2 ring-clinical-teal/10" : "border-border-clinical hover:shadow-md"
      }`}
    >
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal mb-1.5 block">
          Private Practice Location
        </span>
        <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-navy mb-4 border-b border-border-clinical/30 pb-2">
          {clinic.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Column 1: Core Details */}
          <div className="space-y-4 text-sm text-text-secondary">
            {/* Address */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span className="font-bold block text-deep-navy">Clinic Address</span>
                <span className="leading-relaxed">{clinic.address}</span>
              </div>
            </div>

            {/* Reception phone & contact */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <span className="font-bold block text-deep-navy">Reception Contact</span>
                <span>{clinic.receptionContact || clinic.phone}</span>
              </div>
            </div>

            {/* Services */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <span className="font-bold block text-deep-navy">Available Services</span>
                <span>{clinic.services}</span>
              </div>
            </div>

            {/* Facilities */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-1-5h1m2 0H8M9 7h1m-1 4h1m4-4h1" />
              </svg>
              <div>
                <span className="font-bold block text-deep-navy">Facilities Available</span>
                <span>{clinic.facilities}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Parking, Accessibility, Notes */}
          <div className="space-y-4 text-sm text-text-secondary border-t md:border-t-0 md:border-l border-border-clinical/40 pt-4 md:pt-0 md:pl-6">
            {/* Parking */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div>
                <span className="font-bold block text-deep-navy">Parking Details</span>
                <span>{clinic.parking}</span>
              </div>
            </div>

            {/* Accessibility features */}
            {(clinic.disabledAccess || clinic.accessibleEntrance || clinic.liftInformation) && (
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-clinical-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a9 9 0 001.89 5.4" />
                </svg>
                <div className="space-y-1 text-xs">
                  <span className="font-bold block text-deep-navy text-sm">Accessibility Support</span>
                  {clinic.disabledAccess && <span className="block">&bull; {clinic.disabledAccess}</span>}
                  {clinic.accessibleEntrance && <span className="block">&bull; Entrance: {clinic.accessibleEntrance}</span>}
                  {clinic.liftInformation && <span className="block">&bull; Elevators: {clinic.liftInformation}</span>}
                </div>
              </div>
            )}

            {/* Consultation notes */}
            {clinic.consultationNotes && (
              <div className="bg-pale-clinical-blue/40 border border-border-clinical/30 p-3 rounded-lg text-xs leading-relaxed text-text-muted">
                <span className="font-bold text-deep-navy block mb-0.5">Consultation Notes:</span>
                {clinic.consultationNotes}
              </div>
            )}
          </div>
        </div>

        {/* Map Embed or Placeholder Box */}
        <div className="w-full h-44 md:h-52 rounded-lg bg-pale-clinical-blue/20 border border-border-clinical flex flex-col justify-center items-center text-center p-6 relative overflow-hidden mb-6 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(#00afc8_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
          {clinic.mapEmbedCode ? (
            <div
              className="absolute inset-0 z-10 w-full h-full"
              dangerouslySetInnerHTML={{ __html: clinic.mapEmbedCode }}
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <svg className="w-8 h-8 text-clinical-teal/60 mb-2 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-sans text-xs font-bold text-deep-navy mb-0.5">
                {clinic.name} Location Map Pending
              </span>
              <p className="text-[10px] text-text-secondary max-w-xs font-semibold">
                Google Map view will render in this panel. Directions are active.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 border-t border-border-clinical/30 pt-5">
        <Button href={`tel:${clinic.phone}`} variant="teal" className="flex-1 min-w-[120px] text-xs py-2">
          Call Clinic
        </Button>
        <Button href={clinic.bookingLink || "/book-appointment"} variant="primary" className="flex-1 min-w-[120px] text-xs py-2">
          Book Appointment
        </Button>
        {onSelect && (
          <Button
            onClick={onSelect}
            variant={isActive ? "primary" : "secondary"}
            className="flex-1 min-w-[120px] text-xs py-2"
          >
            {isActive ? "Viewing Map" : "Select on Map"}
          </Button>
        )}
        <Button href={clinic.mapLink} target="_blank" rel="noopener noreferrer" variant="secondary" className="flex-1 min-w-[120px] text-xs py-2">
          Directions Link
        </Button>
      </div>
    </div>
  );
};
