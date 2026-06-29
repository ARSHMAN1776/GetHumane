-- ─────────────────────────────────────────────────────────────────────────────
-- migration_portfolio.sql
-- Run in Supabase SQL Editor → New query → Run
-- ALSO: Go to Supabase Dashboard → Storage → New bucket
--       Name: "portfolio"  |  Public: YES  |  then click Create
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  caption     TEXT        CHECK (length(caption) <= 150),
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_user_id_idx ON public.portfolio_items(user_id);

-- 2. Google Calendar columns on users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_refresh_token   TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_id     TEXT,
  ADD COLUMN IF NOT EXISTS calendar_sync_enabled  BOOLEAN NOT NULL DEFAULT false;

-- 3. RLS on portfolio_items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_items' AND policyname='Portfolio items are public') THEN
    EXECUTE 'CREATE POLICY "Portfolio items are public" ON public.portfolio_items FOR SELECT USING (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_items' AND policyname='Providers manage own portfolio') THEN
    EXECUTE 'CREATE POLICY "Providers manage own portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

SELECT 'portfolio_items table + google calendar columns ready ✓' AS status;
