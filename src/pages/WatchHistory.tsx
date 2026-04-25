import React, { useState } from 'react';
import { Trash2, Play, Calendar, Clock, Star, ChevronLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchHistory, useRemoveFromHistory, useClearHistory } from '../hooks/useMovies';
import { MovieDetail } from './MovieDetail';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export const WatchHistory: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { data: history, isLoading } = useWatchHistory();
  const { mutate: removeFromHistory } = useRemoveFromHistory();
  const { mutate: clearHistory } = useClearHistory();
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activePlayerItem, setActivePlayerItem] = useState<any>(null);

  const getImageUrl = (item: any) => {
    if (item.backdrop_url) return item.backdrop_url;
    if (item.poster_url) return item.poster_url;
    
    if (item.backdrop_path) {
      if (item.backdrop_path.startsWith('http')) return item.backdrop_path;
      return `https://image.tmdb.org/t/p/w780${item.backdrop_path.startsWith('/') ? '' : '/'}${item.backdrop_path}`;
    }
    if (item.poster_path) {
      if (item.poster_path.startsWith('http')) return item.poster_path;
      return `https://image.tmdb.org/t/p/w500${item.poster_path.startsWith('/') ? '' : '/'}${item.poster_path}`;
    }
    return 'https://via.placeholder.com/780x440?text=No+Image';
  };

  const handleItemClick = (item: any) => {
    setSelectedItem({
      ...item,
      id: item.tmdb_id
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      clearHistory();
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary pt-32 px-6 md:px-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-bg-primary pt-32 px-6 md:px-16 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Sign in required</h1>
          <p className="text-text-secondary font-medium">Please sign in to view and manage your watch history across all your devices.</p>
          <Link to="/" className="inline-block px-8 py-3 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Link to="/" className="text-accent-red flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white">Watch History</h1>
            <p className="text-text-secondary font-medium">Manage your recently watched movies and TV shows.</p>
          </div>
          
          {history && history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-accent-red/20 border border-white/10 hover:border-accent-red/50 rounded-full text-xs font-black uppercase tracking-widest transition-all text-white"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          )}
        </div>

        {!history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Clock className="w-10 h-10 text-text-muted" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Your history is empty</h2>
              <p className="text-text-secondary">Start watching something to see it here!</p>
            </div>
            <Link to="/" className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item: any) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      onClick={() => setActivePlayerItem(item)}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 fill-black" />
                    </button>
                    <button
                      onClick={() => handleItemClick(item)}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/40 transition-all"
                    >
                      <Info className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                      {item.media_type}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromHistory(item.tmdb_id)}
                    className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-accent-red transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-accent-red transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.last_watched).toLocaleDateString()}
                      </span>
                      {item.media_type === 'tv' && (
                        <span className="text-accent-red">
                          S{item.season} E{item.episode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      <span>Progress</span>
                      <span>{item.duration_seconds > 0 ? Math.round((item.progress_seconds / item.duration_seconds) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-red shadow-[0_0_10px_rgba(229,9,20,0.5)]" 
                        style={{ width: `${item.duration_seconds > 0 ? Math.round((item.progress_seconds / item.duration_seconds) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={selectedItem.media_type}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePlayerItem && (
          <EmbedPlayer
            tmdbId={activePlayerItem.tmdb_id}
            type={activePlayerItem.media_type}
            season={activePlayerItem.season}
            episode={activePlayerItem.episode}
            title={activePlayerItem.title}
            posterPath={activePlayerItem.poster_path}
            backdropPath={activePlayerItem.backdrop_path}
            startTime={activePlayerItem.progress_seconds}
            onClose={() => setActivePlayerItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
