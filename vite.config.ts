import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory cache on the server proxy to avoid consuming RapidAPI quota on reloads
const serverCache = new Map<string, { timestamp: number; status: number; body: string }>();
const SERVER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Server-side API middleware plugin for Anime DB
 * Proxies /api/anime requests to RapidAPI Anime DB server-side
 * keeping RAPIDAPI_KEY secure in the backend and out of browser code.
 */
function animeApiPlugin(apiKey?: string, apiHost?: string): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    if (!req.url || !req.url.startsWith('/api/anime')) {
      return next();
    }

    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const pathname = parsedUrl.pathname;
      const search = parsedUrl.search;

      let upstreamPath = '/anime';
      if (pathname.startsWith('/api/anime/by-id/')) {
        const rest = pathname.substring('/api/anime/by-id/'.length).trim();
        upstreamPath = `/anime/by-id/${rest}`;
      } else if (pathname.startsWith('/api/anime/')) {
        const rest = pathname.substring('/api/anime/'.length).trim();
        if (rest) {
          upstreamPath = `/anime/by-id/${rest}`;
        }
      }

      const host = apiHost || 'anime-db.p.rapidapi.com';
      const key = (apiKey || process.env.RAPIDAPI_KEY || '').trim();

      if (!key) {
        console.warn('[Anime Server API] RAPIDAPI_KEY is not configured in server environment.');
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'ANIME_SERVICE_UNAVAILABLE',
            message: 'Anime data service is not configured on the server.'
          })
        );
        return;
      }

      const upstreamUrl = `https://${host}${upstreamPath}${search}`;

      // Check server cache
      const cached = serverCache.get(upstreamUrl);
      if (cached && Date.now() - cached.timestamp < SERVER_CACHE_TTL) {
        res.statusCode = cached.status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'HIT');
        res.end(cached.body);
        return;
      }

      const upstreamRes = await fetch(upstreamUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': host,
          Accept: 'application/json'
        }
      });

      const body = await upstreamRes.text();

      // Only cache successful responses
      if (upstreamRes.status === 200) {
        serverCache.set(upstreamUrl, {
          timestamp: Date.now(),
          status: upstreamRes.status,
          body
        });
      }

      res.statusCode = upstreamRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Cache', 'MISS');
      res.end(body);
    } catch (err: any) {
      console.error('[Anime Server API] Error fetching upstream data:', err?.message || err);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'GATEWAY_ERROR',
          message: 'Failed to communicate with anime data provider.'
        })
      );
    }
  };

  return {
    name: 'anime-api-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';
  const apiHost = env.RAPIDAPI_ANIME_HOST || process.env.RAPIDAPI_ANIME_HOST || 'anime-db.p.rapidapi.com';

  return {
    plugins: [react(), animeApiPlugin(apiKey, apiHost)],
    server: {
      port: 3001,
    },
  };
});
