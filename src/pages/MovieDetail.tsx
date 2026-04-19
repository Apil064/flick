import React, { useState } from 'react';
import { X, Play, Plus, Star, Clock, Calendar, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useMovieCredits, useSimilar, useAddToWatchlist, useRemoveFromWatchlist, useWatchlist, useTVSeason } from '../hooks/useMovies';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { useUser } from '@clerk/clerk-react';

interface MovieDetailProps {
  item: any;
  type: 'movie' | 'tv';
  onClose: () => void;
  onItemClick?: (item: any, type: 'movie' | 'tv') => void;
}

export const MovieDetail: React.FC<MovieDetailProps> = ({ item, type, onClose, onItemClick }) => {
  const { isSignedIn } = useUser();
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState({ 
    season: item.season || 1, 
    episode: item.episode || 1,
    startTime: item.progress_seconds || 0,
    title: item.title,
    posterPath: item.poster_path || item.poster_url?.replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w780', ''),
    backdropPath: item.backdrop_path || item.backdrop_url?.replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/w780', '')
  });
  const [activeSeason, setActiveSeason] = useState(item.season || 1);
  
  const { data: details, isLoading } = useMovieDetails(type, item.id);
  const { data: credits } = useMovieCredits(type, item.id);
  const { data: similar } = useSimilar(type, item.id);
  const { data: seasonDetails } = useTVSeason(item.id.toString(), activeSeason);
  const { data: watchlist } = useWatchlist();
  const { mutate: addToWatchlist } = useAddToWatchlist();
  const { mutate: removeFromWatchlist } = useRemoveFromWatchlist();

  if (!item) return null;

  const isInWatchlist = watchlist?.some((w: any) => String(w.tmdb_id) === String(item.id));

  const handleWatchNow = (s = 1, e = 1, t = 0) => {
    const cleanPoster = item.poster_path || item.poster_url?.replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w780', '');
    const cleanBackdrop = item.backdrop_path || item.backdrop_url?.replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/w780', '');
    
    setSelectedEpisode({ 
      season: s, 
      episode: e, 
      startTime: t,
      title: item.title,
      posterPath: cleanPoster,
      backdropPath: cleanBackdrop
    });
    setShowPlayer(true);
  };

  const handleWatchlistClick = () => {
    if (!isSignedIn) return;
    
    if (isInWatchlist) {
      removeFromWatchlist(String(item.id));
    } else {
      addToWatchlist({
        tmdb_id: item.id,
        media_type: type,
        title: item.title,
        poster_path: item.poster_url?.replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w780', ''),
        backdrop_path: item.backdrop_url?.replace('https://image.tmdb.org/t/p/original', '').replace('https://image.tmdb.org/t/p/w500', '').replace('https://image.tmdb.org/t/p/w780', ''),
        overview: item.description,
        vote_average: item.rating,
        release_date: item.release_year
      });
    }
  };

  const backdropUrl = item.backdrop_url || item.poster_url;
  const posterUrl = item.poster_url;
  const rating = item.rating?.toFixed(1) || 'N/A';
  const year = item.release_year;

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
                {item.title}
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
                onClick={() => handleWatchNow()}
                className="flex-1 md:flex-none px-10 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group shadow-xl"
              >
                <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" />
                WATCH NOW
              </button>
              <button
                onClick={handleWatchlistClick}
                disabled={!isSignedIn}
                className={`flex-1 md:flex-none px-10 py-4 font-black rounded-full transition-all border flex items-center justify-center gap-3 shadow-2xl group/watchlist ${
                  isInWatchlist 
                    ? 'bg-accent-red border-accent-red text-white scale-105 shadow-accent-red/20' 
                    : 'bg-white/5 text-white hover:bg-white/10 border-white/20'
                }`}
              >
                {isInWatchlist ? (
                  <>
                    <Check className="w-6 h-6" />
                    ADDED TO LIST
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 group-hover/watchlist:rotate-90 transition-transform" />
                    ADD TO LIST
                  </>
                )}
              </button>
            </div>

            {/* Episodes Section for TV Shows */}
            {type === 'tv' && details?.seasons && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tighter uppercase italic text-accent-red">Episodes</h3>
                  <select 
                    value={activeSeason}
                    onChange={(e) => setActiveSeason(Number(e.target.value))}
                    className="bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all cursor-pointer"
                  >
                    {details.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seasonDetails?.episodes?.map((ep: any) => (
                    <button
                      key={ep.id}
                      onClick={() => handleWatchNow(activeSeason, ep.episode_number)}
                      className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/20 transition-all text-left group"
                    >
                      <div className="relative flex-shrink-0 w-32 aspect-video rounded-xl overflow-hidden bg-bg-secondary">
                        <img
                          src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : posterUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-black">
                          EP {ep.episode_number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="text-sm font-bold truncate mb-1 group-hover:text-accent-red transition-colors">
                          {ep.name}
                        </h4>
                        <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
                          {ep.overview || "No description available."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest text-text-secondary">Overview</h3>
              <p className="text-lg leading-relaxed text-text-secondary max-w-3xl">
                {item.description}
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
                      onClick={() => {
                        if (onItemClick) {
                          onItemClick(s, type);
                        }
                      }}
                      className="flex-shrink-0 w-32 aspect-[2/3] rounded-lg overflow-hidden relative group cursor-pointer"
                    >
                      <img
                        src={s.poster_url}
                        alt={s.title}
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
            season={selectedEpisode.season}
            episode={selectedEpisode.episode}
            title={item.title || item.name}
            posterPath={item.poster_path}
            backdropPath={item.backdrop_path}
            startTime={selectedEpisode.startTime}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
