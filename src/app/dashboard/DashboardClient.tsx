'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function DashboardClient({ initialUser }: { initialUser: User }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = initialUser?.user_metadata?.full_name || initialUser?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarUrl = initialUser?.user_metadata?.avatar_url

  const quickLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/discover', label: 'Discover', icon: '🔍' },
    { href: '/watchlists', label: 'My Watchlists', icon: '📋' },
    { href: '/history', label: 'Watch History', icon: '🕐' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="glass border border-white/10 rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/50 shadow-lg shadow-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20">
              {initials}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-background" title="Online" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">{displayName}</h1>
          <p className="text-gray-400 text-sm mt-1">{initialUser?.email}</p>
          <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">
            Member since {new Date(initialUser?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/15 text-primary border border-primary/20 font-medium">WatchEX Member</span>
            {initialUser?.app_metadata?.provider === 'google' && (
              <span className="px-3 py-1 text-xs rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">Google Account</span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

      {/* Quick Nav Links */}
      <h2 className="text-lg font-bold text-white mb-3 font-heading uppercase tracking-wider">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="glass border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Account Details */}
      <h2 className="text-lg font-bold text-white mb-3 font-heading uppercase tracking-wider">Account Details</h2>
      <div className="glass border border-white/10 rounded-2xl overflow-hidden">
        {[
          { label: 'Email address', value: initialUser?.email ?? '—' },
          { label: 'Account provider', value: (initialUser?.app_metadata?.provider ?? 'email').charAt(0).toUpperCase() + (initialUser?.app_metadata?.provider ?? 'email').slice(1) },
          { label: 'User ID', value: initialUser?.id ? initialUser.id.slice(0, 18) + '...' : '—' },
          { label: 'Last sign in', value: initialUser?.last_sign_in_at ? new Date(initialUser.last_sign_in_at).toLocaleString() : '—' },
        ].map((row, i, arr) => (
          <div key={row.label} className={`flex justify-between items-center px-5 py-4 ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}>
            <span className="text-gray-400 text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium text-right ml-4 break-all">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
