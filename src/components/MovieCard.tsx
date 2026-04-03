import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';

interface MediaProps {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

export default function MovieCard({ media }: { media: MediaProps }) {
  const isTV = media.media_type === 'tv' || media.name;
  const href = `/${isTV ? 'tv' : 'movie'}/${media.id}`;
  const title = media.title || media.name || 'Unknown';
  const year = (media.release_date || media.first_air_date || '').split('-')[0];

  return (
    <Link href={href} className="group relative w-[140px] md:w-[180px] lg:w-[220px] flex-shrink-0 flex flex-col gap-2 transition-transform hover:scale-105">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-light border border-white/5">
        {media.poster_path ? (
          <Image
            src={getImageUrl(media.poster_path, 'w342')!}
            alt={title}
            fill
            sizes="(max-width: 768px) 140px, (max-width: 1024px) 180px, 220px"
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</div>
        )}
        {media.vote_average ? (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-accent flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {media.vote_average.toFixed(1)}
          </div>
        ) : null}
      </div>
      <div>
        <h3 className="text-sm md:text-base font-semibold truncate text-white">{title}</h3>
        <p className="text-xs text-gray-400">{year} • {isTV ? 'TV' : 'Movie'}</p>
      </div>
    </Link>
  );
}
