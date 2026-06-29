-- =============================================================================
-- GetHumane — Complete Supabase Schema
-- Run this once against a fresh Supabase project.
-- Requires: pg_uuidv4, postgis extensions enabled in Supabase dashboard.
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- =============================================================================
-- TABLES
-- =============================================================================

-- ─── users ────────────────────────────────────────────────────────────────────
-- One row per auth.users entry. Created via Supabase trigger on signup.
create table if not exists public.users (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  email                 text        unique not null,
  full_name             text        not null default '',
  photo_url             text,
  role                  text        not null check (role in ('seeker', 'provider')) default 'seeker',
  bio                   text,
  city                  text,
  -- Geography: POINT(lng lat) — used by PostGIS proximity search
  location              geography(POINT, 4326),

  -- Trust & safety
  is_verified           boolean     not null default false,
  emergency_contact_phone text,

  -- Stripe Identity
  stripe_identity_session_id text,

  -- Provider Pro subscription
  stripe_customer_id    text,
  is_pro                boolean     not null default false,
  subscription_status   text,                                     -- 'trialing' | 'active' | 'past_due' | 'cancelled'
  subscription_end_at   timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ─── skills ───────────────────────────────────────────────────────────────────
create table if not exists public.skills (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  skill_name  text        not null,
  hourly_rate numeric     not null check (hourly_rate >= 0),
  description text,
  created_at  timestamptz not null default now()
);

create index if not exists skills_user_id_idx on public.skills(user_id);

-- ─── bookings ─────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                        uuid        primary key default uuid_generate_v4(),
  provider_id               uuid        not null references public.users(id) on delete cascade,
  seeker_id                 uuid        not null references public.users(id) on delete cascade,
  skill_id                  uuid        references public.skills(id) on delete set null,
  skill_name                text        not null,
  scheduled_at              timestamptz not null,
  duration_hours            numeric     not null check (duration_hours > 0),
  total_price               numeric     not null check (total_price >= 0),
  status                    text        not null default 'pending'
                              check (status in ('pending','confirmed','in_progress','completed','cancelled','disputed')),
  stripe_payment_intent_id  text,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint no_self_booking check (provider_id <> seeker_id)
);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create index if not exists bookings_provider_id_idx on public.bookings(provider_id);
create index if not exists bookings_seeker_id_idx   on public.bookings(seeker_id);
create index if not exists bookings_status_idx      on public.bookings(status);

-- ─── messages ─────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid        primary key default uuid_generate_v4(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  sender_id   uuid        not null references public.users(id) on delete cascade,
  content     text        not null check (length(content) > 0 and length(content) <= 2000),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists messages_booking_id_idx on public.messages(booking_id);
create index if not exists messages_sender_id_idx  on public.messages(sender_id);

-- ─── reviews ──────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id            uuid        primary key default uuid_generate_v4(),
  booking_id    uuid        not null references public.bookings(id) on delete cascade,
  reviewer_id   uuid        not null references public.users(id) on delete cascade,
  reviewee_id   uuid        not null references public.users(id) on delete cascade,
  rating        integer     not null check (rating between 1 and 5),
  comment       text        check (length(comment) <= 1000),
  created_at    timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

create index if not exists reviews_reviewee_id_idx on public.reviews(reviewee_id);
create index if not exists reviews_reviewer_id_idx on public.reviews(reviewer_id);

-- ─── reports ──────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id               uuid        primary key default uuid_generate_v4(),
  reporter_id      uuid        not null references public.users(id) on delete cascade,
  reported_user_id uuid        not null references public.users(id) on delete cascade,
  booking_id       uuid        references public.bookings(id) on delete set null,
  reason           text        not null check (length(reason) > 0 and length(reason) <= 1000),
  created_at       timestamptz not null default now(),
  unique (reporter_id, reported_user_id)
);

-- ─── disputes ─────────────────────────────────────────────────────────────────
create table if not exists public.disputes (
  id             uuid        primary key default uuid_generate_v4(),
  booking_id     uuid        not null references public.bookings(id) on delete cascade,
  opened_by      uuid        not null references public.users(id) on delete cascade,
  reason         text        not null check (reason in ('no_show','payment_issue','unsafe_behavior','quality','other')),
  evidence_text  text        check (length(evidence_text) <= 2000),
  status         text        not null default 'open' check (status in ('open','resolved','closed')),
  resolved_by    uuid        references public.users(id),
  resolved_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists disputes_booking_id_idx on public.disputes(booking_id);
create index if not exists disputes_status_idx     on public.disputes(status);

-- ─── checkins ─────────────────────────────────────────────────────────────────
-- Both parties must check in before a session is marked in_progress.
create table if not exists public.checkins (
  id          uuid        primary key default uuid_generate_v4(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  user_id     uuid        not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (booking_id, user_id)
);

create index if not exists checkins_booking_id_idx on public.checkins(booking_id);

-- ─── panic_events ─────────────────────────────────────────────────────────────
-- Logs every panic button press for safety team audit trail.
create table if not exists public.panic_events (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  booking_id  uuid        references public.bookings(id) on delete set null,
  location    geography(POINT, 4326),
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists panic_events_user_id_idx on public.panic_events(user_id);

-- ─── recurring_sessions ───────────────────────────────────────────────────────
create table if not exists public.recurring_sessions (
  id              uuid        primary key default uuid_generate_v4(),
  provider_id     uuid        not null references public.users(id) on delete cascade,
  seeker_id       uuid        not null references public.users(id) on delete cascade,
  skill_id        uuid        references public.skills(id) on delete set null,
  skill_name      text        not null,
  frequency       text        not null check (frequency in ('weekly','biweekly','monthly')),
  day_of_week     integer     check (day_of_week between 0 and 6),  -- 0=Sun, 6=Sat
  time_of_day     time        not null,
  duration_hours  numeric     not null check (duration_hours > 0),
  hourly_rate     numeric     not null check (hourly_rate >= 0),
  next_occurrence date        not null,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists recurring_provider_id_idx on public.recurring_sessions(provider_id);
create index if not exists recurring_seeker_id_idx   on public.recurring_sessions(seeker_id);

-- ─── waitlist ─────────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id         uuid        primary key default uuid_generate_v4(),
  email      text        unique not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- PostGIS: providers_within_radius RPC
-- Returns providers within `radius_km` of a given lat/lng.
-- Usage: supabase.rpc('providers_within_radius', { lat, lng, radius_km })
-- =============================================================================
create or replace function public.providers_within_radius(
  lat       float8,
  lng       float8,
  radius_km float8 default 25
)
returns table (
  id          uuid,
  full_name   text,
  photo_url   text,
  city        text,
  bio         text,
  is_verified boolean,
  is_pro      boolean,
  distance_km float8
)
language sql stable as $$
  select
    u.id,
    u.full_name,
    u.photo_url,
    u.city,
    u.bio,
    u.is_verified,
    u.is_pro,
    round((st_distance(
      u.location,
      st_point(lng, lat)::geography
    ) / 1000.0)::numeric, 2)::float8 as distance_km
  from public.users u
  where
    u.role = 'provider'
    and u.location is not null
    and st_dwithin(
      u.location,
      st_point(lng, lat)::geography,
      radius_km * 1000
    )
  order by distance_km;
$$;

-- Index on location for PostGIS proximity queries
create index if not exists users_location_idx
  on public.users using gist(location);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.users               enable row level security;
alter table public.skills              enable row level security;
alter table public.bookings            enable row level security;
alter table public.messages            enable row level security;
alter table public.reviews             enable row level security;
alter table public.reports             enable row level security;
alter table public.disputes            enable row level security;
alter table public.checkins            enable row level security;
alter table public.panic_events        enable row level security;
alter table public.recurring_sessions  enable row level security;
alter table public.waitlist            enable row level security;

-- ─── users ────────────────────────────────────────────────────────────────────
create policy "Public profiles are viewable by anyone"
  on public.users for select using (true);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);

-- ─── skills ───────────────────────────────────────────────────────────────────
create policy "Skills are public"
  on public.skills for select using (true);

create policy "Providers manage their own skills"
  on public.skills for all using (auth.uid() = user_id);

-- ─── bookings ─────────────────────────────────────────────────────────────────
create policy "Booking parties can view their bookings"
  on public.bookings for select
  using (auth.uid() = provider_id or auth.uid() = seeker_id);

create policy "Seekers can create bookings"
  on public.bookings for insert with check (auth.uid() = seeker_id);

create policy "Booking parties can update their bookings"
  on public.bookings for update
  using (auth.uid() = provider_id or auth.uid() = seeker_id);

-- ─── messages ─────────────────────────────────────────────────────────────────
create policy "Booking parties can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

create policy "Booking parties can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

create policy "Booking parties can mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

-- ─── reviews ──────────────────────────────────────────────────────────────────
create policy "Reviews are public"
  on public.reviews for select using (true);

create policy "Authenticated users can write reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- ─── reports ──────────────────────────────────────────────────────────────────
create policy "Users can submit reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

create policy "Users can view their own reports"
  on public.reports for select using (auth.uid() = reporter_id);

-- ─── disputes ─────────────────────────────────────────────────────────────────
create policy "Booking parties can open disputes"
  on public.disputes for insert with check (
    auth.uid() = opened_by
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

create policy "Booking parties can view disputes"
  on public.disputes for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

-- ─── checkins ─────────────────────────────────────────────────────────────────
create policy "Booking parties can check in"
  on public.checkins for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

create policy "Booking parties can view checkins"
  on public.checkins for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.provider_id = auth.uid() or b.seeker_id = auth.uid())
    )
  );

-- ─── panic_events ─────────────────────────────────────────────────────────────
create policy "Users can log their own panic events"
  on public.panic_events for insert with check (auth.uid() = user_id);

create policy "Users can view their own panic events"
  on public.panic_events for select using (auth.uid() = user_id);

-- ─── recurring_sessions ───────────────────────────────────────────────────────
create policy "Parties can view recurring sessions"
  on public.recurring_sessions for select
  using (auth.uid() = provider_id or auth.uid() = seeker_id);

create policy "Providers can create recurring sessions"
  on public.recurring_sessions for insert with check (auth.uid() = provider_id);

create policy "Providers can update recurring sessions"
  on public.recurring_sessions for update using (auth.uid() = provider_id);

-- ─── waitlist ─────────────────────────────────────────────────────────────────
create policy "Anyone can join the waitlist"
  on public.waitlist for insert with check (true);

-- =============================================================================
-- TRIGGER: auto-create user row on auth.users signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, photo_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- REALTIME: enable on tables needed for live features
-- =============================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.checkins;
