"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CommunityDisclaimerBlock } from "./CommunityDisclaimerBlock";

interface CommunityDisclaimerStripProps {
  className?: string;
}

/**
 * Short, always-visible disclaimer reminder. Rendered once per Community
 * layout, and again (short form only, via the `compact` usage pattern)
 * directly above post/reply composers.
 */
export const CommunityDisclaimerStrip: React.FC<CommunityDisclaimerStripProps> = ({
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`font-sans text-xs md:text-sm ${className}`}>
      <div className="bg-soft-blue-grey border border-border-clinical rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-text-secondary">
          Posting here is visible to all members and is not reviewed by a clinician.
          Don&apos;t share personal details. Urgent symptoms?{" "}
          <Link href="/urgent-advice" className="font-semibold text-clinical-teal underline hover:text-deep-navy">
            See urgent advice
          </Link>{" "}
          instead of posting.
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 font-semibold text-clinical-teal hover:text-deep-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clinical-teal cursor-pointer"
          aria-expanded={expanded}
        >
          {expanded ? "Hide full guidelines" : "Read full guidelines"}
        </button>
      </div>
      {expanded && <CommunityDisclaimerBlock className="mt-3" />}
    </div>
  );
};
