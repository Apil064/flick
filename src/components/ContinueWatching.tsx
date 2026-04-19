import React from 'react';
import { useContinueWatching } from '../hooks/useMovies';
import { Play } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface ContinueWatchingProps {
  onPlay: (item: any) => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onPlay }) => {
  const { isSignedIn } = useUser();
  const { data: history, isLoading } = useContinueWatching();

  const getImageUrl = (backdropPath?: string, posterPath?: string) => {
    if (backdropPath) {
      if (backdropPath.startsWith('http')) return backdropPath;
      return `https://image.tmdb.org/t/p/w780${backdropPath}`;
    }
    if (posterPath) {
      if (posterPath.startsWith('http')) return posterPath;
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return ''; // Background will show white/5 loader base
  };

  if (!isSignedIn || isLoading || !history || history.length === 0) return null;

  const displayHistory = history.slice(0, 10);

  return (
    <div className="py-10 px-4 sm:px-8 md:px-16">
      <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-white/90 mb-8">Continue Watching</h2>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 pr-6 md:pr-16">
        {displayHistory.map((item: any) => {
          const progress = item.duration_seconds > 0 ? (item.progress_seconds / item.duration_seconds) * 100 : 0;
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-[240px] md:w-[320px] group cursor-pointer"
              onClick={() => onPlay({
                ...item,
                id: item.tmdb_id,
                progress_seconds: item.progress_seconds,
                season: item.season,
                episode: item.episode
              })}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-white/5 border border-white/10 shadow-2xl">
                <img
                  src={getImageUrl(item.backdrop_path, item.poster_path)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-accent-red flex items-center justify-center scale-0 group-hover:scale-100 transition-all duration-500 shadow-[0_0_30px_rgba(229,9,20,0.6)]">
                    <Play className="w-7 h-7 fill-white text-white ml-1" />
                  </div>
                </div>
                
                {/* Progress Bar Container */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 backdrop-blur-sm">
                  <div 
                    className="h-full bg-accent-red shadow-[0_0_15px_rgba(229,9,20,0.8)] transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2 px-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold truncate text-sm tracking-tight text-white/90">{item.title}</h3>
                  <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                    {Math.max(0, Math.floor((item.duration_seconds - item.progress_seconds) / 60))}m left
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider opacity-60">
                  {item.media_type === 'tv' ? `S${item.season} • E${item.episode}` : 'Feature Film'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
