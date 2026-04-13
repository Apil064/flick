import React from 'react';
import { useHistory } from '../hooks/useMovies';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

export const ContinueWatching: React.FC = () => {
  const { data: history, isLoading } = useHistory();

  if (isLoading || !history || history.length === 0) return null;

  return (
    <div className="py-10 px-6 md:px-16">
      <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-tight">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {history.slice(0, 5).map((item: any) => {
          const progress = (item.progress_seconds / item.duration_seconds) * 100;
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-64 md:w-80 group cursor-pointer"
              onClick={() => {
                // Open player logic
              }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-bg-secondary">
                <img
                  src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-white" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-accent-red shadow-[0_0_10px_rgba(229,9,20,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold truncate">{item.title}</h3>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">
                  {item.media_type === 'tv' ? `S${item.season} E${item.episode}` : 'Movie'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
