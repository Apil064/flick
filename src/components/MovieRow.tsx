import React from 'react';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  items: any[];
  type: 'movie' | 'tv';
  onItemClick: (item: any) => void;
}

export function MovieRow({ title, items, type, onItemClick }: MovieRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-8 px-6 md:px-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.slice(0, 6).map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            type={type}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
