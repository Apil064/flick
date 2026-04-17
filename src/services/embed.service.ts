// src/services/embed.service.ts
export const embedService = {
  getSources(tmdbId: string, type: 'movie' | 'tv', season?: string, episode?: string, imdbId?: string) {
    const sources = [];

    sources.push({
      name: 'Videasy',
      url: type === 'movie'
        ? `https://player.videasy.net/movie/${tmdbId}?color=E50914&nextEpisode=1&autoplayNextEpisode=1`
        : `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=1&autoplayNextEpisode=1`,
      priority: 1
    });

    const id = imdbId || tmdbId;

    sources.push({
      name: 'VidSrc',
      url: type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
      priority: 2
    });

    sources.push({
      name: 'MultiEmbed',
      url: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      priority: 3
    });

    return sources;
  }
};