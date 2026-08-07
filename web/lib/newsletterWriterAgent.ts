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
Your goal is to write a comprehensive, detailed, and evidence-based patient education newsletter on a specific knee topic. The newsletter should be long, thorough, and highly informative (approx. 600-900 words), bridging high-quality clinical research with patient-friendly explanations.

Guidelines:
1. Target Audience: Patients experiencing knee pain, joint stiffness, arthritis, or recovering from surgery. Write with clinical empathy, warmth, and clarity. Avoid overly dense, dry academic speak, but explain the biological mechanisms and clinical facts thoroughly.
2. Jargon Control: Explain complex terms immediately in plain English (e.g., if mentioning "viscosupplementation", explain it as "injecting a lubricating gel into the joint").
3. Structure & Sections:
   - SUBJECT: A scroll-stopping, professional, click-worthy email subject line (e.g., "SUBJECT: Non-surgical joint preservation: What really works?").
   - INTRO: An empathetic opening acknowledging common patient struggles and symptoms related to the topic.
   - THE SCIENCE: Explain the underlying anatomy, pathology, or biological process in clear, detailed terms.
   - CLINICAL EVIDENCE & CONTROVERSIES: Synthesize the specific clinical studies and evidence points. Mention any clinical debates (e.g., conservative treatment vs. early intervention, or functional milestones).
   - WHO IS A CANDIDATE?: Explain the specific clinical criteria, functional indications, or symptoms that make a patient suitable for this intervention/treatment.
   - PRACTICAL ACTION STEPS: 3-5 specific, evidence-based recommendations, exercises, or lifestyle changes the patient can make.
   - LANDMARK REFERENCES: A dedicated section at the bottom listing the clinical studies and guidelines (with PMIDs/journals) so patients know it is fully evidence-based.
   - CALL TO ACTION: A welcoming closing inviting them to book a consultation, learn more on our website, or message our clinical team.
   - SIGNATURE: "Warm regards,\nThe Lincolnshire Knee Clinic Team"
   - DISCLAIMER: A brief note that the newsletter is for educational purposes and doesn't replace formal medical advice.
4. Formatting: Write in markdown. Do NOT use H1 (#) or H2 (##) headers. Only use H3 (###) headers for main sections to ensure compatibility with email template formatting. Use bold text for key takeaways. Keep paragraphs around 3-4 sentences.`,
  });

  let userPrompt = `Please write a detailed, highly researched, and evidence-based patient newsletter about this topic: "${topic}".\n\n`;

  if (research) {
    userPrompt += `Here is the comprehensive clinical research brief you must synthesize and cite:\n`;
    userPrompt += `Summary of Evidence: ${research.summary}\n\n`;
    userPrompt += `Key Evidence Points:\n${(research.key_points || []).map(p => `- ${p}`).join("\n")}\n\n`;
    if (research.conflicting_findings && research.conflicting_findings.length > 0) {
      userPrompt += `Clinical Controversies & Considerations:\n${research.conflicting_findings.map(f => `- ${f}`).join("\n")}\n\n`;
    }
    if (research.clinical_indications && research.clinical_indications.length > 0) {
      userPrompt += `Candidate Screening & Clinical Indications:\n${research.clinical_indications.map(i => `- ${i}`).join("\n")}\n\n`;
    }
    userPrompt += `Literature Sources & Citations (Please include these as references at the end and cite them inline where relevant):\n${(research.sources || []).map(s => `- ${s}`).join("\n")}\n\n`;
  } else {
    userPrompt += `Note: No additional research brief was provided. Draw on your pre-trained clinical knowledge of standard orthopaedic guidelines (such as NICE guidelines and top knee preservation journals: JBJS, AJSM, The Knee) to write an informative and detailed newsletter.\n`;
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
