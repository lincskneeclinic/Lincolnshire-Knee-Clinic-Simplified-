-- Lincolnshire Knee Clinic (Simplified) — Community Discussion Setup
-- Run this script in your Supabase SQL Editor (EU Frankfurt region), in the
-- SAME project as supabase_contacts_setup.sql, AFTER Supabase Auth (Email
-- provider) has been enabled for the project.
--
-- This adds patient Community discussion rooms/posts/replies/reports on top
-- of Supabase's built-in `auth.users` table. It is a separate, non-clinical
-- feature from the future secure Patient Portal described in
-- docs/sitemap.md §5 (appointments/documents/PROMs), which must remain
-- invite-only. Community accounts are open self-registration because no
-- clinical records are stored here — only discussion text under a
-- member-chosen display name.

-- ============================================================
-- 1. Profiles (one row per Supabase Auth user who joins Community)
-- ============================================================

CREATE TABLE IF NOT EXISTS community_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  newsletter_opt_in BOOLEAN NOT NULL DEFAULT false,
  disclaimer_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_community_profiles_display_name_lower
  ON community_profiles (lower(display_name));

-- Public-safe view: other members may only ever see a display name, never
-- the real email/identity behind it. Admin moderation reads the base table
-- directly via the service-role key (bypasses RLS), so it still sees everything.
CREATE OR REPLACE VIEW community_profiles_public AS
  SELECT user_id, display_name
  FROM community_profiles
  WHERE status <> 'banned';

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read their own profile"
  ON community_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can insert their own profile"
  ON community_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their own profile"
  ON community_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to profiles"
  ON community_profiles FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 2. Rooms (discussion topics/categories)
-- ============================================================

CREATE TABLE IF NOT EXISTS community_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE community_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active rooms"
  ON community_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access to rooms"
  ON community_rooms FOR ALL
  TO service_role
  USING (true);

INSERT INTO community_rooms (slug, name, description, sort_order) VALUES
  ('introductions', 'Introductions & General Chat', 'New here? Say hello and get to know other members of the community.', 1),
  ('osteoarthritis-joint-health', 'Osteoarthritis & Joint Health', 'Living with knee arthritis — day-to-day experiences, coping strategies and questions.', 2),
  ('sports-injuries-acl-ligament', 'Sports Injuries & ACL/Ligament Recovery', 'ACL and other ligament injuries, sports-related knee problems and rehab experiences.', 3),
  ('meniscus-cartilage', 'Meniscus & Cartilage Injuries', 'Meniscal tears, cartilage damage and related recovery discussion.', 4),
  ('knee-replacement-surgery', 'Knee Replacement & Surgery', 'Partial, total and revision knee replacement — preparing for and recovering from surgery.', 5),
  ('injections-non-surgical', 'Injections & Non-Surgical Treatments', 'Cortisone, hyaluronic acid, PRP, Arthrosamid and other non-surgical options.', 6),
  ('recovery-rehab-exercise', 'Recovery, Rehab & Exercise', 'Exercises, physiotherapy and returning to everyday activity, work or sport.', 7),
  ('living-well-knee-pain', 'Living Well with Knee Pain', 'General wellbeing, pacing, mobility aids and day-to-day life with ongoing knee pain.', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. Posts
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES community_rooms(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'deleted')),
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_room ON community_posts(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read visible posts or their own"
  ON community_posts FOR SELECT
  USING (status = 'visible' OR author_id = auth.uid());

CREATE POLICY "Active members can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Authors can soft-delete their own visible posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id AND status = 'visible')
  WITH CHECK (auth.uid() = author_id AND status = 'deleted');

CREATE POLICY "Service role full access to posts"
  ON community_posts FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 4. Replies
-- ============================================================

CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'deleted')),
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_replies_post ON community_replies(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON community_replies(author_id);

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read visible replies or their own"
  ON community_replies FOR SELECT
  USING (status = 'visible' OR author_id = auth.uid());

CREATE POLICY "Active members can create replies"
  ON community_replies FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Authors can soft-delete their own visible replies"
  ON community_replies FOR UPDATE
  USING (auth.uid() = author_id AND status = 'visible')
  WITH CHECK (auth.uid() = author_id AND status = 'deleted');

CREATE POLICY "Service role full access to replies"
  ON community_replies FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 5. Reports (member-flagged content, reviewed by clinic admins)
-- ============================================================

CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'actioned', 'dismissed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status, created_at DESC);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can create reports"
  ON community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Members can read their own reports"
  ON community_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Service role full access to reports"
  ON community_reports FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- 6. Business dashboard admin access
-- ============================================================
-- The /portal/business dashboard is protected by Supabase Auth. After creating
-- the dashboard admin user in Supabase Auth, run the block below with the real
-- admin email address. This creates/updates the matching community_profiles row
-- and grants dashboard access via is_admin = true.
--
-- DO $$
-- DECLARE
--   admin_user_id UUID;
-- BEGIN
--   SELECT id INTO admin_user_id
--   FROM auth.users
--   WHERE email = 'admin@example.com';
--
--   IF admin_user_id IS NULL THEN
--     RAISE EXCEPTION 'No Supabase Auth user found for the dashboard admin email';
--   END IF;
--
--   INSERT INTO community_profiles (
--     user_id,
--     display_name,
--     newsletter_opt_in,
--     disclaimer_accepted_at,
--     is_admin,
--     status
--   )
--   VALUES (
--     admin_user_id,
--     'Clinic Admin',
--     false,
--     now(),
--     true,
--     'active'
--   )
--   ON CONFLICT (user_id) DO UPDATE
--   SET is_admin = true,
--       status = 'active';
-- END $$;
