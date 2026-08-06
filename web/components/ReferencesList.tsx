import React from "react";

interface StaticReference {
  text: string;
  url?: string;
}

interface ReferencesListProps {
  staticReferences?: (string | StaticReference)[];
  evidenceSource?: string;
  defaultReferences?: string[];
  title?: string;
}

export const ReferencesList: React.FC<ReferencesListProps> = ({
  staticReferences,
  evidenceSource,
  defaultReferences = [],
  title = "References",
}) => {
  // Helper to turn inline URLs into clickable links
  const renderClickableText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clinical-teal hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Parse evidenceSource into { text, url } items (splitting on " — ")
  const parsedEvidence: StaticReference[] = [];
  if (evidenceSource) {
    evidenceSource
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(" — ");
        if (parts.length >= 2) {
          const text = parts[0].trim();
          const url = parts.slice(1).join(" — ").trim();
          parsedEvidence.push({ text, url });
        } else {
          parsedEvidence.push({ text: line });
        }
      });
  }

  // Convert staticReferences into normalized { text, url } objects
  const normalizedStatic: StaticReference[] = [];
  if (staticReferences && staticReferences.length > 0) {
    staticReferences.forEach((ref) => {
      if (typeof ref === "string") {
        normalizedStatic.push({ text: ref });
      } else {
        normalizedStatic.push(ref);
      }
    });
  }

  const hasReferences = normalizedStatic.length > 0 || parsedEvidence.length > 0;

  if (!hasReferences && defaultReferences.length === 0) {
    return null;
  }

  return (
    <section id="references" className="scroll-mt-8 border-t border-border-clinical/30 pt-6 text-xs text-text-muted leading-relaxed space-y-2.5">
      <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
        {title}
      </span>
      <ol className="list-decimal pl-5 space-y-1.5 font-medium">
        {normalizedStatic.map((ref, idx) => (
          <li key={`static-${idx}`}>
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clinical-teal hover:underline"
              >
                {ref.text}
              </a>
            ) : (
              <>{renderClickableText(ref.text)}</>
            )}
          </li>
        ))}
        {parsedEvidence.map((ref, idx) => (
          <li key={`evidence-${idx}`}>
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clinical-teal hover:underline"
              >
                {ref.text}
              </a>
            ) : (
              <>{renderClickableText(ref.text)}</>
            )}
          </li>
        ))}
        {!hasReferences &&
          defaultReferences.map((ref, idx) => (
            <li key={`default-${idx}`}>
              <>{renderClickableText(ref)}</>
            </li>
          ))}
      </ol>
    </section>
  );
};
