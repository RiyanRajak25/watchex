export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'original' | 'w1280' | 'w342' = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
};
