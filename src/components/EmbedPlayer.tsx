import React from 'react';

interface EmbedPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export function EmbedPlayer({ tmdbId, type, season, episode }: EmbedPlayerProps) {
  const src = type === 'movie'
    ? `https://player.cineby.workers.dev/movie/${tmdbId}`
    : `https://player.cineby.workers.dev/tv/${tmdbId}/${season}/${episode}`;
  
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <iframe
        src={`${src}?primaryColor=FF0000&secondaryColor=000000&iconColor=FFFFFF`}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute inset-0"
      />
    </div>
  );
}
