import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, List, Play, ChevronRight, Maximize, Search, ToggleLeft as Toggle, ToggleRight, RotateCcw, RotateCw, Volume2, Settings, Cloud, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useTVSeason, useSaveProgress, useMovieImages } from '../hooks/useMovies';

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
  const [showUI, setShowUI] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: details } = useMovieDetails(type, tmdbId);
  const { data: images } = useMovieImages(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);
  const { mutate: saveProgress } = useSaveProgress();
  const [localProgress, setLocalProgress] = useState(startTime);
  const [duration, setDuration] = useState(0);

  const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en' && l.file_path.endsWith('.png')) || 
               images?.logos?.find((l: any) => l.iso_639_1 === 'en') || 
               images?.logos?.[0];
  const logoUrl = logo ? `https://image.tmdb.org/t/p/w500${logo.file_path}` : null;

  // Handle UI visibility on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      setShowUI(true);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
      uiTimeoutRef.current = setTimeout(() => {
        if (!showEpisodeList) setShowUI(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initial show

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [showEpisodeList]);

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

  // Listen for messages from the player iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'timeupdate') {
          setLocalProgress(Math.floor(data.data.seconds));
          setDuration(Math.floor(data.data.duration));
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-next logic
  useEffect(() => {
    if (!autoNext || type !== 'tv' || !details || !seasonDetails) return;
    
    const currentDuration = duration || (details?.runtime || 120) * 60;
    if (localProgress >= currentDuration - 30 && currentDuration > 0) {
      const nextEp = seasonDetails.episodes.find((e: any) => e.episode_number === currentEpisode + 1);
      if (nextEp) {
        handleEpisodeChange(currentSeason, nextEp.episode_number);
      } else {
        const nextSeason = details.seasons.find((s: any) => s.season_number === currentSeason + 1);
        if (nextSeason) {
          setCurrentSeason(nextSeason.season_number);
          setCurrentEpisode(1);
          setLocalProgress(0);
        }
      }
    }
  }, [localProgress, autoNext, type, details, seasonDetails, currentEpisode, currentSeason, duration]);

  useEffect(() => {
    const currentDuration = duration || (details?.runtime || 120) * 60;
    const saveInterval = setInterval(() => {
      saveProgress({
        tmdb_id: tmdbId,
        media_type: type,
        title: title,
        poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        season: type === 'tv' ? currentSeason : null,
        episode: type === 'tv' ? currentEpisode : null,
        progress_seconds: localProgress,
        duration_seconds: currentDuration
      });
    }, 30000);

    return () => {
      clearInterval(saveInterval);
      saveProgress({
        tmdb_id: tmdbId,
        media_type: type,
        title: title,
        poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        season: type === 'tv' ? currentSeason : null,
        episode: type === 'tv' ? currentEpisode : null,
        progress_seconds: localProgress,
        duration_seconds: currentDuration
      });
    };
  }, [tmdbId, type, currentSeason, currentEpisode, title, posterPath, backdropPath, details?.poster_url, details?.backdrop_url, details?.runtime, localProgress, duration]);

  const videoUrl = type === 'movie'
    ? `https://vidking.net/embed/movie/${tmdbId}?color=E50914&controls=0`
    : `https://vidking.net/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}?color=E50914&controls=0`

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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredEpisodes = seasonDetails?.episodes?.filter((ep: any) => 
    ep.name.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    ep.episode_number.toString() === episodeSearch
  );

  const currentEpisodeDetails = seasonDetails?.episodes?.find((e: any) => e.episode_number === currentEpisode);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden font-sans"
    >
      {/* Top Bar */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 h-24 px-8 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
          >
            <div className="flex items-center gap-6 pointer-events-auto">
              <button
                onClick={onClose}
                className="p-3 bg-black/20 backdrop-blur-xl hover:bg-white/10 rounded-full transition-all border border-white/10 group shadow-2xl"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Container */}
      <div className="flex-1 relative bg-black group/player">
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen allow-top-navigation-by-user-activation"
          title="Video Player"
        />

        {/* Cineby-style Overlay UI */}
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8 md:p-16 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
            >
              <div className="max-w-3xl space-y-6 mb-12">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={title} 
                    className="h-20 md:h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
                    {title}
                  </h1>
                )}

                <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/80">
                  {type === 'tv' && (
                    <span className="text-accent-red">S{currentSeason} • E{currentEpisode}</span>
                  )}
                  <span>{details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0]}</span>
                  <span>{details?.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : currentEpisodeDetails?.runtime ? `${currentEpisodeDetails.runtime}m` : ''}</span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {details?.vote_average?.toFixed(1) || currentEpisodeDetails?.vote_average?.toFixed(1)}
                  </span>
                </div>

                <p className="text-sm md:text-base text-white/60 font-medium max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
                  {type === 'tv' ? currentEpisodeDetails?.overview || details?.overview : details?.overview}
                </p>
              </div>

              {/* Custom Controls Bar */}
              <div className="w-full space-y-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden group/progress cursor-pointer">
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent-red shadow-[0_0_15px_rgba(229,9,20,0.8)] transition-all duration-300"
                    style={{ width: `${duration > 0 ? (localProgress / duration) * 100 : 0}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `${duration > 0 ? (localProgress / duration) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <button className="text-white hover:text-accent-red transition-colors">
                      <Play className="w-7 h-7 fill-current" />
                    </button>
                    <div className="flex items-center gap-6">
                      <button className="text-white/60 hover:text-white transition-colors">
                        <RotateCcw className="w-6 h-6" />
                      </button>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <RotateCw className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Volume2 className="w-6 h-6" />
                      </button>
                      <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-3/4 bg-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-sm font-black tracking-tighter text-white/60">
                      {formatTime(localProgress)} <span className="mx-1">/</span> {formatTime(duration || (details?.runtime || 120) * 60)}
                    </div>
                    <div className="flex items-center gap-6">
                      {type === 'tv' && (
                        <button 
                          onClick={() => setShowEpisodeList(!showEpisodeList)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showEpisodeList ? 'bg-accent-red text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                          <Layout className="w-4 h-4" />
                          Episodes
                        </button>
                      )}
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Cloud className="w-6 h-6" />
                      </button>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Settings className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handleFullscreen}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Maximize className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Episode Sidebar */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-6 top-6 bottom-6 w-full md:w-[450px] bg-bg-primary/90 backdrop-blur-3xl border border-white/10 z-[60] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="Search"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:border-accent-red transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <select 
                        value={currentSeason}
                        onChange={(e) => setCurrentSeason(Number(e.target.value))}
                        className="appearance-none bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all pr-8 cursor-pointer"
                      >
                        {details?.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => (
                          <option key={s.id} value={s.season_number}>
                            S{s.season_number}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none rotate-90" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Auto next</span>
                      <button onClick={() => setAutoNext(!autoNext)} className="text-accent-red">
                        {autoNext ? <ToggleRight className="w-6 h-6" /> : <Toggle className="w-6 h-6 opacity-40" />}
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowEpisodeList(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {filteredEpisodes?.map((ep: any) => {
                  const isActive = currentEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeChange(currentSeason, ep.episode_number)}
                      className={`w-full flex flex-col p-4 rounded-[32px] transition-all border text-left group relative overflow-hidden ${
                        isActive 
                          ? 'bg-white/10 border-white/20 shadow-2xl' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex gap-4 w-full">
                        <div className="relative flex-shrink-0 w-32 aspect-video rounded-2xl overflow-hidden bg-bg-secondary shadow-lg">
                          <img
                            src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : details?.backdrop_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          {isActive && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent-red rounded text-[8px] font-black tracking-widest uppercase shadow-lg">
                              WATCHING
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="text-sm font-black tracking-tight truncate mb-1 text-white">
                            {ep.episode_number}. {ep.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                            <span>
                              {isActive && duration > 0 && localProgress > 0
                                ? `${Math.max(0, Math.ceil((duration - localProgress) / 60))}m left`
                                : `${ep.runtime || details?.runtime || 60}m`}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed mt-2 opacity-60">
                            {ep.overview || "No description available."}
                          </p>
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
