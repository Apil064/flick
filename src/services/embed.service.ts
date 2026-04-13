export const embedService = {
  getSources(tmdbId: string, type: 'movie' | 'tv', season?: string, episode?: string, imdbId?: string) {
    const sources = [];

    // Primary: VidApi (Cineby's own)
    const cinebyBase = 'https://player.cineby.workers.dev';
    const cinebyUrl = type === 'movie' 
      ? `${cinebyBase}/movie/${tmdbId}`
      : `${cinebyBase}/tv/${tmdbId}/${season}/${episode}`;
    
    sources.push({
      name: 'VidApi (Flick)',
      url: `${cinebyUrl}?primaryColor=FF0000&secondaryColor=000000&iconColor=FFFFFF`,
      priority: 1
    });

    // Fallbacks (using IMDB ID if available, otherwise TMDB ID)
    const id = imdbId || tmdbId;

    sources.push({
      name: 'VidSrc To',
      url: type === 'movie' 
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
      priority: 2
    });

    sources.push({
      name: '2Embed',
      url: `https://www.2embed.cc/embed/${id}`,
      priority: 3
    });

    sources.push({
      name: 'MultiEmbed',
      url: `https://multiembed.mov/?video_id=${id}`,
      priority: 4
    });

    return sources;
  }
};
