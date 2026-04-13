import axios from 'axios';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Redis setup (optional fallback to memory)
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000, // 5 seconds
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('error', (err) => {
    console.warn('[Redis] Connection error:', err.message);
  });
}

const cache = {
  async get(key: string) {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (err) {
      console.warn('[Redis] Get error:', err);
      return null;
    }
  },
  async set(key: string, value: any, ttlSeconds: number) {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.warn('[Redis] Set error:', err);
    }
  }
};

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const tmdbService = {
  async getTrending(type: 'movie' | 'tv' | 'all' = 'all') {
    const cacheKey = `trending_${type}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const { data } = await tmdb.get(`/trending/${type}/week`);
      const results = data.results || [];
      await cache.set(cacheKey, results, 3600); // 1 hour
      return results;
    } catch (error) {
      console.error('TMDB getTrending error:', error);
      return [];
    }
  },

  async getPopular(type: 'movie' | 'tv') {
    try {
      const { data } = await tmdb.get(`/${type}/popular`);
      return data.results || [];
    } catch (error) {
      console.error('TMDB getPopular error:', error);
      return [];
    }
  },

  async getDetails(type: 'movie' | 'tv', id: string) {
    const cacheKey = `${type}_${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { data } = await tmdb.get(`/${type}/${id}`, {
      params: { append_to_response: 'credits,videos,similar,recommendations' }
    });
    await cache.set(cacheKey, data, 86400); // 24 hours
    return data;
  },

  async getSeasonDetails(tvId: string, seasonNumber: string) {
    const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  },

  async searchMulti(query: string, page: number = 1) {
    const { data } = await tmdb.get('/search/multi', {
      params: { query, page }
    });
    return data;
  },

  async getByGenre(type: 'movie' | 'tv', genreId: string) {
    const { data } = await tmdb.get(`/discover/${type}`, {
      params: { with_genres: genreId }
    });
    return data.results;
  }
};
