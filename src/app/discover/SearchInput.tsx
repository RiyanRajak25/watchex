'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [text, setText] = useState(initialQuery || '')
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Ctrl+K or "/"  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') inputRef.current?.blur()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 500ms debounce — normalize to lowercase for consistent TMDB results
  useEffect(() => {
    const normalized = text.trim().toLowerCase()
    const handler = setTimeout(() => {
      if (normalized !== '' && normalized !== initialQuery.toLowerCase()) {
        router.push(`/discover?q=${encodeURIComponent(normalized)}`)
        router.refresh()
      } else if (normalized === '' && initialQuery !== '') {
        router.push(`/discover`)
        router.refresh()
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [text, initialQuery, router])

  return (
    <div className={`relative w-full transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-5 h-5 transition-colors duration-200 ${focused ? 'text-primary' : 'text-gray-500'}`}>
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search movies, shows… (press / or Ctrl+K)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="block w-full pl-11 pr-10 py-3.5 border border-white/10 rounded-xl leading-5 bg-white/5 backdrop-blur text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/50 sm:text-sm transition-all duration-200 shadow-lg"
      />

      {/* Clear button */}
      {text && (
        <button
          onClick={() => { setText(''); router.push('/discover'); router.refresh(); inputRef.current?.focus() }}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* Hint badge */}
      {!text && !focused && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] text-gray-600 border border-white/10 rounded bg-white/5 font-mono">/</kbd>
        </div>
      )}
    </div>
  )
}
