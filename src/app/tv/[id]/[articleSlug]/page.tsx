import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getImageUrl } from '@/lib/tmdb-utils';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft } from 'lucide-react';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { InfiniteArticleFeed } from '@/components/InfiniteArticleFeed';
import { StickyPlayer } from '@/components/StickyPlayer';

export const revalidate = 86400; // ISR cache revalidation (daily)

interface PageProps {
  params: {
    id: string;
    articleSlug: string;
  };
}

// Ensure supabase client is created safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const mediaId = parseInt(params.id, 10);
  if (isNaN(mediaId)) return {};

  const { data: article } = await supabase
    .from('generated_articles')
    .select(`
      title,
      content,
      movie_cache!inner ( poster_path )
    `)
    .eq('movie_id', mediaId)
    .eq('media_type', 'tv')
    .eq('article_slug', params.articleSlug)
    .maybeSingle();

  if (!article) return {};

  return {
    title: `${article.title} | WatchEX`,
    description: article.content.substring(0, 160).replace(/#/g, '').trim() + '...',
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160).replace(/#/g, '').trim() + '...',
      // @ts-ignore
      images: article.movie_cache?.[0]?.poster_path ? [getImageUrl(article.movie_cache[0].poster_path, 'w500')!] : (article.movie_cache?.poster_path ? [getImageUrl(article.movie_cache.poster_path, 'w500')!] : []),
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function TVLongTailArticlePage({ params }: PageProps) {
  const mediaId = parseInt(params.id, 10);
  if (isNaN(mediaId)) notFound();

  const { data: article, error } = await supabase
    .from('generated_articles')
    .select(`
      title,
      content,
      created_at,
      movie_cache!inner ( title, release_year, poster_path, trailer_key )
    `)
    .eq('movie_id', mediaId)
    .eq('media_type', 'tv')
    .eq('article_slug', params.articleSlug)
    .maybeSingle();

  // @ts-ignore
  if (!article || !article.movie_cache || error) notFound();

  // @ts-ignore
  const movieCache = Array.isArray(article.movie_cache) ? article.movie_cache[0] : article.movie_cache;

  return (
    <main className="min-h-screen bg-background pb-20 pt-24">
      {/* Sticky Top/Scroll Player */}
      <StickyPlayer trailerKey={movieCache.trailer_key || null} movieTitle={movieCache.title} />

      {/* JSON-LD Structured Data */}
      <FaqSchema
        articleTitle={article.title}
        movieTitle={movieCache.title}
        content={article.content}
        slug={params.articleSlug}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'TV Shows', href: '/tv' },
        { name: movieCache.title, href: `/tv/${mediaId}` },
        { name: params.articleSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), href: `/tv/${mediaId}/${params.articleSlug}` },
      ]} />
      {/* Cinematic Hero Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[50vh] z-0">
        {movieCache.poster_path && (
          <Image 
            src={getImageUrl(movieCache.poster_path, 'original')!} 
            fill 
            alt="Backdrop" 
            className="object-cover opacity-20 sepia-[.2] blur-sm saturate-50" 
            priority 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link 
          href={`/tv/${mediaId}`} 
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 duration-200" />
          Back to {movieCache.title}
        </Link>
        
        <header className="mb-12">
          <div className="inline-block px-3 py-1 bg-accent/20 border border-accent/20 rounded-full text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            {params.articleSlug.replace(/-/g, ' ')}
          </div>
          <h1 className="text-3xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-400 text-sm">
            <span>TV Show: {movieCache.title} ({movieCache.release_year})</span>
            <span>•</span>
            <span>Published: {new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:text-white prose-a:text-accent prose-strong:text-white/90">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </article>
      </div>

      {/* Infinite Scroll Trap */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <InfiniteArticleFeed 
          movieId={mediaId} 
          mediaType="tv" 
          initialSlug={params.articleSlug} 
          movieTitle={movieCache.title} 
        />
      </div>
    </main>
  );
}
