import axios from 'axios';

async function testScraper() {
  const tmdbId = '120'; // Lord of the Rings
  const type = 'movie';
  const embedUrl = `https://vidking.net/embed/${type}/${tmdbId}`;
  
  console.log(`Fetching ${embedUrl}...`);
  try {
    const response = await axios.get(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://vidking.net/'
      }
    });
    const html = response.data;
    console.log(`HTML length: ${html.length}`);
    console.log('HTML Preview (End):');
    console.log(html.substring(2000));
    
    const sourceMatch = html.match(/file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) || 
                        html.match(/src:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) ||
                        html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
    
  const apiUrl = `https://vidking.net/api/movie/${tmdbId}`;
  console.log(`Fetching API ${apiUrl}...`);
  try {
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://vidking.net/'
      }
    });
    console.log('API Response:', JSON.stringify(apiResponse.data).substring(0, 500));
  } catch (e) {
    console.log(`API Error: ${e.message}`);
  }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

testScraper();
