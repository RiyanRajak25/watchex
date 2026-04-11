# WatchEX — Programmatic SEO TV Migration

To enable the Long-Tail Content Engine to support **TV Shows** alongside Movies natively, you need to add a `media_type` column to your tables to prevent ID collisions.

**Run this SQL in your Supabase Dashboard -> SQL Editor:**

```sql
-- 1. Add media_type to both tables
ALTER TABLE public.movie_cache ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'movie';
ALTER TABLE public.generated_articles ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'movie';

-- 2. Update Primary Key for movie_cache to be composite
ALTER TABLE public.movie_cache DROP CONSTRAINT IF EXISTS movie_cache_pkey CASCADE;
ALTER TABLE public.movie_cache ADD PRIMARY KEY (id, media_type);

-- 3. Update Foreign Key and Unique Constraints for generated_articles
ALTER TABLE public.generated_articles DROP CONSTRAINT IF EXISTS unique_movie_slug;
ALTER TABLE public.generated_articles 
  ADD CONSTRAINT generated_articles_media_fkey 
  FOREIGN KEY (movie_id, media_type) REFERENCES public.movie_cache(id, media_type) ON DELETE CASCADE;
  
ALTER TABLE public.generated_articles ADD CONSTRAINT unique_movie_slug UNIQUE(movie_id, media_type, article_slug);
```

> [!TIP]
> After running this, the API `pSEO-worker` cron job will seamlessly process TV shows globally, and you can visit TV articles locally via `/tv/[id]/ending-explained`!
