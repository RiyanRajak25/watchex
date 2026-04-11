/**
 * MovieSchema — JSON-LD Structured Data for Movie/TV Pages
 * 
 * Injects https://schema.org/Movie with AggregateRating (gold stars in SERP)
 * and optional VideoObject (trailer carousel in Google Videos tab).
 * 
 * This is a Server Component — renders in the initial HTML payload for crawlers.
 */

interface MovieSchemaProps {
  movie: {
    id: number;
    title?: string;
    name?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    vote_count?: number;
    runtime?: number;
    genres?: { id: number; name: string }[];
    credits?: {
      cast?: { name: string; character: string }[];
      crew?: { name: string; job: string }[];
    };
    videos?: {
      results?: { key: string; site: string; type: string; name: string }[];
    };
  };
  mediaType?: 'movie' | 'tv';
  baseUrl?: string;
}

export function MovieSchema({ movie, mediaType = 'movie', baseUrl = 'https://watchex.com' }: MovieSchemaProps) {
  const title = movie.title || movie.name || 'Untitled';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name;
  const actors = movie.credits?.cast?.slice(0, 5).map(c => ({
    '@type': 'Person',
    name: c.name,
  })) || [];

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : undefined;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : undefined;

  // Find YouTube trailer
  const trailer = movie.videos?.results?.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  // Core Movie schema
  const movieSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': mediaType === 'tv' ? 'TVSeries' : 'Movie',
    name: title,
    description: movie.overview || '',
    url: `${baseUrl}/${mediaType}/${movie.id}`,
    dateCreated: releaseDate,
    ...(posterUrl && { image: posterUrl }),
    ...(backdropUrl && { thumbnailUrl: backdropUrl }),
    ...(movie.genres && movie.genres.length > 0 && {
      genre: movie.genres.map(g => g.name),
    }),
    ...(director && {
      director: {
        '@type': 'Person',
        name: director,
      },
    }),
    ...(actors.length > 0 && { actor: actors }),
    ...(movie.runtime && {
      duration: `PT${Math.floor(movie.runtime / 60)}H${movie.runtime % 60}M`,
    }),
  };

  // AggregateRating — the gold stars hack
  if (movie.vote_average && movie.vote_count && movie.vote_count > 0) {
    movieSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average.toFixed(1),
      bestRating: '10',
      worstRating: '1',
      ratingCount: movie.vote_count,
    };
  }

  // VideoObject — trailer carousel in Google Videos tab
  const schemas: Record<string, any>[] = [movieSchema];

  if (trailer) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: trailer.name || `${title} - Official Trailer`,
      description: `Watch the official trailer for ${title}. ${movie.overview?.substring(0, 120) || ''}`,
      thumbnailUrl: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
      uploadDate: releaseDate,
      contentUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
      embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
      ...(movie.runtime && { duration: `PT${Math.floor(movie.runtime / 60)}H${movie.runtime % 60}M` }),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={`movie-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
