import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface Top10CarouselProps {
  title: string;
  items: any[];
  type: 'movie' | 'tv';
  onItemClick: (item: any) => void;
}

export const Top10Carousel: React.FC<Top10CarouselProps> = ({ title, items, type, onItemClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const displayItems = items.slice(0, 10);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  const handleEnd = () => {
    setIsDragging(false);
  };

  if (!items || items.length === 0) {
    return (
      <div className="py-16 px-6 md:px-16 overflow-hidden bg-black/20">
        <div className="h-20 md:h-28 w-2/3 bg-white/5 animate-pulse rounded-2xl mb-12" />
        <div className="flex gap-8 px-8 sm:px-16 md:px-24">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-44 md:w-56 aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/carousel py-12 px-4 sm:px-8 md:px-16 overflow-hidden bg-black/20">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-white flex items-baseline gap-3">
          <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #E50914' }}>Top 10</span>
          <span className="text-[10px] md:text-xs font-bold text-text-secondary tracking-widest uppercase">Content Today</span>
        </h2>
      </div>

      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-50 w-16 bg-gradient-to-r from-black to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-10 h-10 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleEnd}
          onMouseMove={handleMouseMove}
          className={`flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12 pt-10 px-8 sm:px-16 md:px-24 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {displayItems.map((item, index) => (
            <div key={item.id} className="snap-start flex-shrink-0 relative group/item flex items-end pl-8 sm:pl-10 md:pl-14">
              {/* Numeric Badge */}
              <div className="absolute left-0 bottom-[-5%] z-10 select-none pointer-events-none transition-all duration-500 group-hover/item:-translate-x-3 md:group-hover/item:-translate-x-5 origin-bottom-right">
                <span className="text-[60px] sm:text-[80px] md:text-[130px] font-black leading-[0.8] tracking-tighter transition-all duration-500"
                      style={{ 
                        WebkitTextStroke: '1.5px #E50914',
                        color: 'transparent',
                      }}>
                  <span className="relative">
                    {/* Outline Layer */}
                    {index + 1}
                    {/* Fill Layer (Visible on Hover) */}
                    <span className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"
                          style={{ 
                            color: '#E50914',
                            WebkitTextStroke: '0px',
                            filter: 'drop-shadow(0 0 15px rgba(229,9,20,0.8))',
                            background: 'linear-gradient(to bottom, #ff4d4d, #E50914)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                      {index + 1}
                    </span>
                  </span>
                </span>
              </div>
              
              <div className="relative z-20 transition-all duration-500">
                <div className="relative rounded-lg overflow-hidden transition-all duration-500 shadow-2xl">
                  <MovieCard item={item} type={type} onClick={() => onItemClick(item)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-50 w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-10 h-10 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
