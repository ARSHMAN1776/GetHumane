-- ============================================================
-- GetHumane Feature Migration — run after base schema
-- ============================================================

-- Referral codes on users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code   TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_balance  NUMERIC(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS checkr_candidate_id     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'not_started';
-- background_check_status: not_started | pending | clear | consider | suspended

-- ── Referrals ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending', -- pending | converted
  credit_amount  NUMERIC(10,2) DEFAULT 10,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referee_id)
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- ── Group Sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  skill_name     TEXT NOT NULL,
  description    TEXT,
  date_time      TIMESTAMPTZ NOT NULL,
  location       TEXT NOT NULL,
  max_capacity   INT NOT NULL DEFAULT 8,
  price_per_seat NUMERIC(10,2) NOT NULL,
  is_public      BOOLEAN DEFAULT true,
  status         TEXT NOT NULL DEFAULT 'upcoming', -- upcoming | completed | cancelled
  created_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sessions visible to all" ON group_sessions
  FOR SELECT USING (is_public = true OR auth.uid() = provider_id);
CREATE POLICY "Providers manage own sessions" ON group_sessions
  FOR ALL USING (auth.uid() = provider_id);

-- ── Group Enrollments ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES group_sessions(id) ON DELETE CASCADE,
  seeker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats       INT NOT NULL DEFAULT 1,
  total_paid  NUMERIC(10,2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, seeker_id)
);
ALTER TABLE group_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrolled users see own enrollments" ON group_enrollments
  FOR SELECT USING (auth.uid() = seeker_id);
CREATE POLICY "Provider sees their session enrollments" ON group_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_sessions WHERE id = session_id AND provider_id = auth.uid())
  );

-- ── Push Subscriptions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT,
  auth       TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subs" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ── Increment helper for credit_balance ────────────────────────────────────
CREATE OR REPLACE FUNCTION increment(x NUMERIC, user_id UUID)
RETURNS NUMERIC AS $$
  SELECT credit_balance + x FROM users WHERE id = user_id;
$$ LANGUAGE sql STABLE;
