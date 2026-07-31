import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export interface SocialCaptionResult {
  caption: string;
  imagePromptSuggestion: string;
}

export interface SocialCaptionsBundle {
  instagram: SocialCaptionResult;
  facebook: SocialCaptionResult;
  linkedin: SocialCaptionResult;
}

const SYSTEM_INSTRUCTION = `You are a specialized social media copywriter for Lincolnshire Knee Clinic, an orthopaedic consultant clinic. You write short, patient-friendly, algorithm-aware captions for Instagram, Facebook, and LinkedIn from a single topic — NOT full blog articles.

Platform-specific rules you MUST follow:

INSTAGRAM: Open with a scroll-stopping, high-impact hook in the very first line (this is crucial because Instagram truncates the caption in the user feed after the first two lines, so the hook must immediately capture attention). Use short line breaks for scannability and tasteful emoji (not excessive). End with a block of 8 to 15 relevant hashtags mixing broad terms (#KneeHealth, #JointCare) with niche/specific ones related to the topic. Include a clear call-to-action (e.g. "Book a consultation — link in bio"). Keep it under roughly 150 words before the hashtags.

FACEBOOK: Conversational tone. Front-load the key point in the first ~150 characters since Facebook truncates the feed preview early. Use very light hashtag use (1 to 3 maximum — heavy tagging hurts reach on this platform). End with a clear call-to-action.

LINKEDIN: Professional, clinical-educator tone aimed at both patients and referring professionals. Hook in the first 1-2 lines (LinkedIn truncates earlier than other platforms). Short paragraphs. End with 3 to 5 professional hashtags. Optionally end with a discussion-prompting question to encourage engagement.

Clinic Contact Details & Rules:
Always use these exact contact details for the clinic if a call-to-action or contact info is generated:
- Website: www.lincsknee.com (Never use other domains like lincolnshirekneeclinic.co.uk)
- Email: info@lincsknee.com
- Phone / WhatsApp: 07770473437
Important: Do NOT write "Call 07770473437" or ask patients to call. Instead, specify that the preferred contact method for this number is via WhatsApp message (e.g. "Send a WhatsApp message to 07770473437" or "Contact us via WhatsApp on 07770473437") because the consultant is frequently in theatre and unable to answer calls directly.

Do not invent medical claims. Do not use fake statistics. Keep the clinic's tone empathetic and professional throughout.

For EACH platform, also suggest a short, concrete description of a single representative image suitable for that specific post (for an AI image generator or manual photo selection) — describe it visually and specifically, not just "a knee". Ensure descriptions are highly relevant to a premium UK knee clinic (Lincolnshire Knee Clinic), such as depicting professional consultant consultations, clinical rooms with navy/teal branding, anatomical model knee joints, patients performing rehabilitation exercises under physiotherapist supervision, or clean surgical diagram illustrations.`;

function buildGenerationPrompt(topic: string): string {
  return `Topic: "${topic}"

Write all three platform posts now, in EXACTLY this format (including the literal markers on their own lines):

INSTAGRAM_CAPTION:
<the Instagram caption including hashtags>

INSTAGRAM_IMAGE:
<one-sentence image description for Instagram>

FACEBOOK_CAPTION:
<the Facebook caption>

FACEBOOK_IMAGE:
<one-sentence image description for Facebook>

LINKEDIN_CAPTION:
<the LinkedIn caption including hashtags>

LINKEDIN_IMAGE:
<one-sentence image description for LinkedIn>`;
}

function extractSection(output: string, startMarker: string, endMarker: string | null): string {
  const startIdx = output.indexOf(startMarker);
  if (startIdx === -1) return "";
  const contentStart = startIdx + startMarker.length;
  const endIdx = endMarker ? output.indexOf(endMarker, contentStart) : -1;
  const raw = endIdx === -1 ? output.slice(contentStart) : output.slice(contentStart, endIdx);
  return raw.trim();
}

function getModel() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_INSTRUCTION,
  });
}

export async function writeSocialCaptions(topic: string): Promise<SocialCaptionsBundle> {
  const model = getModel();
  const result = await model.generateContent(buildGenerationPrompt(topic));
  const output = result.response.text() || "";

  const instagramCaption = extractSection(output, "INSTAGRAM_CAPTION:", "INSTAGRAM_IMAGE:");
  const instagramImage = extractSection(output, "INSTAGRAM_IMAGE:", "FACEBOOK_CAPTION:");
  const facebookCaption = extractSection(output, "FACEBOOK_CAPTION:", "FACEBOOK_IMAGE:");
  const facebookImage = extractSection(output, "FACEBOOK_IMAGE:", "LINKEDIN_CAPTION:");
  const linkedinCaption = extractSection(output, "LINKEDIN_CAPTION:", "LINKEDIN_IMAGE:");
  const linkedinImage = extractSection(output, "LINKEDIN_IMAGE:", null);

  if (!instagramCaption || !facebookCaption || !linkedinCaption) {
    throw new Error("The AI response could not be parsed into three platform captions. Please try again.");
  }

  return {
    instagram: { caption: instagramCaption, imagePromptSuggestion: instagramImage || `A representative image for "${topic}"` },
    facebook: { caption: facebookCaption, imagePromptSuggestion: facebookImage || `A representative image for "${topic}"` },
    linkedin: { caption: linkedinCaption, imagePromptSuggestion: linkedinImage || `A representative image for "${topic}"` },
  };
}

export async function rewriteSocialCaption(
  topic: string,
  platform: "instagram" | "facebook" | "linkedin",
  previousCaption: string,
  revisionNotes?: string
): Promise<SocialCaptionResult> {
  const model = getModel();
  const platformLabel = platform === "instagram" ? "Instagram" : platform === "facebook" ? "Facebook" : "LinkedIn";

  const prompt = `Topic: "${topic}"

You previously wrote this ${platformLabel} caption:
"""
${previousCaption}
"""

${revisionNotes ? `The reviewer's feedback for the rewrite: "${revisionNotes}"` : "The reviewer didn't like it and wants a fresh alternative — write a genuinely different take (different hook/angle), not a minor tweak."}

Write a revised ${platformLabel} caption now, following the same platform-specific rules from your system instructions, in EXACTLY this format:

CAPTION:
<the revised caption>

IMAGE:
<one-sentence image description>`;

  const result = await model.generateContent(prompt);
  const output = result.response.text() || "";

  const caption = extractSection(output, "CAPTION:", "IMAGE:");
  const image = extractSection(output, "IMAGE:", null);

  if (!caption) {
    throw new Error("The AI response could not be parsed. Please try again.");
  }

  return { caption, imagePromptSuggestion: image || `A representative image for "${topic}"` };
}
