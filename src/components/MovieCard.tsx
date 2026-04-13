import React from 'react';
import { motion } from 'motion/react';
import { Star, Play } from 'lucide-react';

interface MovieCardProps {
  key?: React.Key;
  item: any;
  type: 'movie' | 'tv';
  onClick: () => void;
}

export function MovieCard({ item, type, onClick }: MovieCardProps) {
  const title = item.title || item.name;
  const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  const rating = item.vote_average?.toFixed(1);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-lg">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-white">{rating}</span>
          </div>
          <h3 className="text-white font-bold text-sm line-clamp-2">{title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
            <span>•</span>
            <span className="capitalize">{type}</span>
          </div>
        </div>
      </div>
      
      {/* Play button overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100 shadow-xl">
        <Play className="w-6 h-6 text-white fill-white ml-1" />
      </div>
    </motion.div>
  );
}
