# WatchEX — Programmatic SEO (pSEO) Tables Migration

To enable the Long-Tail Content Engine to store AI-generated articles via Supabase instead of Prisma, you MUST run this SQL in your **Supabase Dashboard**.

1. Go to **Supabase Dashboard** -> **SQL Editor** -> **New Query**.
2. Paste the SQL below and click **Run**.

---

### SQL Migration

```sql
-- 1. Create MovieCache table
CREATE TABLE IF NOT EXISTS public.movie_cache (
  id           INTEGER PRIMARY KEY, -- TMDB ID
  title        TEXT NOT NULL,
  overview     TEXT,
  release_year TEXT,
  poster_path  TEXT,
  processed    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create GeneratedArticle table
CREATE TABLE IF NOT EXISTS public.generated_articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id     INTEGER NOT NULL REFERENCES public.movie_cache(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT   unique_movie_slug UNIQUE(movie_id, article_slug)
);

-- 3. Create LongTailQuery table
CREATE TABLE IF NOT EXISTS public.long_tail_queries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query        TEXT NOT NULL UNIQUE,
  volume       INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Set RLS (Optional, since these are public to read)
ALTER TABLE public.movie_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the cached/generated content
CREATE POLICY "Public read access for movie cache"
  ON public.movie_cache FOR SELECT USING (true);

CREATE POLICY "Public read access for generated articles"
  ON public.generated_articles FOR SELECT USING (true);
  
-- Note: Inserts and Updates are handled securely via the backend cron job
-- using the Supabase Service Role Key, which auto-bypasses RLS.
```

---

> [!TIP]
> After running this, the Cron worker and Dynamic Article Pages will function seamlessly natively on Supabase.
