import { getDetails } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb-utils";
import Image from 'next/image';
import Player from '@/components/Player';
import MediaCarousel from '@/components/MediaCarousel';
import WatchlistButton from '@/components/WatchlistButton';
import Comments from '@/components/Comments';
import CastCarousel from '@/components/CastCarousel';
import TrailerButton from '@/components/TrailerButton';
import StarRating from '@/components/StarRating';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TVDetails({ params }: { params: { id: string } }) {
  const media = await getDetails('tv', params.id);
  const title = media.name;
  const year = (media.first_air_date || '').split('-')[0];
  const runtime = media.episode_run_time?.[0] || 0;

  // Fetch pSEO articles for this tv show
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  const { data: generatedArticles } = await supabase
    .from('generated_articles')
    .select('title, article_slug')
    .eq('movie_id', parseInt(params.id, 10))
    .eq('media_type', 'tv');
  
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="w-full h-[40vh] md:h-[60vh] relative">
        {media.backdrop_path && <Image src={getImageUrl(media.backdrop_path, 'original')!} fill alt="Backdrop" className="object-cover opacity-30" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="hidden md:block w-[240px] flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-[2/3] relative">
           {media.poster_path && <Image src={getImageUrl(media.poster_path, 'w500')!} fill alt="Poster" className="object-cover" />}
          </div>
          <div className="flex flex-col gap-4 max-w-3xl justify-end pb-4 pt-16 md:pt-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold text-white">{title} <span className="text-gray-500 font-sans text-2xl md:text-3xl font-normal">({year})</span></h1>
            
            {runtime > 0 && (
              <div className="text-sm font-semibold text-accent/90 mb-1 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Ends around {new Date(Date.now() + runtime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (per episode)
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-300 items-center">
               {media.genres?.map((g: any) => <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full border border-white/5">{g.name}</span>)}
               <div className="flex flex-wrap gap-4 items-center ml-2">
                 <span className="px-3 py-1 text-accent border border-accent/20 bg-accent/10 rounded-full flex items-center gap-1.5 font-bold shadow-lg shadow-accent/10">
                   ★ {media.vote_average?.toFixed(1)}
                 </span>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <StarRating mediaId={media.id} mediaType="tv" />
               </div>
               <span className="px-3 py-1 bg-white/10 rounded-full ml-2">{media.number_of_seasons} Seasons • {media.number_of_episodes} Episodes</span>
               <div className="flex flex-wrap gap-3 ml-2 items-center">
                 <WatchlistButton media={media} type="tv" />
                 <TrailerButton videos={media.videos?.results} />
               </div>
            </div>
            <p className="text-lg text-gray-300 md:mt-2">{media.overview}</p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          {/* Left Column (Player, Cast, Recommendations) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Player */}
            <div className="w-full">
               <h2 className="text-2xl font-subheading uppercase font-bold text-white mb-4">Watch TV Show</h2>
               <Player tmdbId={media.id} type="tv" season={1} episode={1} mediaDetails={media} />
            </div>

            {/* Cast */}
            {media.credits?.cast && media.credits.cast.length > 0 && (
              <div>
                <CastCarousel cast={media.credits.cast} />
              </div>
            )}

            {/* Recommendations */}
            <div className="-mx-4 md:mx-0">
              <MediaCarousel title="You Might Also Like" items={media.recommendations?.results || []} />
            </div>
            
            {/* pSEO Internal Linking Mesh */}
            <div className="flex flex-col gap-6">
              {/* Generated Article Links */}
              {generatedArticles && generatedArticles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedArticles.map((article) => (
                    <Link 
                      key={article.article_slug}
                      href={`/tv/${params.id}/${article.article_slug}`}
                      className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
                    >
                      <div className="text-xs text-accent uppercase font-semibold tracking-wider mb-2">
                        {article.article_slug.replace(/-/g, ' ')}
                      </div>
                      <h4 className="text-white font-heading font-bold group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Discussion */}
            <Comments mediaId={media.id} mediaType="tv" />
          </div>

          {/* Right Sidebar (Technical Details) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass border border-white/10 shadow-2xl flex flex-col gap-6 sticky top-24">
              <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4">Details</h3>
              
              {media.status && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                  <p className="text-sm text-white font-medium">{media.status}</p>
                </div>
              )}
              
              {media.first_air_date && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">First Aired</p>
                  <p className="text-sm text-white font-medium">{new Date(media.first_air_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
              
              {media.original_language && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Original Language</p>
                  <p className="text-sm text-white font-medium uppercase">{media.original_language}</p>
                </div>
              )}

              {media.networks && media.networks.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Network</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {media.networks.slice(0, 3).map((network: any) => (
                      <span key={network.id} className="text-xs px-2 py-1 bg-white/5 rounded-md border border-white/5 text-gray-300">
                        {network.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {media.production_companies && media.production_companies.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Production</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {media.production_companies.slice(0, 3).map((company: any) => (
                      <span key={company.id} className="text-xs px-2 py-1 bg-white/5 rounded-md border border-white/5 text-gray-300">
                        {company.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
