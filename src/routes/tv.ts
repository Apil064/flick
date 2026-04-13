import { Router } from 'express';
import { tmdbService } from '../services/tmdb.service';

const router = Router();

router.get('/trending', async (req, res) => {
  try {
    const data = await tmdbService.getTrending('tv');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await tmdbService.getDetails('tv', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});

router.get('/:id/season/:n', async (req, res) => {
  try {
    const data = await tmdbService.getSeasonDetails(req.params.id, req.params.n);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season details' });
  }
});

export default router;
