import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrending, usePopular, useTopRated, useByGenre } from '../hooks/useMovies';
import { Carousel } from '../components/Carousel';
import { MovieDetail } from './MovieDetail';
import { ContinueWatching } from '../components/ContinueWatching';

export const Home: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'movie' | 'tv'>('movie');

  const { data: trendingMovies, isLoading: loadingTrending } = useTrending('movie');
  const { data: trendingTV } = useTrending('tv');
  const { data: popularMovies } = usePopular('movie');
  const { data: actionMovies } = useByGenre('movie', '28');
  const { data: dramaMovies } = useByGenre('movie', '18');

  useEffect(() => {
    if (!trendingMovies || trendingMovies.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(trendingMovies.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trendingMovies]);

  const featured = trendingMovies?.[featuredIndex];

  const handleItemClick = (item: any, type: 'movie' | 'tv') => {
    setSelectedItem(item);
    setDetailType(type);
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
                src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
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
                {featured?.vote_average?.toFixed(1)}
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-shadow-lg">
              {featured?.title}
            </h1>

            <p className="text-lg md:text-xl text-text-secondary font-medium max-w-2xl line-clamp-3 text-shadow-lg">
              {featured?.overview}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => handleItemClick(featured, 'movie')}
                className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all flex items-center gap-3 group"
              >
                <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" />
                PLAY NOW
              </button>
              <button 
                onClick={() => handleItemClick(featured, 'movie')}
                className="px-10 py-4 bg-bg-secondary/60 backdrop-blur-md text-white font-black rounded-full hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3"
              >
                <Info className="w-6 h-6" />
                MORE INFO
              </button>
            </div>
          </motion.div>
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-10 right-6 md:right-16 flex gap-2">
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
      <div className="relative z-10 -mt-20 md:-mt-32 space-y-4">
        <ContinueWatching />
        <Carousel 
          title="Trending This Week" 
          items={trendingMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />
        <Carousel 
          title="Popular TV Shows" 
          items={trendingTV || []} 
          type="tv" 
          onItemClick={(item) => handleItemClick(item, 'tv')} 
        />
        <Carousel 
          title="Top Rated Movies" 
          items={popularMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />
        <Carousel 
          title="Action Packed" 
          items={actionMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />
        <Carousel 
          title="Drama Series" 
          items={dramaMovies || []} 
          type="movie" 
          onItemClick={(item) => handleItemClick(item, 'movie')} 
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={detailType}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
