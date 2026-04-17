// src/scripts/init-neon-db.ts
// Run with: npx tsx src/scripts/init-neon-db.ts
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  console.log('🚀 Initializing Neon database...');
  const client = await pool.connect();
  try {
    await client.query(`
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
    console.log('✅ watchlist table ready');

    await client.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        title TEXT NOT NULL,
        poster_path TEXT,
        backdrop_path TEXT,
        season INTEGER DEFAULT 0,
        episode INTEGER DEFAULT 0,
        progress_seconds INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        last_watched TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tmdb_id, season, episode)
      );
    `);
    console.log('✅ watch_history table ready');

    // Test insert + delete to verify permissions
    await client.query(`INSERT INTO watchlist(user_id, tmdb_id, media_type, title) VALUES('__test__','0','movie','test') ON CONFLICT DO NOTHING`);
    await client.query(`DELETE FROM watchlist WHERE user_id='__test__'`);
    console.log('✅ DB read/write permissions confirmed');
    console.log('🎉 Neon database initialized successfully!');
  } catch (err) {
    console.error('❌ Init failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
