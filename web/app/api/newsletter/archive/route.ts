import { NextResponse } from "next/server";
import { getNewsletterEditions } from "@/lib/newsletterDistribution";

function excerptFromMarkdown(markdown: string, maxLength = 160): string {
  const plainText = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/[#>*_`~-]/g, "") // markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trim()}…`;
}

function readTimeFromMarkdown(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

export async function GET() {
  const editions = await getNewsletterEditions();

  const archives = editions
    .filter((edition) => edition.status === "sent" && edition.dateSent)
    .sort((a, b) => new Date(b.dateSent!).getTime() - new Date(a.dateSent!).getTime())
    .map((edition) => ({
      id: edition.id,
      title: edition.subject,
      excerpt: excerptFromMarkdown(edition.bodyMarkdown || ""),
      dateSent: edition.dateSent,
      readTime: readTimeFromMarkdown(edition.bodyMarkdown || ""),
      url: `/newsletter/archive/${edition.id}`,
    }));

  return NextResponse.json({
    success: true,
    archives,
  });
}
