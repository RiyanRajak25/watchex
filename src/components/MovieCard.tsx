import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb-utils'

interface MediaProps {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  overview?: string;
}

function RatingBar({ score }: { score: number }) {
  const pct = Math.min((score / 10) * 100, 100)
  const color = score >= 7.5 ? '#00D4FF' : score >= 6 ? '#C9A84C' : '#e81cff'
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function MovieCard({ media }: { media: MediaProps }) {
  const isTV = media.media_type === 'tv' || (!media.media_type && media.name && !media.title);
  const href = `/${isTV ? 'tv' : 'movie'}/${media.id}`;
  const title = media.title || media.name || 'Unknown';
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = media.vote_average ?? 0;

  return (
    <Link href={href} className="group relative w-[140px] md:w-[180px] lg:w-[200px] flex-shrink-0 flex flex-col gap-2">
      {/* Poster container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#141414] border border-white/5 shadow-md transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/30">
        
        {media.poster_path ? (
          <Image
            src={getImageUrl(media.poster_path, 'w342')!}
            alt={title}
            fill
            sizes="(max-width: 768px) 140px, (max-width: 1024px) 180px, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Type pill */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${isTV ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
            {isTV ? 'TV' : 'FILM'}
          </span>
          {/* Rating badge */}
          {rating > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-accent flex items-center gap-0.5">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 gap-2">
          {rating > 0 && <RatingBar score={rating} />}
          <button className="w-full py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 mt-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>
            Watch Now
          </button>
        </div>
      </div>

      {/* Info below */}
      <div className="px-0.5">
        <h3 className="text-sm font-semibold truncate text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-gray-500">{year || '—'}</p>
      </div>
    </Link>
  );
}
