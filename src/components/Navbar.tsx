'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="fixed top-0 w-full z-50 glass border-b-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="WatchEX Logo" 
            className="h-10 w-auto object-contain hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(232,28,255,0.4)]"
          />
          <span className="hidden sm:inline-block font-heading text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity">
            WatchEX
          </span>
        </Link>
        <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-300">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/discover" className="hover:text-primary transition-colors">Discover</Link>
          <Link href="/history" className="hover:text-primary transition-colors">History</Link>
          <Link href="/watchlists" className="hover:text-primary transition-colors">Watchlist</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/discover" className="p-2 text-gray-300 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform shadow-lg shadow-primary/20"
              title="My Dashboard"
            >
              {initials}
            </Link>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/40 rounded-full text-sm font-semibold transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
