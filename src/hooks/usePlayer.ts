import { useState, useEffect, useCallback, useRef } from 'react';

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullScreen: boolean;
  isBuffering: boolean;
}

export const usePlayer = (initialTime: number = 0) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: initialTime,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isFullScreen: false,
    isBuffering: false,
  });

  const playerRef = useRef<any>(null);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const seek = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  const setPlaying = useCallback((isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
  }, []);

  const setProgress = useCallback((currentTime: number) => {
    setState(prev => ({ ...prev, currentTime }));
  }, []);

  const setBuffering = useCallback((isBuffering: boolean) => {
    setState(prev => ({ ...prev, isBuffering }));
  }, []);

  return {
    state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setDuration,
    setPlaying,
    setProgress,
    setBuffering,
    playerRef,
  };
};
