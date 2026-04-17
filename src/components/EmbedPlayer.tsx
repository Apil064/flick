// src/components/EmbedPlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, List, Play, ChevronRight,
  Maximize, Search, ToggleLeft as Toggle, ToggleRight,
  Server, RefreshCw, AlertCircle, Minimize2
} from 'lucide-react';
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

const getSources = (tmdbId: string, type: 'movie' | 'tv', season: number, episode: number) => [
  {
    name: 'Videasy',
    label: 'S1',
    color: '#E50914',
    url: type === 'movie'
      ? `https://player.videasy.net/movie/${tmdbId}?color=E50914&nextEpisode=1&autoplayNextEpisode=1`
      : `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=1&autoplayNextEpisode=1`,
  },
  {
    name: 'VidSrc',
    label: 'S2',
    color: '#3b82f6',
    url: type === 'movie'
      ? `https://vidsrc.to/embed/movie/${tmdbId}`
      : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    name: 'MultiEmbed',
    label: 'S3',
    color: '#8b5cf6',
    url: type === 'movie'
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
      : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    name: '2Embed',
    label: 'S4',
    color: '#10b981',
    url: type === 'movie'
      ? `https://www.2embed.cc/embed/${tmdbId}`
      : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
];

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({
  tmdbId, type, season = 1, episode = 1,
  title, onClose, posterPath, backdropPath, startTime = 0
}) => {
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showServerPanel, setShowServerPanel] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [autoNext, setAutoNext] = useState(true);
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const { data: details } = useMovieDetails(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);
  const { mutate: saveProgress } = useSaveProgress();
  const [localProgress, setLocalProgress] = useState(startTime);

  const sources = getSources(tmdbId, type, currentSeason, currentEpisode);
  const activeSource = sources[activeSourceIdx];

  useEffect(() => { setLocalProgress(startTime); }, [startTime, tmdbId, currentSeason, currentEpisode]);
  useEffect(() => {
    const t = setInterval(() => setLocalProgress(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [tmdbId, currentSeason, currentEpisode]);

  // Save progress
  useEffect(() => {
    const duration = type === 'movie'
      ? (details?.runtime || 120) * 60
      : (details?.episode_run_time?.[0] || 45) * 60;

    const save = () => saveProgress({
      tmdb_id: tmdbId, media_type: type, title,
      poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
      backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
      season: type === 'tv' ? currentSeason : 0,
      episode: type === 'tv' ? currentEpisode : 0,
      progress_seconds: localProgress,
      duration_seconds: duration
    });

    const interval = setInterval(save, 30000);
    window.addEventListener('beforeunload', save);
    return () => { clearInterval(interval); window.removeEventListener('beforeunload', save); save(); };
  }, [tmdbId, type, currentSeason, currentEpisode, title, posterPath, backdropPath,
      details, localProgress]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!showEpisodeList && !showServerPanel) setControlsVisible(false);
    }, 3500);
  }, [showEpisodeList, showServerPanel]);

  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current); }, [resetHideTimer]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEpisodeList) setShowEpisodeList(false);
        else if (showServerPanel) setShowServerPanel(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, showEpisodeList, showServerPanel]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s); setCurrentEpisode(e);
    setLocalProgress(0); setIsLoading(true); setActiveSourceIdx(0);
    if (window.innerWidth < 768) setShowEpisodeList(false);
  };

  const handleSourceChange = (idx: number) => {
    setActiveSourceIdx(idx); setIsLoading(true); setShowServerPanel(false);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const filteredEpisodes = seasonDetails?.episodes?.filter((ep: any) =>
    ep.name.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    ep.episode_number.toString().includes(episodeSearch)
  );

  const currentEpData = seasonDetails?.episodes?.find((e: any) => e.episode_number === currentEpisode);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden select-none"
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center gap-6 pointer-events-none"
          >
            {(backdropPath || posterPath) && (
              <img
                src={backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : `https://image.tmdb.org/t/p/w500${posterPath}`}
                alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#E50914] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black italic text-[#E50914]">F</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg tracking-tight truncate max-w-xs">{title}</p>
                {type === 'tv' && (
                  <p className="text-[#E50914] text-xs font-black uppercase tracking-widest mt-1">
                    S{currentSeason} • E{currentEpisode}
                  </p>
                )}
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">
                  {activeSource.name}...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 pb-16
                       bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none"
          >
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={onClose}
                  className="flex-shrink-0 p-2.5 bg-black/50 backdrop-blur-xl rounded-full border border-white/10
                             hover:bg-white/10 transition-all group shadow-xl"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="min-w-0">
                  <h2 className="font-black text-base md:text-lg tracking-tight truncate max-w-[200px] md:max-w-lg drop-shadow-2xl">
                    {title}
                  </h2>
                  {type === 'tv' && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#E50914] font-black uppercase tracking-widest">
                        S{currentSeason} • E{currentEpisode}
                      </span>
                      {currentEpData && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                          <span className="text-[10px] text-white/40 font-bold truncate max-w-[100px] md:max-w-xs">
                            {currentEpData.name}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Server selector */}
                <button
                  onClick={() => { setShowServerPanel(!showServerPanel); setShowEpisodeList(false); }}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black
                             uppercase tracking-widest transition-all border backdrop-blur-xl shadow-xl ${
                    showServerPanel ? 'bg-[#E50914] border-[#E50914] text-white' : 'bg-black/50 border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  {activeSource.name}
                </button>

                {type === 'tv' && (
                  <button
                    onClick={() => { setShowEpisodeList(!showEpisodeList); setShowServerPanel(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black
                               uppercase tracking-widest transition-all border backdrop-blur-xl shadow-xl ${
                      showEpisodeList ? 'bg-[#E50914] border-[#E50914] text-white' : 'bg-black/50 border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Episodes</span>
                  </button>
                )}

                <button onClick={handleFullscreen}
                  className="p-2.5 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>

                <button onClick={onClose}
                  className="p-2.5 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom mobile server row */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-16
                       bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
          >
            <div className="flex md:hidden items-center gap-2 justify-center pointer-events-auto mb-2">
              {sources.map((s, i) => (
                <button key={i} onClick={() => handleSourceChange(i)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                    i === activeSourceIdx
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg'
                      : 'bg-black/60 border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server panel dropdown */}
      <AnimatePresence>
        {showServerPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-20 right-4 md:right-8 z-[60] w-56
                       bg-[#141414]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#525252]">Select Server</p>
            </div>
            {sources.map((s, i) => (
              <button key={i} onClick={() => handleSourceChange(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 ${i === activeSourceIdx ? 'bg-white/5' : ''}`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                     style={{ backgroundColor: i === activeSourceIdx ? s.color : 'rgba(255,255,255,0.2)' }} />
                <span className={`text-sm font-bold ${i === activeSourceIdx ? 'text-white' : 'text-[#a3a3a3]'}`}>
                  {s.name}
                </span>
                {i === activeSourceIdx && (
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5
                                   bg-[#E50914]/20 text-[#E50914] rounded-full">Active</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main iframe */}
      <div className="flex-1 relative bg-black">
        <iframe
          key={activeSource.url}
          ref={iframeRef}
          src={activeSource.url}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen allow-top-navigation-by-user-activation allow-popups"
          title="Video Player"
          onLoad={() => setIsLoading(false)}
        />

        {/* Episode sidebar */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[460px]
                         bg-[#0a0a0a]/98 backdrop-blur-3xl border-l border-white/10
                         z-[60] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.6)]"
            >
              <div className="p-6 border-b border-white/5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight uppercase italic text-[#E50914]">Episodes</h3>
                  <button onClick={() => setShowEpisodeList(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input
                    type="text" placeholder="Search episodes..."
                    value={episodeSearch} onChange={e => setEpisodeSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                               text-xs font-medium outline-none focus:border-[#E50914]/50 transition-all
                               placeholder:text-[#525252]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <select
                      value={currentSeason}
                      onChange={e => setCurrentSeason(Number(e.target.value))}
                      className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl
                                 px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none
                                 focus:border-[#E50914]/50 transition-all pr-8 cursor-pointer"
                    >
                      {details?.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => (
                        <option key={s.id} value={s.season_number}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none rotate-90" />
                  </div>
                  <button
                    onClick={() => setAutoNext(!autoNext)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px]
                               font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                      autoNext ? 'bg-[#E50914]/10 border-[#E50914]/40 text-[#E50914]' : 'bg-white/5 border-white/10 text-[#525252]'
                    }`}
                  >
                    {autoNext ? <ToggleRight className="w-4 h-4" /> : <Toggle className="w-4 h-4" />}
                    Auto
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {filteredEpisodes?.map((ep: any) => {
                  const isActive = currentEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeChange(currentSeason, ep.episode_number)}
                      className={`w-full flex gap-4 p-3 rounded-2xl transition-all border text-left group
                                  relative overflow-hidden ${
                        isActive
                          ? 'bg-[#E50914]/10 border-[#E50914]/30'
                          : 'bg-white/3 border-transparent hover:bg-white/8 hover:border-white/15'
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-32 aspect-video rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : (backdropPath ? `https://image.tmdb.org/t/p/w780${backdropPath}` : '')}
                          alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#E50914] rounded text-[8px] font-black tracking-widest uppercase">
                            Now
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-black">
                          E{ep.episode_number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className={`text-sm font-bold tracking-tight truncate mb-1 transition-colors ${
                          isActive ? 'text-[#E50914]' : 'text-white'
                        }`}>
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-[#a3a3a3] line-clamp-2 leading-relaxed">
                          {ep.overview || 'No description available.'}
                        </p>
                        {ep.runtime && (
                          <span className="inline-block mt-2 text-[9px] font-black text-[#525252] bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {ep.runtime} min
                          </span>
                        )}
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