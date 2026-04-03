import { searchMedia, getTrending, fetchTMDB } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { SearchInput } from './SearchInput';
import GenreFilter from './GenreFilter';

export const dynamic = 'force-dynamic';

const GENRE_MAP: Record<string, { id: number; emoji: string }> = {
  'All':        { id: 0,     emoji: '🌐' },
  'Action':     { id: 28,    emoji: '💥' },
  'Comedy':     { id: 35,    emoji: '😂' },
  'Drama':      { id: 18,    emoji: '🎭' },
  'Horror':     { id: 27,    emoji: '👻' },
  'Sci-Fi':     { id: 878,   emoji: '🚀' },
  'Romance':    { id: 10749, emoji: '❤️' },
  'Thriller':   { id: 53,    emoji: '🔪' },
  'Animation':  { id: 16,    emoji: '🎨' },
  'Fantasy':    { id: 14,    emoji: '🧙' },
  'Crime':      { id: 80,    emoji: '🕵️' },
  'Adventure':  { id: 12,    emoji: '🗺️' },
  'Family':     { id: 10751, emoji: '👨‍👩‍👧' },
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; type?: string }
}) {
  const query   = searchParams.q || ''
  const genre   = searchParams.genre || 'All'
  const type    = (searchParams.type as 'movie' | 'tv') || 'movie'
  const genreId = GENRE_MAP[genre]?.id ?? 0

  let results: any
  if (query) {
    results = await searchMedia(query.trim().toLowerCase(), 1)
  } else if (genreId > 0) {
    results = await fetchTMDB(`/discover/${type}`, {
      with_genres: String(genreId),
      sort_by: 'popularity.desc',
      page: '1',
    })
  } else {
    results = await getTrending('all', 'week')
  }

  const items: any[] = results?.results || []

  const heading = query
    ? `Results for "${query}"`
    : genreId > 0
    ? `${GENRE_MAP[genre]?.emoji} ${genre} ${type === 'tv' ? 'Shows' : 'Movies'}`
    : '🔥 Trending This Week'

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white">Discover</h1>
          <p className="text-gray-400 mt-1 font-sans text-sm">{heading}</p>
        </div>
        <div className="w-full md:w-[420px]">
          <SearchInput initialQuery={query} />
        </div>
      </div>

      {/* Genre chips + type toggle */}
      <GenreFilter
        genres={Object.keys(GENRE_MAP)}
        activeGenre={genre}
        activeType={type}
      />

      {/* Divider */}
      <div className="border-b border-white/5" />

      {/* Results */}
      {items.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-gray-700">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <p className="text-gray-500 text-lg">Nothing found{query ? ` for "${query}"` : ''}.</p>
          <p className="text-gray-600 text-sm">Try a different search or genre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {items.map((item: any) => (
            <MovieCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </main>
  );
}
