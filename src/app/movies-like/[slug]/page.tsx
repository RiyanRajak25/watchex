import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getDetails } from '@/lib/tmdb';
import { getImageUrl } from '@/lib/tmdb-utils';
import { VelocityGrid } from '@/components/VelocityGrid';
import { KineticReveal } from '@/components/KineticTypography';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 86400; // ISR cache revalidation (daily)

interface PageProps {
  params: {
    slug: string; // Acts as tmdb movie id
  };
}

// Ensure supabase client is created safely for server-side ISR fetches
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Using Anon key for read-only public routes
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Dynamically queries TMDB for the specific movie's recommendations to ensure 
 * overlapping genres/themes, yielding high relevancy "Movies Like" data.
 */
async function getSimilarMovies(movieId: string) {
  const media = await getDetails('movie', movieId);
  if (!media || !media.recommendations || !media.recommendations.results) {
    return [];
  }
  
  // Randomly shuffle to keep the generated ISR page highly dynamic across rebuilds
  const shuffled = media.recommendations.results.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}

function parseMovieId(slug: string): number | null {
  const match = slug.match(/(\d+)$/);
  const id = match ? parseInt(match[1], 10) : parseInt(slug, 10);
  return isNaN(id) ? null : id;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const movieId = parseMovieId(params.slug);
  if (!movieId) return {};

  const media = await getDetails('movie', movieId.toString());
  if (!media || !media.title) return {};

  const currentYear = new Date().getFullYear();
  const genres = media.genres?.map((g: any) => g.name).join(' and ') || 'similar';

  return {
    title: `10 Incredible Movies Like ${media.title} to Watch in ${currentYear}`,
    description: `Discover the best ${genres} movies like ${media.title}. Dive into our hand-picked cinematic recommendations full of shared themes, plus ending explanations and fan theories.`,
    openGraph: {
      title: `10 Incredible Movies Like ${media.title} to Watch in ${currentYear}`,
      images: media.poster_path ? [getImageUrl(media.poster_path, 'w500')!] : [],
    },
  };
}

export async function generateStaticParams() {
  return []; // Dynamic on-demand ISR build
}

export default async function MoviesLikePage({ params }: PageProps) {
  const movieId = parseMovieId(params.slug);
  if (!movieId) notFound();

  // 1. Fetch Primary Movie Architecture
  const media = await getDetails('movie', movieId.toString());
  if (!media || !media.title) notFound();

  // 2. Fetch Relational "Similar" Movies dynamically
  const similarMoviesRaw = await getSimilarMovies(movieId.toString());
  
  // Map to VelocityGrid component Props structure 
  // (Assuming global GSAP Flip click handling triggers off the wrapped layout id/href)
  const similarMoviesList = similarMoviesRaw
    .filter((m: any) => m.poster_path) // Ensure premium UI stability
    .map((m: any) => ({
      id: m.id,
      src: getImageUrl(m.poster_path, 'w500')!,
      title: m.title,
      href: `/movie/${m.id}`
    }));

  // 3. Fetch any LLM generated PSEO expansion articles from Supabase directly linked to the origin movie
  const { data: generatedArticles } = await supabase
    .from('generated_articles')
    .select('title, content, article_slug')
    .eq('movie_id', movieId)
    .eq('media_type', 'movie');

  // ItemList schema for the recommendations grid
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Movies Like ${media.title}`,
    description: `Curated list of movies similar to ${media.title}`,
    numberOfItems: similarMoviesList.length,
    itemListElement: similarMoviesList.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: m.src,
        url: m.href,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-24 overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Movies', href: '/discover' },
        { name: media.title, href: `/movie/${movieId}` },
        { name: `Movies Like ${media.title}`, href: `/movies-like/${params.slug}` },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      
      {/* Background Hero Depth */}
      <div className="fixed top-0 left-0 w-full h-[60vh] z-0 pointer-events-none">
        {media.backdrop_path && (
          <img 
            src={getImageUrl(media.backdrop_path, 'original')!} 
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-10 sepia-[.3] blur-xl saturate-150 transform scale-110" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Navigation & Context */}
        <Link 
          href={`/movie/${movieId}`} 
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 duration-200" />
          Back to {media.title}
        </Link>
        
        {/* Premium Kinetic Header */}
        <header className="mb-12">
          <div className="inline-block px-3 py-1 bg-accent/20 border border-accent/20 rounded-full text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            Curated Cinematic Recommendations
          </div>
          <KineticReveal 
            element="h1"
            text={`Movies Like ${media.title}`}
            className="text-5xl md:text-7xl font-heading font-black text-white mb-6 leading-tight"
          />
          <p className="text-xl text-gray-400 max-w-2xl font-light">
            If you loved the {media.genres?.[0]?.name ? media.genres[0].name.toLowerCase() : 'atmosphere'} elements 
            of <span className="text-white font-medium">{media.title}</span>, these critically-acclaimed films 
            share its DNA, themes, and emotional gravity.
          </p>
        </header>
      </div>

      {/* GSAP Driven Interactive Grid (Bounce Rate Killer) */}
      <div className="relative z-10 -mt-16 w-full">
        <VelocityGrid items={similarMoviesList} />
      </div>

      {/* Supplemental LLM Programmatic Content Stack - Masonry Structure */}
      {generatedArticles && generatedArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 relative z-10 columns-1 md:columns-2 gap-12">
          {generatedArticles.map((article) => (
             <section key={article.article_slug} className="break-inside-avoid mb-16 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
               <KineticReveal 
                 element="h2"
                 text={article.title}
                 className="text-3xl font-heading font-bold text-white mb-8"
               />
               <article className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:text-white/90 prose-a:text-accent prose-strong:text-white">
                 <ReactMarkdown>
                   {article.content}
                 </ReactMarkdown>
               </article>
             </section>
          ))}
        </div>
      )}

    </main>
  );
}
