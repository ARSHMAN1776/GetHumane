-- ─────────────────────────────────────────────────────────────────────────────
-- migration_skill_categories.sql
-- Run in Supabase SQL Editor → New query → Run
-- Fully idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create skill_categories table
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id          SERIAL      PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL,
  emoji       TEXT        NOT NULL DEFAULT '⭐',
  group_name  TEXT        NOT NULL DEFAULT 'General',
  keywords    TEXT[]      NOT NULL DEFAULT '{}',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS — anyone can read, only service_role can write
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'skill_categories'
      AND policyname = 'Skill categories are public'
  ) THEN
    EXECUTE 'CREATE POLICY "Skill categories are public"
      ON public.skill_categories FOR SELECT USING (true)';
  END IF;
END $$;

-- 3. Seed all 52 categories (ON CONFLICT DO NOTHING = safe to re-run)
INSERT INTO public.skill_categories (slug, label, emoji, group_name, sort_order, keywords) VALUES

  -- ── Food & Drink ──────────────────────────────────────────────────────
  ('cooking',             'Cooking',               '🍳', 'Food & Drink',        10, ARRAY['cook','cuisine','recipe','chef','food']),
  ('baking',              'Baking & Pastry',       '🎂', 'Food & Drink',        11, ARRAY['bak','pastry','bread','cake','dessert']),
  ('nutrition',           'Nutrition',             '🥗', 'Food & Drink',        12, ARRAY['nutrition','meal','diet','health']),
  ('bartending',          'Bartending',            '🍹', 'Food & Drink',        13, ARRAY['bartend','cocktail','mixology','drink']),

  -- ── Fitness & Movement ────────────────────────────────────────────────
  ('fitness',             'Fitness & Training',    '💪', 'Fitness & Movement',  20, ARRAY['fitness','workout','training','gym','strength']),
  ('yoga-pilates',        'Yoga & Pilates',        '🧘', 'Fitness & Movement',  21, ARRAY['yoga','pilates','stretch','flexibility']),
  ('dance',               'Dance',                 '💃', 'Fitness & Movement',  22, ARRAY['dance','salsa','ballet','hip hop','tango','ballroom']),
  ('martial-arts',        'Martial Arts',          '🥋', 'Fitness & Movement',  23, ARRAY['martial','karate','judo','boxing','jiu-jitsu','mma','self-defense','taekwondo']),
  ('sports',              'Sports Coaching',       '⚽', 'Fitness & Movement',  24, ARRAY['sport','tennis','football','basketball','soccer','cricket','golf','swim','run','cycling','volleyball','badminton']),

  -- ── Wellness & Mind ───────────────────────────────────────────────────
  ('meditation',          'Meditation',            '🌿', 'Wellness & Mind',     30, ARRAY['meditat','mindfulness','breathing','relaxation','stress']),
  ('life-coaching',       'Life Coaching',         '🌟', 'Wellness & Mind',     31, ARRAY['life coach','mindset','goal','motivation','personal development']),
  ('massage',             'Massage & Bodywork',    '💆', 'Wellness & Mind',     32, ARRAY['massage','bodywork','reflexology','reiki','acupressure']),
  ('mental-wellness',     'Mental Wellness',       '🧠', 'Wellness & Mind',     33, ARRAY['mental','anxiety','coping','journaling','emotional']),

  -- ── Creative Arts ─────────────────────────────────────────────────────
  ('music',               'Music',                 '🎸', 'Creative Arts',       40, ARRAY['music','guitar','piano','drum','sing','violin','bass','ukulele','flute','trumpet','saxophone']),
  ('painting-drawing',    'Painting & Drawing',    '🎨', 'Creative Arts',       41, ARRAY['paint','draw','sketch','watercolour','watercolor','oil','acrylic','charcoal','canvas']),
  ('photography',         'Photography & Video',   '📷', 'Creative Arts',       42, ARRAY['photo','camera','portrait','landscape','lightroom','editing','video','film']),
  ('arts-crafts',         'Arts & Crafts',         '✂️', 'Creative Arts',       43, ARRAY['craft','knit','crochet','pottery','ceramics','jewellery','jewelry','origami','scrapbook','embroidery']),
  ('writing-poetry',      'Writing & Poetry',      '✍️', 'Creative Arts',       44, ARRAY['writ','poetry','creative writ','storytelling','journal','blog','copywriting']),
  ('fashion-styling',     'Fashion & Styling',     '👗', 'Creative Arts',       45, ARRAY['fashion','style','sewing','tailor','cloth','wardrobe']),

  -- ── Home & Trades ─────────────────────────────────────────────────────
  ('home-repair',         'Home Repair & DIY',     '🔨', 'Home & Trades',       50, ARRAY['repair','fix','handyman','diy','home','maintenance']),
  ('carpentry',           'Carpentry & Woodwork',  '🪵', 'Home & Trades',       51, ARRAY['carpent','woodwork','furniture','cabinet','joiner']),
  ('gardening',           'Gardening & Plants',    '🌱', 'Home & Trades',       52, ARRAY['garden','plant','landscape','lawn','pruning','flower','vegetable']),
  ('sewing-textiles',     'Sewing & Textiles',     '🧵', 'Home & Trades',       53, ARRAY['sew','tailor','alter','quilt','textile','fabric']),
  ('automotive',          'Automotive Care',        '🚗', 'Home & Trades',       54, ARRAY['car','auto','mechanic','vehicle','driving','bike','motorcycle']),
  ('cleaning-organising', 'Cleaning & Organising', '🏠', 'Home & Trades',       55, ARRAY['clean','organis','organiz','tidy','declutter']),
  ('painting-deco',       'Painting & Decorating', '🖌️', 'Home & Trades',       56, ARRAY['paint','decor','wallpaper','interior','exterior']),
  ('plumbing',            'Plumbing Basics',        '🔧', 'Home & Trades',       57, ARRAY['plumb','pipe','tap','water','drain']),
  ('electrical',          'Electrical Basics',      '⚡', 'Home & Trades',       58, ARRAY['electric','wiring','socket','light','switch']),

  -- ── Education ─────────────────────────────────────────────────────────
  ('tutoring',            'Academic Tutoring',      '📚', 'Education',           60, ARRAY['tutor','school','homework','study','maths','math','science','english','history']),
  ('languages',           'Language Teaching',      '🌍', 'Education',           61, ARRAY['language','english','spanish','french','arabic','chinese','hindi','german','italian','japanese','portuguese','russian','teach']),
  ('test-prep',           'Test & Exam Prep',       '📝', 'Education',           62, ARRAY['exam','test','sat','ielts','toefl','gcse','a-level','prep']),
  ('chess',               'Chess & Strategy',       '♟️', 'Education',           63, ARRAY['chess','strategy','board game','logic','puzzle']),
  ('kids-activities',     'Kids Activities',        '🧒', 'Education',           64, ARRAY['kids','children','child','play','lego','story']),
  ('sign-language',       'Sign Language',          '🤟', 'Education',           65, ARRAY['sign language','asl','bsl','deaf','hearing']),

  -- ── Business & Career ─────────────────────────────────────────────────
  ('business-coaching',   'Business Coaching',      '💼', 'Business & Career',   70, ARRAY['business','entrepreneur','startup','coach','consulting','strategy']),
  ('finance',             'Finance & Budgeting',    '💰', 'Business & Career',   71, ARRAY['finance','budget','account','invest','money','tax','bookkeeping']),
  ('public-speaking',     'Public Speaking',        '🎤', 'Business & Career',   72, ARRAY['speak','presentation','toastmaster','communication','debate','confidence']),
  ('resume-interview',    'Resume & Interview',     '📄', 'Business & Career',   73, ARRAY['resume','cv','interview','career','job','linkedin','hire']),
  ('marketing',           'Marketing & Branding',   '📣', 'Business & Career',   74, ARRAY['marketing','brand','campaign','content','ads','growth']),

  -- ── Technology ────────────────────────────────────────────────────────
  ('coding',              'Coding & Programming',   '💻', 'Technology',          80, ARRAY['code','coding','program','develop','python','javascript','web','app','software']),
  ('design-digital',      'Digital Design',         '🖌️', 'Technology',          81, ARRAY['design','ui','ux','graphic','figma','canva','illustrator','photoshop','brand']),
  ('digital-marketing',   'Digital Marketing',      '📱', 'Technology',          82, ARRAY['marketing','social media','seo','content','ads','instagram','tiktok','youtube']),
  ('data-analysis',       'Data & Analytics',       '📊', 'Technology',          83, ARRAY['data','analysis','excel','sql','tableau','statistics']),
  ('it-support',          'IT Support',             '🖥️', 'Technology',          84, ARRAY['it','computer','windows','mac','network','wifi','tech support']),

  -- ── Culture & Heritage ────────────────────────────────────────────────
  ('traditional-crafts',  'Traditional Crafts',     '🏺', 'Culture & Heritage',  90, ARRAY['traditional','heritage','folk','cultural','weaving','pottery','craft']),
  ('astrology-tarot',     'Astrology & Tarot',      '🔮', 'Culture & Heritage',  91, ARRAY['astrology','tarot','horoscope','spiritual','crystal','numerology']),
  ('cultural-cooking',    'Heritage Cooking',       '🥘', 'Culture & Heritage',  92, ARRAY['traditional food','heritage recipe','cultural','ethnic','regional']),

  -- ── Family ────────────────────────────────────────────────────────────
  ('parenting',           'Parenting Support',      '👶', 'Family',              100, ARRAY['parenting','baby','toddler','newborn','parent','childcare']),
  ('family-fitness',      'Family Fitness',         '🏃', 'Family',              101, ARRAY['family','kids fitness','outdoor','hiking','bike']),

  -- ── Other ─────────────────────────────────────────────────────────────
  ('pet-care',            'Pet Care & Training',    '🐾', 'Other',               110, ARRAY['pet','dog','cat','train','animal','groom']),
  ('mobile-photography',  'Mobile Photography',     '📸', 'Other',               111, ARRAY['mobile photo','iphone photo','smartphone camera','instagram']),
  ('other',               'Other Skills',           '⭐', 'Other',               999, ARRAY[]::text[])

ON CONFLICT (slug) DO NOTHING;

-- 4. Verify
SELECT group_name, COUNT(*) AS categories
FROM public.skill_categories
GROUP BY group_name
ORDER BY MIN(sort_order);
