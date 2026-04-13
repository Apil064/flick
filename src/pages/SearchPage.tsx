import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Star, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useMovieSearch, useTrending } from '../hooks/useMovies';
import debounce from 'lodash/debounce';

interface SearchPageProps {
  onClose: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: searchResults, isLoading } = useMovieSearch(debouncedQuery);
  const { data: trending } = useTrending('all');

  const updateQuery = useCallback(
    debounce((q: string) => setDebouncedQuery(q), 300),
    []
  );

  useEffect(() => {
    updateQuery(query);
  }, [query, updateQuery]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-bg-primary/95 backdrop-blur-2xl flex flex-col"
    >
      <div className="p-6 md:p-16 flex flex-col h-full">
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 max-w-4xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-text-muted" />
            <input
              autoFocus
              type="text"
              placeholder="Search movies, TV shows, actors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-bg-secondary/50 border-b-2 border-white/10 px-20 py-6 text-2xl md:text-4xl font-bold focus:outline-none focus:border-accent-red transition-colors placeholder:text-text-muted"
            />
          </div>
          <button
            onClick={onClose}
            className="ml-8 p-4 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-10 h-10" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          {!query && (
            <div className="space-y-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-text-secondary">
                Trending Searches
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trending?.slice(0, 12).map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer space-y-3"
                    onClick={() => {
                      // Open detail modal logic
                    }}
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden relative">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-10 h-10 fill-white" />
                      </div>
                    </div>
                    <p className="font-bold truncate">{item.title || item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-bg-secondary animate-pulse rounded-xl" />
                ))
              ) : (
                searchResults?.results?.map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer space-y-3"
                    onClick={() => {
                      // Open detail modal logic
                    }}
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden relative bg-bg-secondary">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted italic text-xs">
                          No Poster
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 glass rounded text-[10px] font-bold uppercase">
                        {item.media_type}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold truncate">{item.title || item.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {item.vote_average?.toFixed(1)}
                        </span>
                        <span>{(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
