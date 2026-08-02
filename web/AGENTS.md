<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Social media content generation — standing product requirement

All AI-generated Instagram/Facebook/LinkedIn post copy must be written to optimize for that platform's distribution algorithm AND search/SEO discoverability, not just brand-safe tone. This is a locked-in product requirement, not a one-off tweak — preserve it if you ever touch social generation prompts.

The single source of truth is `SYSTEM_INSTRUCTION` in `web/lib/socialWriterAgent.ts` — every social generation path in the app (the blog-linked content pipeline and the standalone social-only generator) calls through this one file's `writeSocialCaptions`/`rewriteSocialCaption`/`rewriteCarouselSlides`, so there is nowhere else this needs duplicating. If you add a new social generation entry point, route it through this same file rather than writing a parallel prompt.

Current per-platform tactics baked into that prompt (keep these current as platform algorithms evolve — verify against up-to-date guidance, don't assume this list stays true forever):
- Instagram: hook-first opening, save/share-oriented structure (checklists, before/after, step-by-step), 8-15 hashtags mixing broad + niche + long-tail search phrasing.
- Facebook: no raw outbound links in the post body (suppresses reach), comment/share-inviting closing question, light hashtag use.
- LinkedIn: no outbound link in the main body (link goes in first comment instead), professional keyword phrasing referring clinicians would search, discussion-prompting close.

The lightweight always-available heuristic scorer (`web/lib/estimatedPostScore.ts`) and the real Meta-Graph-API-grounded post-performance score (`web/lib/socialPerformanceAgent.ts`, `web/lib/metaPostMetrics.ts`) both complement this — they score/critique after generation, they don't replace optimizing the generation prompt itself.
