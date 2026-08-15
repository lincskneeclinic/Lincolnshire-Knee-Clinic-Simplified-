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

**Default image sourcing**: when a blog draft is approved, `web/lib/contentPipeline.ts` (both the main `submitPipelineReview` social-draft initialization and `backfillMissingSocialFormats`) auto-populates the blog's hero/featured image (the `isFeatured` entry in `suggested_images`) as the starting image for every format — Instagram/Facebook/LinkedIn `imageUrl`, Story `imageUrl`, Carousel `slides[0].imageUrl`, and Reel `coverImageUrl` (a field that exists only for this purpose — Reels otherwise only carry `videoUrl`). This is a convenience default, not a lock — every format stays fully editable/replaceable in the portal's Social tab. Preserve this default if you touch how social drafts get created; a reviewer should never land on a blank image slot for a photo the clinic already generated.

# Video uploads — standing product requirement

Any video the app accepts (currently `web/app/api/portal/content-pipeline/upload-video/route.ts`, used for Reel uploads) must be compressed before it's stored or deployed — never store/ship a raw video file as-is. This came from a real incident: the Arthrosamid patient video was manually placed in `public/videos/` at 117MB, was gitignored so it never actually deployed at all, and even if it had, would have been far too large for reasonable delivery.

The pattern to follow (see `upload-video/route.ts`'s `compressVideo` for the reference implementation): re-encode with `ffmpeg-static` (already a dependency) using H.264 Baseline profile + `-movflags +faststart` (required for reliable progressive playback on mobile Safari) at a CRF around 25-26, AAC audio at 128k. Always fall back to the original buffer if compression fails or doesn't actually shrink the file — a slightly larger upload beats a broken one.

Two easy-to-miss config requirements this depends on, both in `web/next.config.ts`:
- `serverExternalPackages: ["ffmpeg-static"]` — without this, Next.js bundles the package and its `__dirname`-based binary path resolution breaks (resolves to a bogus path, `spawn ENOENT`).
- `experimental.proxyClientMaxBodySize` — `proxy.ts`'s matcher covers nearly every route, and this Next.js version buffers every request body passing through it, silently truncating anything over the default 10MB with no error (the route handler just gets a corrupted partial body). Any new large-upload feature needs this raised to cover it.

If a manually-placed static asset (not uploaded through the app) needs to go in git despite `/public/videos/*` being gitignored by default, allowlist that one file explicitly in `.gitignore` (see the existing `!/public/videos/arthrosamid-patient-video.mp4` line) rather than removing the directory-level ignore — keep future dev-only video dumps out of git by default.

# Newsletter images — standing product requirement

AI-generated newsletter drafts and monthly digests must not include captions or labels for images. When writing newsletters in markdown, images should be inserted cleanly without captions. Both the ReactMarkdown renderer for archived newsletters (`web/app/newsletter/archive/[id]/page.tsx`) and the inline HTML converter (`web/lib/newsletterMarkdown.ts`) are configured to suppress captions and render images cleanly. Always adhere to this standard when editing or creating newsletter templates or generation features.

# Blog and Article images — standing product requirement

Images in blog posts and educational articles must not include captions or labels unless the image is a clinical or anatomical diagram (e.g., MRI scans, X-rays, anatomical illustrations, or medical device component diagrams). Standard patient photos, exercise demonstrations, and general consultation photos must not have any text captions associated with them.

# SEO — standing product requirement

Every blog and technical article the content pipeline produces must be SEO-maximized, not just clinically accurate — this is a locked-in product requirement, not a one-off tweak. If you touch blog/article generation, publishing, or the education pages, preserve all of the following (or improve on it — don't regress it):

- **Keyword targeting in the generation prompts**: `web/lib/blogWriterAgent.ts`'s system prompts (both `writeBlogDraft` and `writeTechnicalArticleDraft`) require the model to identify a primary search phrase for the topic and place it near the front of the title, naturally within the first 100 words, and in at least 2 section headers, plus 3-5 secondary/related phrases woven in naturally. Don't let this get diluted into vague "write good SEO" instructions — keep it concrete and checkable.
- **Heading hierarchy**: both prompts require `##` (H2) for section headers, not `###`. The page renders the article title as H1 (`app/education/[category]/[article]/page.tsx`), so H2 keeps a valid, non-skipping hierarchy. `UpdatedArticleBody`'s markdown-to-JSX mapping in that same file maps `h1`/`h2` markdown to `<h2>` and `h3` to `<h3>` — if you ever change the prompt's heading level, update that mapping to match, or the DOM hierarchy will skip a level again.
- **Meta description length**: the `EXCERPT:` output (used as the page's `<meta description>` and OG/Twitter description) must be 140-160 characters and include the primary search phrase — enforced by prompt instruction, not code, so if you rewrite the prompt keep this constraint explicit.
- **FAQ generation + FAQPage schema**: both writer prompts require 3-5 genuine FAQs (`FAQS:\nQ: ...\nA: ...` format, parsed by `parseFaqs()` in `blogWriterAgent.ts`), threaded through `BlogDraftVersion.faqs`/`article_faqs` in `web/lib/contentPipeline.ts`, written into the published `ArticleContent.faqs` by `publishBlogDraftToWebsite` in `web/lib/educationArticles.ts`, and rendered both as an on-page `FaqAccordion` and as `FAQPage` JSON-LD structured data in `app/education/[category]/[article]/page.tsx` (the schema condition is `data.faqs.length > 0`, not gated on whether the article has an "override" — AI content always has a synthetic override, so gating on that silently disables the schema for all AI content). The portal's `PipelineDraftTab.tsx` shows generated FAQs to the clinical reviewer before approval since they're patient-facing clinical claims like the rest of the draft.
- **Internal linking**: every article page renders a deterministic "Related Reading" section (same category, most recent, excludes the paired blog/technical counterpart) computed directly from real site data in `app/education/[category]/[article]/page.tsx` — never replace this with AI-chosen links/URLs, which risks a hallucinated or dead link slipping past review.
- **Image alt text**: the AI writer's own `[FEATURED IMAGE PLACEHOLDER: ...]` description is carried through as `ArticleContent.imageAlt` (set in `publishBlogDraftToWebsite`) and used as the banner image's real `alt` text, instead of falling back to the article title. Preserve this when touching the image pipeline.
- **Sitemap coverage**: `app/sitemap.ts` must include AI-published articles via `getDynamicArticles()`, not just the static entries in `data/articles.ts` — this is the easiest of all these to silently regress (e.g. if someone "simplifies" the sitemap back down to one source), and it means every newly-published article has zero proactive discovery signal to search engines until it's caught.

Social post SEO/discoverability (hashtags, keyword phrasing, per-platform tactics) is a separate, already-documented requirement — see "Social media content generation" above.


