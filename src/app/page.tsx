import { getTrending, getPopular, getTopRated } from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import MediaCarousel from "@/components/MediaCarousel";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [trendingAll, popularMovies, popularTv, topRatedMovies] = await Promise.all([
    getTrending('all', 'day'),
    getPopular('movie'),
    getPopular('tv'),
    getTopRated('movie')
  ]);

  const rawHeroItems = trendingAll?.results?.slice(0, 5) || [];
  
  // Fetch full details for the hero items to get their background video trailers
  const heroItems = await Promise.all(
    rawHeroItems.map(async (item: any) => {
      const type = item.media_type === 'tv' ? 'tv' : 'movie';
      try {
        const { getDetails } = await import('@/lib/tmdb');
        const details = await getDetails(type, item.id);
        return { ...item, videos: details?.videos };
      } catch {
        return item;
      }
    })
  );

  return (
    <main className="min-h-screen flex flex-col bg-background pb-20">
      <HeroBanner items={heroItems} />
      
      <div className="flex flex-col gap-2 -mt-10 relative z-20">
        <MediaCarousel 
          title="Trending Today" 
          items={trendingAll?.results?.slice(1, 21) || []} 
        />
        <MediaCarousel 
          title="Popular Movies" 
          items={popularMovies?.results || []} 
        />
        <MediaCarousel 
          title="Popular TV Shows" 
          items={popularTv?.results || []} 
        />
        <MediaCarousel 
          title="Top Rated Classics" 
          items={topRatedMovies?.results || []} 
        />
      </div>
    </main>
  );
}
