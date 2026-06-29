-- ─────────────────────────────────────────────────────────────────────────────
-- migration_messages.sql
-- Run this once in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Fully idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the messages table (safe if it already exists)
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS messages_booking_id_idx ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx  ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- 3. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies (idempotent — wrapped in DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'messages'
      AND policyname = 'Booking parties can read messages'
  ) THEN
    EXECUTE '
      CREATE POLICY "Booking parties can read messages"
        ON public.messages FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND (b.provider_id = auth.uid() OR b.seeker_id = auth.uid())
          )
        )
    ';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'messages'
      AND policyname = 'Booking parties can send messages'
  ) THEN
    EXECUTE '
      CREATE POLICY "Booking parties can send messages"
        ON public.messages FOR INSERT
        WITH CHECK (
          auth.uid() = sender_id
          AND EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND (b.provider_id = auth.uid() OR b.seeker_id = auth.uid())
              AND b.status != ''cancelled''
          )
        )
    ';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'messages'
      AND policyname = 'Booking parties can mark messages read'
  ) THEN
    EXECUTE '
      CREATE POLICY "Booking parties can mark messages read"
        ON public.messages FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND (b.provider_id = auth.uid() OR b.seeker_id = auth.uid())
          )
        )
    ';
  END IF;
END $$;

-- 5. Add to Supabase Realtime publication (so the chat updates live)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname   = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Skill categories reference table
--    Stores every real-world skill category so the browse page and AI match
--    engine have a canonical list to work from.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id          SERIAL      PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL,
  emoji       TEXT        NOT NULL DEFAULT '⭐',
  group_name  TEXT        NOT NULL DEFAULT 'General',
  keywords    TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed all categories (idempotent via ON CONFLICT DO NOTHING)
INSERT INTO public.skill_categories (slug, label, emoji, group_name, keywords) VALUES
  -- Food & Drink
  ('cooking',            'Cooking',              '🍳', 'Food & Drink',        ARRAY['cook','cuisine','recipe','chef','food']),
  ('baking',             'Baking & Pastry',      '🎂', 'Food & Drink',        ARRAY['bak','pastry','bread','cake','dessert']),
  ('nutrition',          'Nutrition',            '🥗', 'Food & Drink',        ARRAY['nutrition','meal','diet','health']),
  ('bartending',         'Bartending',           '🍹', 'Food & Drink',        ARRAY['bartend','cocktail','mixology','drink']),

  -- Fitness & Movement
  ('fitness',            'Fitness & Training',   '💪', 'Fitness & Movement',  ARRAY['fitness','workout','training','gym','strength']),
  ('yoga-pilates',       'Yoga & Pilates',       '🧘', 'Fitness & Movement',  ARRAY['yoga','pilates','stretch','flexibility']),
  ('dance',              'Dance',                '💃', 'Fitness & Movement',  ARRAY['dance','salsa','ballet','hip hop','tango','ballroom']),
  ('martial-arts',       'Martial Arts',         '🥋', 'Fitness & Movement',  ARRAY['martial','karate','judo','boxing','jiu-jitsu','mma','self-defense','taekwondo']),
  ('sports',             'Sports Coaching',      '⚽', 'Fitness & Movement',  ARRAY['sport','tennis','football','basketball','soccer','cricket','golf','swim','run','cycling','volleyball','badminton']),

  -- Wellness & Mind
  ('meditation',         'Meditation',           '🌿', 'Wellness & Mind',     ARRAY['meditat','mindfulness','breathing','relaxation','stress']),
  ('life-coaching',      'Life Coaching',        '🌟', 'Wellness & Mind',     ARRAY['life coach','mindset','goal','motivation','personal development']),
  ('massage',            'Massage & Bodywork',   '💆', 'Wellness & Mind',     ARRAY['massage','bodywork','reflexology','reiki','acupressure']),
  ('mental-wellness',    'Mental Wellness',      '🧠', 'Wellness & Mind',     ARRAY['mental','anxiety','coping','journaling','emotional']),

  -- Creative Arts
  ('music',              'Music',                '🎸', 'Creative Arts',       ARRAY['music','guitar','piano','drum','sing','violin','bass','ukulele','flute','trumpet','saxophone']),
  ('painting-drawing',   'Painting & Drawing',   '🎨', 'Creative Arts',       ARRAY['paint','draw','sketch','watercolour','oil','acrylic','charcoal','canvas']),
  ('photography',        'Photography & Video',  '📷', 'Creative Arts',       ARRAY['photo','camera','portrait','landscape','lightroom','editing','video','film']),
  ('arts-crafts',        'Arts & Crafts',        '✂️', 'Creative Arts',       ARRAY['craft','knit','crochet','pottery','ceramics','jewellery','jewelry','origami','scrapbook','embroidery']),
  ('writing-poetry',     'Writing & Poetry',     '✍️', 'Creative Arts',       ARRAY['writ','poetry','creative writ','storytelling','journal','blog','copywriting']),
  ('fashion-styling',    'Fashion & Styling',    '👗', 'Creative Arts',       ARRAY['fashion','style','sewing','tailor','cloth','wardrobe']),

  -- Home & Trades
  ('home-repair',        'Home Repair & DIY',    '🔨', 'Home & Trades',       ARRAY['repair','fix','handyman','diy','home','maintenance']),
  ('carpentry',          'Carpentry & Woodwork', '🪵', 'Home & Trades',       ARRAY['carpent','woodwork','furniture','cabinet','joiner']),
  ('gardening',          'Gardening & Plants',   '🌱', 'Home & Trades',       ARRAY['garden','plant','landscape','lawn','pruning','flower','vegetable']),
  ('sewing-textiles',    'Sewing & Textiles',    '🧵', 'Home & Trades',       ARRAY['sew','tailor','alter','quilt','textile','fabric']),
  ('automotive',         'Automotive Care',      '🚗', 'Home & Trades',       ARRAY['car','auto','mechanic','vehicle','driving','bike','motorcycle']),
  ('cleaning-organising','Cleaning & Organising','🏠', 'Home & Trades',       ARRAY['clean','organis','organiz','tidy','declutter']),
  ('painting-deco',      'Painting & Decorating','🖌️', 'Home & Trades',      ARRAY['paint','decor','wallpaper','interior','exterior']),
  ('plumbing',           'Plumbing Basics',      '🔧', 'Home & Trades',       ARRAY['plumb','pipe','tap','water','drain']),
  ('electrical',         'Electrical Basics',    '⚡', 'Home & Trades',       ARRAY['electric','wiring','socket','light','switch']),

  -- Education & Learning
  ('tutoring',           'Academic Tutoring',    '📚', 'Education',           ARRAY['tutor','school','homework','study','maths','math','science','english','history']),
  ('languages',          'Language Teaching',    '🌍', 'Education',           ARRAY['language','english','spanish','french','arabic','chinese','hindi','german','italian','japanese','portuguese','russian','teach']),
  ('test-prep',          'Test & Exam Prep',     '📝', 'Education',           ARRAY['exam','test','sat','ielts','toefl','gcse','a-level','prep']),
  ('chess',              'Chess & Strategy',     '♟️', 'Education',           ARRAY['chess','strategy','board game','logic','puzzle']),
  ('kids-activities',    'Kids Activities',      '🧒', 'Education',           ARRAY['kids','children','child','play','lego','story','drawing for kids']),
  ('sign-language',      'Sign Language',        '🤟', 'Education',           ARRAY['sign language','asl','bsl','deaf','hearing']),

  -- Business & Career
  ('business-coaching',  'Business Coaching',    '💼', 'Business & Career',   ARRAY['business','entrepreneur','startup','coach','consulting','strategy']),
  ('finance',            'Finance & Budgeting',  '💰', 'Business & Career',   ARRAY['finance','budget','account','invest','money','tax','bookkeeping']),
  ('public-speaking',    'Public Speaking',      '🎤', 'Business & Career',   ARRAY['speak','presentation','toastmaster','communication','debate','confidence']),
  ('resume-interview',   'Resume & Interview',   '📄', 'Business & Career',   ARRAY['resume','cv','interview','career','job','linkedin','hire']),
  ('marketing',          'Marketing & Branding', '📣', 'Business & Career',   ARRAY['marketing','brand','campaign','content','ads','growth']),

  -- Technology
  ('coding',             'Coding & Programming', '💻', 'Technology',          ARRAY['code','coding','program','develop','python','javascript','web','app','software']),
  ('design-digital',     'Digital Design',       '🖌️', 'Technology',          ARRAY['design','ui','ux','graphic','figma','canva','illustrator','photoshop','brand']),
  ('digital-marketing',  'Digital Marketing',    '📱', 'Technology',          ARRAY['marketing','social media','seo','content','ads','instagram','tiktok','youtube']),
  ('data-analysis',      'Data & Analytics',     '📊', 'Technology',          ARRAY['data','analysis','excel','sql','tableau','statistics']),
  ('it-support',         'IT Support',           '🖥️', 'Technology',          ARRAY['it','computer','windows','mac','network','wifi','tech support']),

  -- Culture & Heritage
  ('traditional-crafts', 'Traditional Crafts',   '🏺', 'Culture & Heritage',  ARRAY['traditional','heritage','folk','cultural','weaving','pottery','craft']),
  ('astrology-tarot',    'Astrology & Tarot',    '🔮', 'Culture & Heritage',  ARRAY['astrology','tarot','horoscope','spiritual','crystal','numerology']),
  ('cultural-cooking',   'Cultural & Heritage Cooking','🥘','Culture & Heritage',ARRAY['traditional food','heritage recipe','cultural','ethnic','regional']),

  -- Family & Parenting
  ('parenting',          'Parenting Support',    '👶', 'Family',              ARRAY['parenting','baby','toddler','newborn','parent','childcare']),
  ('family-fitness',     'Family Fitness',       '🏃', 'Family',              ARRAY['family','kids fitness','outdoor','hiking','bike']),

  -- Other
  ('pet-care',           'Pet Care & Training',  '🐾', 'Other',               ARRAY['pet','dog','cat','train','animal','groom']),
  ('photography-phone',  'Mobile Photography',   '📸', 'Other',               ARRAY['mobile photo','iphone photo','smartphone camera','instagram']),
  ('other',              'Other Skills',         '⭐', 'Other',               ARRAY[])
ON CONFLICT (slug) DO NOTHING;

-- Allow anyone to read skill categories (no auth needed)
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'skill_categories'
      AND policyname = 'Skill categories are public'
  ) THEN
    EXECUTE 'CREATE POLICY "Skill categories are public" ON public.skill_categories FOR SELECT USING (true)';
  END IF;
END $$;

-- Done.
SELECT 'messages table + ' || COUNT(*)::text || ' skill categories ready ✓' AS status
FROM public.skill_categories;
