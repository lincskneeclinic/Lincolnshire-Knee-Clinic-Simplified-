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
