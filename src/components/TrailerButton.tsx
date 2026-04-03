'use client'

import { useState } from 'react'
import TrailerModal from './TrailerModal'
import * as Tooltip from '@radix-ui/react-tooltip'

interface TrailerButtonProps {
  videos: any[]
}

export default function TrailerButton({ videos }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Find the official YouTube trailer
  const trailer = videos?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  )

  if (!trailer) return null

  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl group outline-none"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:text-primary transition-colors"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            Watch Trailer
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="z-[101] px-2.5 py-1.5 bg-gray-900 border border-white/10 rounded-lg text-[10px] font-bold text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={8}>
            Launch Media Player
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <TrailerModal
        youtubeKey={trailer.key}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
