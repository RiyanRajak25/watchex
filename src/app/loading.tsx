import { HeroSkeleton, CarouselSkeleton } from '@/components/MediaSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <HeroSkeleton />
      <div className="flex flex-col gap-8 -mt-20 relative z-10 px-4 md:px-8">
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    </div>
  )
}
