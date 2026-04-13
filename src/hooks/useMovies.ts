import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../lib/api';

export const useTrending = (type: 'movie' | 'tv' | 'all' = 'movie') => useQuery({
  queryKey: ['trending', type],
  queryFn: () => API.get(`/${type === 'tv' ? 'tv' : 'movies'}/trending`).then(r => r.data),
  staleTime: 1000 * 60 * 60, // 1 hour
});

export const usePopular = (type: 'movie' | 'tv' = 'movie') => useQuery({
  queryKey: ['popular', type],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/popular`).then(r => r.data),
});

export const useTopRated = (type: 'movie' | 'tv' = 'movie') => useQuery({
  queryKey: ['top-rated', type],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/top-rated`).then(r => r.data),
});

export const useNowPlaying = () => useQuery({
  queryKey: ['now-playing'],
  queryFn: () => API.get('/movies/now-playing').then(r => r.data),
});

export const useOnAir = () => useQuery({
  queryKey: ['on-air'],
  queryFn: () => API.get('/tv/on-air').then(r => r.data),
});

export const useMovieDetails = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['details', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}`).then(r => r.data),
  enabled: !!id,
});

export const useMovieCredits = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['credits', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}/credits`).then(r => r.data),
  enabled: !!id,
});

export const useSimilar = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['similar', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}/similar`).then(r => r.data),
  enabled: !!id,
});

export const useRecommendations = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['recommendations', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}/recommendations`).then(r => r.data),
  enabled: !!id,
});

export const useMovieSearch = (query: string) => useQuery({
  queryKey: ['search', query],
  queryFn: () => API.get(`/search?q=${encodeURIComponent(query)}`).then(r => r.data),
  enabled: !!query && query.length > 2,
});

export const useByGenre = (type: 'movie' | 'tv', genreId: string) => useQuery({
  queryKey: ['genre', type, genreId],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/genre/${genreId}`).then(r => r.data),
  enabled: !!genreId,
});

export const useWatchlist = () => useQuery({
  queryKey: ['watchlist'],
  queryFn: () => API.get('/user/watchlist').then(r => r.data),
});

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: any) => API.post('/user/watchlist', item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => API.delete(`/user/watchlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });
};

export const useHistory = () => useQuery({
  queryKey: ['history'],
  queryFn: () => API.get('/user/history').then(r => r.data),
});

export const useSaveProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => API.post('/user/history', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });
};
