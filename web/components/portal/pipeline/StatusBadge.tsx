"use client";

export function StatusBadge({ status, isContinueEditing }: { status: string; isContinueEditing?: boolean }) {
  const styles: Record<string, string> = {
    awaiting_blog_approval: "bg-dark-overlay-navy border-clinical-teal/40 text-clinical-teal",
    awaiting_social_approval: "bg-dark-overlay-navy border-clinical-teal/40 text-clinical-teal",
    published: "bg-dark-overlay-navy border-clinical-teal/30 text-white/90",
    researching: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    writing_blog: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    writing_social: "bg-dark-overlay-navy border-clinical-teal/20 text-clinical-teal/80",
    abandoned: "bg-dark-overlay-navy border-white/10 text-white/50",
  };

  const labels: Record<string, string> = {
    awaiting_blog_approval: "Awaiting Blog Review",
    awaiting_social_approval: "Awaiting Social Review",
    published: "Published Live",
    researching: "Researching",
    writing_blog: "Writing Blog",
    writing_social: "Writing Social Captions",
    abandoned: "Archived",
  };

  if (isContinueEditing) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-dark-overlay-navy border-amber-400/50 text-amber-300">
        ✎ Continue Editing
      </span>
    );
  }

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
        styles[status] || "bg-dark-overlay-navy border-white/10 text-white/70"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
