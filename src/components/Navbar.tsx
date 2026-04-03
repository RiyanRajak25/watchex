'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import GlobalSearch from './GlobalSearch'

const NAV_LINKS = [
  { href: '/',           label: 'Home',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/discover',   label: 'Discover',  icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' },
  { href: '/history',    label: 'History',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/watchlists', label: 'Watchlist', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
]

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.refresh()
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-xl shadow-black/30' : 'bg-gradient-to-b from-black/60 to-transparent backdrop-blur-none border-b-0'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src="/logo.png" alt="WatchEX Logo" className="h-9 w-auto object-contain hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(232,28,255,0.5)]" />
            <span className="hidden sm:inline-block font-heading text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              WatchEX
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 font-medium text-sm">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${active ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon}/></svg>
                  {link.label}
                  {active && <span className="w-1 h-1 rounded-full bg-primary" />}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Tooltip.Root>
               <Tooltip.Trigger asChild>
                  <div><GlobalSearch /></div>
               </Tooltip.Trigger>
               <Tooltip.Portal>
                  <Tooltip.Content className="z-[100] px-2 py-1 bg-gray-800 text-white text-[10px] rounded border border-white/10 shadow-xl animate-in fade-in zoom-in-95 duration-200" sideOffset={5}>
                     Search (Ctrl+K)
                     <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
               </Tooltip.Portal>
            </Tooltip.Root>
            
            <div className="h-6 w-px bg-white/10 hidden md:block mx-1" />

            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm outline-none hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 animate-pulse-glow">
                    {initials}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-[100] min-w-[200px] glass border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={8}>
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Signed in as</p>
                       <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    </div>

                    <DropdownMenu.Item asChild>
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 outline-none transition-all cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link href="/watchlists" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 outline-none transition-all cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
                        Watchlists
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link href="/history" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 outline-none transition-all cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Watch History
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-white/5 my-1.5" />

                    <DropdownMenu.Item 
                      onSelect={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 outline-none transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Link href="/login" className="hidden md:flex px-4 py-2 bg-primary/20 text-primary border border-primary/40 hover:bg-primary/40 rounded-full text-sm font-semibold transition-all hover:scale-105">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> : 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-[#111] border-b border-white/10 p-4 flex flex-col gap-1 shadow-2xl animate-fade-up">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon}/></svg>
                  {link.label}
                </Link>
              )
            })}
            <div className="border-t border-white/5 mt-2 pt-2">
              {user ? (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
