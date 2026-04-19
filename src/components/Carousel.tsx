import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface CarouselProps {
  title: string;
  items: any[];
  type: 'movie' | 'tv';
  onItemClick: (item: any) => void;
  limit?: number;
}

export const Carousel: React.FC<CarouselProps> = ({ title, items, type, onItemClick, limit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayItems = limit ? items.slice(0, limit) : items;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayItems]);

  // Auto-scroll logic
  useEffect(() => {
    if (isHovered || isDragging || !scrollRef.current || displayItems.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we're at the end, scroll back to start, otherwise scroll right
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, isDragging, displayItems.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  if (!items || items.length === 0) {
    return (
      <div className="py-6 px-4 sm:px-8 md:px-16 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-[140px] md:w-[220px] aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative group/carousel py-6 px-4 sm:px-8 md:px-16 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-white/90">{title}</h2>
        <button className="text-xs font-bold text-accent-red hover:text-white transition-colors">See All</button>
      </div>

      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/60 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleEnd}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          className={`flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {displayItems.map((item) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <MovieCard 
                item={item} 
                type={type} 
                onClick={() => onItemClick(item)} 
                className="!w-[140px] md:!w-[220px]"
              />
            </div>
          ))}
        </div>

        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/60 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
