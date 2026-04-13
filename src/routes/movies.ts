import { Router } from 'express';
import { tmdbService } from '../services/tmdb.service';

const router = Router();

router.get('/trending', async (req, res) => {
  try {
    const data = await tmdbService.getTrending('movie');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const data = await tmdbService.getPopular('movie');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    const data = await tmdbService.getTopRated('movie');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

router.get('/now-playing', async (req, res) => {
  try {
    const data = await tmdbService.getNowPlaying();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch now playing movies' });
  }
});

router.get('/genre/:id', async (req, res) => {
  try {
    const data = await tmdbService.getByGenre('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies by genre' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await tmdbService.getDetails('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

router.get('/:id/credits', async (req, res) => {
  try {
    const data = await tmdbService.getCredits('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie credits' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const data = await tmdbService.getSimilar('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch similar movies' });
  }
});

router.get('/:id/recommendations', async (req, res) => {
  try {
    const data = await tmdbService.getRecommendations('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie recommendations' });
  }
});

export default router;
