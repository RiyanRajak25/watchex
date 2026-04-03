import { searchMedia, getTrending } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { SearchInput } from './SearchInput';

export const dynamic = 'force-dynamic';

export default async function DiscoverPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';
  
  const results = query 
    ? await searchMedia(query, 1) 
    : await getTrending('all', 'week');

  const items = results?.results || [];

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white">Discover</h1>
          <p className="text-gray-400 mt-2 font-sans">Search for your favorite movies and TV shows</p>
        </div>
        <div className="w-full md:w-96">
          <SearchInput initialQuery={query} />
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="py-20 text-center text-gray-500">No results found for &quot;{query}&quot;</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="w-full">
               <MovieCard media={item} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
