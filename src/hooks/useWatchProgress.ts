import { useEffect, useRef } from 'react';
import { useSaveProgress } from './useMovies';

interface WatchProgressProps {
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  backdropPath?: string;
  season?: number;
  episode?: number;
  currentTime: number;
  duration: number;
  enabled: boolean;
}

export const useWatchProgress = ({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  season,
  episode,
  currentTime,
  duration,
  enabled
}: WatchProgressProps) => {
  const { mutate: saveProgress } = useSaveProgress();
  const lastSavedTime = useRef(0);

  useEffect(() => {
    if (!enabled || duration === 0) return;

    // Save every 5 seconds if time has changed significantly
    const interval = setInterval(() => {
      if (Math.abs(currentTime - lastSavedTime.current) >= 5) {
        saveProgress({
          tmdb_id: tmdbId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          season: season || 0,
          episode: episode || 0,
          progress_seconds: Math.floor(currentTime),
          duration_seconds: Math.floor(duration)
        });
        lastSavedTime.current = currentTime;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTime, duration, enabled, tmdbId, mediaType, title, posterPath, backdropPath, season, episode, saveProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled && duration > 0 && currentTime > 0) {
        saveProgress({
          tmdb_id: tmdbId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          season: season || 0,
          episode: episode || 0,
          progress_seconds: Math.floor(currentTime),
          duration_seconds: Math.floor(duration)
        });
      }
    };
  }, []);
};
