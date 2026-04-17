// src/components/EmbedPlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, List, Play, ChevronRight,
  Maximize, Search, ToggleLeft as Toggle, ToggleRight,
  RefreshCw, Minimize2,
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

// ── Videasy URL builder ──────────────────────────────────────────────────────
const buildVideasyUrl = (
  tmdbId: string,
  type: 'movie' | 'tv',
  season: number,
  episode: number,
  title?: string,
  episodeName?: string,
) => {
  const base =
    type === 'movie'
      ? `https://player.videasy.net/movie/${tmdbId}`
      : `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`;

  const params = new URLSearchParams({
    color: 'E50914',           // red accent colour
    nextEpisode: '1',          // show next-episode button
    autoplayNextEpisode: '1',  // auto-advance episodes
    autoplay: '1',             // force autoplay
    autoPlay: '1',             // double check param
    muted: '1',                // standard autoplay requires muting in many browsers
    theme: 'netflix',          // Netflix-style overlay
    title: title || '',        // Pass title for overlay
  });

  if (type === 'tv' && episodeName) {
    params.append('episode_name', episodeName);
  }

  return `${base}?${params.toString()}`;
};

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  title,
  onClose,
  posterPath,
  backdropPath,
  startTime = 0,
}) => {
  const [currentSeason, setCurrentSeason]     = useState(season);
  const [currentEpisode, setCurrentEpisode]   = useState(episode);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [episodeSearch, setEpisodeSearch]     = useState('');
  const [autoNext, setAutoNext]               = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [loadError, setLoadError]             = useState(false);

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout>>();

  const { data: details }       = useMovieDetails(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);
  const { mutate: saveProgress } = useSaveProgress();
  const [localProgress, setLocalProgress] = useState(startTime);

  const currentEpData = seasonDetails?.episodes?.find(
    (e: any) => e.episode_number === currentEpisode,
  );

  const videasyUrl = buildVideasyUrl(
    tmdbId, 
    type, 
    currentSeason, 
    currentEpisode, 
    title, 
    currentEpData?.name
  );

  // ── Ad / redirect blocking (Monkey Patching) ───────────────────────────
  useEffect(() => {
    const originalOpen = window.open.bind(window);

    // ✅ Monkey Patch window.open (Blocks almost all popups/redirects)
    (window as any).open = (...args: Parameters<typeof window.open>) => {
      const url = args[0]?.toString() ?? '';
      const isAllowed = url.includes('videasy.net') || url.includes('themoviedb.org') || url === 'about:blank' || !url;
      
      if (isAllowed) return originalOpen(...args);
      
      console.warn('[FlickGuard] Blocked redirect to:', url);
      return { 
        focus: () => {}, 
        close: () => {}, 
        location: { href: '' },
        closed: true
      };
    };

    // ✅ Stop Top-Frame Navigation (The "Cloudflare" approach)
    // We override window.onbeforeunload and also monitor for unauthorized location changes
    const protectLocation = () => {
      try {
        const originalLocation = window.location;
        // Some browsers allow defining a getter/setter on location, though it's dangerous
        // Instead we use a reliable timer to check if we've been moved
        const interval = setInterval(() => {
          if (window.location !== originalLocation) {
             console.warn('[FlickGuard] Detected unauthorized navigation attempt.');
          }
        }, 500);
        return () => clearInterval(interval);
      } catch (e) {
        return () => {};
      }
    };

    const cleanupLocation = protectLocation();

    // ✅ Intercept Videasy messages
    const handleMessage = (e: MessageEvent) => {
      if (!e.origin.includes('videasy.net')) return;
      // Handle player events here if needed
    };

    window.addEventListener('message', handleMessage);

    return () => {
      (window as any).open = originalOpen;
      window.removeEventListener('message', handleMessage);
      cleanupLocation();
    };
  }, [loadError]);

  // ── Progress tracking ────────────────────────────────────────────────────
  useEffect(() => {
    setLocalProgress(startTime);
  }, [startTime, tmdbId, currentSeason, currentEpisode]);

  useEffect(() => {
    const t = setInterval(() => setLocalProgress(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [tmdbId, currentSeason, currentEpisode]);

  useEffect(() => {
    const duration =
      type === 'movie'
        ? (details?.runtime || 120) * 60
        : (details?.episode_run_time?.[0] || 45) * 60;

    const save = () =>
      saveProgress({
        tmdb_id: tmdbId,
        media_type: type,
        title,
        poster_path:
          posterPath ||
          details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path:
          backdropPath ||
          details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
        season: type === 'tv' ? currentSeason : 0,
        episode: type === 'tv' ? currentEpisode : 0,
        progress_seconds: localProgress,
        duration_seconds: duration,
      });

    const interval = setInterval(save, 30_000);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', save);
      save();
    };
  }, [tmdbId, type, currentSeason, currentEpisode, title, posterPath, backdropPath, details, localProgress]);

  // ── Controls auto-hide ───────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!showEpisodeList) setControlsVisible(false);
    }, 3500);
  }, [showEpisodeList]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [resetHideTimer]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEpisodeList) setShowEpisodeList(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showEpisodeList]);

  // ── Fullscreen sync ──────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    setLocalProgress(0);
    setLoadError(false);
    if (window.innerWidth < 768) setShowEpisodeList(false);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleReload = () => {
    setLoadError(false);
    if (iframeRef.current) iframeRef.current.src = videasyUrl;
  };

  const filteredEpisodes = seasonDetails?.episodes?.filter(
    (ep: any) =>
      ep.name.toLowerCase().includes(episodeSearch.toLowerCase()) ||
      ep.episode_number.toString().includes(episodeSearch),
  );

  // ── Render ───────────────────────────────────────────────────────────────
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
      {/* Movie Loading Overlay Removed as requested */}

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loadError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-6"
          >
            <div className="text-center space-y-2">
              <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                Failed to load
              </p>
              <h2 className="text-white font-black text-2xl tracking-tight">{title}</h2>
            </div>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-[#E50914] rounded-full text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={onClose}
              className="text-white/40 text-xs font-bold hover:text-white transition-colors"
            >
              Go back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Netflix-style top bar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
          >
            {/* Top vignette */}
            <div className="h-36 bg-gradient-to-b from-black/95 via-black/50 to-transparent" />

            <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-6 md:px-10 pt-5 pointer-events-auto">
              {/* Back + title */}
              <div className="flex items-center gap-3 min-w-0 z-[70]">
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 transition-all group pointer-events-auto"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <div className="min-w-0">
                  {/* Netflix pattern: dim parent above, bright episode below */}
                  {type === 'tv' ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-0.5 truncate max-w-[180px] md:max-w-sm">
                        {title}
                      </p>
                      <h2 className="text-base md:text-lg font-black text-white tracking-tight truncate max-w-[200px] md:max-w-md drop-shadow-2xl">
                        {currentEpData?.name || `Episode ${currentEpisode}`}
                      </h2>
                      <p className="text-[10px] text-[#E50914] font-black uppercase tracking-widest mt-0.5">
                        S{currentSeason} &middot; E{currentEpisode}
                      </p>
                    </>
                  ) : (
                    <h2 className="text-base md:text-xl font-black text-white tracking-tight truncate max-w-[220px] md:max-w-lg drop-shadow-2xl">
                      {title}
                    </h2>
                  )}
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2 flex-shrink-0 z-[70]">
                {type === 'tv' && (
                  <button
                    onClick={() => setShowEpisodeList(!showEpisodeList)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black
                                uppercase tracking-widest transition-all border backdrop-blur-xl shadow-xl pointer-events-auto ${
                      showEpisodeList
                        ? 'bg-[#E50914] border-[#E50914] text-white'
                        : 'bg-black/50 border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Episodes</span>
                  </button>
                )}

                <button
                  onClick={handleFullscreen}
                  className="p-2.5 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl pointer-events-auto"
                >
                  {isFullscreen
                    ? <Minimize2 className="w-5 h-5 text-white" />
                    : <Maximize className="w-5 h-5 text-white" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2.5 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl pointer-events-auto"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main: Videasy iframe + ad shields ───────────────────────────────── */}
      <div className="flex-1 relative bg-black">
        {/*
          ✅  Method 1: Invisible Wall (CSP + Restricted Sandbox)
          We omit 'allow-top-navigation' and 'allow-popups' to kill redirects.
          'allow-same-origin' is kept so Videasy doesn't detect a restricted sandbox.
        */}
        <iframe
          key={`${tmdbId}-${type}-${currentSeason}-${currentEpisode}`}
          ref={iframeRef}
          src={videasyUrl}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
          referrerPolicy="no-referrer"
          title={`${title}${type === 'tv' ? ` S${currentSeason}E${currentEpisode}` : ''}`}
          onError={() => setLoadError(true)}
        />

        {/*
          ✅ Full-Screen Shield (Ad-Prevention Layer)
          When controls are hidden, this invisible layer covers the entire iframe.
          It intercepts ALL clicks/taps, preventing them from reaching the iframe's
          internal ads (like click-jacking overlays).
          The first tap anywhere will toggle the controls instead of triggering an ad.
        */}
        {!controlsVisible && (
          <div
            className="absolute inset-0 z-30 cursor-pointer bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              resetHideTimer();
            }}
          />
        )}

        {/* ── Episode sidebar ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[440px]
                         bg-[#0a0a0a]/98 backdrop-blur-3xl border-l border-white/8
                         z-[60] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.7)]"
            >
              {/* Sidebar header */}
              <div className="p-6 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    Episodes
                  </h3>
                  <button
                    onClick={() => setShowEpisodeList(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Episode search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search episodes..."
                    value={episodeSearch}
                    onChange={e => setEpisodeSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                               text-xs font-medium text-white outline-none focus:border-[#E50914]/50
                               transition-all placeholder:text-white/25"
                  />
                </div>

                {/* Season picker + auto-next toggle */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <select
                      value={currentSeason}
                      onChange={e => { setCurrentSeason(Number(e.target.value)); setEpisodeSearch(''); }}
                      className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl
                                 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white
                                 outline-none focus:border-[#E50914]/50 transition-all pr-8 cursor-pointer"
                    >
                      {details?.seasons
                        ?.filter((s: any) => s.season_number > 0)
                        .map((s: any) => (
                          <option key={s.id} value={s.season_number}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none rotate-90" />
                  </div>

                  <button
                    onClick={() => setAutoNext(!autoNext)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px]
                               font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                      autoNext
                        ? 'bg-[#E50914]/10 border-[#E50914]/40 text-[#E50914]'
                        : 'bg-white/5 border-white/10 text-white/30'
                    }`}
                  >
                    {autoNext ? <ToggleRight className="w-4 h-4" /> : <Toggle className="w-4 h-4" />}
                    Auto
                  </button>
                </div>
              </div>

              {/* Episode cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {filteredEpisodes?.map((ep: any) => {
                  const isActive = currentEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeChange(currentSeason, ep.episode_number)}
                      className={`w-full flex gap-4 p-3 rounded-2xl transition-all border text-left group ${
                        isActive
                          ? 'bg-[#E50914]/10 border-[#E50914]/30'
                          : 'bg-white/3 border-transparent hover:bg-white/8 hover:border-white/10'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0 w-28 aspect-video rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={
                            ep.still_path
                              ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                              : backdropPath
                              ? `https://image.tmdb.org/t/p/w780${backdropPath}`
                              : ''
                          }
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                            Playing
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-black text-white">
                          E{ep.episode_number}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className={`text-sm font-bold tracking-tight truncate mb-1 transition-colors ${
                          isActive ? 'text-[#E50914]' : 'text-white'
                        }`}>
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                          {ep.overview || 'No description available.'}
                        </p>
                        {ep.runtime && (
                          <span className="inline-block mt-2 text-[9px] font-black text-white/25 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
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