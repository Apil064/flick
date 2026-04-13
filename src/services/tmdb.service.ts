import axios from 'axios';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to get axios instance with current API key
const getTmdb = () => {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is missing');
  }
  return axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
      api_key: key,
    },
  });
};

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

export const tmdbService = {
  async getTrending(type: 'movie' | 'tv' | 'all' = 'all') {
    const cacheKey = `trending_${type}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get(`/trending/${type}/week`);
      const results = data.results || [];
      if (results.length > 0) {
        await cache.set(cacheKey, results, 3600); // 1 hour
      }
      console.log(`✅ TMDB getTrending (${type}) success: ${results.length} results`);
      return results;
    } catch (error: any) {
      console.error(`❌ TMDB getTrending (${type}) error:`, error.response?.data || error.message);
      throw error;
    }
  },

  async getPopular(type: 'movie' | 'tv') {
    const cacheKey = `popular_${type}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get(`/${type}/popular`);
      const results = data.results || [];
      if (results.length > 0) {
        await cache.set(cacheKey, results, 3600); // 1 hour
      }
      console.log(`✅ TMDB getPopular (${type}) success: ${results.length} results`);
      return results;
    } catch (error: any) {
      console.error(`❌ TMDB getPopular (${type}) error:`, error.response?.data || error.message);
      throw error;
    }
  },

  async getDetails(type: 'movie' | 'tv', id: string) {
    const cacheKey = `${type}_${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get(`/${type}/${id}`, {
        params: { append_to_response: 'credits,videos,similar,recommendations' }
      });
      await cache.set(cacheKey, data, 86400); // 24 hours
      return data;
    } catch (error: any) {
      console.error(`❌ TMDB getDetails (${type}, ${id}) error:`, error.response?.data || error.message);
      return null;
    }
  },

  async getSeasonDetails(tvId: string, seasonNumber: string) {
    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
      return data;
    } catch (error: any) {
      console.error(`❌ TMDB getSeasonDetails (${tvId}, ${seasonNumber}) error:`, error.response?.data || error.message);
      return null;
    }
  },

  async searchMulti(query: string, page: number = 1) {
    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get('/search/multi', {
        params: { query, page }
      });
      return data;
    } catch (error: any) {
      console.error(`❌ TMDB searchMulti (${query}) error:`, error.response?.data || error.message);
      return { results: [] };
    }
  },

  async getByGenre(type: 'movie' | 'tv', genreId: string) {
    try {
      const tmdb = getTmdb();
      const { data } = await tmdb.get(`/discover/${type}`, {
        params: { with_genres: genreId }
      });
      return data.results || [];
    } catch (error: any) {
      console.error(`❌ TMDB getByGenre (${type}, ${genreId}) error:`, error.response?.data || error.message);
      return [];
    }
  }
};
