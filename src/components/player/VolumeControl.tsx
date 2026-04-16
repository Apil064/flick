import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div 
      className="flex items-center gap-2 group/volume"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={onToggleMute}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <VolumeIcon className="w-6 h-6 text-white" />
      </button>

      <div className={`overflow-hidden transition-all duration-300 flex items-center ${isHovered ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  );
};
