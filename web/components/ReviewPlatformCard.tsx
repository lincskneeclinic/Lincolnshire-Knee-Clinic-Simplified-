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
  rating?: string;
  reviewCount?: string;
  featuredReviews?: FeaturedReview[];
  platformUrl?: string | null;
}

export const ReviewPlatformCard: React.FC<ReviewPlatformCardProps> = ({
  platformName,
  description,
  rating,
  reviewCount,
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

        {/* Ratings & Counts — shown only once real, verified figures are available */}
        {(rating || reviewCount) && (
          <div className="bg-pale-clinical-blue border border-border-clinical/30 rounded-lg p-4 mb-6 space-y-2 text-xs text-text-secondary">
            {rating && (
              <div className="flex items-center justify-between">
                <span className="font-semibold">Overall Rating:</span>
                <span className="font-mono text-text-muted">{rating}</span>
              </div>
            )}
            {reviewCount && (
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Reviews:</span>
                <span className="font-mono text-text-muted">{reviewCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Featured reviews list */}
        <div className="space-y-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-navy block">
            Featured Reviews
          </span>
          {featuredReviews.length === 0 ? (
            <div className="text-xs text-text-muted bg-warm-off-white/40 border border-dashed border-border-clinical/60 p-3 rounded italic text-center">
              Featured reviews will be listed here once verified.
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
