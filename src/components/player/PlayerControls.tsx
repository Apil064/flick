import React, { useState } from 'react';
import { Play, Pause, Maximize, Minimize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu } from './SettingsMenu';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullScreen: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullScreen: () => void;
  onSkip: (seconds: number) => void;
  title?: string;
  sources?: { label: string; url: string; type: 'iframe' | 'video' }[];
  activeSourceIndex?: number;
  onSourceChange?: (index: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullScreen,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullScreen,
  onSkip,
  title,
  sources = [],
  activeSourceIndex = 0,
  onSourceChange = () => {}
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex flex-col px-4 md:px-8 pb-4 md:pb-8 space-y-4">
      {/* Progress Bar */}
      <ProgressBar current={currentTime} total={duration} onSeek={onSeek} />

      {/* Control Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={onTogglePlay}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => onSkip(-10)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => onSkip(10)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          <VolumeControl 
            volume={volume} 
            isMuted={isMuted} 
            onVolumeChange={onVolumeChange} 
            onToggleMute={onToggleMute} 
          />

          <div className="text-sm font-bold text-white tabular-nums">
            {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {title && (
            <div className="hidden lg:block text-sm font-black uppercase tracking-widest text-white/60 truncate max-w-xs">
              {title}
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors ${isSettingsOpen ? 'bg-white/10' : ''}`}
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
            
            <SettingsMenu 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)}
              sources={sources}
              activeSourceIndex={activeSourceIndex}
              onSourceChange={onSourceChange}
            />
          </div>

          <button 
            onClick={onToggleFullScreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isFullScreen ? (
              <Minimize className="w-6 h-6 text-white" />
            ) : (
              <Maximize className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
