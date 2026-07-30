import React from "react";
import Link from "next/link";

interface TocItem {
  label: string;
  id: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * "On this page" navigation for long clinical content pages (conditions,
 * treatments, symptoms, injections). Renders as a sticky sidebar on desktop
 * (lg+) and as an expandable section above the main content on mobile/tablet,
 * per docs/accessibility.md §9.3 — a permanent sidebar must not simply
 * disappear below the lg breakpoint.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-6">
        <div className="bg-pale-clinical-blue/30 border border-border-clinical/50 p-5 rounded-xl text-left">
          <h2 className="font-sans text-xs font-bold text-deep-navy uppercase tracking-wider mb-4 border-b border-border-clinical/40 pb-2">
            On this page
          </h2>
          <nav className="flex flex-col gap-3" aria-label="On this page">
            {items.map((toc, idx) => (
              <Link
                key={idx}
                href={`#${toc.id}`}
                className="text-xs font-semibold text-text-secondary hover:text-clinical-teal transition-colors block py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
              >
                {toc.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile/tablet expandable equivalent */}
      <details className="lg:hidden group bg-pale-clinical-blue/30 border border-border-clinical/50 rounded-xl">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-4 font-sans text-xs font-bold text-deep-navy uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal">
          <span>On this page</span>
          <span className="transition-transform group-open:rotate-180" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <nav className="flex flex-col gap-3 px-4 pb-4 pt-1" aria-label="On this page">
          {items.map((toc, idx) => (
            <Link
              key={idx}
              href={`#${toc.id}`}
              className="text-xs font-semibold text-text-secondary hover:text-clinical-teal transition-colors block py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-teal focus-visible:outline-offset-1"
            >
              {toc.label}
            </Link>
          ))}
        </nav>
      </details>
    </>
  );
};
