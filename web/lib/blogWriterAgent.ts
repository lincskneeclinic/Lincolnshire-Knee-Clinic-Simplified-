import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchBrief } from "./contentPipeline";
import { generateContentWithRetry } from "./geminiRetry";

const apiKey = process.env.GEMINI_API_KEY;

// Parses a "FAQS:\nQ: ...\nA: ...\nQ: ...\nA: ..." block (placed before BODY: in
// the requested output format so the greedy BODY regex doesn't swallow it) into
// structured Q&A pairs for the on-page FAQ accordion and FAQPage schema.
function parseFaqs(output: string): Array<{ question: string; answer: string }> {
  const faqsBlockMatch = output.match(/FAQS:\s*([\s\S]*?)(?=\n\s*BODY:)/i);
  if (!faqsBlockMatch) return [];

  const pairRegex = /Q:\s*(.+?)\s*\n\s*A:\s*([\s\S]*?)(?=\n\s*Q:|\s*$)/gi;
  const faqs: Array<{ question: string; answer: string }> = [];
  let match;
  while ((match = pairRegex.exec(faqsBlockMatch[1])) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

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
    model: "gemini-3.5-flash",
    systemInstruction: `You are a specialized medical content writer and orthopaedic consultant communicator for Lincolnshire Knee Clinic.
You will be provided with a rich clinical research brief and a topic/clinical question.
Your job is to write an exhaustive, empathetic, and highly detailed evidence-based blog article (minimum 800 to 1,200 words).

Guidelines:
1. Target Audience: General patient audience with no medical background. You MUST write in plain, layman's language. Avoid academic/journal tone entirely; write the way an empathetic clinician would explain something to a worried patient in a clinic, not the way a scientific paper would describe it to other clinicians.
2. Jargon Control: Use minimal medical jargon. Where a clinical term is genuinely necessary (e.g., "ACL", "arthroscopy", "meniscectomy"), you MUST briefly explain it in simple, plain words the first time it is used.
3. Structure:
   - Use engaging, clear H2 headers (##) for main sections — the page itself renders the article title as H1, so sections must be H2 to keep a valid, single-jump heading hierarchy (never skip straight to H3 for a top-level section).
   - Start with an empathetic Introduction acknowledging the patient's concern (e.g. fear of re-injury, eagerness to return to sport).
   - Create detailed sections explaining the physiological or surgical mechanics, chronological milestones vs functional biological recovery, and evidence-based rehabilitation protocols.
   - Dedicate a specific section to "Clinical Evidence & Consensus", directly synthesizing findings from journals like JBJS, AJSM, and The Knee as provided in the research brief, but translated into clear patient-facing language.
   - Conclude with a clear actionable call-to-action to book an individual clinical consultation and screening at Lincolnshire Knee Clinic. Always use these exact contact details for the clinic in the CTA: Website: www.lincsknee.com (Never use other domains like lincolnshirekneeclinic.co.uk), Email: info@lincsknee.com, Phone / WhatsApp: 07770473437 (Always specify that the preferred contact method for this number is via WhatsApp message because the consultant is frequently in theatre and unable to answer calls directly).
4. Nuance & Controversy Flags: Where the research brief notes clinical controversies or conflicting findings (e.g., accelerated vs conservative rehab, functional testing vs time-based clearance), you MUST insert a clinical review flag immediately following that paragraph. The flag must be exactly formatted as "[NEEDS CLINICAL REVIEW]" followed by specific instructions to the reviewing consultant. If the research brief's overall evidence grade is "Conflicting Expert Opinion", treat that as a strong signal that this topic needs at least one such flag even if individual conflicting_findings entries are sparse. Where the research brief lists evidence gaps, weave an honest, brief acknowledgment of what remains uncertain into the relevant section rather than presenting the topic as fully settled.
5. Formatting: Use standard Markdown. Bold key terms and milestones. Use bullet lists for rehabilitation exercises or functional clearance criteria.
6. Content Integrity: You must incorporate all provided 'Key Points', 'Conflicting Findings', and 'Clinical Indications' thoroughly without inventing medical claims.
7. Featured Image: The article body MUST begin with exactly one featured-image marker on its own line, before the introduction paragraph. This image is later used as the card thumbnail on the Education Hub, so describe a single clear, representative visual for the whole article. It MUST be written in the exact format: [FEATURED IMAGE PLACEHOLDER: Description of a representative hero image for this article].
8. Inline Image Placeholders: In addition to the featured image, insert 1 to 3 further image placeholder markers inline on their own line at natural, logical points in the rest of the article body (e.g. after introducing a surgical technique or rehab milestone). These MUST be written in the exact format: [IMAGE PLACEHOLDER: Description of what the image, diagram, X-Ray, or photo should show]. Do not put them all at the top; place them where they contextually enhance patient comprehension.
9. Revision Mode: If previous draft details and reviewer feedback are supplied, focus on revising the previous draft to address the requested changes specifically — keep what wasn't flagged as a problem, don't rewrite from scratch. Ensure that you preserve the existing featured image and inline image placeholder markers that were not requested to be changed.
10. SEO Keyword Targeting: Before writing, identify the single primary search phrase a patient would actually type for this topic (e.g. "PRP injections for knee osteoarthritis", not a clinical label like "platelet-rich plasma therapy"). Use it near the front of the TITLE, naturally within the first 100 words of the body, and naturally in at least 2 of the H2 section headers. Identify 3-5 closely related secondary phrases (synonyms, related symptoms/procedures a patient might also search) and weave them in naturally across the body where they fit the content — never force a phrase in where it reads unnaturally, and never repeat the primary phrase so often it reads as keyword-stuffed.
11. SEO Excerpt: The EXCERPT (used as the page's meta description) must be 140-160 characters, include the primary search phrase naturally, and be written to earn a click from a search results page (state the concrete benefit/answer, not just the topic).
12. FAQs: Write 3 to 5 genuinely common patient questions about this specific topic (the kind patients actually ask in clinic or type into search engines — often long-tail, conversational phrasing distinct from the primary keyword), each with a concise, plain-language answer (2-4 sentences). These power an FAQ rich-result in search, so questions must be specific to this topic, not generic ("What is knee pain?"), and answers must be self-contained and accurate to the research brief — never invent a claim here that isn't supported elsewhere in the brief/body.`
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
${research.overall_evidence_grade ? `\nOverall Evidence Grade: ${research.overall_evidence_grade}` : ""}
${research.evidence_gaps && research.evidence_gaps.length > 0 ? `\nKnown Evidence Gaps (acknowledge honestly, do not present as settled):\n${research.evidence_gaps.map((p) => "- " + p).join("\n")}` : ""}
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
Please write the comprehensive, long-form clinical article now (or the revised version if a revision request was detailed above). Also provide a 1-sentence SEO excerpt/meta description, title, and 3-5 patient FAQs at the very beginning in the exact format:
EXCERPT: <your excerpt, 140-160 characters, includes the primary search phrase>

TITLE: <a catchy but professional clinical title, ideally 50-60 characters, with the primary search phrase placed near the front>

FAQS:
Q: <question 1>
A: <answer 1>
Q: <question 2>
A: <answer 2>
Q: <question 3>
A: <answer 3>

BODY:
<the comprehensive markdown body of the article (800+ words)>
`;

  try {
    const result = await generateContentWithRetry(model, userPrompt);
    const output = result.response.text() || "";

    // Parse the output
    const excerptMatch = output.match(/EXCERPT:\s*(.*)/i);
    const titleMatch = output.match(/TITLE:\s*(.*)/i);
    const bodyMatch = output.match(/BODY:\s*([\s\S]*)/i);
    const faqs = parseFaqs(output);

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
      faqs,
    };
  } catch (err) {
    console.error("Error generating blog draft via Gemini:", err);
    throw err;
  }
}

export async function writeTechnicalArticleDraft(
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
    model: "gemini-3.5-flash",
    systemInstruction: `You are a specialized medical content writer and orthopaedic consultant communicator for Lincolnshire Knee Clinic.
You will be provided with a rich clinical research brief and a topic/clinical question.
Your job is to write an exhaustive, highly technical, and deeply researched clinical article (minimum 1,500 to 2,200 words, aiming for a 12-15 minute read).

Guidelines:
1. Target Audience: General practitioners (GPs), physiotherapists, and highly informed patients seeking detailed scientific evidence. You MUST write in a professional, clinical, and academically rigorous tone (similar to a review article in JBJS or AJSM).
2. Clinical Terminology: Use precise medical and anatomical terminology (e.g., "anterolateral ligament", "mechanotransduction", "proprioceptive deficits", "osteotomy") without dumbing it down. Ensure surgical techniques and biomechanical terms are used accurately.
3. Structure:
   - Use clear H2 headers (##) for main sections — the page itself renders the article title as H1, so top-level sections must be H2 to keep a valid, single-jump heading hierarchy (never skip straight to H3 for a top-level section).
   - Start with a clinical Introduction summarizing the pathophysiology and clinical relevance of the topic.
   - Detail the surgical or preservation interventions, biomechanical principles, postoperative biology of healing (e.g. ligamentization phases), and evidence-based rehabilitation protocols.
   - Dedicate a substantial section to "Clinical Evidence Analysis & Literature Review", citing specific findings, patient outcomes, and clinical studies from peer-reviewed journals (JBJS, AJSM, Arthroscopy, The Knee) as provided in the research brief.
   - Conclude with a clinical summary and a professional call-to-action for GP referrals or specialist consultation at Lincolnshire Knee Clinic. Call-to-action details: Website: www.lincsknee.com, Email: info@lincsknee.com, Phone / WhatsApp: 07770473437 (WhatsApp message preferred due to theatre schedule).
4. Nuance & Controversy: Outline clinical debates or controversial findings (e.g. conservative management vs reconstruction, graft selections, single vs double bundle) and place a clinical review flag formatted exactly as "[NEEDS CLINICAL REVIEW]" followed by instructions to the consultant.
5. Formatting: Standard Markdown. Use bulleted lists for clinical indications or rehabilitation phases. Include references formatted academically.
6. Featured Image: The article body MUST begin with exactly one featured-image marker on its own line: [FEATURED IMAGE PLACEHOLDER: Description of a clinical, medical or anatomical illustration for this article].
7. Inline Image Placeholders: Insert 2 to 4 further image placeholder markers inline on their own line at logical points (e.g. after introducing a surgical technique or rehab milestone). Format: [IMAGE PLACEHOLDER: Description of what the diagram, X-Ray, MRI scan, or clinical photo should show].
8. Revision Mode: If previous draft details and reviewer feedback are supplied, focus on revising the previous draft to address the requested changes specifically. Ensure that you preserve the existing featured image and inline image placeholder markers.
9. SEO Keyword Targeting: Before writing, identify the primary clinical search phrase a GP, physiotherapist, or informed patient would actually search for this topic (e.g. "PRP vs hyaluronic acid knee osteoarthritis evidence" rather than a vague topic label). Use it near the front of the TITLE, naturally within the first 100 words, and naturally in at least 2 of the H2 section headers — never force it in where it breaks academic tone or reads as stuffed.
10. SEO Excerpt: The EXCERPT (used as the page's meta description) must be 140-160 characters, include the primary search phrase naturally, and state the concrete clinical question the article answers.
11. FAQs: Write 3 to 5 genuinely common clinical questions a GP, physiotherapist, or informed patient would ask about this specific topic, each with a concise, clinically precise answer (2-4 sentences) grounded in the research brief. These power an FAQ rich-result in search, so keep them specific to this topic and never invent a claim here that isn't supported elsewhere in the brief/body.`
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
${research.overall_evidence_grade ? `\nOverall Evidence Grade: ${research.overall_evidence_grade}` : ""}
${research.evidence_gaps && research.evidence_gaps.length > 0 ? `\nKnown Evidence Gaps (acknowledge honestly, do not present as settled):\n${research.evidence_gaps.map((p) => "- " + p).join("\n")}` : ""}
`
    : `
Topic / Clinical Question: "${topic}"

Note: No research brief was supplied for this article. Draw on your pre-trained clinical knowledge of standard orthopaedic guidelines and literature to write an accurate, evidence-informed technical article.
`;

  if (previousDraft && revisionNotes) {
    userPrompt += `
----------------------------------------
REVISION REQUEST DETAILS:
You are updating a previously written draft of the technical article. Do NOT rewrite the entire article from scratch. Instead, focus on specifically addressing the reviewer's feedback while maintaining the rest of the text, structure, and quality.

Previous Draft Version: V${previousDraft.version}
Previous Title: "${previousDraft.article_title || previousDraft.title}"
Previous Excerpt/Meta: "${previousDraft.article_excerpt || previousDraft.excerpt}"
Previous Body Content:
${previousDraft.article_body_markdown || previousDraft.article_body || previousDraft.body_markdown || previousDraft.body}

Reviewer Feedback / Requested Changes:
"${revisionNotes}"

Please revise the previous draft according to the feedback. Keep all parts of the draft that are accurate and not subject to feedback. Ensure you preserve image placeholders.
`;
  }

  userPrompt += `
Please write the comprehensive, long-form clinical technical article now (or the revised version if a revision request was detailed above). Also provide a 1-sentence SEO excerpt/meta description, title, and 3-5 clinical FAQs at the very beginning in the exact format:
EXCERPT: <your excerpt, 140-160 characters, includes the primary search phrase>

TITLE: <a professional clinical title, ideally 50-60 characters, with the primary search phrase placed near the front>

FAQS:
Q: <question 1>
A: <answer 1>
Q: <question 2>
A: <answer 2>
Q: <question 3>
A: <answer 3>

BODY:
<the comprehensive markdown body of the technical article (1500+ words)>
`;

  try {
    const result = await generateContentWithRetry(model, userPrompt);
    const output = result.response.text() || "";

    const excerptMatch = output.match(/EXCERPT:\s*(.*)/i);
    const titleMatch = output.match(/TITLE:\s*(.*)/i);
    const bodyMatch = output.match(/BODY:\s*([\s\S]*)/i);
    const faqs = parseFaqs(output);

    const excerpt = excerptMatch ? excerptMatch[1].trim() : `An in-depth clinical analysis of ${topic} for healthcare professionals.`;
    const title = titleMatch ? titleMatch[1].trim() : `${topic} (Clinical Depth)`;
    let body = bodyMatch ? bodyMatch[1].trim() : output.trim();

    const flagRegex = /\[NEEDS CLINICAL REVIEW\].*/gi;
    const flags = body.match(flagRegex) || [];

    const featuredPlaceholderRegex = /\[FEATURED IMAGE PLACEHOLDER:\s*(.*?)\]/i;
    if (!featuredPlaceholderRegex.test(body)) {
      body = `[FEATURED IMAGE PLACEHOLDER: An anatomical illustration of "${title}"]\n\n${body}`;
    }

    const placeholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
    let match;
    const suggestedImages: Array<string | { placeholderId?: string; label: string; url?: string; isFeatured?: boolean }> = [];

    const findPreviousUrl = (label: string) =>
      previousDraft?.article_suggested_images?.find(
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
        placeholderId: previousResolved?.placeholderId || "article-featured-image",
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
        placeholderId: previousResolved?.placeholderId || `article-placeholder-${count++}`,
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
      faqs,
    };
  } catch (err) {
    console.error("Error generating technical article draft via Gemini:", err);
    throw err;
  }
}

