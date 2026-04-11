'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '@/lib/tmdb-utils';
import { PrimaryButton } from '@/components/TactileUI';
import { KineticReveal, MagneticWrapper, CodedInteractionButton } from '@/components/KineticTypography';
import { AnimatedPlayIcon } from '@/components/Phase2Layouts';

export default function HeroBanner({ items }: { items: any[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setActive(i => (i + 1) % items.length), [items.length])
  const prev = useCallback(() => setActive(i => (i - 1 + items.length) % items.length), [items.length])

  // Auto-rotate every 7s
  useEffect(() => {
    if (paused || items.length <= 1) return
    const id = setInterval(next, 7000)
    return () => clearInterval(id)
  }, [next, paused, items.length])

  if (!items || items.length === 0) return null

  const media = items[active]
  if (!media) return null

  const isTV = media.media_type === 'tv' || (!media.title && media.name)
  const href = `/${isTV ? 'tv' : 'movie'}/${media.id}`
  const title = media.title || media.name || 'Unknown'
  const year = (media.release_date || media.first_air_date || '').split('-')[0]
  const rating = media.vote_average ?? 0

  return (
    <div
      className="relative w-full h-[85vh] md:h-[95vh] flex items-end overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Media with Crossfade */}
      {items.map((item, idx) => {
        const trailer = item?.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        const showVideo = idx === active && trailer && !paused;

        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {showVideo ? (
              <div className="absolute inset-0 w-full h-full scale-125 md:scale-150 pointer-events-none origin-center">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&rel=0&showinfo=0`}
                  className="w-full h-[120%] -mt-[10%] object-cover opacity-60"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : item.backdrop_path ? (
              <Image
                src={getImageUrl(item.backdrop_path, 'original')!}
                alt={item.title || item.name}
                fill
                priority={idx === 0}
                className="object-cover opacity-70"
              />
            ) : null}
          </div>
        );
      })}

      {/* Extreme Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/80 pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 px-6 md:px-16 pb-20 max-w-6xl flex flex-col gap-6 w-full animate-fade-up pointer-events-none">
        {/* Type pill */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className={`text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border shadow-lg ${isTV ? 'text-accent border-accent/50 bg-accent/10 shadow-accent/20' : 'text-primary border-primary/50 bg-primary/10 shadow-primary/20'}`}>
            {isTV ? '📺 TV Show' : '🎬 Movie'}
          </span>
          {year && <span className="text-sm font-semibold text-gray-400 tracking-wider">{year}</span>}
          {rating > 0 && (
            <span className="text-sm font-black text-white flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
              <svg viewBox="0 0 24 24" fill="#FF5A00" className="w-4 h-4 drop-shadow-[0_0_8px_rgba(255,90,0,0.8)]"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <KineticReveal 
          text={title} 
          className="text-5xl md:text-7xl lg:text-8xl font-black font-serif text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-[1.1] max-w-4xl tracking-tight pointer-events-auto"
        />

        <p className="text-base md:text-lg text-gray-300/90 line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed font-sans drop-shadow-lg mix-blend-screen pointer-events-auto">
          {media.overview}
        </p>

        {/* Genres */}
        {media.genre_ids && media.genre_ids.length > 0 && (
          <div className="flex flex-wrap gap-2 pointer-events-auto">
            {media.genre_ids.slice(0, 4).map((gid: number) => (
              <span key={gid} className="text-xs font-bold tracking-widest uppercase text-white/70 px-3 py-1 rounded-sm bg-white/5 border border-white/10 shadow-inner font-sans">
                {GENRE_MAP[gid] || gid}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-6 flex-wrap relative pointer-events-auto">
          <MagneticWrapper>
            <PrimaryButton onClick={() => window.location.href = href} className="gap-2 px-8 py-4 flex items-center shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] font-sans group">
              <AnimatedPlayIcon />
              Watch Trailer
            </PrimaryButton>
          </MagneticWrapper>
          
          <MagneticWrapper>
            <CodedInteractionButton onClick={() => window.location.href = href} className="font-sans font-medium text-sm gap-2 uppercase tracking-widest">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Explore
            </CodedInteractionButton>
          </MagneticWrapper>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-8 right-8 z-50 flex gap-2 pointer-events-auto">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActive(idx); }}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === active ? 'w-8 bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow nav */}
      {items.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }} 
            className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 !pointer-events-auto cursor-pointer transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] border-white/20"
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }} 
            className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] w-14 h-14 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 !pointer-events-auto cursor-pointer transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] border-white/20"
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* Progress bar on current slide */}
      {!paused && items.length > 1 && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary z-30 animate-progress-bar shadow-[0_0_20px_rgba(0,229,255,0.8)]" />
      )}
    </div>
  )
}

// Common TMDB genre map
const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
}
