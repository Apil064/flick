import React, { useState } from 'react';
import { useTrending, usePopular, useTopRated, useByGenre } from '../hooks/useMovies';
import { Carousel } from '../components/Carousel';
import { MovieDetail } from './MovieDetail';
import { AnimatePresence } from 'motion/react';
import { Play, Info } from 'lucide-react';

const GENRES = [
  { id: '10759', name: 'Action & Adventure' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
  { id: '9648', name: 'Mystery' },
  { id: '16', name: 'Animation' },
];

export const TVShows: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeGenre, setActiveGenre] = useState(GENRES[0]);

  const { data: trending } = useTrending('tv');
  const { data: popular } = usePopular('tv');
  const { data: topRated } = useTopRated('tv');
  const { data: genreTV } = useByGenre('tv', activeGenre.id);

  const featured = trending?.[0];

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Featured Banner */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        {featured && (
          <div className="absolute inset-0">
            <img
              src={featured.backdrop_url}
              alt={featured.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 hero-gradient" />
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-16 pb-12 space-y-4">
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-none">{featured?.name}</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => handleItemClick(featured)}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-black text-sm font-black rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2 uppercase tracking-tighter"
            >
              <Play className="w-5 h-5 fill-black" /> PLAY
            </button>
            <button 
              onClick={() => handleItemClick(featured)}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-bg-secondary/60 backdrop-blur-md text-white text-sm font-black rounded-full hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 uppercase tracking-tighter"
            >
              <Info className="w-5 h-5" /> INFO
            </button>
          </div>
        </div>
      </div>

      {/* Genre Tabs */}
      <div className="px-4 sm:px-8 md:px-16 py-4 sm:py-8 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide sticky top-20 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-white/5">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre)}
            className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap uppercase tracking-widest ${
              activeGenre.id === genre.id
                ? 'bg-accent-red text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-white'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-8">
        <Carousel title={`${activeGenre.name} Shows`} items={genreTV || []} type="tv" onItemClick={handleItemClick} />
        <Carousel title="Trending TV" items={trending || []} type="tv" onItemClick={handleItemClick} />
        <Carousel title="Popular TV" items={popular || []} type="tv" onItemClick={handleItemClick} />
        <Carousel title="Top Rated" items={topRated || []} type="tv" onItemClick={handleItemClick} />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type="tv"
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
