import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';
import { usePlayer } from '../../hooks/usePlayer';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import { PlayerOverlay } from './PlayerOverlay';
import { PlayerControls } from './PlayerControls';
import { X } from 'lucide-react';

interface PlayerContainerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  backdropPath?: string;
  season?: number;
  episode?: number;
  startTime?: number;
  onClose: () => void;
  sources?: { label: string; url: string; type: 'iframe' | 'video' }[];
}

export const PlayerContainer: React.FC<PlayerContainerProps> = ({
  tmdbId,
  type,
  title,
  posterPath,
  backdropPath,
  season,
  episode,
  startTime = 0,
  onClose,
  sources = []
}) => {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  
  const { 
    state, 
    togglePlay, 
    seek, 
    setVolume, 
    toggleMute, 
    setDuration, 
    setPlaying, 
    setProgress,
    setBuffering
  } = usePlayer(startTime);

  const defaultSources = [
    { 
      label: 'Server 1 (Vidking)', 
      type: 'iframe' as const, 
      url: type === 'movie' 
        ? `https://vidking.net/embed/movie/${tmdbId}?color=E50914`
        : `https://vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=E50914`
    },
    { 
      label: 'Server 2 (AutoEmbed)', 
      type: 'iframe' as const, 
      url: type === 'movie'
        ? `https://player.autoembed.cc/embed/movie/${tmdbId}`
        : `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`
    },
    {
      label: 'Server 3 (HLS Demo)',
      type: 'video' as const,
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    }
  ];

  const allSources = sources.length > 0 ? sources : defaultSources;
  const activeSource = allSources[activeSourceIndex];

  // Watch Progress Hook
  useWatchProgress({
    tmdbId,
    mediaType: type,
    title,
    posterPath,
    backdropPath,
    season,
    episode,
    currentTime: state.currentTime,
    duration: state.duration,
    enabled: true
  });

  // Initialize Native Player
  useEffect(() => {
    if (activeSource.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      if (activeSource.url.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(activeSource.url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = activeSource.url;
        }
      } else {
        video.src = activeSource.url;
      }

      plyrRef.current = new Plyr(video, {
        controls: [], // We use our custom UI
        keyboard: { focused: true, global: true },
      });

      plyrRef.current.on('ready', () => {
        setDuration(plyrRef.current?.duration || 0);
        if (startTime > 0) plyrRef.current?.forward(startTime);
      });

      plyrRef.current.on('timeupdate', () => {
        setProgress(plyrRef.current?.currentTime || 0);
      });

      plyrRef.current.on('playing', () => setPlaying(true));
      plyrRef.current.on('pause', () => setPlaying(false));
      plyrRef.current.on('waiting', () => setBuffering(true));
      plyrRef.current.on('playing', () => setBuffering(false));

      return () => {
        plyrRef.current?.destroy();
      };
    }
  }, [activeSource, startTime]);

  // Sync state with native player
  useEffect(() => {
    if (plyrRef.current) {
      if (state.isPlaying) plyrRef.current.play();
      else plyrRef.current.pause();
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (plyrRef.current) {
      plyrRef.current.volume = state.volume;
      plyrRef.current.muted = state.isMuted;
    }
  }, [state.volume, state.isMuted]);

  const handleToggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSkip = (seconds: number) => {
    if (plyrRef.current) {
      plyrRef.current.currentTime += seconds;
    } else {
      // Best effort for iframe (simulated)
      seek(Math.max(0, state.currentTime + seconds));
    }
  };

  const handleSeek = (time: number) => {
    if (plyrRef.current) {
      plyrRef.current.currentTime = time;
    } else {
      seek(time);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 z-[210] p-3 bg-black/40 hover:bg-black/60 rounded-full transition-all border border-white/10 group"
      >
        <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Player Content */}
      <div className="relative w-full h-full">
        {activeSource.type === 'iframe' ? (
          <iframe
            src={activeSource.url}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : (
          <video ref={videoRef} className="w-full h-full" />
        )}

        {/* Custom Overlay Layer */}
        <PlayerOverlay 
          isPlaying={state.isPlaying} 
          isBuffering={state.isBuffering}
          onTogglePlay={togglePlay}
        >
          <PlayerControls 
            isPlaying={state.isPlaying}
            currentTime={state.currentTime}
            duration={state.duration}
            volume={state.volume}
            isMuted={state.isMuted}
            isFullScreen={!!document.fullscreenElement}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
            onToggleFullScreen={handleToggleFullScreen}
            onSkip={handleSkip}
            title={title}
            sources={allSources}
            activeSourceIndex={activeSourceIndex}
            onSourceChange={setActiveSourceIndex}
          />
        </PlayerOverlay>
      </div>

      {/* Server Switcher (Phase 3) */}
      {sources.length > 1 && (
        <div className="absolute top-6 right-6 z-[210] flex gap-2">
          {sources.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSourceIndex(i)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                activeSourceIndex === i 
                  ? 'bg-accent-red border-accent-red text-white' 
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
