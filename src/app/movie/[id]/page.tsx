import { getDetails } from '@/lib/tmdb';
import { getImageUrl } from '@/lib/tmdb-utils';
import Image from 'next/image';
import Player from '@/components/Player';
import MediaCarousel from '@/components/MediaCarousel';
import WatchlistButton from '@/components/WatchlistButton';
import Comments from '@/components/Comments';
import CastCarousel from '@/components/CastCarousel';
import TrailerButton from '@/components/TrailerButton';
import StarRating from '@/components/StarRating';

export const dynamic = 'force-dynamic';

export default async function MovieDetails({ params }: { params: { id: string } }) {
  const media = await getDetails('movie', params.id);
  const title = media.title || media.name;
  const year = (media.release_date || '').split('-')[0];
  
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Backdrop */}
      <div className="w-full h-[40vh] md:h-[60vh] relative">
        {media.backdrop_path && <Image src={getImageUrl(media.backdrop_path, 'original')!} fill alt="Backdrop" className="object-cover opacity-30" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10 flex flex-col gap-8">
        {/* Info Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="hidden md:block w-[240px] flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-[2/3] relative">
           {media.poster_path && <Image src={getImageUrl(media.poster_path, 'w500')!} fill alt="Poster" className="object-cover" />}
          </div>
          <div className="flex flex-col gap-4 max-w-3xl justify-end pb-4 pt-16 md:pt-0">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">{title} <span className="text-gray-500 font-sans text-3xl font-normal">({year})</span></h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-300 items-center">
               {media.genres?.map((g: any) => <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full border border-white/5">{g.name}</span>)}
               <div className="flex flex-wrap gap-4 items-center">
                 <span className="px-3 py-1 text-accent border border-accent/20 bg-accent/10 rounded-full flex items-center gap-1.5 font-bold shadow-lg shadow-accent/10">
                   ★ {media.vote_average?.toFixed(1)} <span className="text-[10px] text-accent/50 opacity-60 font-medium">TMDB</span>
                 </span>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <StarRating mediaId={media.id} mediaType="movie" />
               </div>
               <span className="px-3 py-1 bg-white/10 rounded-full">{Math.floor(media.runtime / 60)}h {media.runtime % 60}m</span>
               <div className="flex flex-wrap gap-3 ml-2 items-center">
                 <WatchlistButton media={media} type="movie" />
                 <TrailerButton videos={media.videos?.results} />
               </div>
            </div>
            <p className="text-lg text-gray-300 md:mt-2">{media.overview}</p>
          </div>
        </div>

        {/* Player */}
        <div className="w-full max-w-5xl mx-auto mt-8">
           <h2 className="text-2xl font-subheading uppercase font-bold text-white mb-4">Watch Movie</h2>
           <Player tmdbId={media.id} type="movie" mediaDetails={media} />
        </div>

        {/* Cast */}
        {media.credits?.cast && media.credits.cast.length > 0 && (
          <div className="mt-8">
            <CastCarousel cast={media.credits.cast} />
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-12 -mx-4 md:mx-0">
          <MediaCarousel title="You Might Also Like" items={media.recommendations?.results || []} />
        </div>

        {/* Discussion */}
        <Comments mediaId={media.id} mediaType="movie" />
      </div>
    </main>
  );
}
