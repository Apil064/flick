// src/services/embed.service.ts
// These sources provide publicly accessible embed endpoints
// that work without server-side scraping.

export const embedService = {
  getSources(
    tmdbId: string,
    type: 'movie' | 'tv',
    season?: string,
    episode?: string,
    imdbId?: string
  ) {
    const s = season || '1';
    const e = episode || '1';

    return [
      {
        name: 'VidSrc Pro',
        url:
          type === 'movie'
            ? `https://vidsrc.pro/embed/movie/${tmdbId}`
            : `https://vidsrc.pro/embed/tv/${tmdbId}/${s}/${e}`,
        priority: 1,
      },
      {
        name: 'VidSrc.to',
        url:
          type === 'movie'
            ? `https://vidsrc.to/embed/movie/${tmdbId}`
            : `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
        priority: 2,
      },
      {
        name: 'AutoEmbed',
        url:
          type === 'movie'
            ? `https://autoembed.co/movie/tmdb/${tmdbId}`
            : `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`,
        priority: 3,
      },
      {
        name: '2Embed',
        url:
          type === 'movie'
            ? `https://www.2embed.cc/embed/${tmdbId}`
            : `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
        priority: 4,
      },
      {
        name: 'SmashyStream',
        url:
          type === 'movie'
            ? `https://player.smashystream.com/movie.php?tmdb=${tmdbId}`
            : `https://player.smashystream.com/tv.php?tmdb=${tmdbId}&s=${s}&e=${e}`,
        priority: 5,
      },
    ];
  },
};