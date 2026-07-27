import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchBrief } from "./contentPipeline";

const apiKey = process.env.GEMINI_API_KEY;

export async function writeBlogDraft(
  topic: string,
  research: ResearchBrief,
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
1. Target Audience: ${research.target_audience}. The tone must be empathetic to patient anxieties while maintaining rigorous orthopaedic accuracy.
2. Structure: 
   - Use engaging, clear H3 headers (###) for sections.
   - Start with an empathetic Introduction acknowledging the patient's concern (e.g. fear of re-injury, eagerness to return to sport).
   - Create detailed sections explaining the physiological or surgical mechanics, chronological milestones vs functional biological recovery, and evidence-based rehabilitation protocols.
   - Dedicate a specific section to "Clinical Evidence & Consensus", directly synthesizing findings from journals like JBJS, AJSM, and The Knee as provided in the research brief.
   - Conclude with a clear actionable call-to-action to book an individual clinical consultation and screening at Lincolnshire Knee Clinic.
3. Nuance & Controversy Flags: Where the research brief notes clinical controversies or conflicting findings (e.g., accelerated vs conservative rehab, functional testing vs time-based clearance), you MUST insert a clinical review flag immediately following that paragraph. The flag must be exactly formatted as "[NEEDS CLINICAL REVIEW]" followed by specific instructions to the reviewing consultant.
4. Formatting: Use standard Markdown. Bold key terms and milestones. Use bullet lists for rehabilitation exercises or functional clearance criteria.
5. Content Integrity: You must incorporate all provided 'Key Points', 'Conflicting Findings', and 'Clinical Indications' thoroughly without inventing medical claims.
6. Image Placeholders: Insert 1 to 3 image placeholder markers inline on their own line at natural, logical points in the article body (e.g. after introducing a surgical technique or rehab milestone). The placeholders MUST be written in the exact format: [IMAGE PLACEHOLDER: Description of what the image, diagram, X-Ray, or photo should show]. Do not put them all at the top; place them where they contextually enhance patient comprehension.
7. Revision Mode: If previous draft details and reviewer feedback are supplied, focus on revising the previous draft to address the requested changes specifically — keep what wasn't flagged as a problem, don't rewrite from scratch. Ensure that you preserve any existing image placeholder markers that were not requested to be changed.`
  });

  let userPrompt = `
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

Please revise the previous draft according to the feedback. Keep all parts of the draft that are accurate and not subject to feedback, making targeted updates. Ensure you preserve any inline [IMAGE PLACEHOLDER: ...] tags unless instructed to change them.
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
    const body = bodyMatch ? bodyMatch[1].trim() : output.trim();

    // Extract flags from the body
    const flagRegex = /\[NEEDS CLINICAL REVIEW\].*/gi;
    const flags = body.match(flagRegex) || [];

    // Parse image placeholders
    const placeholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
    let match;
    const suggestedImages: Array<string | { placeholderId?: string; label: string; url?: string }> = [
      "Patient undergoing functional knee rehabilitation and symmetry testing with a physical therapist",
      "Anatomical diagram illustrating knee joint structures and surgical repair integrity"
    ];
    let count = 1;
    while ((match = placeholderRegex.exec(body)) !== null) {
      const label = match[1].trim();
      const previousResolved = previousDraft?.suggested_images?.find(
        (img: any) =>
          typeof img === "object" &&
          img !== null &&
          img.label?.trim().toLowerCase() === label.toLowerCase()
      );
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
