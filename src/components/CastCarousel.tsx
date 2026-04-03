'use client'

import Image from 'next/image'
import { getImageUrl } from '@/lib/tmdb-utils'

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastCarouselProps {
  cast: CastMember[]
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  if (!cast || cast.length === 0) return null

  // Take top 15 cast members
  const topCast = cast.slice(0, 15)

  return (
    <section className="flex flex-col gap-4 py-8 w-full max-w-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-subheading font-bold text-white uppercase tracking-wider border-l-4 border-primary pl-3">
        Cast & Crew
      </h2>
      
      <div className="flex overflow-x-auto gap-6 px-2 pb-4 pt-2 scrollbar-hide snap-x">
        {topCast.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-2 min-w-[100px] md:min-w-[120px] snap-start group text-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all duration-300 shadow-xl group-hover:shadow-primary/20">
              {member.profile_path ? (
                <Image
                  src={getImageUrl(member.profile_path, 'w342')!}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 opacity-50"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 max-w-[120px]">
              <p className="text-sm font-bold text-white truncate w-full group-hover:text-primary transition-colors">{member.name}</p>
              <p className="text-[10px] md:text-xs text-gray-400 italic truncate w-full">{member.character}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
