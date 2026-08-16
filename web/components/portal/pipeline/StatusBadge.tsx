"use client";

export function StatusBadge({ status, isContinueEditing }: { status: string; isContinueEditing?: boolean }) {
  const styles: Record<string, string> = {
    awaiting_blog_approval: "bg-portal-surface-alt border-clinical-teal/40 text-portal-accent-text",
    awaiting_social_approval: "bg-portal-surface-alt border-clinical-teal/40 text-portal-accent-text",
    published: "bg-portal-surface-alt border-clinical-teal/30 text-portal-text/90",
    researching: "bg-portal-surface-alt border-clinical-teal/20 text-portal-accent-text/80",
    writing_blog: "bg-portal-surface-alt border-clinical-teal/20 text-portal-accent-text/80",
    writing_social: "bg-portal-surface-alt border-clinical-teal/20 text-portal-accent-text/80",
    abandoned: "bg-portal-surface-alt border-portal-border/10 text-portal-text/50",
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
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-portal-surface-alt border-amber-400/50 text-amber-300">
        ✎ Continue Editing
      </span>
    );
  }

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
        styles[status] || "bg-portal-surface-alt border-portal-border/10 text-portal-text/70"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
