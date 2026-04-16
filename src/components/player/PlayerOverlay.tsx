import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface PlayerOverlayProps {
  isPlaying: boolean;
  isBuffering: boolean;
  onTogglePlay: () => void;
  children: React.ReactNode;
}

export const PlayerOverlay: React.FC<PlayerOverlayProps> = ({
  isPlaying,
  isBuffering,
  onTogglePlay,
  children
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = () => {
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => setIsVisible(false), 3000);
    }
  };

  useEffect(() => {
    showControls();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying]);

  return (
    <div 
      className="absolute inset-0 z-40 group cursor-none"
      onMouseMove={showControls}
      onClick={onTogglePlay}
      style={{ cursor: isVisible ? 'default' : 'none' }}
    >
      {/* Gradients */}
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" 
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" 
            />
          </>
        )}
      </AnimatePresence>

      {/* Center Controls */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {isBuffering ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="w-20 h-20 text-accent-red animate-spin" />
            </motion.div>
          ) : !isPlaying || isVisible ? (
            <motion.div
              key={isPlaying ? 'pause' : 'play'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="p-8 bg-black/20 backdrop-blur-sm rounded-full border border-white/10"
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white fill-white" />
              ) : (
                <Play className="w-12 h-12 text-white fill-white ml-1" />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Wrapper */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 pointer-events-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
