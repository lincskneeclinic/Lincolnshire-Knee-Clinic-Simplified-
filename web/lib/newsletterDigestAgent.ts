import { GoogleGenerativeAI } from "@google/generative-ai";
import { blogArticles } from "@/data/articles";
import { getStoreValue } from "./dataStore";
import { convertNewsletterMarkdownToHtml } from "./newsletterMarkdown";
import { getTrendingCommunityTopics } from "./communityDigest";
import { SITE_URL } from "./site";

const apiKey = process.env.GEMINI_API_KEY;
const RECENT_DAYS = 30;
const MIN_ARTICLES = 3;

const MONTHLY_THEMES = [
  "Non-surgical joint preservation & injections (PRP, Arthrosamid, steroids)",
  "Surgery & recovery (knee replacement, ACL, meniscus)",
  "General knee health & prevention",
  "Lifestyle, exercise & rehab tips for everyday joint care",
];

function getRecentArticles() {
  const sorted = Object.values(blogArticles).sort(
    (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
  );
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recent = sorted.filter((a) => new Date(a.datePublished).getTime() >= cutoff);
  return (recent.length >= MIN_ARTICLES ? recent : sorted).slice(0, MIN_ARTICLES);
}

async function getTopPatientTopics(limit: number) {
  const topicsList = await getStoreValue<any[]>("dynamic-topics", []);
  return Array.isArray(topicsList)
    ? [...topicsList].sort((a, b) => (b.enquiryCount || 0) - (a.enquiryCount || 0)).slice(0, limit)
    : [];
}

async function getLeadingPollOption() {
  const pollData = await getStoreValue<{ votes: Record<string, number>; suggestions: any[] }>(
    "newsletter-poll",
    { votes: {}, suggestions: [] }
  );
  const entries = Object.entries(pollData.votes || {});
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { option: entries[0][0], votes: entries[0][1] };
}

function monthlyTheme() {
  return MONTHLY_THEMES[new Date().getMonth() % MONTHLY_THEMES.length];
}

export async function writeMonthlyDigestEdition(): Promise<{
  subject: string;
  body_markdown: string;
  body_html: string;
}> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const recentArticles = getRecentArticles();
  const topTopics = await getTopPatientTopics(5);
  const leadingPoll = await getLeadingPollOption();
  const trendingCommunityTopics = await getTrendingCommunityTopics(3);
  const theme = monthlyTheme();
  const monthLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are an expert patient-communication specialist writing the connective prose for Lincolnshire Knee Clinic's monthly patient newsletter digest.

You are NOT writing the whole newsletter — only specific short pieces of prose that will be slotted into a fixed template alongside real data the reader will also see. Do not invent facts, article titles, statistics, or patient quotes; only write in the empathetic, plain-language, jargon-light tone of a UK orthopaedic clinic addressing patients with knee pain, arthritis, or post-surgical recovery.

You MUST respond in EXACTLY this format, with each labelled section on its own line(s) and nothing else before or after:

SUBJECT:
<a scroll-stopping, professional email subject line for this month's digest>

INTRO:
<a warm 2-3 sentence opening welcoming patients to this month's digest — do not reference specific article titles or numbers, those aren't known to you>

BLOG_INTRO:
<one friendly sentence introducing "what's new on the blog this month" — do not name specific articles>

QUESTIONS_INTRO:
<one friendly sentence introducing a section on what patients have been asking the clinic about — do not name specific topics>

TIP_HEADING:
<a short, engaging title for an educational tip about: ${theme}>

TIP_BODY:
<2-3 short paragraphs, plain language, giving one genuinely useful, evidence-informed educational tip about ${theme}. Use "###" for a sub-heading if useful, and **bold** for key takeaways>

CLOSING:
<a short closing paragraph with a call to action to book a consultation or message the clinic, plus the sign-off "Warm regards,\\nThe Lincolnshire Knee Clinic Team">`,
  });

  const userPrompt = `Write the ${monthLabel} digest connective prose now, following the exact section format from your instructions. This month's rotating educational theme is: "${theme}".`;

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  const extract = (label: string, nextLabel: string | null) => {
    const pattern = nextLabel
      ? new RegExp(`${label}:\\s*([\\s\\S]*?)\\n\\s*${nextLabel}:`, "i")
      : new RegExp(`${label}:\\s*([\\s\\S]*)`, "i");
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  };

  const subject = extract("SUBJECT", "INTRO") || `Lincolnshire Knee Clinic — ${monthLabel} Update`;
  const intro = extract("INTRO", "BLOG_INTRO") || `Welcome to this month's update from Lincolnshire Knee Clinic.`;
  const blogIntro = extract("BLOG_INTRO", "QUESTIONS_INTRO") || "Here's what's new on the blog this month:";
  const questionsIntro = extract("QUESTIONS_INTRO", "TIP_HEADING") || "Here's what patients have been asking us about:";
  const tipHeading = extract("TIP_HEADING", "TIP_BODY") || theme;
  const tipBody = extract("TIP_BODY", "CLOSING") || "";
  const closing = extract("CLOSING", null) ||
    `Ready to take the next step in your joint health?\n\nWarm regards,\nThe Lincolnshire Knee Clinic Team`;

  const sections: string[] = [intro];

  if (recentArticles.length > 0) {
    sections.push(`### New on the Blog\n\n${blogIntro}`);
    sections.push(
      recentArticles
        .map((a) => `- [${a.title}](${SITE_URL}/clinical-knowledge-hub/${a.slug}) — ${a.description}`)
        .join("\n")
    );
  }

  if (topTopics.length > 0) {
    sections.push(`### What Patients Have Been Asking About\n\n${questionsIntro}`);
    sections.push(topTopics.map((t) => `- **${t.label}**`).join("\n"));
  }

  if (trendingCommunityTopics.length > 0) {
    sections.push(`### Trending in Our Patient Community\n\nOur Community forum has patients discussing this too — join the conversation:`);
    sections.push(
      trendingCommunityTopics
        .map(
          (t) =>
            `- [${t.title}](${SITE_URL}/community/${t.roomSlug}/${t.postId}) — ${t.roomName}${t.replyCount > 0 ? ` (${t.replyCount} ${t.replyCount === 1 ? "reply" : "replies"})` : ""}`
        )
        .join("\n")
    );
  }

  if (leadingPoll) {
    sections.push(
      `### Vote for Next Month's Topic\n\nRight now, patients are most interested in **${leadingPoll.option}**. Have your say on what we cover next by visiting our [newsletter page](${SITE_URL}/newsletter).`
    );
  }

  sections.push(`### ${tipHeading}\n\n${tipBody}`);
  sections.push(closing);

  const body_markdown = sections.filter(Boolean).join("\n\n");
  const body_html = convertNewsletterMarkdownToHtml(subject, body_markdown);

  return { subject, body_markdown, body_html };
}
