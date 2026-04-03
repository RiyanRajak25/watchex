'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as ScrollArea from '@radix-ui/react-scroll-area'

const TYPES = [
  { value: 'movie', label: '🎬 Movies' },
  { value: 'tv',    label: '📺 Shows'  },
]

export default function GenreFilter({
  genres,
  activeGenre,
  activeType,
}: {
  genres: string[]
  activeGenre: string
  activeType: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (genre: string, type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('genre', genre)
    params.set('type', type)
    params.delete('q')
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit backdrop-blur-xl">
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => navigate(activeGenre, t.value)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeType === t.value
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Genre Chips with Radix ScrollArea */}
      <ScrollArea.Root className="w-full overflow-hidden">
        <ScrollArea.Viewport className="w-full h-full pb-3">
          <div className="flex gap-2.5">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => navigate(g, activeType)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border whitespace-nowrap ${
                  activeGenre === g
                    ? 'bg-primary/20 text-primary border-primary shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/30 hover:text-white hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className="flex flex-col h-1 select-none touch-none bg-white/5 rounded-full transition-all hover:bg-white/10" 
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="flex-1 bg-primary/40 rounded-full transition-all hover:bg-primary/60" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  )
}
