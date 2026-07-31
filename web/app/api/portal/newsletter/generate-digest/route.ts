import { NextResponse } from "next/server";
import { writeMonthlyDigestEdition } from "@/lib/newsletterDigestAgent";
import { getNewsletterEditions, saveNewsletterEditions, NewsletterEdition } from "@/lib/newsletterDistribution";
import crypto from "crypto";

export const maxDuration = 60;

export async function POST() {
  try {
    console.log("[Newsletter Digest API] Generating monthly digest draft");
    const generated = await writeMonthlyDigestEdition();

    const now = new Date().toISOString();
    const monthLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const newEdition: NewsletterEdition = {
      id: `EDITION-${crypto.randomUUID()}`,
      subject: generated.subject,
      topic: `Monthly Digest — ${monthLabel}`,
      bodyMarkdown: generated.body_markdown,
      bodyHtml: generated.body_html,
      includeResearch: false,
      researchBrief: null,
      status: "draft",
      created_at: now,
    };

    const editions = await getNewsletterEditions();
    editions.unshift(newEdition);
    await saveNewsletterEditions(editions);

    return NextResponse.json({
      success: true,
      message: "Monthly digest draft generated successfully.",
      edition: newEdition,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/newsletter/generate-digest:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate monthly digest draft" },
      { status: 500 }
    );
  }
}
