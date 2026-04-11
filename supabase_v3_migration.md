-- Phase 4: Supabase Migration Script
-- Run this in the Supabase SQL Editor to support the Smart Indexing Queue and PiP Video Player

-- 1. Create the indexing tracking table to manage Google Indexing API quotas
CREATE TABLE IF NOT EXISTS public.indexing_tracking (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    push_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect indexing tracking with Row Level Security (RLS)
ALTER TABLE public.indexing_tracking ENABLE ROW LEVEL SECURITY;

-- Allow read access for anon (optional, technically only the backend needs this)
CREATE POLICY "Allow public read access on indexing_tracking" 
ON public.indexing_tracking FOR SELECT USING (true);

-- Allow all operations for Service Role (backend pushing updates)
CREATE POLICY "Allow service role all access on indexing_tracking"
ON public.indexing_tracking FOR ALL USING (auth.role() = 'service_role');


-- 2. Add trailer_key to movie_cache to support Sticky PiP Player without extra API calls
ALTER TABLE public.movie_cache 
ADD COLUMN IF NOT EXISTS trailer_key TEXT;
