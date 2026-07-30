// Mirrors the category taxonomy used by the public Education Hub
// (app/education/[category]/page.tsx). Kept as a separate constant so the
// content pipeline dashboard can offer the same categories without importing
// from a public route file.
export const ARTICLE_CATEGORIES = [
  { value: "knee-arthritis", label: "Knee Arthritis" },
  { value: "knee-replacement", label: "Knee Replacement" },
  { value: "sports-knee-injuries", label: "Sports Knee Injuries" },
  { value: "injections", label: "Knee Injections" },
  { value: "recovery-and-rehabilitation", label: "Recovery & Rehabilitation" },
  { value: "patient-guides", label: "Patient Guides" },
  { value: "faqs", label: "FAQs" },
] as const;

export type ArticleCategoryValue = (typeof ARTICLE_CATEGORIES)[number]["value"];
