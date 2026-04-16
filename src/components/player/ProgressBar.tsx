import React, { useState, useRef, useEffect } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek: (time: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, onSeek }) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  const percentage = total > 0 ? (current / total) * 100 : 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    setHoverTime(percent * total);
    setHoverX(x);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    onSeek(percent * total);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={barRef}
      className="relative w-full h-1.5 bg-white/20 cursor-pointer group transition-all hover:h-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverTime(null)}
      onClick={handleClick}
    >
      {/* Played Progress */}
      <div 
        className="absolute top-0 left-0 h-full bg-accent-red transition-all duration-100"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-red rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
      </div>

      {/* Hover Preview */}
      {hoverTime !== null && (
        <>
          <div 
            className="absolute top-0 left-0 h-full bg-white/30"
            style={{ width: `${(hoverX / (barRef.current?.width || 1)) * 100}%` }}
          />
          <div 
            className="absolute bottom-6 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-white pointer-events-none"
            style={{ left: hoverX }}
          >
            {formatTime(hoverTime)}
          </div>
        </>
      )}
    </div>
  );
};
