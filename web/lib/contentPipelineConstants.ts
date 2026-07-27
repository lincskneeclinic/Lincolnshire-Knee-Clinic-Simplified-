// Shared constants safe to import from both server code and client components.
// Keep this file free of server-only imports (fs, path, etc.) — page.tsx (a
// client component) imports from here directly.

// Minimum blog article body length (chars) required to approve a draft. Real
// generated articles run into the thousands of characters; this only exists to
// catch empty/placeholder submissions before they get approved and published.
export const MIN_BLOG_BODY_LENGTH = 200;
