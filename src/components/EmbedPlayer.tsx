import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Server, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails } from '../hooks/useMovies';

interface EmbedPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onClose: () => void;
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ tmdbId, type, season = 1, episode = 1, title, onClose }) => {
  const [activeServer, setActiveServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const { data: details } = useMovieDetails(type, tmdbId);

  const tvSuffix = type === 'tv' ? `/${currentSeason}/${currentEpisode}` : '';

  const SOURCES = [
    { name: 'Server 1', url: `https://player.cineby.workers.dev/${type}/${tmdbId}${tvSuffix}` },
    { name: 'Server 2', url: `https://vidsrc.to/embed/${type}/${tmdbId}${tvSuffix}` },
    { name: 'Server 3', url: `https://vidking.net/embed/${type}/${tmdbId}${tvSuffix}` },
    { name: 'Server 4', url: `https://www.2embed.cc/embed/${tmdbId}${type === 'tv' ? `&s=${currentSeason}&e=${currentEpisode}` : ''}` },
    { name: 'Server 5', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${type === 'tv' ? `&s=${currentSeason}&e=${currentEpisode}` : ''}` },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    setShowEpisodeList(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
    >
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between bg-bg-primary/95 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
              {title}
            </h2>
            {type === 'tv' && (
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                Season {currentSeason} • Episode {currentEpisode}
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {SOURCES.map((server, idx) => (
            <button
              key={idx}
              onClick={() => setActiveServer(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeServer === idx
                  ? 'bg-accent-red border-accent-red text-white'
                  : 'bg-bg-secondary border-white/10 text-text-secondary hover:border-white/30'
              }`}
            >
              {server.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className={`p-2 rounded-full transition-colors ${showEpisodeList ? 'bg-accent-red text-white' : 'hover:bg-white/10'}`}
            >
              <List className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex">
        <iframe
          src={SOURCES[activeServer].url}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />

        {/* Episode Sidebar */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-bg-primary/95 backdrop-blur-xl border-l border-white/5 z-50 overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Episodes</h3>
                <button onClick={() => setShowEpisodeList(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {details?.seasons?.map((s: any) => (
                  <div key={s.id} className="space-y-4">
                    <h4 className="text-sm font-black text-text-secondary uppercase tracking-widest border-b border-white/5 pb-2">
                      {s.name}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: s.episode_count }).map((_, i) => {
                        const epNum = i + 1;
                        const isActive = currentSeason === s.season_number && currentEpisode === epNum;
                        return (
                          <button
                            key={i}
                            onClick={() => handleEpisodeChange(s.season_number, epNum)}
                            className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-accent-red text-white'
                                : 'bg-bg-secondary hover:bg-zinc-800 text-text-secondary'
                            }`}
                          >
                            {epNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Server Selector */}
      <div className="md:hidden h-14 px-4 flex items-center gap-2 overflow-x-auto bg-bg-primary border-t border-white/5 scrollbar-hide">
        <Server className="w-4 h-4 text-text-muted flex-shrink-0" />
        {SOURCES.map((server, idx) => (
          <button
            key={idx}
            onClick={() => setActiveServer(idx)}
            className={`px-4 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeServer === idx
                ? 'bg-accent-red border-accent-red text-white'
                : 'bg-bg-secondary border-white/10 text-text-secondary'
            }`}
          >
            {server.name}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
