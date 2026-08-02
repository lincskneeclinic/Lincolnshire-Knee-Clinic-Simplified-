export interface EstimatedPostScore {
  /**
   * 0-100, a lightweight heuristic guess based only on the text itself —
   * length, hashtags, CTA/question presence, capitalization. Not derived
   * from any real engagement data. Always available (no post needs to be
   * live or linked), unlike the real, Graph-API-grounded score in
   * socialPerformanceAgent.ts.
   */
  score: number;
  tips: string[];
}

type Platform = "instagram" | "facebook" | "linkedin";
type PostType = "post" | "story" | "carousel" | "reel";

const LENGTH_BANDS: Record<PostType, { min: number; idealMin: number; idealMax: number; max: number }> = {
  post: { min: 40, idealMin: 80, idealMax: 300, max: 600 },
  story: { min: 10, idealMin: 20, idealMax: 120, max: 200 },
  carousel: { min: 20, idealMin: 60, idealMax: 400, max: 800 },
  reel: { min: 20, idealMin: 60, idealMax: 500, max: 1500 },
};

const CTA_PATTERN =
  /\b(book|call|schedule|visit|click the link|link in bio|dm us|message us|comment below|tag a friend|share this|swipe up|learn more|find out|get in touch)\b/i;

export function estimatePostScore(params: { text: string; platform: Platform; postType: PostType }): EstimatedPostScore {
  const text = (params.text || "").trim();
  const tips: string[] = [];

  if (!text) {
    return { score: 0, tips: ["Add caption text to get an estimated score."] };
  }

  let score = 50;
  const band = LENGTH_BANDS[params.postType];
  const len = text.length;

  if (len < band.min) {
    score -= 15;
    tips.push("Caption is quite short — add a bit more detail.");
  } else if (len > band.max) {
    score -= 10;
    tips.push("Caption may be too long for this format — consider trimming.");
  } else if (len >= band.idealMin && len <= band.idealMax) {
    score += 15;
  } else {
    score += 5;
  }

  if (CTA_PATTERN.test(text) || text.includes("?")) {
    score += 15;
  } else {
    tips.push("Add a clear call-to-action or question to invite engagement.");
  }

  const hashtagCount = (text.match(/#\w+/g) || []).length;
  if (params.platform === "instagram") {
    if (hashtagCount === 0) {
      tips.push("Add a few relevant hashtags (3-8) to improve discoverability.");
    } else if (hashtagCount >= 3 && hashtagCount <= 8) {
      score += 10;
    } else if (hashtagCount > 15) {
      score -= 10;
      tips.push("Too many hashtags can look spammy — trim to under 10.");
    }
  } else {
    if (hashtagCount > 5) {
      score -= 5;
      tips.push("Hashtags are less effective on this platform — keep to a few or none.");
    }
  }

  const letters = text.replace(/[^a-zA-Z]/g, "");
  const upperRatio = letters.length > 0 ? (letters.match(/[A-Z]/g) || []).length / letters.length : 0;
  if (letters.length > 20 && upperRatio > 0.5) {
    score -= 10;
    tips.push("Avoid writing in all caps — it can read as shouting.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, tips: tips.slice(0, 4) };
}
