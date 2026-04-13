import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../lib/api';

export const useTrending = (type: 'movie' | 'tv' = 'movie') => useQuery({
  queryKey: ['trending', type],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/trending`).then(r => r.data),
  staleTime: 1000 * 60 * 60, // 1 hour
});

export const usePopular = (type: 'movie' | 'tv' = 'movie') => useQuery({
  queryKey: ['popular', type],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/popular`).then(r => r.data),
});

export const useMovieDetails = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['details', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}`).then(r => r.data),
  enabled: !!id,
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
