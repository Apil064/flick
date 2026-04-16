import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, List, Play, ChevronRight, Maximize, Search, ToggleLeft as Toggle, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useTVSeason, useSaveProgress } from '../hooks/useMovies';

interface EmbedPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onClose: () => void;
  posterPath?: string;
  backdropPath?: string;
  startTime?: number;
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ 
  tmdbId, type, season = 1, episode = 1, title, onClose, posterPath, backdropPath, startTime = 0 
}) => {
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [autoNext, setAutoNext] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { data: details } = useMovieDetails(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);
  const { mutate: saveProgress } = useSaveProgress();
  const [localProgress, setLocalProgress] = useState(startTime);

  // Initialize localProgress correctly when startTime changes
  useEffect(() => {
    setLocalProgress(startTime);
  }, [startTime, tmdbId, currentSeason, currentEpisode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalProgress(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [tmdbId, currentSeason, currentEpisode]);

  // Auto-next logic
  useEffect(() => {
    if (!autoNext || type !== 'tv' || !details || !seasonDetails) return;
    
    const duration = (details?.runtime || 120) * 60;
    // If we're near the end (e.g., last 30 seconds), check for next episode
    if (localProgress >= duration - 30 && duration > 0) {
      const nextEp = seasonDetails.episodes.find((e: any) => e.episode_number === currentEpisode + 1);
      if (nextEp) {
        handleEpisodeChange(currentSeason, nextEp.episode_number);
        setLocalProgress(0);
      } else {
        // Check next season
        const nextSeason = details.seasons.find((s: any) => s.season_number === currentSeason + 1);
        if (nextSeason) {
          setCurrentSeason(nextSeason.season_number);
          setCurrentEpisode(1);
          setLocalProgress(0);
        }
      }
    }
  }, [localProgress, autoNext, type, details, seasonDetails, currentEpisode, currentSeason]);

  useEffect(() => {
    const duration = type === 'movie' 
      ? (details?.runtime || 120) * 60 
      : (details?.episode_run_time?.[0] || 45) * 60;

    const saveInterval = setInterval(() => {
      saveProgress({
        tmdb_id: tmdbId,
        media_type: type,
        title: title,
        poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        season: type === 'tv' ? currentSeason : 0,
        episode: type === 'tv' ? currentEpisode : 0,
        progress_seconds: localProgress,
        duration_seconds: duration
      });
    }, 30000);

    const handleBeforeUnload = () => {
      saveProgress({
        tmdb_id: tmdbId,
        media_type: type,
        title: title,
        poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        season: type === 'tv' ? currentSeason : 0,
        episode: type === 'tv' ? currentEpisode : 0,
        progress_seconds: localProgress,
        duration_seconds: duration
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [tmdbId, type, currentSeason, currentEpisode, title, posterPath, backdropPath, details?.poster_url, details?.backdrop_url, details?.runtime, details?.episode_run_time, localProgress]);

  const videoUrl = type === 'movie'
    ? `https://vidking.net/embed/movie/${tmdbId}?color=E50914`
    : `https://vidking.net/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}?color=E50914`

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch(() => {
        document.documentElement.requestFullscreen();
      });
    }
  };

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    setLocalProgress(0);
    if (window.innerWidth < 768) setShowEpisodeList(false);
  };

  const filteredEpisodes = seasonDetails?.episodes?.filter((ep: any) => 
    ep.name.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    ep.episode_number.toString() === episodeSearch
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden font-sans"
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 h-20 px-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button
            onClick={onClose}
            className="p-2.5 bg-black/40 backdrop-blur-xl hover:bg-white/10 rounded-full transition-all border border-white/10 group shadow-2xl"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-black tracking-tighter text-white drop-shadow-2xl truncate max-w-[180px] md:max-w-lg">
              {title}
            </h2>
            {type === 'tv' && (
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="text-[10px] text-accent-red font-black uppercase tracking-[0.2em] drop-shadow-md">
                  S{currentSeason} • E{currentEpisode}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate max-w-[120px] md:max-w-xs">
                  {seasonDetails?.episodes?.find((e: any) => e.episode_number === currentEpisode)?.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border backdrop-blur-xl shadow-2xl ${
                showEpisodeList 
                  ? 'bg-accent-red border-accent-red text-white' 
                  : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Browse Episodes</span>
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="p-2.5 bg-black/40 backdrop-blur-xl hover:bg-white/10 rounded-full transition-all border border-white/10 shadow-2xl"
            title="Fullscreen"
          >
            <Maximize className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-black/40 backdrop-blur-xl hover:bg-white/10 rounded-full transition-all border border-white/10 shadow-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen allow-top-navigation-by-user-activation"
          title="Video Player"
        />

        {/* Episode Sidebar */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[500px] bg-bg-primary/98 backdrop-blur-3xl border-l border-white/10 z-[60] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 border-b border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-accent-red">Episodes</h3>
                  <button 
                    onClick={() => setShowEpisodeList(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="Search episodes..."
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent-red transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-bg-secondary border border-white/10 rounded-xl px-4 py-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Auto Next</span>
                    <button onClick={() => setAutoNext(!autoNext)} className="text-accent-red">
                      {autoNext ? <ToggleRight className="w-5 h-5" /> : <Toggle className="w-5 h-5 opacity-40" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select 
                      value={currentSeason}
                      onChange={(e) => setCurrentSeason(Number(e.target.value))}
                      className="appearance-none bg-bg-secondary border border-white/10 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all pr-12 cursor-pointer"
                    >
                      {details?.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => (
                        <option key={s.id} value={s.season_number}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none rotate-90" />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {filteredEpisodes?.length || 0} Episodes
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                {filteredEpisodes?.map((ep: any) => {
                  const isActive = currentEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeChange(currentSeason, ep.episode_number)}
                      className={`w-full flex gap-5 p-4 rounded-3xl transition-all border text-left group relative overflow-hidden ${
                        isActive 
                          ? 'bg-accent-red/10 border-accent-red/50 shadow-[0_0_30px_rgba(229,9,20,0.1)]' 
                          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-36 md:w-44 aspect-video rounded-2xl overflow-hidden bg-bg-secondary shadow-lg">
                        <img
                          src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : details?.backdrop_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Play className="w-5 h-5 fill-white text-white" />
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent-red rounded-md text-[8px] font-black tracking-widest uppercase shadow-lg">
                            Watching
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-black tracking-tighter">
                          EP {ep.episode_number}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className={`text-sm font-black tracking-tight truncate mb-1.5 ${isActive ? 'text-accent-red' : 'text-white'}`}>
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-medium opacity-80">
                          {ep.overview || "No description available for this episode."}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] font-black text-text-muted flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {ep.vote_average?.toFixed(1) || 'N/A'}
                          </span>
                          <span className="text-[10px] font-black text-text-muted bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {ep.runtime ? `${ep.runtime} MIN` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Star = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
