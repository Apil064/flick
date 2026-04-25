import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/clerk-react';
import { useTrending, usePopular, useTopRated, useByGenre, useRecent, useByGenreName } from '../hooks/useMovies';
import { Carousel } from '../components/Carousel';
import { Top10Carousel } from '../components/Top10Carousel';
import { MovieDetail } from './MovieDetail';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { ContinueWatching } from '../components/ContinueWatching';
import { Hero } from '../components/Hero';

export const Home: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'movie' | 'tv'>('movie');
  const [activePlayerItem, setActivePlayerItem] = useState<any>(null);
  const { isSignedIn } = useUser();

  const { data: trendingMovies, isLoading: loadingTrending, isError: trendingError } = useTrending('movie');
  const { data: popularTV } = usePopular('tv');
  const { data: popularMovies } = usePopular('movie');
  const { data: topRatedMovies } = useTopRated('movie');
  const { data: actionMovies } = useByGenreName('action');
  const { data: comedyMovies } = useByGenreName('comedy');

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

  if (trendingError) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Unable to load content</h2>
        <p className="text-text-secondary mb-8">There was an error connecting to the streaming service. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all font-sans"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Hero Section */}
      <Hero 
        items={trendingMovies || []} 
        onItemClick={handleItemClick} 
      />

      {/* Carousels */}
      <div className="relative z-10 mt-20 md:mt-32 space-y-12">
        {isSignedIn && <ContinueWatching onPlay={handleDirectPlay} />}
        
        <Top10Carousel
          title="Top 10 Movies"
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
          title="Popular TV Shows" 
          items={popularTV || []} 
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
