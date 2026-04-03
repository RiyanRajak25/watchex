'use client'

import * as Dialog from '@radix-ui/react-dialog'

interface TrailerModalProps {
  youtubeKey: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function TrailerModal({ youtubeKey, isOpen, onOpenChange }: TrailerModalProps) {
  if (!youtubeKey) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[95vw] max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 focus:outline-none">
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              title="YouTube Trailer"
            />
            
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/10"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
