'use client'

import { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

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
        credentials: 'include',
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
        className="bg-transparent text-[10px] uppercase font-black tracking-widest text-white px-4 py-2 outline-none appearance-none cursor-pointer"
      >
        <option value="planning" className="text-black">Planning</option>
        <option value="watching" className="text-black">Watching</option>
        <option value="completed" className="text-black">Completed</option>
        <option value="on_hold" className="text-black">On Hold</option>
        <option value="dropped" className="text-black">Dropped</option>
      </select>
      
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? '...' : 'Add to List'}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="z-[101] px-2.5 py-1.5 bg-gray-900 border border-white/10 rounded-lg text-[10px] font-bold text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200" sideOffset={8}>
            Save to {status.replace('_', ' ')}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      {message && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-primary bg-black/90 px-3 py-1.5 rounded-full border border-primary/20 shadow-xl animate-bounce">
          {message}
        </span>
      )}
    </div>
  )
}
