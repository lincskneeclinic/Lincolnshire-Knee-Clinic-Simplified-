export type RunDetailTab = "draft" | "research" | "images" | "social";

export function getRenderableImageUrl(suggestedImages?: any[]): string | null {
  if (!suggestedImages || !Array.isArray(suggestedImages) || suggestedImages.length === 0) return null;
  const match = suggestedImages.find(
    (item) =>
      typeof item === "string" &&
      (item.startsWith("http://") ||
        item.startsWith("https://") ||
        item.startsWith("/") ||
        item.startsWith("data:"))
  );
  return match || null;
}

export function cleanHeadingBugs(text: string): string {
  if (!text) return "";
  return text.replace(/^(\s*)(#+)\s*(#+)\s*/gm, "$1$2 ");
}
