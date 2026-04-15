import { Router } from 'express';
import { tmdbService } from '../services/tmdb.service';

const router = Router();

const GENRE_MAP: Record<string, string> = {
  action: '28',
  adventure: '12',
  animation: '16',
  comedy: '35',
  crime: '80',
  documentary: '99',
  drama: '18',
  family: '10751',
  fantasy: '14',
  history: '36',
  horror: '27',
  music: '10402',
  mystery: '9648',
  romance: '10749',
  science_fiction: '878',
  tv_movie: '10770',
  thriller: '53',
  war: '10752',
  western: '37'
};

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

router.get('/recent', async (req, res) => {
  try {
    const data = await tmdbService.getRecent();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent movies' });
  }
});

router.get('/by-genre', async (req, res) => {
  try {
    const genreName = (req.query.genre as string)?.toLowerCase();
    const genreId = GENRE_MAP[genreName] || genreName;
    const data = await tmdbService.getByGenre('movie', genreId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies by genre' });
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

router.get('/:id/images', async (req, res) => {
  try {
    const data = await tmdbService.getImages('movie', req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie images' });
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
