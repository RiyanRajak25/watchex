import MovieCard from './MovieCard';

interface MediaCarouselProps {
  title: string;
  items: any[];
  viewAllLink?: string;
}

export default function MediaCarousel({ title, items, viewAllLink }: MediaCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 py-6 w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-end px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-subheading font-bold text-white uppercase tracking-wider border-l-4 border-primary pl-3 bg-clip-text">
          {title}
        </h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm text-primary hover:text-primary-hover transition-colors font-medium">
            View All →
          </a>
        )}
      </div>
      <div className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 pt-2 scrollbar-hide snap-x">
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <MovieCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
