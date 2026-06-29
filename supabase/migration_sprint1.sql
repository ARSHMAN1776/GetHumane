-- ============================================================
-- GetHumane Sprint 1 Migration  (self-contained, idempotent)
-- Run in Supabase SQL editor
-- ============================================================

-- ── Disputes table (create if schema.sql was not run) ──────
CREATE TABLE IF NOT EXISTS public.disputes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  opened_by      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason         TEXT        NOT NULL CHECK (reason IN ('no_show','payment_issue','unsafe_behavior','quality','other')),
  evidence_text  TEXT        CHECK (length(evidence_text) <= 2000),
  status         TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','closed')),
  resolved_by    UUID        REFERENCES public.users(id),
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS disputes_booking_id_idx ON public.disputes(booking_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx     ON public.disputes(status);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- ── Disputes: add resolution columns ──────────────────────
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS refund_issued   BOOLEAN DEFAULT false;

-- ── Disputes: RLS policies (skip if already exist) ────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'disputes'
      AND policyname = 'Booking parties can open disputes'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Booking parties can open disputes"
        ON public.disputes FOR INSERT
        WITH CHECK (
          auth.uid() = opened_by AND
          EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND (b.provider_id = auth.uid() OR b.seeker_id = auth.uid())
          )
        )
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'disputes'
      AND policyname = 'Booking parties can view disputes'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Booking parties can view disputes"
        ON public.disputes FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND (b.provider_id = auth.uid() OR b.seeker_id = auth.uid())
          )
        )
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'disputes'
      AND policyname = 'Admins can resolve disputes'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can resolve disputes" ON public.disputes FOR UPDATE USING (true)';
  END IF;
END $$;

-- ── Provider Availability ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.availability (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week  INT     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME    NOT NULL DEFAULT '09:00',
  end_time     TIME    NOT NULL DEFAULT '18:00',
  is_available BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability'
      AND policyname = 'Anyone can view provider availability'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view provider availability" ON public.availability FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability'
      AND policyname = 'Providers manage own availability'
  ) THEN
    EXECUTE 'CREATE POLICY "Providers manage own availability" ON public.availability FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Enable realtime (safe to run even if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
