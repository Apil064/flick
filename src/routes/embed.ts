import { Router } from 'express';
import { embedService } from '../services/embed.service.js';

const router = Router();

router.get('/sources', (req, res) => {
  const { tmdbId, type, season, episode, imdbId } = req.query;
  
  if (!tmdbId || !type) {
    return res.status(400).json({ error: 'tmdbId and type are required' });
  }

  const sources = embedService.getSources(
    tmdbId as string, 
    type as 'movie' | 'tv', 
    season as string, 
    episode as string,
    imdbId as string
  );
  
  res.json(sources);
});

export default router;
