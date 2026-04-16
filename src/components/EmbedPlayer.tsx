// src/components/EmbedPlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, List, Play, ChevronRight,
  Maximize, Search, ToggleLeft as Toggle, ToggleRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useTVSeason, useSaveProgress } from '../hooks/useMovies';
import { embedService } from '../services/embed.service';

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
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [autoNext, setAutoNext] = useState(true);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0); // force remount on source change
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: details } = useMovieDetails(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);
  const { mutate: saveProgress } = useSaveProgress();

  // Build source list whenever episode/season changes
  const sources = embedService.getSources(
    tmdbId,
    type,
    String(currentSeason),
    String(currentEpisode)
  );
  const activeSource = sources[sourceIndex] || sources[0];

  // Progress tracking (approximate — iframe doesn't expose video state)
  const localProgressRef = useRef(startTime);
  const [localProgress, setLocalProgress] = useState(startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      localProgressRef.current += 1;
      setLocalProgress(localProgressRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [tmdbId, currentSeason, currentEpisode]);

  // Auto-next for TV
  useEffect(() => {
    if (!autoNext || type !== 'tv' || !details || !seasonDetails) return;
    const approxDuration = (details?.episode_run_time?.[0] || 45) * 60;
    if (localProgress >= approxDuration - 30 && approxDuration > 0) {
      const nextEp = seasonDetails.episodes?.find(
        (ep: any) => ep.episode_number === currentEpisode + 1
      );
      if (nextEp) {
        handleEpisodeChange(currentSeason, nextEp.episode_number);
      } else {
        const nextSeason = details.seasons?.find(
          (s: any) => s.season_number === currentSeason + 1
        );
        if (nextSeason) {
          setCurrentSeason(nextSeason.season_number);
          setCurrentEpisode(1);
          localProgressRef.current = 0;
          setLocalProgress(0);
        }
      }
    }
  }, [localProgress]);

  // Save progress every 30s and on unmount
  const doSaveProgress = useCallback(() => {
    const duration =
      type === 'movie'
        ? (details?.runtime || 120) * 60
        : (details?.episode_run_time?.[0] || 45) * 60;

    saveProgress({
      tmdb_id: tmdbId,
      media_type: type,
      title,
      poster_path: posterPath || details?.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
      backdrop_path: backdropPath || details?.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
      season: type === 'tv' ? currentSeason : 0,
      episode: type === 'tv' ? currentEpisode : 0,
      progress_seconds: Math.floor(localProgressRef.current),
      duration_seconds: Math.floor(duration),
    });
  }, [tmdbId, type, title, posterPath, backdropPath, details, currentSeason, currentEpisode]);

  useEffect(() => {
    const interval = setInterval(doSaveProgress, 30000);
    window.addEventListener('beforeunload', doSaveProgress);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', doSaveProgress);
      doSaveProgress();
    };
  }, [doSaveProgress]);

  // Keyboard: ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    localProgressRef.current = 0;
    setLocalProgress(0);
    setSourceIndex(0);
    setIframeKey((k) => k + 1);
    if (window.innerWidth < 768) setShowEpisodeList(false);
  };

  const switchSource = (idx: number) => {
    setSourceIndex(idx);
    setIframeKey((k) => k + 1);
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.().catch(() => {
        document.documentElement.requestFullscreen?.();
      });
    }
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
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden"
    >
      {/* ── Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onClose}
            className="p-2 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-full transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black tracking-tight text-white truncate max-w-[200px] md:max-w-md">
              {title}
            </span>
            {type === 'tv' && (
              <span className="text-[10px] text-accent-red font-bold uppercase tracking-widest">
                S{currentSeason} · E{currentEpisode}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Source switcher */}
          <div className="hidden md:flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-2 py-1">
            {sources.map((src, idx) => (
              <button
                key={src.name}
                onClick={() => switchSource(idx)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  idx === sourceIndex
                    ? 'bg-accent-red text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {src.name}
              </button>
            ))}
          </div>

          {/* Reload */}
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-2 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-full border border-white/10 transition-all"
            title="Reload player"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Episode list (TV only) */}
          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border backdrop-blur-md ${
                showEpisodeList
                  ? 'bg-accent-red border-accent-red text-white'
                  : 'bg-black/50 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Episodes</span>
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="p-2 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-full border border-white/10 transition-all"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-full border border-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile source switcher ── */}
      <div className="absolute top-16 left-0 right-0 z-50 flex md:hidden items-center gap-1 overflow-x-auto px-4 pb-2 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex gap-1 pointer-events-auto">
          {sources.map((src, idx) => (
            <button
              key={src.name}
              onClick={() => switchSource(idx)}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                idx === sourceIndex
                  ? 'bg-accent-red border-accent-red text-white'
                  : 'bg-black/60 border-white/20 text-white/70'
              }`}
            >
              {src.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Iframe (the actual player) ── */}
      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={activeSource.url}
        className="w-full h-full border-none"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen allow-top-navigation-by-user-activation"
        title={`${title} — ${activeSource.name}`}
      />

      {/* ── Episode Sidebar ── */}
      <AnimatePresence>
        {showEpisodeList && type === 'tv' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full md:w-[440px] bg-bg-primary/98 backdrop-blur-3xl border-l border-white/10 z-[160] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.6)]"
          >
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter uppercase italic text-accent-red">
                  Episodes
                </h3>
                <button
                  onClick={() => setShowEpisodeList(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search episodes..."
                    value={episodeSearch}
                    onChange={(e) => setEpisodeSearch(e.target.value)}
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-accent-red transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 bg-bg-secondary border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                    Auto
                  </span>
                  <button onClick={() => setAutoNext(!autoNext)} className="text-accent-red">
                    {autoNext ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <Toggle className="w-5 h-5 opacity-40" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(Number(e.target.value))}
                    className="appearance-none bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all pr-10 cursor-pointer"
                  >
                    {details?.seasons
                      ?.filter((s: any) => s.season_number > 0)
                      .map((s: any) => (
                        <option key={s.id} value={s.season_number}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none rotate-90" />
                </div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {filteredEpisodes?.length || 0} episodes
                </span>
              </div>
            </div>

            {/* Episode list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {filteredEpisodes?.map((ep: any) => {
                const isActive = currentEpisode === ep.episode_number;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleEpisodeChange(currentSeason, ep.episode_number)}
                    className={`w-full flex gap-3 p-3 rounded-2xl transition-all border text-left group ${
                      isActive
                        ? 'bg-accent-red/10 border-accent-red/40'
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative flex-shrink-0 w-32 aspect-video rounded-xl overflow-hidden bg-bg-secondary">
                      <img
                        src={
                          ep.still_path
                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                            : details?.backdrop_url
                        }
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-accent-red rounded text-[8px] font-black tracking-widest uppercase">
                          Now
                        </div>
                      )}
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-black">
                        EP {ep.episode_number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4
                        className={`text-sm font-black tracking-tight truncate mb-1 ${
                          isActive ? 'text-accent-red' : 'text-white'
                        }`}
                      >
                        {ep.name}
                      </h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {ep.overview || 'No description available.'}
                      </p>
                      {ep.runtime && (
                        <span className="text-[10px] font-black text-text-muted mt-1.5 inline-block">
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
    </motion.div>
  );
};