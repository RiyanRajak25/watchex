# WatchEX — History Table Migration

To resolve the "System Error" on the History page, you MUST run this SQL in your **Supabase Dashboard**.

1. Go to **Supabase Dashboard** -> **SQL Editor** -> **New Query**.
2. Paste the SQL below and click **Run**.

---

### SQL Migration

```sql
-- 1. Create the histories table
CREATE TABLE IF NOT EXISTS public.histories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id    INTEGER NOT NULL,
  media_type  TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title       TEXT NOT NULL,
  poster_path TEXT,
  season      INTEGER, -- Optional, for TV shows
  episode     INTEGER, -- Optional, for TV shows
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.histories ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies
CREATE POLICY "Users can read own history"
  ON public.histories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.histories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.histories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.histories FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create an index for performance
CREATE INDEX IF NOT EXISTS histories_user_id_idx ON public.histories (user_id);
```

---

> [!TIP]
> After running this, the History page on your Netlify site will start working immediately.
