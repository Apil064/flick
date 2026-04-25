export const embedService = {
  getSources(tmdbId: string, type: 'movie' | 'tv', season?: string, episode?: string, imdbId?: string) {
    const sources = [];

    // Primary: VidAPI
    const vidapiBase = 'https://vaplayer.ru/embed';
    const vidapiUrl = type === 'movie' 
      ? `${vidapiBase}/movie/${tmdbId}`
      : `${vidapiBase}/tv/${tmdbId}/${season}/${episode}`;
    
    sources.push({
      name: 'VidAPI',
      url: `${vidapiUrl}?primaryColor=e40914&secondaryColor=a2a2a2&iconColor=eefdec`,
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
