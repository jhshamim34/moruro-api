import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import pako from 'pako';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for all routes so any website can use this API without errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
  }
  next();
});

// Cache for the obfuscation key to avoid redundant fetching
let cachedObfKey = '';

async function getObfKey() {
  if (cachedObfKey) return cachedObfKey;
  try {
    const envParamsRes = await axios.get('https://www.miruro.to/env2.js', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const envMatch = envParamsRes.data.match(/VITE_PIPE_OBF_KEY\\":\\"([^\\]+)\\"/);
    if (!envMatch) throw new Error('Could not find VITE_PIPE_OBF_KEY');
    cachedObfKey = envMatch[1];
    return cachedObfKey;
  } catch (err) {
    throw new Error('Failed to fetch Miruro environment configuration');
  }
}

// Helper: Secure Pipe Fetch
async function pipeFetch(payload: any, obfKey: string) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const dataRes = await axios.get(`https://www.miruro.to/api/secure/pipe?e=${b64}`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' }
  });
  const t = dataRes.data.replace(/-/g, '+').replace(/_/g, '/');
  let a = Buffer.from(t + ('='.repeat((4 - t.length % 4) % 4)), 'base64');
  const Ro = Buffer.from(obfKey, 'hex');
  for (let j = 0; j < a.length; j++) {
      a[j] ^= Ro[j % Ro.length];
  }
  try {
      return JSON.parse(pako.inflate(a, { to: 'string' }));
  } catch(e) {
      return JSON.parse(pako.inflateRaw(a, { to: 'string' }));
  }
}

// Target API Endpoint
// URI: /api/stream?id={anime id}&ep={num}&server={string}&type={string}
app.get('/api/stream', async (req, res) => {
  const { id, ep, server, type } = req.query;
  
  if (!id || !ep || !server || !type) {
    res.status(400).json({ error: 'Missing parameters. Required parameters: id, ep, server, type' });
    return;
  }

  // Map server parameter to provider name (Arc = hd-1, Bee = hd-2)
  const serverStr = String(server).toLowerCase();
  let providerName = '';
  if (serverStr === 'hd-1') {
      providerName = 'arc';
  } else if (serverStr === 'hd-2') {
      providerName = 'bee';
  } else {
      res.status(400).json({ error: "Invalid server format. Please provide 'hd-1' or 'hd-2'" });
      return;
  }

  const category = String(type).toLowerCase(); // 'sub' or 'dub'
  if (category !== 'sub' && category !== 'dub') {
     res.status(400).json({ error: "Invalid type format. Please provide 'sub' or 'dub'" });
     return;
  }

  try {
    const obfKey = await getObfKey();

    const epPayload = { path: 'episodes', method: 'GET', query: { anilistId: id.toString() }, body: null, version: '0.2.0' };
    const episodesData = await pipeFetch(epPayload, obfKey);

    if (!episodesData || !episodesData.providers || !episodesData.providers[providerName]) {
       res.status(404).json({ error: `Server '${server}' (${providerName}) does not have streaming instances for this anime.` });
       return;
    }

    const providerData = episodesData.providers[providerName];
    if (!providerData.episodes || !providerData.episodes[category]) {
       res.status(404).json({ error: `Server '${server}' does not provide '${category}' for this anime.` });
       return;
    }

    const epMatch = providerData.episodes[category].find((e: any) => String(e.number) === String(ep));
    if (!epMatch) {
       res.status(404).json({ error: `Episode ${ep} not found for server '${server}' and type '${category}'.` });
       return;
    }

    const srcPayload = {
        path: 'sources',
        method: 'GET',
        query: { episodeId: epMatch.id, provider: providerName, category },
        body: null,
        version: '0.2.0'
    };
    
    let sourcesData = await pipeFetch(srcPayload, obfKey);
    
    // Process sources to filter out embed URLs, only keeping HLS types
    if (sourcesData && Array.isArray(sourcesData.streams)) {
        sourcesData.streams = sourcesData.streams.filter((s: any) => s.type === 'hls');
    }
    
    // Return raw JSON representing the stream data structure
    res.json(sourcesData);
  } catch (error: any) {
    console.error('API Stream Handler Error:', error);
    res.status(500).json({ error: 'Failed to scrape stream data', details: error.message });
  }
});

app.get('/api/episodes', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing anime id parameter' });

  try {
    // We scrape SSR data for total episode count/meta, but the detailed accurate episode
    // list (number, title, image) comes beautifully from their pipe endpoint.
    const obfKey = await getObfKey();
    
    // Fetch SSR data to respect the request to visit /watch/{id}
    const { data: html } = await axios.get(`https://www.miruro.to/watch/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const prefix = 'window.__SSR_DATA__=';
    let totalEpisodes = null;
    let animeTitle = null;
    if (html.includes(prefix)) {
        const ssrStrMatch = html.split(prefix)[1];
        if (ssrStrMatch) {
            const ssrJsonStr = ssrStrMatch.split(';</script>')[0];
            try {
                const ssrObj = JSON.parse(ssrJsonStr);
                totalEpisodes = ssrObj.episodes; // Extracted total episode count
                animeTitle = ssrObj.title?.english || ssrObj.title?.romaji || ssrObj.title?.native;
            } catch (e) {}
        }
    }

    // Now get detailed episode list from the secure API the page uses internally
    const epPayload = { path: 'episodes', method: 'GET', query: { anilistId: id.toString() }, body: null, version: '0.2.0' };
    const episodesData = await pipeFetch(epPayload, obfKey);
    
    // Merge episodes from available providers to get a comprehensive list. 
    // Usually 'arc' or 'bee' has the most extensive mapped sets.
    let mappedEpisodes: any[] = [];
    
    const providersList = Object.values(episodesData.providers || {}) as any[];
    for (const prob of providersList) {
       for (const category of ['sub', 'dub']) {
          if (prob.episodes && prob.episodes[category]) {
              const eplist = prob.episodes[category];
              if (eplist.length > mappedEpisodes.length) {
                  mappedEpisodes = eplist;
              }
          }
       }
    }
    
    if (totalEpisodes == null && episodesData.mappings && episodesData.mappings.episodes) {
        totalEpisodes = episodesData.mappings.episodes;
    }

    const outputEpisodes = mappedEpisodes.map(ep => ({
       episodeNumber: ep.number,
       title: ep.title || `Episode ${ep.number}`,
       image: ep.image || undefined,
    }));

    // Optionally sort by episode number
    outputEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    res.json({
        totalEpisodes: totalEpisodes,
        animeTitle: animeTitle,
        episodes: outputEpisodes
    });
  } catch (err: any) {
    console.error('API Episodes Handler Error:', err);
    res.status(500).json({ error: 'Failed to scrape episodes data', details: err.message });
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static production build
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Define port differently on Vercel
  if (process.env.VERCEL !== '1') {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Express API is active! Listing for connections on port ${port}`);
    });
  }
}

startServer();

export default app;
