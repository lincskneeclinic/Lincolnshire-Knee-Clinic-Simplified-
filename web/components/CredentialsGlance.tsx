import React from "react";

interface CredentialItem {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface CredentialsGlanceProps {
  className?: string;
  isOverlapping?: boolean;
}

export const CredentialsGlance: React.FC<CredentialsGlanceProps> = ({
  className = "",
  isOverlapping = false,
}) => {
  const credentials: CredentialItem[] = [
    {
      title: "Title & Appointment",
      value: "Consultant Trauma & Orthopaedic Surgeon",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "GMC Number",
      value: "GMC Specialist Register: 4145976",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Clinical Leadership",
      value: "Clinical Lead for Elective Orthopaedics",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "NHS Trust Base",
      value: "Humber Health Partnership",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "Qualifications",
      value: "MB BS, MRCS, FRCS (Tr & Orth), PG Cert (Sports Injuries)",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: "Fellowship Training",
      value: "Senior Knee Fellowship (Bradford & Leicester)",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-6 md:px-8 ${
        isOverlapping ? "-mt-12 md:-mt-16 lg:-mt-20 relative z-20" : ""
      } ${className}`}
    >
      <div className="bg-white border border-border-clinical/85 rounded-2xl p-6 md:p-8 shadow-[0_10px_35px_rgba(8,47,73,0.06)]">
        <h3 className="font-serif text-lg md:text-xl font-bold text-deep-navy mb-6 pb-4 border-b border-border-clinical/50 flex items-center gap-2.5">
          <svg
            className="w-5 h-5 text-clinical-teal shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Credentials at a Glance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-pale-clinical-blue/40 border border-transparent hover:border-border-clinical/30 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-clinical-teal/10 flex items-center justify-center text-clinical-teal shrink-0">
                {cred.icon}
              </div>
              <div className="space-y-1">
                <span className="block font-sans text-sm font-bold text-deep-navy leading-snug">
                  {cred.title}
                </span>
                <span className="block font-sans text-xs text-text-secondary leading-relaxed font-semibold">
                  {cred.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-text-muted italic mt-6 pt-4 border-t border-border-clinical/20">
          GMC registration and NHS leadership roles are listed for identification purposes only and do not constitute an endorsement of this private clinic.
        </p>
      </div>
    </div>
  );
};
