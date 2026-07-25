-- Lincolnshire Knee Clinic (Simplified) — Supabase Database Setup
-- Run this script in your Supabase SQL Editor (EU Frankfurt region)

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile_number TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT true,
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_source TEXT NOT NULL DEFAULT 'newsletter-signup-component',
  primary_interest TEXT DEFAULT 'General Joint Health',
  topics JSONB DEFAULT '[]'::jsonb,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on email for fast subscriber lookup
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public insert policy for web form submissions
CREATE POLICY "Allow public insert to contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access"
  ON contacts
  FOR ALL
  USING (true);
