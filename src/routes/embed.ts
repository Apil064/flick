import { Router } from 'express';
import { embedService } from '../services/embed.service.js';
import { vidkingService } from '../services/vidking.service.js';

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

router.get('/vidking-source', async (req, res) => {
  const { id, type, season, episode } = req.query;
  
  if (!id || !type) {
    return res.status(400).json({ error: 'id and type are required' });
  }

  const m3u8 = await vidkingService.getM3U8(
    type as 'movie' | 'tv',
    id as string,
    season as string,
    episode as string
  );

  if (m3u8) {
    res.json({ source: m3u8 });
  } else {
    res.status(404).json({ error: 'Source not found' });
  }
});

export default router;
