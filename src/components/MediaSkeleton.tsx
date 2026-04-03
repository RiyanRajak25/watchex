'use client'

export default function MediaSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/5" />
      <div className="h-4 w-3/4 bg-white/5 rounded" />
      <div className="h-3 w-1/2 bg-white/5 rounded" />
    </div>
  )
}

export function CarouselSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-8 px-4 md:px-8">
      <div className="h-8 w-48 bg-white/5 rounded-lg" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="min-w-[160px] md:min-w-[200px]">
             <MediaSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[70vh] md:h-[85vh] bg-white/5 animate-pulse flex flex-col justify-end p-8 md:p-16 gap-4">
      <div className="h-4 w-24 bg-white/10 rounded" />
      <div className="h-12 md:h-20 w-3/4 bg-white/10 rounded-xl" />
      <div className="h-4 w-1/2 bg-white/10 rounded" />
      <div className="flex gap-4 mt-4">
        <div className="h-12 w-32 bg-white/20 rounded-full" />
        <div className="h-12 w-32 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}
