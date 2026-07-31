import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchBrief } from "./researchAgent";
import { convertNewsletterMarkdownToHtml } from "./newsletterMarkdown";

const apiKey = process.env.GEMINI_API_KEY;

export async function writeNewsletterEdition(
  topic: string,
  research?: ResearchBrief
): Promise<{ subject: string; body_markdown: string; body_html: string }> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are an expert patient-communication specialist and clinical newsletter copywriter for Lincolnshire Knee Clinic.
Your goal is to write a highly engaging, plain-language, evidence-based patient newsletter on a specific knee topic.

Guidelines:
1. Target Audience: Patients experiencing knee pain, joint stiffness, arthritis, or recovering from surgery. Avoid dry, academic, or textbook writing. Write with clinical empathy, warmth, and clarity.
2. Jargon Control: Keep medical terminology to a minimum. If you use a term like "viscosupplementation" or "meniscus", immediately explain it in plain English.
3. Structure:
   - SUBJECT line: A scroll-stopping, professional, click-worthy email subject line (e.g., "SUBJECT: Non-surgical joint preservation: What really works?").
   - INTRO: An empathetic opening acknowledging common patient experiences or struggles with this topic.
   - CLINICAL INSIGHT: Explain the clinical facts and recent research findings (if research data is provided) in simple terms.
   - PRACTICAL TIPS: 3-4 actionable tips the patient can implement (exercises, joint preservation tactics, lifestyle choices).
   - CALL TO ACTION: Direct them to book a consultation, learn more on the website, or message our team via WhatsApp for personalized guidance.
   - SIGNATURE: "Warm regards,\nThe Lincolnshire Knee Clinic Team"
   - DISCLAIMER: A brief note that the newsletter is for educational purposes and doesn't replace formal medical advice.
4. Formatting: Write in markdown. Do NOT use H1 (#) or H2 (##) headers. Only use H3 (###) headers. Use bold text for key takeaways. Keep paragraphs short (2-3 sentences) for easy readability.`,
  });

  let userPrompt = `Please write a patient newsletter about this topic: "${topic}".\n\n`;

  if (research) {
    userPrompt += `Here is the clinical research brief you should synthesize for the patients:\n`;
    userPrompt += `Summary of Evidence: ${research.summary}\n`;
    userPrompt += `Key Evidence Points:\n${(research.key_points || []).map(p => `- ${p}`).join("\n")}\n`;
    userPrompt += `Literature Sources:\n${(research.sources || []).map(s => `- ${s}`).join("\n")}\n`;
  } else {
    userPrompt += `Note: No additional research brief was provided. Draw on your pre-trained clinical knowledge of standard orthopaedic guidelines (such as NICE guidelines and top knee preservation journals) to write an informative and helpful newsletter.`;
  }

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  // Extract Subject line from generated text
  let subject = `Lincolnshire Knee Clinic Update: ${topic}`;
  let body_markdown = text;

  const subjectMatch = text.match(/SUBJECT:\s*(.*)/i);
  if (subjectMatch && subjectMatch[1]) {
    subject = subjectMatch[1].trim();
    body_markdown = text.replace(/SUBJECT:\s*(.*)/i, "").trim();
  }

  // Generate clean, inline-styled HTML from markdown for distribution
  const body_html = convertNewsletterMarkdownToHtml(subject, body_markdown);

  return { subject, body_markdown, body_html };
}

export { convertNewsletterMarkdownToHtml };
