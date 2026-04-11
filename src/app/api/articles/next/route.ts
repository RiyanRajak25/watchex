import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS on generated_articles if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');
  const mediaType = searchParams.get('mediaType') || 'movie';
  const excludeSlug = searchParams.get('excludeSlug');

  if (!movieId || !excludeSlug) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const { data: articles, error } = await supabase
      .from('generated_articles')
      .select('article_slug, title, content, created_at')
      .eq('movie_id', movieId)
      .eq('media_type', mediaType)
      .neq('article_slug', excludeSlug)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ article: null });
    }

    // Pick a random next article to encourage different reading paths
    const randomIndex = Math.floor(Math.random() * articles.length);
    const nextArticle = articles[randomIndex];

    return NextResponse.json({ article: nextArticle });
  } catch (err: any) {
    console.error('[API Next Article] Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
