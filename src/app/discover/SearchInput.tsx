'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [text, setText] = useState(initialQuery || '')
  const router = useRouter()
  
  useEffect(() => {
    const handler = setTimeout(() => {
      // Force native push to completely bypass nuqs shallow limitations
      if (text !== initialQuery && text.trim() !== '') {
        router.push(`/discover?q=${encodeURIComponent(text.trim())}`)
        router.refresh() // Force Next.js Server Component payload refresh
      } else if (text.trim() === '' && initialQuery !== '') {
        router.push(`/discover`)
        router.refresh()
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [text, initialQuery, router]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </div>
      <input
        type="text"
        placeholder="Type to search..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-surface-light text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors shadow-lg"
      />
    </div>
  )
}
