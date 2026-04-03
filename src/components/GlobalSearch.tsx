'use client'

import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getImageUrl } from '@/lib/tmdb-utils'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === '/' && !open && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results?.slice(0, 8) || [])
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (id: number, type: string) => {
    router.push(`/${type === 'tv' ? 'tv' : 'movie'}/${id}`)
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => { setOpen(val); if (!val) setQuery('') }}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm group"
          title="Search (Ctrl+K)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px] items-center font-mono">⌘K</kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-[90vw] max-w-2xl bg-[#0d0d0f]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 focus:outline-none">
          {/* Input section */}
          <div className="relative border-b border-white/10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search movies, TV shows..."
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-5 text-lg text-white placeholder-gray-500 focus:outline-none"
            />
            {loading && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Results section */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id, item.media_type)}
                    className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 group transition-all text-left"
                  >
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                      {item.poster_path && (
                        <Image
                          src={getImageUrl(item.poster_path, 'w342')!}
                          alt={item.title || item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-bold text-white text-sm group-hover:text-primary truncate transition-colors">
                        {item.title || item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="uppercase">{item.media_type}</span>
                        <span>•</span>
                        <span>{(item.release_date || item.first_air_date || '').split('-')[0] || 'N/A'}</span>
                        {item.vote_average > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-accent flex items-center gap-0.5">★ {item.vote_average.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-gray-700"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                 <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;.</p>
              </div>
            ) : !query && (
              <div className="py-12 text-center text-gray-600 text-sm">
                 Type something to start searching...
              </div>
            )}
          </div>

          {/* Footer badge */}
          <div className="p-3 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
            <div>↑↓ to navigate • ↵ to select</div>
            <div>ESC to close</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
