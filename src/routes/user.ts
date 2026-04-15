import { Router } from 'express';
import { query } from '../lib/db';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All routes here require authentication
router.use(requireAuth);

router.get('/watchlist', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    console.log(`🔍 Fetching watchlist for user: ${userId}`);
    const result = await query('SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC', [userId]);
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Failed to fetch watchlist:', error.message);
    res.status(500).json({ error: 'Failed to fetch watchlist', details: error.message });
  }
});

router.post('/watchlist', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const { tmdb_id, media_type, title, poster_path } = req.body;
    console.log(`📝 Adding to watchlist: User=${userId}, Item=${tmdb_id}`);
    
    await query(
      'INSERT INTO watchlist (user_id, tmdb_id, media_type, title, poster_path) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [userId, tmdb_id, media_type, title, poster_path]
    );
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('❌ Failed to add to watchlist:', error.message);
    res.status(500).json({ error: 'Failed to add to watchlist', details: error.message });
  }
});

router.delete('/watchlist/:id', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    await query('DELETE FROM watchlist WHERE user_id = $1 AND tmdb_id = $2', [userId, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

router.get('/continue-watching', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    // Filter for progress between 5% and 90%
    const result = await query(
      `SELECT * FROM watch_history 
       WHERE user_id = $1 
       AND duration_seconds > 0
       AND (progress_seconds::float / duration_seconds) BETWEEN 0.05 AND 0.90
       ORDER BY last_watched DESC`, 
      [userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Failed to fetch continue watching:', error.message);
    res.status(500).json({ error: 'Failed to fetch continue watching' });
  }
});

router.post('/progress', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const { tmdb_id, media_type, title, poster_path, backdrop_path, season, episode, progress_seconds, duration_seconds } = req.body;
    
    const s = season || 0;
    const e = episode || 0;

    await query(
      `INSERT INTO watch_history (
        user_id, tmdb_id, media_type, title, poster_path, backdrop_path, season, episode, progress_seconds, duration_seconds, last_watched
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (user_id, tmdb_id, season, episode) DO UPDATE SET
        progress_seconds = EXCLUDED.progress_seconds,
        duration_seconds = EXCLUDED.duration_seconds,
        last_watched = NOW()`,
      [userId, tmdb_id, media_type, title, poster_path, backdrop_path, s, e, progress_seconds, duration_seconds]
    );
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('❌ Failed to save progress:', error.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

router.get('/history', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const result = await query(
      'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY last_watched DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

router.delete('/history/:tmdbId', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    await query(
      'DELETE FROM watch_history WHERE user_id = $1 AND tmdb_id = $2',
      [userId, req.params.tmdbId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove from history' });
  }
});

router.delete('/history', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    await query(
      'DELETE FROM watch_history WHERE user_id = $1',
      [userId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;
