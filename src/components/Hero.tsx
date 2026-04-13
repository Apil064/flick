import React from 'react';
import { Play, Info, Plus, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  movie: any;
  onPlay: () => void;
  onInfo: () => void;
  onDownload: () => void;
}

export function Hero({ movie, onPlay, onInfo, onDownload }: HeroProps) {
  if (!movie) return <div className="h-[85vh] bg-zinc-900 animate-pulse" />;

  const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const title = movie.title || movie.name;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={backdrop}
          alt={title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-3xl gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600/20 text-red-500 text-xs font-bold px-2 py-1 rounded border border-red-500/30 uppercase tracking-widest">
              Flick Original
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-sm font-bold">{movie.vote_average?.toFixed(1)}</span>
              <span className="text-xs text-zinc-400">/ 10</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-tight uppercase">
            {title}
          </h1>
          
          <p className="text-zinc-300 text-lg line-clamp-3 max-w-xl mb-8 leading-relaxed">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlay}
              className="px-8 py-4 bg-white text-black rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-zinc-200 transition-colors"
            >
              <Play className="w-6 h-6 fill-black" />
              Watch Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-red-700 transition-colors"
            >
              <Download className="w-6 h-6" />
              Download
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onInfo}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
            >
              <Info className="w-6 h-6" />
              More Info
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-white/10 text-white rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
