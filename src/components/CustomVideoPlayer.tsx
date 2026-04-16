import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Settings, Maximize, Minimize, Subtitles, List, ChevronLeft,
  Star, Clock, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomVideoPlayerProps {
  source: string;
  title?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  details?: any;
  seasonDetails?: any;
  startTime?: number;
  onClose: () => void;
  onProgress?: (progress: number, duration: number) => void;
  onEpisodeChange?: (season: number, episode: number) => void;
  onToggleEpisodeList?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  source, title, type, season, episode, details, seasonDetails, 
  startTime = 0, onClose, onProgress, onEpisodeChange, onToggleEpisodeList
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentEpisodeDetails = type === 'tv' 
    ? seasonDetails?.episodes?.find((e: any) => e.episode_number === episode)
    : null;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (startTime > 0) video.currentTime = startTime;
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (startTime > 0) video.currentTime = startTime;
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [source, startTime]);

  // Controls visibility logic
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Video event handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      if (onProgress) onProgress(current, dur);
    }
  };

  const seek = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden select-none"
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-t from-black/90 via-transparent to-black/60"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Middle Info (Bottom Left) */}
            <div className="flex flex-col gap-4 max-w-2xl mb-24">
              <div className="flex items-center gap-3">
                {type === 'tv' && (
                  <span className="px-2 py-0.5 bg-accent-red text-[10px] font-black uppercase rounded">
                    S{season} E{episode}
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none drop-shadow-2xl">
                  {type === 'tv' ? currentEpisodeDetails?.name || title : title}
                </h1>
              </div>
              
              <div className="flex items-center gap-6 text-sm font-bold text-white/80">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  {details?.rating?.toFixed(1) || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {details?.release_year}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {type === 'movie' ? `${details?.runtime}m` : `${currentEpisodeDetails?.runtime || 45}m`}
                </div>
              </div>

              <p className="text-lg text-white/60 line-clamp-3 leading-relaxed drop-shadow-md font-medium">
                {type === 'tv' ? currentEpisodeDetails?.overview || details?.description : details?.description}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col gap-6 w-full">
              {/* Progress Bar */}
              <div className="flex items-center gap-4 group/progress">
                <span className="text-xs font-bold font-mono w-12">{formatTime(currentTime)}</span>
                <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent-red transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono w-12">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white" />}
                  </button>
                  <button onClick={() => seek(-10)} className="hover:scale-110 transition-transform">
                    <RotateCcw className="w-7 h-7" />
                  </button>
                  <button onClick={() => seek(10)} className="hover:scale-110 transition-transform">
                    <RotateCw className="w-7 h-7" />
                  </button>
                  <div className="flex items-center gap-3 group/volume">
                    <button onClick={toggleMute}>
                      {isMuted || volume === 0 ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
                    </button>
                    <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden h-1.5 bg-white/20 rounded-full relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute top-0 left-0 h-full bg-white"
                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <button className="hover:text-accent-red transition-colors">
                    <Subtitles className="w-6 h-6" />
                  </button>
                  <button className="hover:text-accent-red transition-colors">
                    <Settings className="w-6 h-6" />
                  </button>
                  {type === 'tv' && (
                    <button 
                      onClick={onToggleEpisodeList}
                      className="flex items-center gap-2 hover:text-accent-red transition-colors"
                    >
                      <List className="w-6 h-6" />
                      <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Episodes</span>
                    </button>
                  )}
                  <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                    {isFullscreen ? <Minimize className="w-7 h-7" /> : <Maximize className="w-7 h-7" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
