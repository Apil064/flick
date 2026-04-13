import React, { useState } from 'react';
import { X, Play, Plus, Star, Clock, Calendar, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useMovieCredits, useSimilar, useAddToWatchlist, useWatchlist } from '../hooks/useMovies';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { useUser } from '@clerk/clerk-react';

interface MovieDetailProps {
  item: any;
  type: 'movie' | 'tv';
  onClose: () => void;
}

export const MovieDetail: React.FC<MovieDetailProps> = ({ item, type, onClose }) => {
  const { isSignedIn } = useUser();
  const [showPlayer, setShowPlayer] = useState(false);
  const { data: details, isLoading } = useMovieDetails(type, item.id);
  const { data: credits } = useMovieCredits(type, item.id);
  const { data: similar } = useSimilar(type, item.id);
  const { data: watchlist } = useWatchlist();
  const { mutate: addToWatchlist } = useAddToWatchlist();

  if (!item) return null;

  const isInWatchlist = watchlist?.some((w: any) => w.tmdb_id === item.id);

  const handleWatchlistClick = () => {
    if (!isSignedIn) return;
    
    if (!isInWatchlist) {
      addToWatchlist({
        tmdb_id: item.id,
        media_type: type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date
      });
    }
  };

  const backdropUrl = `https://image.tmdb.org/t/p/original${item.backdrop_path || item.poster_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-bg-primary rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Side: Poster (Hidden on mobile) */}
          <div className="hidden md:block w-1/3 relative">
            <img
              src={posterUrl}
              alt={item.title || item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg-primary" />
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 no-scrollbar">
            {/* Backdrop for mobile */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-64 -z-10">
              <img
                src={backdropUrl}
                alt=""
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent" />
            </div>

            <div className="space-y-4 pt-20 md:pt-0">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-accent-red text-[10px] font-black uppercase rounded">
                  {type === 'movie' ? 'Movie' : 'TV Series'}
                </span>
                {details?.genres?.map((g: any) => (
                  <span key={g.id} className="text-xs font-medium text-text-secondary">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                {item.title || item.name}
              </h1>

              {details?.tagline && (
                <p className="text-xl italic text-text-secondary font-medium">
                  "{details.tagline}"
                </p>
              )}

              <div className="flex items-center gap-6 text-sm font-bold">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-yellow-500" />
                  {rating}
                </div>
                <div className="flex items-center gap-1 text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {year}
                </div>
                {details?.runtime && (
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    {details.runtime} min
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowPlayer(true)}
                className="flex-1 md:flex-none px-10 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group"
              >
                <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" />
                WATCH NOW
              </button>
              <button
                onClick={handleWatchlistClick}
                disabled={!isSignedIn}
                className={`flex-1 md:flex-none px-10 py-4 font-black rounded-full transition-all border flex items-center justify-center gap-3 ${
                  isInWatchlist 
                    ? 'bg-accent-red border-accent-red text-white' 
                    : 'bg-bg-secondary text-white hover:bg-zinc-800 border-white/10'
                }`}
              >
                {isInWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {isInWatchlist ? 'IN MY LIST' : 'MY LIST'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest text-text-secondary">Overview</h3>
              <p className="text-lg leading-relaxed text-text-secondary max-w-3xl">
                {item.overview}
              </p>
            </div>

            {/* Cast */}
            {credits?.cast && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-widest text-text-secondary">Top Cast</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {credits.cast.slice(0, 10).map((person: any) => (
                    <div key={person.id} className="flex-shrink-0 w-24 text-center space-y-2">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/5">
                        <img
                          src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x185?text=No+Image'}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs font-bold truncate">{person.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar */}
            {similar && similar.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-text-secondary">More Like This</h3>
                  <button className="text-xs font-bold text-accent-red flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {similar.slice(0, 10).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex-shrink-0 w-32 aspect-[2/3] rounded-lg overflow-hidden relative group cursor-pointer"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w342${s.poster_path}`}
                        alt={s.title || s.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPlayer && (
          <EmbedPlayer
            tmdbId={item.id.toString()}
            type={type}
            title={item.title || item.name}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
