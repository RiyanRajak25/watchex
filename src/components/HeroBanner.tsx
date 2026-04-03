'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '@/lib/tmdb-utils';

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
      className="relative w-full h-[60vh] md:h-[88vh] flex items-end overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop with crossfade */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === active ? 'opacity-100' : 'opacity-0'}`}
        >
          {item.backdrop_path && (
            <Image
              src={getImageUrl(item.backdrop_path, 'original')!}
              alt={item.title || item.name}
              fill
              priority={idx === 0}
              className="object-cover"
            />
          )}
        </div>
      ))}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent z-10" />

      {/* Vignette sides */}
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background/40 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 px-6 md:px-14 pb-16 max-w-5xl flex flex-col gap-4 w-full">
        {/* Type pill */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${isTV ? 'text-accent border-accent/40 bg-accent/10' : 'text-primary border-primary/40 bg-primary/10'}`}>
            {isTV ? '📺 TV Show' : '🎬 Movie'}
          </span>
          {year && <span className="text-xs text-gray-400">{year}</span>}
          {rating > 0 && (
            <span className="text-xs font-bold text-accent flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-white drop-shadow-xl leading-tight max-w-2xl">
          {title}
        </h1>

        <p className="text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 max-w-xl leading-relaxed drop-shadow-md">
          {media.overview}
        </p>

        {/* Genres */}
        {media.genre_ids && media.genre_ids.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {media.genre_ids.slice(0, 3).map((gid: number) => (
              <span key={gid} className="text-[11px] text-gray-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                #{GENRE_MAP[gid] || gid}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-2 flex-wrap">
          <Link
            href={href}
            className="px-7 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-primary/30"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M8 5v14l11-7z"/></svg>
            Watch Now
          </Link>
          <Link
            href={href}
            className="px-7 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full font-semibold flex items-center gap-2 transition-all border border-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            More Info
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === active ? 'w-6 bg-primary' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow nav */}
      {items.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* Progress bar on current slide */}
      {!paused && items.length > 1 && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary/60 z-20 animate-progress-bar" />
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
