'use client'

import { useState, useEffect } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Tooltip from '@radix-ui/react-tooltip'

interface PlayerProps {
  tmdbId: number
  type: 'movie' | 'tv'
  season?: number
  episode?: number
  mediaDetails?: any
}

const SOURCES: { name: string; target?: 'both' | 'movie' | 'tv'; getUrl: (p: PlayerProps, s: number, e: number) => string }[] = [
  {
    name: 'Best(try VIP 1)',
    target: 'both',
    getUrl: (p: PlayerProps, s: number, e: number) =>
      p.type === 'movie'
        ? `https://www.2embed.cc/embed/${p.tmdbId}`
        : `https://www.2embed.cc/embedtv/${p.tmdbId}&s=${s}&e=${e}`
  },
  {
    name: 'Upcloud 1',
    target: 'both',
    getUrl: (p: PlayerProps, s: number, e: number) =>
      p.type === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${p.tmdbId}?autoPlay=false`
        : `https://vidsrc.cc/v2/embed/tv/${p.tmdbId}/${s}/${e}?autoPlay=false`
  },
  {
    name: 'Upcloud 2',
    target: 'both',
    getUrl: (p: PlayerProps, s: number, e: number) =>
      p.type === 'movie'
        ? `https://vidsrc.cc/v3/embed/movie/${p.tmdbId}?autoPlay=false`
        : `https://vidsrc.cc/v3/embed/tv/${p.tmdbId}/${s}/${e}?autoPlay=false`
  },
  {
    name: 'vidking',
    target: 'both',
    getUrl: (p: PlayerProps, s: number, e: number) =>
      p.type === 'movie'
        ? `https://www.vidking.net/embed/movie/${p.tmdbId}?color=e81cff`
        : `https://www.vidking.net/embed/tv/${p.tmdbId}/${s}/${e}?color=e81cff&episodeSelector=true&nextEpisode=true`
  }
]

function RadixSelect({
  value,
  onValueChange,
  items,
  label,
}: {
  value: string
  onValueChange: (v: string) => void
  items: { value: string; label: string }[]
  label: string
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-primary data-[state=open]:border-primary min-w-[110px]"
        aria-label={label}
      >
        <Select.Value />
        <Select.Icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400"><polyline points="6 9 12 15 18 9"/></svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-[200] bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
          position="popper"
          sideOffset={6}
          data-lenis-prevent="true"
        >
          <Select.Viewport className="p-1 max-h-[250px] overflow-y-auto custom-scrollbar">
            {items.map(item => (
              <Select.Item
                key={item.value}
                value={item.value}
                className="relative flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer select-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none data-[state=checked]:text-primary data-[state=checked]:font-semibold transition-colors"
              >
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export default function Player(props: PlayerProps) {
  const [activeServer, setActiveServer] = useState(0)
  const [currentSeason, setCurrentSeason] = useState(props.season || 1)
  const [currentEpisode, setCurrentEpisode] = useState(props.episode || 1)

  const availableSources = SOURCES.filter(s => !s.target || s.target === 'both' || s.target === props.type)

  const seasons = (props.mediaDetails?.seasons || []).filter((s: any) => s.season_number > 0)
  const selectedSeasonData = seasons.find((s: any) => s.season_number === currentSeason)
  const maxEpisodes = selectedSeasonData?.episode_count || 30

  const seasonItems = seasons.map((s: any) => ({
    value: String(s.season_number),
    label: `Season ${s.season_number}`
  }))
  const episodeItems = Array.from({ length: maxEpisodes }, (_, i) => ({
    value: String(i + 1),
    label: `Episode ${i + 1}`
  }))

  useEffect(() => {
    if (!props.mediaDetails) return
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_id: props.tmdbId,
        type: props.type,
        season: props.type === 'tv' ? currentSeason : 0,
        episode: props.type === 'tv' ? currentEpisode : 0,
        title: props.mediaDetails.title || props.mediaDetails.name,
        poster_path: props.mediaDetails.poster_path
      })
    }).catch(() => {})
  }, [props.tmdbId, props.type, currentSeason, currentEpisode, props.mediaDetails])

  // VidKing progress tracking
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const payload = JSON.parse(event.data)
          if (payload.type === 'PLAYER_EVENT') {
            // future: persist progress to Supabase
          }
        }
      } catch {}
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Anti-Redirect Protection
  // Streaming servers (vidsrc, vidking) detect standard sandboxes and block the video.
  // They usually do this by testing if form submissions or popups are allowed.
  // By omitting `allow-top-navigation` but allowing the rest, we trick their detection 
  // into thinking there is no sandbox, while physically preventing them from redirecting our app.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Backup protection in case a script manages to bypass the sandbox
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? A video is currently playing.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="w-full flex flex-col gap-4">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          {/* Server tabs */}
          <div className="flex gap-2 flex-wrap">
            {availableSources.map((server, idx) => (
              <Tooltip.Root key={server.name}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setActiveServer(idx)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap transition-all ${
                      activeServer === idx
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary/50'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {server.name}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={5}
                    className="z-[100] px-3 py-1.5 text-xs text-white bg-[#18181b] border border-white/10 rounded-lg shadow-xl animate-in fade-in"
                  >
                    Switch to {server.name}
                    <Tooltip.Arrow className="fill-[#18181b]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>

          {/* TV selectors */}
          {props.type === 'tv' && seasons.length > 0 && (
            <div className="flex gap-2 items-center">
              <RadixSelect
                value={String(currentSeason)}
                label="Select Season"
                items={seasonItems}
                onValueChange={v => {
                  setCurrentSeason(Number(v))
                  setCurrentEpisode(1)
                }}
              />
              <RadixSelect
                value={String(currentEpisode)}
                label="Select Episode"
                items={episodeItems}
                onValueChange={v => setCurrentEpisode(Number(v))}
              />
            </div>
          )}
        </div>

        {/* Player iframe */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
            <iframe
            key={`${activeServer}-${currentSeason}-${currentEpisode}`}
            src={availableSources[activeServer]?.getUrl(props, currentSeason, currentEpisode) || ''}
            allowFullScreen
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-downloads"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* VIP 1 Recommendation Label */}
        <div className="w-full text-center mt-1">
          <p className="text-red-500 font-bold text-sm md:text-base tracking-widest">
            USE VIP 1 FOR BEST EXPERIENCE !!
          </p>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
