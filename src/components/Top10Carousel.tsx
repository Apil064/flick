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

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/carousel py-16 px-6 md:px-16 overflow-hidden bg-black/20">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-white flex items-baseline gap-4">
          <span className="text-transparent" style={{ WebkitTextStroke: '2px #E50914' }}>TOP 10</span>
          <span className="text-sm md:text-xl tracking-[0.3em] font-bold text-white/90 not-italic">CONTENT TODAY</span>
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
          className={`flex gap-16 md:gap-24 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12 pt-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {displayItems.map((item, index) => (
            <div key={item.id} className="snap-start flex-shrink-0 relative group/item flex items-end">
              {/* Numeric Badge */}
              <div className="absolute -left-12 md:-left-20 bottom-[-5%] z-10 select-none pointer-events-none">
                <span className="text-[160px] md:text-[260px] font-black leading-none tracking-tighter transition-all duration-500 group-hover/item:scale-110"
                      style={{ 
                        WebkitTextStroke: '3px #E50914',
                        color: 'transparent',
                        opacity: '0.8'
                      }}>
                  {index + 1}
                </span>
              </div>
              
              <div className="ml-8 md:ml-16 relative z-20 transition-all duration-500 group-hover/item:scale-110 group-hover/item:-translate-y-6">
                <div className="relative rounded-lg overflow-hidden border-4 border-transparent group-hover/item:border-accent-red group-hover/item:shadow-[0_0_40px_rgba(229,9,20,0.6)] transition-all duration-500 shadow-2xl">
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
