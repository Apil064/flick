import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrending, usePopular, useTopRated, useByGenre, useRecent, useByGenreName } from '../hooks/useMovies';
import { Carousel } from '../components/Carousel';
import { MovieDetail } from './MovieDetail';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { ContinueWatching } from '../components/ContinueWatching';

export const Home: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'movie' | 'tv'>('movie');
  const [activePlayerItem, setActivePlayerItem] = useState<any>(null);

  const { data: trendingMovies, isLoading: loadingTrending } = useTrending('movie');
  const { data: trendingTV } = useTrending('tv');
  const { data: popularMovies } = usePopular('movie');
  const { data: topRatedMovies } = useTopRated('movie');
  const { data: recentMovies } = useRecent();
  const { data: actionMovies } = useByGenreName('action');
  const { data: comedyMovies } = useByGenreName('comedy');

  useEffect(() => {
    if (!trendingMovies || trendingMovies.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(trendingMovies.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trendingMovies]);

  const featured = trendingMovies?.[featuredIndex];

  const handleItemClick = (item: any, type: 'movie' | 'tv') => {
    // If item has tmdb_id (from history), use it as the id
    const normalizedItem = {
      ...item,
      id: item.tmdb_id || item.id
    };
    setSelectedItem(normalizedItem);
    setDetailType(type);
  };

  const handleDirectPlay = (item: any) => {
    setActivePlayerItem(item);
  };

  if (loadingTrending) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Hero Section */}
      <div className="relative h-[85vh] md:h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={featured.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img
                src={featured.backdrop_url}
                alt={featured.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 hero-gradient" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 pt-20">
          <motion.div
            key={featured?.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-accent-red text-[10px] font-black uppercase rounded tracking-widest">
                Trending Now
              </span>
              <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-yellow-500" />
                {featured?.rating?.toFixed(1)}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95] text-shadow-lg text-white">
              {featured?.title}
            </h1>

            <p className="text-sm md:text-base text-text-secondary font-medium max-w-lg line-clamp-3 text-shadow-lg opacity-80">
              {featured?.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button 
                onClick={() => handleItemClick(featured, 'movie')}
                className="px-6 py-2.5 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-black" />
                </div>
                <span className="tracking-tighter text-xs uppercase">PLAY NOW</span>
              </button>
              <button 
                onClick={() => handleItemClick(featured, 'movie')}
                className="px-6 py-2.5 bg-bg-secondary/40 backdrop-blur-xl text-white font-black rounded-full hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2 shadow-lg"
              >
                <Info className="w-4 h-4" />
                <span className="tracking-tighter text-xs uppercase">MORE INFO</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-32 right-6 md:right-16 flex gap-2">
          {trendingMovies?.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setFeaturedIndex(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                featuredIndex === i ? 'w-10 bg-accent-red' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carousels */}
      <div className="relative z-10 -mt-12 md:-mt-24 space-y-12">
        <ContinueWatching onPlay={handleDirectPlay} />
        
        <Carousel 
          title="Trending Now" 
          items={trendingMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />
        
        <Carousel 
          title="Popular on Platform" 
          items={popularMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />

        <Carousel 
          title="Top Rated" 
          items={topRatedMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />

        <Carousel 
          title="Action Movies" 
          items={actionMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />

        <Carousel 
          title="Comedy Movies" 
          items={comedyMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />

        <Carousel 
          title="Recently Added" 
          items={recentMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />

        <Carousel 
          title="Popular TV Shows" 
          items={trendingTV || []} 
          type="tv" 
          onItemClick={(item) => handleItemClick(item, 'tv')} 
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={detailType}
            onClose={() => setSelectedItem(null)}
            onItemClick={handleItemClick}
          />
        )}
      </AnimatePresence>

      {/* Direct Player for Continue Watching */}
      <AnimatePresence>
        {activePlayerItem && (
          <EmbedPlayer
            tmdbId={activePlayerItem.tmdb_id || activePlayerItem.id}
            type={activePlayerItem.media_type}
            season={activePlayerItem.season}
            episode={activePlayerItem.episode}
            title={activePlayerItem.title}
            posterPath={activePlayerItem.poster_path || activePlayerItem.poster_url?.replace('https://image.tmdb.org/t/p/w500', '')}
            backdropPath={activePlayerItem.backdrop_path || activePlayerItem.backdrop_url?.replace('https://image.tmdb.org/t/p/original', '')}
            startTime={activePlayerItem.progress_seconds}
            onClose={() => setActivePlayerItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
