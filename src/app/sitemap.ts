import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://watchex.com';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tv`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Dynamically generated LLM Articles from Supabase
    const { data: articles } = await supabase
      .from('generated_articles')
      .select('movie_id, media_type, article_slug, updated_at')
      .order('updated_at', { ascending: false });

    if (!articles) return routes;

    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/${article.media_type || 'movie'}/${article.movie_id}/${article.article_slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Generate movie/tv item links alongside article paths
    const mediaItemRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
       url: `${baseUrl}/${article.media_type || 'movie'}/${article.movie_id}`,
       lastModified: new Date(article.updated_at),
       changeFrequency: 'weekly',
       priority: 0.9,
    }));

    // Remove duplicates in base routes using Set on JSON
    const uniqueMediaUrls = Array.from(new Set(mediaItemRoutes.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));

    // "Movies Like" landing pages — one per unique movie in cache
    const { data: cachedMovies } = await supabase
      .from('movie_cache')
      .select('id, media_type, updated_at')
      .eq('media_type', 'movie');

    const moviesLikeRoutes: MetadataRoute.Sitemap = (cachedMovies || []).map((m) => ({
      url: `${baseUrl}/movies-like/${m.id}`,
      lastModified: new Date(m.updated_at),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

    return [...routes, ...uniqueMediaUrls, ...articleRoutes, ...moviesLikeRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return routes; // Fallback
  }
}
