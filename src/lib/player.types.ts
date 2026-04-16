// player.types.ts

export interface VideoPlayer {
    play(): void;
    pause(): void;
    stop(): void;
    seek(time: number): void;
    setVolume(volume: number): void;
}

export interface Video {
    id: string;
    title: string;
    duration: number; // in seconds
    isPaused: boolean;
    currentTime: number; // in seconds
}

export interface Playlist {
    videos: Video[];
    currentVideoIndex: number;
    next(): Video | null;
    previous(): Video | null;
}