import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Star, Play, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieSearch, useTrending } from '../hooks/useMovies';
import { MovieDetail } from './MovieDetail';
import debounce from 'lodash/debounce';

interface SearchPageProps {
  onClose: () => void;
}

// Only show these media types — excludes 'person', 'collection', etc.
const ALLOWED_MEDIA_TYPES = ['movie', 'tv'];

// Documentary genre ID in TMDB is 99
const DOCUMENTARY_GENRE_ID = 99;

function isAllowedResult(item: any): boolean {
  const type = item.media_type;
  if (!type) return false;
  if (!ALLOWED_MEDIA_TYPES.includes(type)) return false;
  // Must have a poster, otherwise it's useless to display
  if (!item.poster_url && !item.poster_path) return false;
  return true;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'movie' | 'tv'>('movie');

  const { data: searchResults, isLoading } = useMovieSearch(debouncedQuery);
  const { data: trending } = useTrending('all');

  // Filter trending to only movies and tv too
  const filteredTrending = (trending || []).filter(isAllowedResult);

  // Filter search results: only movies, tv shows, documentaries
  const filteredResults = (searchResults?.results || []).filter(isAllowedResult);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailType(item.media_type === 'tv' ? 'tv' : 'movie');
  };

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

  const hasQuery = query.trim().length > 0;
  const hasResults = filteredResults.length > 0;
  const searchDone = !isLoading && hasQuery && debouncedQuery === query.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-bg-primary/95 backdrop-blur-2xl flex flex-col"
    >
      <div className="p-6 md:p-16 flex flex-col h-full">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 max-w-lg relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              autoFocus
              type="text"
              placeholder="Search movies, TV shows, documentaries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-base font-medium focus:outline-none focus:border-accent-red/50 focus:bg-white/10 transition-all placeholder:text-text-muted shadow-xl"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">

          {/* Trending — shown only when no query */}
          {!hasQuery && (
            <div className="space-y-10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-text-secondary">
                Trending Now
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredTrending.slice(0, 12).map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer space-y-3"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden relative">
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-10 h-10 fill-white" />
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-wide">
                        {item.media_type === 'tv' ? 'TV' : 'Movie'}
                      </div>
                    </div>
                    <p className="font-bold truncate text-sm">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasQuery && (
            <div className="space-y-6">
              {/* Result count label */}
              {!isLoading && searchDone && (
                <p className="text-sm text-text-secondary font-medium">
                  {hasResults
                    ? `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${debouncedQuery}"`
                    : null}
                </p>
              )}

              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-bg-secondary animate-pulse rounded-xl" />
                  ))}
                </div>
              )}

              {/* Results grid */}
              {!isLoading && hasResults && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {filteredResults.map((item: any) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer space-y-3"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden relative bg-bg-secondary">
                        <img
                          src={item.poster_url || `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-10 h-10 fill-white" />
                        </div>
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-wide">
                          {item.media_type === 'tv' ? 'TV' : 'Movie'}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold truncate text-sm">{item.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                          {item.rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              {item.rating?.toFixed(1)}
                            </span>
                          )}
                          {item.release_year && <span>{item.release_year}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state — only shown after search completes with no results */}
              {searchDone && !hasResults && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Film className="w-10 h-10 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No results for "{debouncedQuery}"</h3>
                  <p className="text-text-secondary text-sm max-w-sm">
                    Try a different title or check your spelling. We search movies, TV shows, and documentaries.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={detailType}
            onClose={() => setSelectedItem(null)}
            onItemClick={(item, type) => {
              setSelectedItem(item);
              setDetailType(type);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};