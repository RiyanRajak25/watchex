'use client'

import { useState, useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

interface StarRatingProps {
  mediaId: number
  mediaType: string
}

export default function StarRating({ mediaId, mediaType }: StarRatingProps) {
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/rating?media_id=${mediaId}&media_type=${mediaType}`)
        const data = await res.json()
        if (data.score) setRating(data.score)
      } catch (err) {
        console.error('Failed to fetch rating:', err)
      }
    }
    fetchRating()
  }, [mediaId, mediaType])

  const handleRate = async (score: number) => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, media_type: mediaType, score })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to rate')
      setRating(score)
      setMessage('Rating saved!')
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Your Rating</span>
        <div className="flex gap-0.5">
          {[...Array(10)].map((_, i) => {
            const score = i + 1
            const active = (hover || rating) >= score
            return (
              <Tooltip.Root key={score}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className={`p-0.5 transition-all duration-200 transform hover:scale-125 outline-none ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    onMouseEnter={() => !loading && setHover(score)}
                    onMouseLeave={() => !loading && setHover(0)}
                    onClick={() => !loading && handleRate(score)}
                    disabled={loading}
                    aria-label={`Rate ${score} out of 10`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={active ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-4 h-4 md:w-5 md:h-5 ${active ? 'text-accent drop-shadow-[0_0_8px_rgba(255,180,0,0.5)]' : 'text-gray-600'}`}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="z-[101] px-2 py-1 bg-gray-900 border border-white/10 rounded text-xs text-white shadow-xl animate-in fade-in zoom-in-95 duration-200" sideOffset={5}>
                    {score} / 10
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )
          })}
        </div>
        <span className="ml-2 text-sm font-bold text-white min-w-[3rem]">
          {rating > 0 ? `${rating}/10` : '—'}
        </span>
      </div>
      {message && (
        <span className={`text-[10px] font-bold uppercase tracking-tight animate-fade-in ${message.includes('saved') ? 'text-primary' : 'text-red-400'}`}>
          {message}
        </span>
      )}
    </div>
  )
}
