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

router.get('/popular', async (req, res) => {
  try {
    const data = await tmdbService.getPopular('tv');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular TV shows' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    const data = await tmdbService.getTopRated('tv');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated TV shows' });
  }
});

router.get('/on-air', async (req, res) => {
  try {
    const data = await tmdbService.getOnAir();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch on air TV shows' });
  }
});

router.get('/genre/:id', async (req, res) => {
  try {
    const data = await tmdbService.getByGenre('tv', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV shows by genre' });
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

router.get('/:id/credits', async (req, res) => {
  try {
    const data = await tmdbService.getCredits('tv', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV show credits' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const data = await tmdbService.getSimilar('tv', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch similar TV shows' });
  }
});

export default router;
