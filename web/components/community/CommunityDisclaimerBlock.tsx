import React from "react";
import Link from "next/link";

interface CommunityDisclaimerBlockProps {
  className?: string;
}

/**
 * Full Community disclaimer — shown at registration (above the required
 * consent checkbox) and expandable from CommunityDisclaimerStrip. Distinct
 * copy from MedicalDisclaimerBlock, which is written for editorial clinical
 * content, not member-generated discussion.
 */
export const CommunityDisclaimerBlock: React.FC<CommunityDisclaimerBlockProps> = ({
  className = "",
}) => {
  return (
    <div
      role="region"
      aria-label="Community Guidelines and Disclaimer"
      className={`bg-pale-clinical-blue border-l-4 border-clinical-teal p-5 rounded-r-[4px] font-sans text-sm leading-relaxed space-y-3 ${className}`}
    >
      <h4 className="font-serif text-base font-bold text-deep-navy">
        Community Guidelines &amp; Disclaimer
      </h4>
      <p className="text-text-secondary">
        This Community area is for general discussion between patients only. It is{" "}
        <strong>not medical advice</strong>, and posts and replies are{" "}
        <strong>not reviewed by a clinician</strong>{" "}
        before or after they are published —
        they reflect other members&apos; personal experiences, not Lincolnshire Knee
        Clinic&apos;s clinical guidance. Nothing posted here should be used to make decisions
        about your treatment; if you have questions about your own care, please contact the
        clinic directly or{" "}
        <Link href="/book-appointment" className="font-semibold text-clinical-teal underline hover:text-deep-navy">
          book an appointment
        </Link>
        .
      </p>
      <p className="text-text-secondary">
        Everything you post is visible to all registered Community members. Please do not
        share your own or anyone else&apos;s personal or medical information (full name, date
        of birth, NHS number, contact details, or identifiable photos) in a post or reply.
      </p>
      <p className="text-text-secondary">
        If you&apos;re experiencing an urgent problem — such as sudden severe pain, inability
        to weight-bear, signs of infection, or a hot, swollen joint — do not wait for a reply
        here. Read our{" "}
        <Link href="/urgent-advice" className="font-semibold text-clinical-teal underline hover:text-deep-navy">
          urgent advice guidance
        </Link>{" "}
        or contact emergency services (999) or NHS 111 immediately.
      </p>
      <p className="text-text-secondary">
        If you see a post or reply that seems inappropriate, medically risky, or breaches
        these guidelines, please use the <strong>Report</strong> button on that post — our
        team reviews reports and will remove content where needed.
      </p>
    </div>
  );
};
