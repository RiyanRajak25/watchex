'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Verify token on server
  const verifyTurnstile = async (token: string | null): Promise<boolean> => {
    if (!SITE_KEY) return true // dev bypass when no site key
    if (!token) return false

    const res = await fetch('/api/turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    return data.success === true
  }

  const handleEmailAuth = async (isSignUp: boolean, e: React.MouseEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (!turnstileToken && SITE_KEY) { setError('Security check pending or failed. Please refresh or try again.'); return }
    
    setLoading(true)
    setError(null)

    try {
      const passed = await verifyTurnstile(turnstileToken)
      if (!passed) { setError('Security check failed. Please try again.'); setLoading(false); return }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        setError(null)
        // Provide more visible feedback than just a confirm alert
        alert('📩 Registration successful! Please check your email inbox (and spam folder) for a confirmation link to activate your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 font-sans text-sm">
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
      />

      {error && <p className="text-red-400 text-center text-xs">{error}</p>}

      {SITE_KEY && (
        <div className="flex justify-center my-2">
          <Turnstile 
            siteKey={SITE_KEY} 
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ theme: 'dark' }}
          />
        </div>
      )}

      <p className="text-[10px] text-gray-600 text-center px-2">
        Protected by Cloudflare Turnstile &mdash;{' '}
        <a href="https://www.cloudflare.com/privacypolicy/" className="underline hover:text-gray-400" target="_blank" rel="noreferrer">Privacy</a> &amp;{' '}
        <a href="https://www.cloudflare.com/terms/" className="underline hover:text-gray-400" target="_blank" rel="noreferrer">Terms</a>
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          onClick={(e) => handleEmailAuth(false, e)}
          disabled={loading || (!turnstileToken && !!SITE_KEY)}
          className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Sign In'}
        </button>
        <button
          type="button"
          onClick={(e) => handleEmailAuth(true, e)}
          disabled={loading || (!turnstileToken && !!SITE_KEY)}
          className="flex-1 px-4 py-3 border border-white/20 hover:bg-white/10 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Register
        </button>
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#121212] px-2 text-gray-500 rounded-full">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    </form>
  )
}
