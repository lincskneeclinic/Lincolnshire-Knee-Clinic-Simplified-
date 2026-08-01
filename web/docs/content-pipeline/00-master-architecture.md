# Content Automation Pipeline: Master Architecture & Review System

This document specifies the database schemas, state transitions, decision models, API contracts, and email notification rules for the Lincolnshire Knee Clinic Content Automation Pipeline.

---

## 1. Supabase Database Schema

### `content_pipeline_runs` Table

```sql
CREATE TABLE IF NOT EXISTS content_pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT UNIQUE NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'researching',
    'writing_blog',
    'awaiting_blog_approval',
    'writing_social',
    'awaiting_social_approval',
    'published',
    'abandoned'
  )),
  research_brief JSONB,
  blog_drafts JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_drafts JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_urls JSONB,
  social_media_assets JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_runs_status ON content_pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_runs_created_at ON content_pipeline_runs(created_at DESC);
```

### `content_pipeline_reviews` Table

```sql
CREATE TABLE IF NOT EXISTS content_pipeline_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL REFERENCES content_pipeline_runs(run_id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('blog', 'social')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'edited', 'revision_requested')),
  edited_content JSONB,
  revision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_reviews_run_id ON content_pipeline_reviews(run_id);
```

---

## 2. State Machine Transitions

```
[Start Trigger / Manual Request]
             │
             ▼
      (researching)
             │
             ▼
      (writing_blog)
             │
             ▼
(awaiting_blog_approval) ──► Decision: revision_requested ──► (writing_blog)
             │
             ├─► Decision: approved OR edited
             ▼
     (writing_social)
             │
             ▼
(awaiting_social_approval) ──► Decision: revision_requested ──► (writing_social)
             │
             ├─► Decision: approved OR edited (All platforms approved)
             ▼
        (published)
```

### Status Descriptions
- `researching`: Gathering clinical evidence, PubMed citations, and patient search trends.
- `writing_blog`: AI Writer engine compiling the blog article draft.
- `awaiting_blog_approval`: Blog draft ready for clinician review.
- `writing_social`: Generating social media captions for Instagram, Facebook, and LinkedIn.
- `awaiting_social_approval`: Multi-platform social captions awaiting clinician approval.
- `published`: Blog article live on clinic site and social content finalized.
- `abandoned`: Run canceled or archived.

---

## 3. Review Decision Model & API Payload

### Review Request Payload: `POST /api/portal/content-pipeline/runs/:runId/review`

```ts
interface ReviewSubmissionPayload {
  stage: "blog" | "social";
  decision: "approved" | "edited" | "revision_requested";
  editedContent?: {
    // For blog stage
    title?: string;
    body?: string;
    excerpt?: string;
    suggestedImages?: string[];
    references?: string[];
    // For social stage
    instagram?: { caption: string; status?: "approved" | "pending" };
    facebook?: { caption: string; status?: "approved" | "pending" };
    linkedin?: { caption: string; status?: "approved" | "pending" };
  };
  revisionNotes?: string;
}
```

---

## 4. Email Notification Rules

When a run transitions into `awaiting_blog_approval` or `awaiting_social_approval`:
1. Dispatch an email notification via Microsoft Graph Mail API (`https://graph.microsoft.com/v1.0/me/sendMail`).
2. Recipient: Clinic Content Administrator (`admin@lincsknee.com`).
3. Message includes run topic, target review stage, flags (e.g. `[NEEDS CLINICAL REVIEW]`), and direct URL link to detail view:
   `/portal/business?tab=pipeline&runId={runId}`.

---

## 5. Security & Access Control

- All API routes under `/api/portal/content-pipeline/*` are protected by Supabase admin auth enforced via Next.js `middleware.ts`.
- No patient identifiable health data (PHI) is processed or stored in content pipeline tables.
