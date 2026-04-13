import React, { useState } from 'react';
import { useNowPlaying, useOnAir } from '../hooks/useMovies';
import { MovieCard } from '../components/MovieCard';
import { MovieDetail } from './MovieDetail';
import { AnimatePresence } from 'motion/react';

export const NewAndPopular: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { data: nowPlaying, isLoading: loadingMovies } = useNowPlaying();
  const { data: onAir, isLoading: loadingTV } = useOnAir();

  const items = activeTab === 'movies' ? nowPlaying : onAir;
  const isLoading = activeTab === 'movies' ? loadingMovies : loadingTV;

  return (
    <div className="min-h-screen bg-bg-primary pt-24 px-6 md:px-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">New & Popular</h1>
        
        <div className="flex bg-bg-secondary p-1 rounded-full border border-white/5">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'movies' ? 'bg-accent-red text-white shadow-lg' : 'text-text-secondary hover:text-white'
            }`}
          >
            New Movies
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'tv' ? 'bg-accent-red text-white shadow-lg' : 'text-text-secondary hover:text-white'
            }`}
          >
            New TV Shows
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {isLoading ? (
          Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-bg-secondary animate-pulse rounded-lg" />
          ))
        ) : (
          items?.map((item: any) => (
            <MovieCard
              key={item.id}
              item={item}
              type={activeTab === 'movies' ? 'movie' : 'tv'}
              onClick={() => setSelectedItem(item)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={activeTab === 'movies' ? 'movie' : 'tv'}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
