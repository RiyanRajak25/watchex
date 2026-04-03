const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.tmdb.org/3';

export const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`TMDB fetch error: ${response.status} ${response.statusText} on ${url}`);
      return { results: [] };
    }

    return response.json();
  } catch (error) {
    console.error(`Fetch failed for TMDB ${url}. This is often due to ISP blocking in certain regions (e.g., India).`, error);
    return { results: [] }; // Fallback to empty results instead of crashing the Next.js server
  }
};

export const getTrending = async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'day') => {
  return fetchTMDB(`/trending/${type}/${timeWindow}`);
};

export const getPopular = async (type: 'movie' | 'tv') => {
  return fetchTMDB(`/${type}/popular`);
};

export const getTopRated = async (type: 'movie' | 'tv') => {
  return fetchTMDB(`/${type}/top_rated`);
};

export const getDetails = async (type: 'movie' | 'tv', id: string) => {
  return fetchTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos,recommendations' });
};

export const searchMedia = async (query: string, page: number = 1) => {
  return fetchTMDB('/search/multi', { query, page: page.toString(), include_adult: 'false' });
};

export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'original' | 'w1280' | 'w342' = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
};
