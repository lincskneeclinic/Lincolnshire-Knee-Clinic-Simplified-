-- Lincolnshire Knee Clinic (Simplified) — Operational Data Setup
-- Run this script in your Supabase SQL Editor (EU Frankfurt region), in the
-- SAME project as supabase_contacts_setup.sql / supabase_community_setup.sql.
--
-- Replaces the local web/data/*.json and web/data/intake-registry.csv files
-- previously used by internal /portal/business and /portal/clinician-intake
-- tooling. Those files do not persist reliably on serverless hosting
-- (ephemeral/read-only filesystem, concurrent-write races) — this moves that
-- state into Postgres instead. All access is via the server-role Supabase
-- client only (web/lib/supabase/admin.ts); these tables are never queried
-- with the anon/public key, so RLS here only needs to block the anon/
-- authenticated roles outright, not model per-user access.

-- ============================================================
-- 1. Generic key/value store for simple internal state
-- ============================================================
-- Used as a drop-in replacement for small JSON "files" that don't warrant
-- their own relational schema (dynamic patients/injections mock data,
-- newsletter topic/poll counters, event counters, content-pipeline run and
-- review state, clinical-review status). Each previous JSON file becomes one
-- row, keyed by its former filename.

CREATE TABLE IF NOT EXISTS app_kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_kv_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to app_kv_store"
  ON app_kv_store FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 2. Clinical review status (governance metadata shown on every
--    symptom/condition/treatment/injection page — reviewer name, GMC
--    number, last-reviewed date, evidence source). Real, valuable
--    governance data, so it gets a proper table with one row per page
--    rather than a JSON blob.
-- ============================================================

CREATE TABLE IF NOT EXISTS clinical_review_status (
  page_id TEXT PRIMARY KEY,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewer_name TEXT,
  reviewer_title TEXT,
  last_reviewed_date TEXT,
  evidence_source TEXT,
  reviewed_content_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinical_review_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to clinical_review_status"
  ON clinical_review_status FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 3. Patient intake registry (real clinical/PHI data — proper columns,
--    not a JSON blob, given its sensitivity)
-- ============================================================

CREATE TABLE IF NOT EXISTS intake_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  surgery TEXT,
  oxford_score TEXT,
  medications TEXT,
  allergies TEXT,
  medical_history TEXT,
  consent_signed BOOLEAN NOT NULL DEFAULT false,
  signature_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_registry_patient ON intake_registry(patient_id);

ALTER TABLE intake_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to intake_registry"
  ON intake_registry FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 4. Content field overrides — approved AI-suggested edits to individual
--    fields on symptom/condition/treatment/injection pages (from the
--    dashboard's Clinical Review "AI Content Review" panel). Field-level
--    (one row per page_id + field_name), so approving one suggested fix
--    doesn't disturb the rest of that page's static content. Read at
--    render time and merged on top of the static web/data/*.ts entry.
-- ============================================================

CREATE TABLE IF NOT EXISTS content_field_overrides (
  page_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (page_id, field_name)
);

ALTER TABLE content_field_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to content_field_overrides"
  ON content_field_overrides FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 5. Meta (Instagram + Facebook) post performance analytics.
--    meta_connected_accounts holds the Page/Instagram Business Account
--    access tokens obtained via the Facebook Login OAuth flow.
--    meta_post_links maps an internal pipeline/social-only post to the
--    real platform post a staff member manually published, via a pasted
--    permalink resolved to a real media/post ID.
--    meta_post_metrics stores timestamped snapshots (never overwritten in
--    place) so a future scheduled re-poll can build real trend history
--    without a schema change.
-- ============================================================

CREATE TABLE IF NOT EXISTS meta_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, account_id)
);

ALTER TABLE meta_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to meta_connected_accounts"
  ON meta_connected_accounts FOR ALL
  TO service_role
  USING (true);

CREATE TABLE IF NOT EXISTS meta_post_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('pipeline', 'social_only')),
  source_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  permalink TEXT NOT NULL,
  media_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id, platform)
);

ALTER TABLE meta_post_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to meta_post_links"
  ON meta_post_links FOR ALL
  TO service_role
  USING (true);

CREATE TABLE IF NOT EXISTS meta_post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  post_type TEXT NOT NULL DEFAULT 'feed',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reach INTEGER,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  engagement_rate NUMERIC,
  raw JSONB
);

CREATE INDEX IF NOT EXISTS idx_meta_post_metrics_media ON meta_post_metrics(media_id, fetched_at DESC);

ALTER TABLE meta_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to meta_post_metrics"
  ON meta_post_metrics FOR ALL
  TO service_role
  USING (true);
