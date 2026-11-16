import MovieCard from './MovieCard';

interface MediaCarouselProps {
  title: string;
  items: any[];
  viewAllLink?: string;
}

export default function MediaCarousel({ title, items, viewAllLink }: MediaCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 py-8 w-full max-w-full overflow-hidden relative z-20">
      <div className="flex justify-between items-end px-4 md:px-12">
        <h2 className="text-xl md:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-widest drop-shadow-md">
          {title}
        </h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm text-primary hover:text-accent transition-colors font-bold uppercase tracking-widest flex items-center gap-1 group">
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}
      </div>
      {/* We add significant padding so the 3D hover scale effect doesn't get clipped */}
      <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-12 pb-14 pt-8 scrollbar-hide snap-x">
        {items.map((item) => (
          <div key={item.id} className="snap-start py-4">
            <MovieCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
