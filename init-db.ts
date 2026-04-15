import { query } from './src/lib/db';

async function initDb() {
  console.log('🚀 Initializing database...');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        title TEXT NOT NULL,
        poster_path TEXT,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tmdb_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        title TEXT NOT NULL,
        poster_path TEXT,
        backdrop_path TEXT,
        season INTEGER,
        episode INTEGER,
        progress_seconds INTEGER,
        duration_seconds INTEGER,
        last_watched TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tmdb_id, season, episode)
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initDb();
