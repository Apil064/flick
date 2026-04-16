import React, { useState, useEffect } from 'react';
import { X, List, Play, Search, ToggleLeft as Toggle, ToggleRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieDetails, useTVSeason } from '../hooks/useMovies';
import { PlayerContainer } from './player/PlayerContainer';

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
  
  const { data: details } = useMovieDetails(type, tmdbId);
  const { data: seasonDetails } = useTVSeason(tmdbId, currentSeason);

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
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
      {/* Player Container */}
      <div className="flex-1 relative bg-black">
        <PlayerContainer
          tmdbId={tmdbId}
          type={type}
          title={title || ''}
          posterPath={posterPath}
          backdropPath={backdropPath}
          season={currentSeason}
          episode={currentEpisode}
          startTime={startTime}
          onClose={onClose}
        />

        {/* Episode Sidebar Trigger (Floating) */}
        {type === 'tv' && !showEpisodeList && (
          <button
            onClick={() => setShowEpisodeList(true)}
            className="absolute top-6 right-20 z-[210] p-3 bg-black/40 hover:bg-black/60 rounded-full transition-all border border-white/10 group"
          >
            <List className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Episode Sidebar */}
        <AnimatePresence>
          {showEpisodeList && type === 'tv' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[500px] bg-bg-primary/98 backdrop-blur-3xl border-l border-white/10 z-[220] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
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
