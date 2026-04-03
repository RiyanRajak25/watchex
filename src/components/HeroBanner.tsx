import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

export default function HeroBanner({ media }: { media: any }) {
  if (!media) return null;
  const isTV = media.media_type === 'tv' || media.name;
  const href = `/${isTV ? 'tv' : 'movie'}/${media.id}`;
  const title = media.title || media.name || 'Unknown';
  
  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] flex items-end pb-12 overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {media.backdrop_path ? (
          <Image
            src={getImageUrl(media.backdrop_path, 'original')!}
            alt={title}
            fill
            priority
            className="object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>
      
      <div className="relative z-10 px-6 md:px-12 max-w-4xl flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm md:text-lg text-gray-200 line-clamp-3 md:line-clamp-4 max-w-2xl font-sans drop-shadow-md">
          {media.overview}
        </p>
        <div className="flex gap-4 mt-4">
          <Link href={href} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M8 5v14l11-7z"/></svg>
            Watch Now
          </Link>
        </div>
      </div>
    </div>
  );
}
