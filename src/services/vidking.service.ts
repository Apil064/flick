import axios from 'axios';

export const vidkingService = {
  async getM3U8(type: 'movie' | 'tv', id: string, season?: string, episode?: string) {
    try {
      // This is a placeholder for the actual scraping logic.
      // In a real scenario, we would fetch the embed page and extract the source.
      // For Vidking, it often requires specific headers or a token.
      
      const embedUrl = type === 'movie'
        ? `https://vidking.net/embed/movie/${id}`
        : `https://vidking.net/embed/tv/${id}/${season}/${episode}`;

      // Mocking the fetch for now as scraping can be complex and fragile.
      // In a real implementation, you'd use something like:
      /*
      const { data } = await axios.get(embedUrl, {
        headers: {
          'Referer': 'https://vidking.net/',
          'User-Agent': 'Mozilla/5.0 ...'
        }
      });
      const m3u8Match = data.match(/file:\s*"([^"]+\.m3u8[^"]*)"/);
      if (m3u8Match) return m3u8Match[1];
      */

      // For the sake of this task, I will provide a way to get the source.
      // Some providers have a direct API.
      // If we can't get it, we might have to fallback to the embed URL itself 
      // if the player can handle it, but the user wants an m3u8 fetcher.
      
      // Let's assume we found a way to get it.
      // For now, I'll return a mock or a known working pattern if I can find one.
      // Actually, I'll implement a basic scraper.
      
      const response = await axios.get(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://vidking.net/'
        }
      });

      // Look for common patterns in the HTML using advanced regexes from m3u8player.online
      const html = response.data;
      
      const rx = [
        /https?:\/\/[^\s"'`<>\\]+?\.m3u8(?:[^\s"'`<>\\]*)/ig,
        /\/\/[^\s"'`<>\\]+?\.m3u8(?:[^\s"'`<>\\]*)/ig,
        /["'](?:url|src|file|source|manifest|playlist)["']\s*[:=]\s*["']([^"']+?\.m3u8[^"']*)["']/ig,
        /(?:url|src|file|source|manifest|playlist)\s*[:=]\s*["']([^"']+?\.m3u8[^"']*)["']/ig
      ];

      let foundM3u8: string | null = null;

      // 1. Try regex matching on the whole HTML
      for (const regex of rx) {
        const matches = html.matchAll(regex);
        for (const match of matches) {
          const url = match[1] || match[0];
          if (url && !url.includes('m3u8player.online')) { // Avoid matching the tool itself if it appears
            foundM3u8 = url;
            break;
          }
        }
        if (foundM3u8) break;
      }

      // 2. Try searching in common global variables if present in HTML
      if (!foundM3u8) {
        const globalKeys = ['__NEXT_DATA__', '__INITIAL_STATE__', '__PRELOADED_STATE__'];
        for (const key of globalKeys) {
          const scriptRegex = new RegExp(`<script[^>]*id=["']${key}["'][^>]*>([^<]+)</script>`, 'i');
          const scriptMatch = html.match(scriptRegex);
          if (scriptMatch) {
            try {
              const data = JSON.parse(scriptMatch[1]);
              const searchObj = (obj: any): string | null => {
                for (const k in obj) {
                  if (typeof obj[k] === 'string' && obj[k].includes('.m3u8')) return obj[k];
                  if (typeof obj[k] === 'object' && obj[k] !== null) {
                    const res = searchObj(obj[k]);
                    if (res) return res;
                  }
                }
                return null;
              };
              foundM3u8 = searchObj(data);
              if (foundM3u8) break;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      if (foundM3u8) {
        // Clean up the URL if it starts with //
        if (foundM3u8.startsWith('//')) {
          foundM3u8 = 'https:' + foundM3u8;
        }
        return foundM3u8;
      }

      // Try guessing API endpoints or looking for specific scripts
      const apiGuesses = [
        `https://vidking.net/api/movie/${id}/source`,
        `https://vidking.net/api/v1/movie/${id}`,
        `https://vidking.net/api/source/${type}/${id}`
      ];

      for (const apiUrl of apiGuesses) {
        try {
          const apiRes = await axios.get(apiUrl, { 
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://vidking.net/'
            }
          });
          if (apiRes.data?.source || apiRes.data?.url || apiRes.data?.file) {
            foundM3u8 = apiRes.data.source || apiRes.data.url || apiRes.data.file;
            break;
          }
        } catch (e) {
          // Continue to next guess
        }
      }

      if (foundM3u8) {
        return foundM3u8;
      }

      // If not found, try to look for an API call or a hidden input
      // This is highly dependent on Vidking's current implementation.
      
      return null;
    } catch (error) {
      console.error('Error fetching Vidking M3U8:', error);
      return null;
    }
  }
};
