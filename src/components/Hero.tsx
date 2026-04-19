import React, { useState, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieImages, useMovieDetails } from '../hooks/useMovies';

interface HeroProps {
  items: any[];
  onItemClick: (item: any, type: 'movie' | 'tv') => void;
}

export const Hero: React.FC<HeroProps> = ({ items, onItemClick }) => {
  const [index, setIndex] = useState(0);
  const currentItem = items?.[index];
  const type = currentItem?.media_type || 'movie';
  
  const { data: images } = useMovieImages(type, currentItem?.id?.toString());
  const { data: details } = useMovieDetails(type, currentItem?.id?.toString());

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.min(items.length, 10));
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return <div className="h-[70vh] md:h-screen min-h-[500px] w-full bg-bg-primary" />;
  }

  if (!currentItem) return null;

  const logo = images?.logos?.find((l: any) => l.iso_639_1 === 'en' && l.file_path.endsWith('.png')) || 
               images?.logos?.find((l: any) => l.iso_639_1 === 'en') || 
               images?.logos?.[0];
  const logoUrl = logo ? `https://image.tmdb.org/t/p/w500${logo.file_path}` : null;

  return (
    <div className="relative h-[70vh] md:h-screen min-h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={currentItem.backdrop_url}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 hero-gradient" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-16 pt-20">
        <motion.div
          key={currentItem.id}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-2xl space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-accent-red text-[9px] font-black uppercase rounded tracking-widest">
              TOP 10 TRENDING TODAY
            </span>
            <span className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-500" />
              {currentItem.rating?.toFixed(1)}
            </span>
            <span className="text-text-secondary text-xs font-bold">{currentItem.release_year}</span>
          </div>

          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={currentItem.title} 
              className="h-16 md:h-28 max-w-[280px] md:max-w-[380px] object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95] text-shadow-lg text-white">
              {currentItem.title}
            </h1>
          )}

          <div className="flex flex-wrap gap-x-2.5 gap-y-1">
            {details?.genres?.slice(0, 3).map((g: any) => (
              <span key={g.id} className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                {g.name}
              </span>
            ))}
          </div>

          <p className="hidden sm:block text-xs md:text-sm text-text-secondary font-medium max-w-lg line-clamp-3 text-shadow-lg opacity-80 leading-relaxed">
            {currentItem.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => onItemClick(currentItem, type)}
              className="min-w-[140px] px-6 py-2.5 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              <Play className="w-4 h-4 fill-black" />
              <span className="tracking-tighter text-xs uppercase">PLAY NOW</span>
            </button>
            <button 
              onClick={() => onItemClick(currentItem, type)}
              className="min-w-[140px] px-6 py-2.5 bg-bg-secondary/40 backdrop-blur-xl text-white font-black rounded-full hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2 shadow-lg"
            >
              <Info className="w-4 h-4" />
              <span className="tracking-tighter text-xs uppercase">MORE INFO</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Hero Indicators */}
      <div className="absolute bottom-6 md:bottom-32 right-6 md:right-16 flex gap-2">
        {items?.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              index === i ? 'w-10 bg-accent-red' : 'w-4 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
