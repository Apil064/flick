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

export const useRecent = () => useQuery({
  queryKey: ['recent'],
  queryFn: () => API.get('/movies/recent').then(r => r.data),
});

export const useByGenreName = (genreName: string) => useQuery({
  queryKey: ['genre-name', genreName],
  queryFn: () => API.get(`/movies/by-genre?genre=${genreName}`).then(r => r.data),
  enabled: !!genreName,
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

export const useMovieImages = (type: 'movie' | 'tv', id: string) => useQuery({
  queryKey: ['images', type, id],
  queryFn: () => API.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}/images`).then(r => r.data),
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

export const useTVSeason = (tvId: string, seasonNumber: number) => useQuery({
  queryKey: ['season', tvId, seasonNumber],
  queryFn: () => API.get(`/tv/${tvId}/season/${seasonNumber}`).then(r => r.data),
  enabled: !!tvId && seasonNumber !== undefined,
});

export const useWatchlist = () => useQuery({
  queryKey: ['watchlist'],
  queryFn: () => API.get('/user/watchlist').then(r => r.data),
});

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: any) => API.post('/user/watchlist', item),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], (old: any) => [...(old || []), { ...newItem, id: Date.now() }]);
      return { previousWatchlist };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => API.delete(`/user/watchlist/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], (old: any) => 
        (old || []).filter((item: any) => String(item.tmdb_id) !== String(id))
      );
      return { previousWatchlist };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};

export const useContinueWatching = () => useQuery({
  queryKey: ['continue-watching'],
  queryFn: () => API.get('/user/continue-watching').then(r => r.data),
});

export const useWatchHistory = () => useQuery({
  queryKey: ['watch-history'],
  queryFn: () => API.get('/user/history').then(r => r.data),
});

export const useRemoveFromHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tmdbId: string) => API.delete(`/user/history/${tmdbId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-history'] });
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
    },
  });
};

export const useClearHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => API.delete('/user/history'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-history'] });
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
    },
  });
};

export const useSaveProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => API.post('/user/progress', data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['continue-watching'] });
      const previousHistory = queryClient.getQueryData(['continue-watching']);
      queryClient.setQueryData(['continue-watching'], (old: any) => {
        const filtered = (old || []).filter((item: any) => String(item.tmdb_id) !== String(newData.tmdb_id));
        return [{ ...newData, id: Date.now(), last_watched: new Date().toISOString() }, ...filtered];
      });
      return { previousHistory };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['continue-watching'], context?.previousHistory);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
    },
  });
};
