import { NextResponse } from "next/server";
import { performResearchProcess } from "@/lib/researchAgent";
import { writeNewsletterEdition } from "@/lib/newsletterWriterAgent";
import { getNewsletterEditions, saveNewsletterEditions, NewsletterEdition } from "@/lib/newsletterDistribution";
import crypto from "crypto";

export const maxDuration = 60; // Allow 60s for PubMed and Gemini AI synthesis

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, includeResearch } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'topic' in request body." },
        { status: 400 }
      );
    }

    const cleanTopic = topic.trim();
    let researchBrief: any = undefined;

    if (includeResearch) {
      try {
        console.log(`[Newsletter API] Running PubMed research search for: "${cleanTopic}"`);
        researchBrief = await performResearchProcess(cleanTopic);
      } catch (err) {
        console.error("Failed to run PubMed research process for newsletter:", err);
      }
    }

    console.log(`[Newsletter API] Generating draft for topic: "${cleanTopic}"`);
    const generated = await writeNewsletterEdition(cleanTopic, researchBrief);

    const now = new Date().toISOString();
    const newEdition: NewsletterEdition = {
      id: `EDITION-${crypto.randomUUID()}`,
      subject: generated.subject,
      topic: cleanTopic,
      bodyMarkdown: generated.body_markdown,
      bodyHtml: generated.body_html,
      includeResearch: !!includeResearch,
      researchBrief: researchBrief || null,
      status: "draft",
      created_at: now,
    };

    const editions = await getNewsletterEditions();
    editions.unshift(newEdition);
    await saveNewsletterEditions(editions);

    return NextResponse.json({
      success: true,
      message: "Newsletter edition draft generated successfully.",
      edition: newEdition,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/newsletter/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate newsletter draft" },
      { status: 500 }
    );
  }
}
