import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export interface CarouselSlide {
  slideNumber: number;
  text: string;
  imagePromptSuggestion: string;
  imageUrl?: string;
}

export interface SocialCaptionResult {
  caption: string;
  imagePromptSuggestion: string;
  slides?: CarouselSlide[];
  script?: string;
}

export interface SocialCaptionsBundle {
  instagram: SocialCaptionResult;
  facebook: SocialCaptionResult;
  linkedin: SocialCaptionResult;
  instagramStory: SocialCaptionResult;
  instagramCarousel: SocialCaptionResult;
  instagramReel: SocialCaptionResult;
}

const SYSTEM_INSTRUCTION = `You are a specialized social media copywriter for Lincolnshire Knee Clinic, an orthopaedic consultant clinic. You write short, patient-friendly, algorithm-aware content for Instagram (Standard Posts, Stories, Carousels, and Reels), Facebook, and LinkedIn from a single topic — NOT full blog articles.

Every caption must be optimized for TWO things at once, not just brand-safe copy: (1) that platform's distribution algorithm — the specific signals each platform is known to reward, so the post reaches more people organically — and (2) on-platform and search-engine discoverability (SEO) — natural-language keyword phrases a patient would actually type (e.g. "knee pain after running", "ACL recovery timeline", "when to see a knee specialist"), woven into the copy so it surfaces in that platform's own search/Explore/Discover surfaces and in Google's indexing of public posts. Never keyword-stuff or sacrifice readability for this — it must still read as natural, empathetic patient-facing writing.

Platform-specific rules you MUST follow:

INSTAGRAM: Open with a scroll-stopping, high-impact hook in the very first line (this is crucial because Instagram truncates the caption in the user feed after the first two lines, so the hook must immediately capture attention). Use short line breaks for scannability and tasteful emoji (not excessive). Structure the copy to earn saves and shares specifically — e.g. frame it as a checklist, a "save this for later" reference, or a clear before/after or step-by-step — since Instagram's own ranking signals weight saves and shares more heavily than likes. End with a block of 8 to 15 relevant hashtags mixing broad terms (#KneeHealth, #JointCare) with niche/specific ones related to the topic, plus at least 1-2 long-tail search-style hashtags matching how a patient would actually search (e.g. #KneePainAfterRunning). Include a clear call-to-action (e.g. "Book a consultation — link in bio"). Keep it under roughly 150 words before the hashtags.

INSTAGRAM_STORY: Generate a very short, high-impact text overlay script (maximum 15 words) suitable to be put directly on a vertical 9:16 story background image. Keep it punchy and call-to-action driven. Suggest a vertical 9:16 image prompt description.

INSTAGRAM_CAROUSEL: Design a step-by-step educational slideshow of 3 to 5 slides. For each slide, define: Slide Number, Slide Text Overlay (under 15 words, big bold text), and a Slide Image Description that visually depicts that specific slide's point (see the image-description rule below) — never a repeated generic clinic photo across slides. Carousels are Instagram's strongest save/share format — frame the overall deck so slide 1 promises a clear payoff ("5 signs...", "3 steps to...") that earns a swipe-through.

INSTAGRAM_REEL: Design a short, 30-second conversational video script. Include: (1) A scroll-stopping video intro hook in the first 1-2 seconds (Reels are ranked heavily on watch-through rate, so losing the viewer early is the single biggest reach killer), (2) 3 short, punchy talking points, (3) Visual B-roll action cues for the camera, and (4) Voiceover narration text.

FACEBOOK: Conversational, community tone. Front-load the key point in the first ~150 characters since Facebook truncates the feed preview early. Write to invite comments and shares directly (e.g. end with a genuine question), since Facebook's "Meaningful Social Interactions" ranking signal favours posts that generate real conversation over passive likes. Do not put an external link directly in the post body — Facebook's algorithm measurably suppresses reach on posts with outbound links; instead direct people to "link in bio" / "message us" / "visit our website" without a raw URL. Use very light hashtag use (1 to 3 maximum — heavy tagging hurts reach on this platform). End with a clear call-to-action.

LINKEDIN: Professional, clinical-educator tone aimed at both patients and referring professionals. Hook in the first 1-2 lines (LinkedIn truncates earlier than other platforms, and the "see more" click itself is a positive dwell-time signal, so the hook must earn that click). Short paragraphs with line breaks for scannability — LinkedIn's algorithm favours posts that keep people reading/dwelling on the platform. Do not include an external link in the main post body (LinkedIn deprioritizes outbound-link posts); note in the copy that the link is in the first comment instead if one is needed. Use natural professional/clinical keyword phrasing a referring GP or physiotherapist might search for. End with 3 to 5 professional hashtags. Close with a discussion-prompting question to encourage genuine comments, which LinkedIn weights heavily.

Clinic Contact Details & Rules:
Always use these exact contact details for the clinic if a call-to-action or contact info is generated:
- Website: www.lincsknee.com (Never use other domains like lincolnshirekneeclinic.co.uk)
- Email: info@lincsknee.com
- Phone / WhatsApp: 07770473437
Important: Do NOT write "Call 07770473437" or ask patients to call. Instead, specify that the preferred contact method for this number is via WhatsApp message (e.g. "Send a WhatsApp message to 07770473437" or "Contact us via WhatsApp on 07770473437") because the consultant is frequently in theatre and unable to answer calls directly.

Do not invent medical claims. Do not use fake statistics. Keep the clinic's tone empathetic and professional throughout.

Image description rule (applies to standard posts, stories, and every carousel slide): suggest a short, concrete description of a single representative image (for an AI image generator or manual photo selection). The image MUST depict the SPECIFIC subject the post is actually about — not a generic clinic photo. First identify exactly what the caption discusses (a symptom, a time of day, a body position, a piece of equipment, an activity, an anatomical structure, a recovery stage, etc.), then describe an image of that exact thing. For example: a post about nighttime pain or trouble sleeping after surgery should describe a patient in bed adjusting a pillow beneath an elevated knee at night — NOT a desk with an anatomical model. A post about icing should describe an ice pack being applied to a knee — NOT a consultation room. A post about a specific exercise should describe a patient performing that exact exercise. Only fall back to a generic clinic scene (consultant consultation, clinical room with navy/teal branding, anatomical model, rehab exercise under physiotherapist supervision, surgical diagram) when the topic genuinely has no specific visual subject of its own (e.g. a practice announcement).`;

function buildGenerationPrompt(topic: string): string {
  return `Topic: "${topic}"

Write all six social formats now, in EXACTLY this format (including the literal markers on their own lines):

INSTAGRAM_CAPTION:
<the Instagram post caption including hashtags>

INSTAGRAM_IMAGE:
<one-sentence image description for Instagram>

INSTAGRAM_STORY_CAPTION:
<the Story text overlay script, max 15 words>

INSTAGRAM_STORY_IMAGE:
<one-sentence vertical 9:16 image description for Story>

INSTAGRAM_CAROUSEL_SLIDES:
Slide 1 Visual: <visual description for slide 1>
Slide 1 Text: <text overlay for slide 1>
Slide 2 Visual: <visual description for slide 2>
Slide 2 Text: <text overlay for slide 2>
Slide 3 Visual: <visual description for slide 3>
Slide 3 Text: <text overlay for slide 3>
Slide 4 Visual: <visual description for slide 4>
Slide 4 Text: <text overlay for slide 4>
Slide 5 Visual: <visual description for slide 5>
Slide 5 Text: <text overlay for slide 5>

INSTAGRAM_REEL_SCRIPT:
Hook: <video intro hook>
Visual Cues: <camera angles and visual directions>
Voiceover Script: <narration text to speak>

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

function parseCarouselSlides(rawText: string): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  const lines = rawText.split("\n");
  let currentVisual = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const visualMatch = trimmed.match(/^Slide\s*(\d+)\s*Visual:\s*(.*)$/i);
    const textMatch = trimmed.match(/^Slide\s*(\d+)\s*Text:\s*(.*)$/i);

    if (visualMatch) {
      currentVisual = visualMatch[2].trim();
    } else if (textMatch) {
      const num = parseInt(textMatch[1], 10);
      const text = textMatch[2].trim();
      slides.push({
        slideNumber: num,
        text,
        imagePromptSuggestion: currentVisual || `Visual slide guide for Slide ${num}`,
      });
      currentVisual = "";
    }
  }

  // Fallback if formatting was slightly off
  if (slides.length === 0 && rawText.length > 10) {
    slides.push({
      slideNumber: 1,
      text: rawText,
      imagePromptSuggestion: "Visual slide guide",
    });
  }

  return slides;
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
  const instagramImage = extractSection(output, "INSTAGRAM_IMAGE:", "INSTAGRAM_STORY_CAPTION:");
  const instagramStoryCaption = extractSection(output, "INSTAGRAM_STORY_CAPTION:", "INSTAGRAM_STORY_IMAGE:");
  const instagramStoryImage = extractSection(output, "INSTAGRAM_STORY_IMAGE:", "INSTAGRAM_CAROUSEL_SLIDES:");
  const instagramCarouselRaw = extractSection(output, "INSTAGRAM_CAROUSEL_SLIDES:", "INSTAGRAM_REEL_SCRIPT:");
  const instagramReelRaw = extractSection(output, "INSTAGRAM_REEL_SCRIPT:", "FACEBOOK_CAPTION:");
  const facebookCaption = extractSection(output, "FACEBOOK_CAPTION:", "FACEBOOK_IMAGE:");
  const facebookImage = extractSection(output, "FACEBOOK_IMAGE:", "LINKEDIN_CAPTION:");
  const linkedinCaption = extractSection(output, "LINKEDIN_CAPTION:", "LINKEDIN_IMAGE:");
  const linkedinImage = extractSection(output, "LINKEDIN_IMAGE:", null);

  if (!instagramCaption || !facebookCaption || !linkedinCaption) {
    throw new Error("The AI response could not be parsed into all platform formats. Please try again.");
  }

  const slides = parseCarouselSlides(instagramCarouselRaw);

  return {
    instagram: {
      caption: instagramCaption,
      imagePromptSuggestion: instagramImage || `A representative image for "${topic}"`
    },
    facebook: {
      caption: facebookCaption,
      imagePromptSuggestion: facebookImage || `A representative image for "${topic}"`
    },
    linkedin: {
      caption: linkedinCaption,
      imagePromptSuggestion: linkedinImage || `A representative image for "${topic}"`
    },
    instagramStory: {
      caption: instagramStoryCaption || `New update on "${topic}"!`,
      imagePromptSuggestion: instagramStoryImage || `A vertical image for "${topic}"`
    },
    instagramCarousel: {
      caption: `Swipe through to learn about "${topic}"!`,
      imagePromptSuggestion: `Carousel deck about "${topic}"`,
      slides: slides.length > 0 ? slides : [
        { slideNumber: 1, text: topic, imagePromptSuggestion: `Cover slide for "${topic}"` }
      ]
    },
    instagramReel: {
      caption: `Watch our quick guide on "${topic}"!`,
      imagePromptSuggestion: `Reel visual thumbnail for "${topic}"`,
      script: instagramReelRaw || `Hook: Let's talk about ${topic}!\n\nVoiceover: Here is what you need to know...`
    }
  };
}

export async function rewriteSocialCaption(
  topic: string,
  platform: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel",
  previousCaption: string,
  revisionNotes?: string
): Promise<SocialCaptionResult> {
  const model = getModel();
  const platformLabel = platform === "instagram"
    ? "Instagram"
    : platform === "facebook"
      ? "Facebook"
      : platform === "linkedin"
        ? "LinkedIn"
        : platform === "instagramStory"
          ? "Instagram Story"
          : platform === "instagramCarousel"
            ? "Instagram Carousel"
            : "Instagram Reel";

  const prompt = `Topic: "${topic}"

You previously wrote this ${platformLabel} content:
"""
${previousCaption}
"""

${revisionNotes ? `The reviewer's feedback for the rewrite: "${revisionNotes}"` : "The reviewer wants a fresh alternative — write a genuinely different take, not a minor tweak."}

Write a revised ${platformLabel} content now, following the platform-specific rules from your system instructions, in EXACTLY this format:

CAPTION:
<the revised caption/text/script>

IMAGE:
<one-sentence image/visual description>`;

  const result = await model.generateContent(prompt);
  const output = result.response.text() || "";

  const caption = extractSection(output, "CAPTION:", "IMAGE:");
  const image = extractSection(output, "IMAGE:", null);

  if (!caption) {
    throw new Error("The AI response could not be parsed. Please try again.");
  }

  return {
    caption,
    imagePromptSuggestion: image || `A representative visual description for "${topic}"`
  };
}

export async function rewriteCarouselSlides(
  topic: string,
  previousSlides: CarouselSlide[],
  revisionNotes?: string
): Promise<{ caption: string; imagePromptSuggestion: string; slides: CarouselSlide[] }> {
  const model = getModel();
  const previousText = previousSlides
    .map((s) => `Slide ${s.slideNumber} Visual: ${s.imagePromptSuggestion}\nSlide ${s.slideNumber} Text: ${s.text}`)
    .join("\n");

  const prompt = `Topic: "${topic}"

You previously wrote this Instagram Carousel slide deck:
"""
${previousText}
"""

${revisionNotes ? `The reviewer's feedback for the rewrite: "${revisionNotes}"` : "The reviewer wants a fresh alternative take on the slide deck — not a minor tweak."}

Write a revised 3 to 5 slide Instagram Carousel now, following the INSTAGRAM_CAROUSEL rules and the image description rule from your system instructions, in EXACTLY this format (including the literal markers on their own lines):

Slide 1 Visual: <visual description for slide 1>
Slide 1 Text: <text overlay for slide 1>
Slide 2 Visual: <visual description for slide 2>
Slide 2 Text: <text overlay for slide 2>
Slide 3 Visual: <visual description for slide 3>
Slide 3 Text: <text overlay for slide 3>
(continue up to Slide 5 if needed)`;

  const result = await model.generateContent(prompt);
  const output = result.response.text() || "";
  const slides = parseCarouselSlides(output);

  if (slides.length === 0) {
    throw new Error("The AI response could not be parsed into carousel slides. Please try again.");
  }

  return {
    caption: `Swipe through to learn about "${topic}"!`,
    imagePromptSuggestion: `Carousel deck about "${topic}"`,
    slides
  };
}
