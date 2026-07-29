import React from "react";
import { Button } from "./Button";

interface FeaturedReview {
  id: string;
  author: string; // placeholder
  date: string; // placeholder
  rating: number; // placeholder
  content: string; // placeholder
}

interface ReviewPlatformCardProps {
  platformName: "Google" | "Doctify";
  description: string;
  rating?: string; // e.g. "[Overall Rating]"
  reviewCount?: string; // e.g. "[Total Review Count]"
  featuredReviews?: FeaturedReview[];
  platformUrl?: string | null;
}

export const ReviewPlatformCard: React.FC<ReviewPlatformCardProps> = ({
  platformName,
  description,
  rating = "[Overall Rating]",
  reviewCount = "[Total Review Count]",
  featuredReviews = [],
  platformUrl = null,
}) => {
  const isGoogle = platformName === "Google";

  const isPlaceholder = (url: string | null) => {
    return !url || url.includes("[") || url === "#";
  };

  return (
    <div className="bg-white border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Subtle branding accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${isGoogle ? "bg-[#4285F4]" : "bg-clinical-teal"}`} />

      <div>
        <div className="flex items-center gap-4 mb-4 mt-2">
          {/* Subtle Icon Circle */}
          <div className="w-12 h-12 rounded-full bg-pale-clinical-blue border border-border-clinical/40 flex items-center justify-center text-deep-navy font-bold shrink-0">
            {isGoogle ? (
              <span className="text-xl text-[#4285F4] font-serif">G</span>
            ) : (
              <span className="text-xl text-clinical-teal font-serif">D</span>
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-deep-navy">
              {platformName} Reviews
            </h3>
            <p className="text-xs text-text-muted italic">
              Verified third-party platform
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {description}
        </p>

        {/* Ratings & Counts Placeholders */}
        <div className="bg-pale-clinical-blue border border-border-clinical/30 rounded-lg p-4 mb-6 space-y-2 text-xs text-text-secondary">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Rating:</span>
            <span className="font-mono text-text-muted">{rating}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total Reviews:</span>
            <span className="font-mono text-text-muted">{reviewCount}</span>
          </div>
          
          {/* Small star icons outline placeholder */}
          <div className="flex gap-1 items-center pt-1 border-t border-border-clinical/20 mt-1">
            <span className="text-text-muted font-medium mr-1">Rating Status:</span>
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.77-.569-.371-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Featured reviews placeholders list */}
        <div className="space-y-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-navy block">
            Featured Reviews
          </span>
          {featuredReviews.length === 0 ? (
            <div className="text-xs text-text-muted bg-warm-off-white/40 border border-dashed border-border-clinical/60 p-3 rounded italic text-center">
              [Featured reviews will be listed here once verified]
            </div>
          ) : (
            <div className="space-y-3">
              {featuredReviews.map((rev) => (
                <div key={rev.id} className="bg-warm-off-white border border-border-clinical/30 p-3 rounded-lg text-xs leading-relaxed text-text-secondary">
                  <div className="flex justify-between items-center mb-1 text-[11px] text-text-muted">
                    <span className="font-semibold">{rev.author}</span>
                    <span>{rev.date}</span>
                  </div>
                  <p className="italic">&ldquo;{rev.content}&rdquo;</p>
                  <div className="text-[10px] text-text-muted mt-1">
                    Rating: {rev.rating}/5 | Source: {platformName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-clinical/20 pt-4 mt-2">
        {isPlaceholder(platformUrl) ? (
          <div className="flex flex-col gap-2">
            <Button disabled variant="secondary" className="w-full text-sm py-2 h-10 min-h-[40px]">
              View Reviews
            </Button>
            <span className="text-[10px] text-text-muted text-center italic">
              Reviews coming soon — links pending setup
            </span>
          </div>
        ) : (
          <Button
            href={platformUrl!}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="w-full text-sm py-2 h-10 min-h-[40px]"
          >
            View Reviews on {platformName}
          </Button>
        )}
      </div>
    </div>
  );
};
