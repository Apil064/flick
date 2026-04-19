import React from 'react';
import { Play, Plus, Star, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from '../hooks/useMovies';
import { useUser } from '@clerk/clerk-react';

interface MovieCardProps {
  item: any;
  type: 'movie' | 'tv';
  onClick: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, type, onClick }) => {
  const { isSignedIn } = useUser();
  const { data: watchlist } = useWatchlist();
  const { mutate: addToWatchlist } = useAddToWatchlist();
  const { mutate: removeFromWatchlist } = useRemoveFromWatchlist();
  
  const rating = item.rating?.toFixed(1) || 'N/A';
  const year = item.release_year;

  const isInWatchlist = watchlist?.some((w: any) => String(w.tmdb_id) === String(item.id));

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) return;
    
    if (isInWatchlist) {
      removeFromWatchlist(String(item.id));
    } else {
      addToWatchlist({
        tmdb_id: item.id,
        media_type: type,
        title: item.title,
        poster_path: item.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: item.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        overview: item.description,
        vote_average: item.rating,
        release_date: item.release_year
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-[140px] md:w-[180px] aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group shadow-lg bg-bg-secondary"
      onClick={onClick}
    >
      <img
        src={item.poster_url}
        alt={item.title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="lazy"
      />

      {/* Watchlist Button - Top Right */}
      <button 
        className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 shadow-2xl group/btn ${
          isInWatchlist ? 'bg-accent-red border-accent-red scale-110' : 'bg-black/40 hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100'
        }`}
        onClick={handleWatchlistClick}
        disabled={!isSignedIn}
      >
        {isInWatchlist ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Plus className="w-4 h-4 text-white group-hover/btn:rotate-90 transition-transform" />
        )}
      </button>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center justify-center absolute inset-0">
          <div className="w-12 h-12 rounded-full bg-accent-red flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate text-shadow-lg">
              {item.title || item.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-medium text-white/80">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-yellow-500" />
                {rating}
              </span>
              <span>{year}</span>
              <span className="px-1 border border-white/20 rounded uppercase">
                {type === 'movie' ? 'Movie' : 'TV'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
