---
name: medical_research
description: Trigger this skill when the user requests medical literature research, search on PubMed, or clinical evidence lookup.
---

# Medical Research Agent Skill

This skill allows the agent to conduct structured literature searches of PubMed (MEDLINE) and general medical databases.

## Capabilities
- Search PubMed for matching clinical trials, reviews, and meta-analyses, covering all major knee and orthopedic journals (e.g., Journal of Bone and Joint Surgery, The Knee, American Journal of Sports Medicine, and Arthroscopy).
- Search patient forums, patient support networks, and community discussion platforms (e.g., Reddit, Patient.info) using web search tools to capture qualitative patient experiences and FAQs.
- Retrieve structured citation metadata (PMID, title, authors, journal, pubdate).

## How to use PubMed Search Tool
To run a literature search, execute the Node.js script located under the skill's scripts directory:
`node .agents/skills/medical_research/scripts/pubmed_search.js <your query>`

Example:
`node .agents/skills/medical_research/scripts/pubmed_search.js knee osteoarthritis exercise`

## Research Best Practices
1. **Targeting Specific Knee Journals:** When searching PubMed or the web, narrow down results to top knee journals using journal filters (e.g., appending `"AND (The Knee[Journal] OR Journal of Bone and Joint Surgery[Journal])"` to the PubMed query).
2. **Searching Patient Forums:** Run targeted web searches to locate real-world patient feedback, using queries like `"site:reddit.com/r/running knee pain"` or `"knee replacement recovery experiences forum"`.
3. **PICO Framework:** Structure search terms using Patient, Intervention, Comparison, and Outcome where possible.
4. **Synthesis:** Blend clinical, evidence-based data from PubMed with practical patient experiences from forums to compile comprehensive, patient-friendly articles.

## Knee medical imagery

Whenever the user requests a knee image, medical illustration, diagram, annotated scan, diagnostic visual, injection image, surgical illustration, rehabilitation graphic, or patient-education visual:

1. Read and follow:
   - `/web/docs/medical-imagery-guidelines.md`
   - `/web/docs/image-prompt-library.md`

2. Use `/web/docs/medical-imagery-guidelines.md` for:
   - licensing and attribution
   - clinical and visual standards
   - accessibility and alt text
   - responsive desktop, tablet, and mobile behaviour
   - file naming and storage
   - clinical review requirements

3. Use `/web/docs/image-prompt-library.md` for:
   - the Lincolnshire Knee Clinic house style
   - subject-specific knee prompts
   - negative prompts
   - output format requirements
   - the clinical review checklist

4. The imagery must be exclusively related to the knee.

5. Prefer anatomically accurate, realistic 2D patient-education illustrations with:
   - restrained natural colours
   - a clean white or pale neutral background
   - a calm, non-graphic presentation
   - no embedded text or labels
   - no logo or watermark
   - no blood or gore

6. Do not use images found through a general web search unless their commercial reuse licence has been verified and documented.

7. Treat AI-generated images as drafts. Check anatomical and clinical plausibility before adding them to the website.

8. Generate a clean master image first. Add labels later in the website, SVG, Figma, or another design tool.

9. For website use, provide or request:
   - desktop version
   - tablet version
   - mobile version
   - descriptive alt text
   - an appropriate filename and destination path

10. Before completing the task, apply the clinical review checklist in `/web/docs/image-prompt-library.md`.

If either reference file is missing or cannot be read, stop and report which file is unavailable rather than inventing replacement rules.
