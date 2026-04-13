import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MovieRow } from './components/MovieRow';
import { EmbedPlayer } from './components/EmbedPlayer';
import { useTrending, usePopular, useMovieDetails } from './hooks/useMovies';
import { X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const queryClient = new QueryClient();

function AppContent() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const { data: trendingMovies } = useTrending('movie');
  const { data: trendingTV } = useTrending('tv');
  const { data: popularMovies } = usePopular('movie');

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredMovie = trendingMovies?.[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <Navbar />
      
      <AnimatePresence mode="wait">
        {showPlayer && selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
              <button 
                onClick={() => setShowPlayer(false)}
                className="flex items-center gap-2 text-white font-medium hover:text-red-500 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
                Back to Details
              </button>
              <h2 className="font-bold">{selectedItem.title || selectedItem.name}</h2>
              <div className="w-20" /> {/* Spacer */}
            </div>
            <div className="flex-1 flex items-center justify-center p-4 md:p-10">
              <EmbedPlayer 
                tmdbId={selectedItem.id.toString()} 
                type={selectedItem.title ? 'movie' : 'tv'} 
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main>
        <Hero 
          movie={selectedItem || featuredMovie} 
          onPlay={() => {
            if (!selectedItem && featuredMovie) setSelectedItem(featuredMovie);
            setShowPlayer(true);
          }}
          onInfo={() => {}}
        />

        <div className="-mt-32 relative z-10">
          <MovieRow 
            title="Trending Today" 
            items={trendingMovies} 
            type="movie" 
            onItemClick={handleItemClick} 
          />
          
          <MovieRow 
            title="Flick Originals" 
            items={trendingTV} 
            type="tv" 
            onItemClick={handleItemClick} 
          />

          <div className="py-8 px-6 md:px-16">
            <h2 className="text-4xl font-black text-white/10 mb-8 tracking-tighter uppercase italic">
              Top 10 Content Today
            </h2>
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar">
              {Array.isArray(popularMovies) && popularMovies.slice(0, 10).map((movie: any, index: number) => (
                <div key={movie.id} className="relative flex-shrink-0 group cursor-pointer" onClick={() => handleItemClick(movie)}>
                  <span className="absolute -left-6 bottom-0 text-[120px] font-black text-transparent stroke-white/20 stroke-2 leading-none select-none group-hover:text-red-600/20 transition-colors">
                    {index + 1}
                  </span>
                  <div className="w-48 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 ml-8 shadow-2xl">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MovieRow 
            title="Popular Movies" 
            items={popularMovies} 
            type="movie" 
            onItemClick={handleItemClick} 
          />
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 text-center">
        <div className="text-2xl font-black tracking-tighter text-white/20 mb-2">FLICK</div>
        <p className="text-zinc-600 text-sm">© 2026 Flick Streaming. Inspired by premium platforms.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
