import HeroBanner from "@/components/HeroBanner";
import MediaCarousel from "@/components/MediaCarousel";
import { getTrending, getPopular, getTopRated } from "@/lib/tmdb";

export default async function Home() {
  const [trendingAll, popularMovies, popularTv, topRatedMovies] = await Promise.all([
    getTrending('all', 'day'),
    getPopular('movie'),
    getPopular('tv'),
    getTopRated('movie')
  ]);

  const heroMedia = trendingAll?.results?.[0]; // Get the #1 trending item

  return (
    <main className="min-h-screen flex flex-col bg-background pb-20">
      <HeroBanner media={heroMedia} />
      
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
