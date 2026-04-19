import React from 'react';
import { useWatchlist, useRemoveFromWatchlist } from '../hooks/useMovies';
import { MovieCard } from '../components/MovieCard';
import { MovieDetail } from './MovieDetail';
import { AnimatePresence } from 'motion/react';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export const Watchlist: React.FC = () => {
  const { isSignedIn } = useUser();
  const { data: watchlist, isLoading } = useWatchlist();
  const { mutate: remove } = useRemoveFromWatchlist();
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <Bookmark className="w-20 h-20 text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">Sign in to see your watchlist</h1>
        <p className="text-text-secondary max-w-md mb-8">
          Keep track of all the movies and TV shows you want to watch in one place.
        </p>
        <Link to="/" className="px-8 py-3 bg-accent-red text-white font-bold rounded-full hover:bg-red-700 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-24 px-6 md:px-16 pb-20">
      <div className="flex items-center gap-4 mb-12">
        <Bookmark className="w-10 h-10 text-accent-red" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Watchlist</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !watchlist || watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
          <p className="text-text-secondary mb-8">Start adding movies and shows to keep track of them!</p>
          <Link to="/movies" className="flex items-center gap-2 text-accent-red font-bold hover:underline">
            Browse Movies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {watchlist.map((item: any) => (
            <div key={item.id} className="relative group">
              <MovieCard
                item={item}
                type={item.media_type}
                onClick={() => setSelectedItem(item)}
              />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <MovieDetail
            item={selectedItem}
            type={selectedItem.media_type}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
