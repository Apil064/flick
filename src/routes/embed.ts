// src/routes/embed.ts
import { Router } from 'express';
import { embedService } from '../services/embed.service.js';

const router = Router();

/**
 * GET /api/embed/sources
 * Returns all available embed source URLs for a given TMDB ID.
 * Query params: tmdbId, type, season?, episode?
 */
router.get('/sources', (req, res) => {
  const { tmdbId, type, season, episode } = req.query;

  if (!tmdbId || !type) {
    return res.status(400).json({ error: 'tmdbId and type are required' });
  }

  const sources = embedService.getSources(
    tmdbId as string,
    type as 'movie' | 'tv',
    season as string | undefined,
    episode as string | undefined
  );

  res.json(sources);
});

export default router;