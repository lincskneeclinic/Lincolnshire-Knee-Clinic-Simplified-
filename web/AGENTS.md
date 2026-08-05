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

# Video uploads — standing product requirement

Any video the app accepts (currently `web/app/api/portal/content-pipeline/upload-video/route.ts`, used for Reel uploads) must be compressed before it's stored or deployed — never store/ship a raw video file as-is. This came from a real incident: the Arthrosamid patient video was manually placed in `public/videos/` at 117MB, was gitignored so it never actually deployed at all, and even if it had, would have been far too large for reasonable delivery.

The pattern to follow (see `upload-video/route.ts`'s `compressVideo` for the reference implementation): re-encode with `ffmpeg-static` (already a dependency) using H.264 Baseline profile + `-movflags +faststart` (required for reliable progressive playback on mobile Safari) at a CRF around 25-26, AAC audio at 128k. Always fall back to the original buffer if compression fails or doesn't actually shrink the file — a slightly larger upload beats a broken one.

Two easy-to-miss config requirements this depends on, both in `web/next.config.ts`:
- `serverExternalPackages: ["ffmpeg-static"]` — without this, Next.js bundles the package and its `__dirname`-based binary path resolution breaks (resolves to a bogus path, `spawn ENOENT`).
- `experimental.proxyClientMaxBodySize` — `proxy.ts`'s matcher covers nearly every route, and this Next.js version buffers every request body passing through it, silently truncating anything over the default 10MB with no error (the route handler just gets a corrupted partial body). Any new large-upload feature needs this raised to cover it.

If a manually-placed static asset (not uploaded through the app) needs to go in git despite `/public/videos/*` being gitignored by default, allowlist that one file explicitly in `.gitignore` (see the existing `!/public/videos/arthrosamid-patient-video.mp4` line) rather than removing the directory-level ignore — keep future dev-only video dumps out of git by default.

# Newsletter images — standing product requirement

AI-generated newsletter drafts and monthly digests must not include captions or labels for images. When writing newsletters in markdown, images should be inserted cleanly without captions. Both the ReactMarkdown renderer for archived newsletters (`web/app/newsletter/archive/[id]/page.tsx`) and the inline HTML converter (`web/lib/newsletterMarkdown.ts`) are configured to suppress captions and render images cleanly. Always adhere to this standard when editing or creating newsletter templates or generation features.

