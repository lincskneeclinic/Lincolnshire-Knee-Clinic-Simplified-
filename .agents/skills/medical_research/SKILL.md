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
