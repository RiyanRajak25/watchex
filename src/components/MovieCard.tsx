'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb-utils'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

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
  const color = score >= 7.5 ? '#00E5FF' : score >= 6 ? '#FF5A00' : '#e81cff'
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  )
}

export default function MovieCard({ media }: { media: MediaProps }) {
  const isTV = media.media_type === 'tv' || (!media.media_type && media.name && !media.title);
  const href = `/${isTV ? 'tv' : 'movie'}/${media.id}`;
  const title = media.title || media.name || 'Unknown';
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = media.vote_average ?? 0;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useMotionTemplate`${mouseYSpring}deg`;
  const rotateY = useMotionTemplate`${mouseXSpring}deg`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate rotation (-15 to 15 degrees)
    const rX = ((e.clientY - rect.top) / height - 0.5) * -30;
    const rY = ((e.clientX - rect.left) / width - 0.5) * 30;
    
    x.set(rY);
    y.set(rX);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={href} className="group relative w-[160px] md:w-[220px] lg:w-[240px] flex-shrink-0 flex flex-col gap-3 outline-none" style={{ perspective: 1500 }}>
      <motion.div 
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#0a0a0e] shadow-lg transition-shadow duration-500 border border-white/5"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05, zIndex: 50, filter: 'drop-shadow(0 20px 30px rgba(0, 229, 255, 0.3))' }}
      >
        {media.poster_path ? (
          <Image
            src={getImageUrl(media.poster_path, 'w500')!}
            alt={title}
            fill
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 220px, 240px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/40 bg-zinc-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span className="text-sm font-semibold tracking-widest uppercase">No Image</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10" style={{ transform: "translateZ(30px)" }}>
          <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-sm shadow-xl backdrop-blur-md ${isTV ? 'bg-accent/80 text-white' : 'bg-primary/80 text-black'}`}>
            {isTV ? 'TV' : 'FILM'}
          </span>
          {rating > 0 && (
            <span className="text-xs font-black px-2.5 py-1 rounded-sm bg-black/80 backdrop-blur-md text-white flex items-center gap-1 shadow-xl">
              <svg viewBox="0 0 24 24" fill="#FF5A00" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Hover overlay with play icon & gradient slide-up */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 pb-5 gap-3 pointer-events-none" style={{ transform: "translateZ(40px)" }}>
          
          <div className="flex-1 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
            <div className="w-16 h-16 rounded-full glass border border-white/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,229,255,0.5)]">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>

          <div className="translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             {rating > 0 && <RatingBar score={rating} />}
             <div className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-300">
                Click to Details
             </div>
          </div>
        </div>
      </motion.div>

      {/* Info below */}
      <div className="px-1 mt-1 flex flex-col gap-1">
        <h3 className="text-base font-bold truncate text-white group-hover:text-primary transition-colors tracking-tight font-heading group-hover:drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">{title}</h3>
        <p className="text-sm font-medium text-gray-500 tracking-wider uppercase">{year || '—'}</p>
      </div>
    </Link>
  );
}
