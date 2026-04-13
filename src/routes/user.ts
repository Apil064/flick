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
    const result = await query('SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

router.post('/watchlist', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const { tmdb_id, media_type, title, poster_path } = req.body;
    await query(
      'INSERT INTO watchlist (user_id, tmdb_id, media_type, title, poster_path) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [userId, tmdb_id, media_type, title, poster_path]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
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

router.get('/history', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const result = await query('SELECT * FROM watch_history WHERE user_id = $1 ORDER BY last_watched DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/history', async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.auth.userId;
    const { tmdb_id, media_type, title, poster_path, season, episode, progress_seconds, duration_seconds } = req.body;
    await query(
      `INSERT INTO watch_history (user_id, tmdb_id, media_type, title, poster_path, season, episode, progress_seconds, duration_seconds) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, tmdb_id) DO UPDATE SET 
       progress_seconds = EXCLUDED.progress_seconds, 
       last_watched = NOW()`,
      [userId, tmdb_id, media_type, title, poster_path, season, episode, progress_seconds, duration_seconds]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save history' });
  }
});

export default router;
