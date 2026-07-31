import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchBrief } from "./contentPipeline";

const apiKey = process.env.GEMINI_API_KEY;

export async function writeBlogDraft(
  topic: string,
  research: ResearchBrief | null | undefined,
  previousDraft?: any,
  revisionNotes?: string
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are a specialized medical content writer and orthopaedic consultant communicator for Lincolnshire Knee Clinic.
You will be provided with a rich clinical research brief and a topic/clinical question.
Your job is to write an exhaustive, empathetic, and highly detailed evidence-based blog article (minimum 800 to 1,200 words).

Guidelines:
1. Target Audience: General patient audience with no medical background. You MUST write in plain, layman's language. Avoid academic/journal tone entirely; write the way an empathetic clinician would explain something to a worried patient in a clinic, not the way a scientific paper would describe it to other clinicians.
2. Jargon Control: Use minimal medical jargon. Where a clinical term is genuinely necessary (e.g., "ACL", "arthroscopy", "meniscectomy"), you MUST briefly explain it in simple, plain words the first time it is used.
3. Structure: 
   - Use engaging, clear H3 headers (###) for sections.
   - Start with an empathetic Introduction acknowledging the patient's concern (e.g. fear of re-injury, eagerness to return to sport).
   - Create detailed sections explaining the physiological or surgical mechanics, chronological milestones vs functional biological recovery, and evidence-based rehabilitation protocols.
   - Dedicate a specific section to "Clinical Evidence & Consensus", directly synthesizing findings from journals like JBJS, AJSM, and The Knee as provided in the research brief, but translated into clear patient-facing language.
   - Conclude with a clear actionable call-to-action to book an individual clinical consultation and screening at Lincolnshire Knee Clinic. Always use these exact contact details for the clinic in the CTA: Website: www.lincsknee.com (Never use other domains like lincolnshirekneeclinic.co.uk), Email: info@lincsknee.com, Phone / WhatsApp: 07770473437 (Always specify that the preferred contact method for this number is via WhatsApp message because the consultant is frequently in theatre and unable to answer calls directly).
4. Nuance & Controversy Flags: Where the research brief notes clinical controversies or conflicting findings (e.g., accelerated vs conservative rehab, functional testing vs time-based clearance), you MUST insert a clinical review flag immediately following that paragraph. The flag must be exactly formatted as "[NEEDS CLINICAL REVIEW]" followed by specific instructions to the reviewing consultant.
5. Formatting: Use standard Markdown. Bold key terms and milestones. Use bullet lists for rehabilitation exercises or functional clearance criteria.
6. Content Integrity: You must incorporate all provided 'Key Points', 'Conflicting Findings', and 'Clinical Indications' thoroughly without inventing medical claims.
7. Featured Image: The article body MUST begin with exactly one featured-image marker on its own line, before the introduction paragraph. This image is later used as the card thumbnail on the Education Hub, so describe a single clear, representative visual for the whole article. It MUST be written in the exact format: [FEATURED IMAGE PLACEHOLDER: Description of a representative hero image for this article].
8. Inline Image Placeholders: In addition to the featured image, insert 1 to 3 further image placeholder markers inline on their own line at natural, logical points in the rest of the article body (e.g. after introducing a surgical technique or rehab milestone). These MUST be written in the exact format: [IMAGE PLACEHOLDER: Description of what the image, diagram, X-Ray, or photo should show]. Do not put them all at the top; place them where they contextually enhance patient comprehension.
9. Revision Mode: If previous draft details and reviewer feedback are supplied, focus on revising the previous draft to address the requested changes specifically — keep what wasn't flagged as a problem, don't rewrite from scratch. Ensure that you preserve the existing featured image and inline image placeholder markers that were not requested to be changed.`
  });

  let userPrompt = research
    ? `
Topic / Clinical Question: "${topic}"

Research Brief Summary:
${research.summary}

Key Clinical Insights & Evidence to Cover:
${(research.key_points || []).map((p) => "- " + p).join("\n")}

Clinical Debates / Conflicting Findings (Must insert [NEEDS CLINICAL REVIEW] flags around these):
${(research.conflicting_findings || []).map((p) => "- " + p).join("\n")}

Clinical Indications & Clearance Criteria:
${(research.clinical_indications || []).map((p) => "- " + p).join("\n")}

Literature & Guidelines Sources:
${(research.sources || []).map((p) => "- " + p).join("\n")}
`
    : `
Topic / Clinical Question: "${topic}"

Note: No research brief was supplied for this article. Draw on your pre-trained clinical knowledge of standard orthopaedic guidelines (such as NICE guidelines and leading knee/sports medicine journals) to write an accurate, evidence-informed article. Still insert [NEEDS CLINICAL REVIEW] flags around any genuinely debated or nuanced clinical points.
`;

  if (previousDraft && revisionNotes) {
    userPrompt += `
----------------------------------------
REVISION REQUEST DETAILS:
You are updating a previously written draft of the article. Do NOT rewrite the entire article from scratch. Instead, focus on specifically addressing the reviewer's feedback while maintaining the rest of the text, structure, and quality.

Previous Draft Version: V${previousDraft.version}
Previous Title: "${previousDraft.title}"
Previous Excerpt/Meta: "${previousDraft.excerpt}"
Previous Body Content:
${previousDraft.body_markdown || previousDraft.body}

Reviewer Feedback / Requested Changes:
"${revisionNotes}"

Please revise the previous draft according to the feedback. Keep all parts of the draft that are accurate and not subject to feedback, making targeted updates. Ensure you preserve the leading [FEATURED IMAGE PLACEHOLDER: ...] tag and any inline [IMAGE PLACEHOLDER: ...] tags unless instructed to change them.
`;
  }

  userPrompt += `
Please write the comprehensive, long-form clinical article now (or the revised version if a revision request was detailed above). Also provide a 1-sentence SEO excerpt/meta description at the very beginning in the exact format:
EXCERPT: <your excerpt>

TITLE: <a catchy but professional clinical title>

BODY:
<the comprehensive markdown body of the article (800+ words)>
`;

  try {
    const result = await model.generateContent(userPrompt);
    const output = result.response.text() || "";

    // Parse the output
    const excerptMatch = output.match(/EXCERPT:\s*(.*)/i);
    const titleMatch = output.match(/TITLE:\s*(.*)/i);
    const bodyMatch = output.match(/BODY:\s*([\s\S]*)/i);

    const excerpt = excerptMatch ? excerptMatch[1].trim() : `An exhaustive clinical guide on ${topic} for Lincolnshire Knee Clinic patients.`;
    const title = titleMatch ? titleMatch[1].trim() : topic;
    let body = bodyMatch ? bodyMatch[1].trim() : output.trim();

    // Extract flags from the body
    const flagRegex = /\[NEEDS CLINICAL REVIEW\].*/gi;
    const flags = body.match(flagRegex) || [];

    // The system prompt asks the model to lead with a [FEATURED IMAGE PLACEHOLDER: ...]
    // marker, but LLM instruction-following isn't 100% reliable — guarantee it
    // programmatically rather than leaving the Education Hub card image to chance.
    const featuredPlaceholderRegex = /\[FEATURED IMAGE PLACEHOLDER:\s*(.*?)\]/i;
    if (!featuredPlaceholderRegex.test(body)) {
      body = `[FEATURED IMAGE PLACEHOLDER: A representative hero image for "${title}"]\n\n${body}`;
    }

    // Parse the featured image placeholder (used as the Education Hub card image)
    // and the inline body image placeholders.
    const placeholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
    let match;
    const suggestedImages: Array<string | { placeholderId?: string; label: string; url?: string; isFeatured?: boolean }> = [];

    const findPreviousUrl = (label: string) =>
      previousDraft?.suggested_images?.find(
        (img: any) =>
          typeof img === "object" &&
          img !== null &&
          img.label?.trim().toLowerCase() === label.toLowerCase()
      );

    const featuredMatch = body.match(featuredPlaceholderRegex);
    if (featuredMatch) {
      const label = featuredMatch[1].trim();
      const previousResolved = findPreviousUrl(label);
      suggestedImages.push({
        placeholderId: previousResolved?.placeholderId || "featured-image",
        label,
        url: previousResolved?.url || "",
        isFeatured: true,
      });
    }

    let count = 1;
    while ((match = placeholderRegex.exec(body)) !== null) {
      const label = match[1].trim();
      const previousResolved = findPreviousUrl(label);
      suggestedImages.push({
        placeholderId: previousResolved?.placeholderId || `placeholder-${count++}`,
        label,
        url: previousResolved?.url || ""
      });
    }

    return {
      title,
      excerpt,
      body_markdown: body,
      body,
      flags,
      suggestedImages,
    };
  } catch (err) {
    console.error("Error generating blog draft via Gemini:", err);
    throw err;
  }
}
