'use client'

import { useState } from 'react'

export default function WatchlistButton({ media, type }: { media: any, type: string }) {
  const [status, setStatus] = useState<string>('planning')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: media.id,
          type,
          status,
          title: media.title || media.name,
          poster_path: media.poster_path
        })
      })
      if (!res.ok) throw new Error('You must be logged in to save.')
      setMessage('Saved!')
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="flex bg-white/10 rounded-full border border-white/5 items-center p-1 w-max relative">
      <select 
        value={status} 
        onChange={e => setStatus(e.target.value)}
        className="bg-transparent text-sm text-white px-4 py-2 outline-none appearance-none font-medium cursor-pointer"
      >
        <option value="planning" className="text-black">Planning</option>
        <option value="watching" className="text-black">Watching</option>
        <option value="completed" className="text-black">Completed</option>
        <option value="on_hold" className="text-black">On Hold</option>
        <option value="dropped" className="text-black">Dropped</option>
      </select>
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-colors"
      >
        {loading ? '...' : '+ Add'}
      </button>
      {message && <span className="absolute top-14 left-0 text-xs text-primary whitespace-nowrap bg-black/80 px-2 py-1 rounded">{message}</span>}
    </div>
  )
}
