import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

import {
  ANIME_DB_CANONICAL_ARCHIVE,
  getArchiveAnimeByIdOrSlug,
  searchArchiveAnime
} from './src/data/animeDbArchive';

// In-memory cache on the server proxy to avoid consuming RapidAPI quota on reloads
const serverCache = new Map<string, { timestamp: number; status: number; body: string }>();
const SERVER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory cache for Hianime API proxy
const hianimeCache = new Map<string, { timestamp: number; status: number; body: string }>();
const HIANIME_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

      let upstreamPath = '/anime';
      let requestedId = '';
      if (pathname.startsWith('/api/anime/by-id/')) {
        requestedId = pathname.substring('/api/anime/by-id/'.length).trim();
        upstreamPath = `/anime/by-id/${requestedId}`;
      } else if (pathname.startsWith('/api/anime/')) {
        requestedId = pathname.substring('/api/anime/'.length).trim();
        if (requestedId) {
          upstreamPath = `/anime/by-id/${requestedId}`;
        }
      }

      // Ensure required page & size parameters for Anime DB listings
      if (upstreamPath === '/anime') {
        if (!parsedUrl.searchParams.has('page')) parsedUrl.searchParams.set('page', '1');
        if (!parsedUrl.searchParams.has('size')) parsedUrl.searchParams.set('size', '18');
      }
      const search = parsedUrl.search;

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

      // If upstream succeeded (HTTP 200), cache and return
      if (upstreamRes.status === 200) {
        serverCache.set(upstreamUrl, {
          timestamp: Date.now(),
          status: upstreamRes.status,
          body
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'MISS');
        res.end(body);
        return;
      }

      // If upstream failed or was not found (e.g. slug requested or 429 quota reached)
      if (requestedId) {
        const match = getArchiveAnimeByIdOrSlug(requestedId);
        if (match) {
          const seedBody = JSON.stringify(match);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'SEED');
          res.end(seedBody);
          return;
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'NOT_FOUND');
          res.end(
            JSON.stringify({
              error: 'NOT_FOUND',
              message: `Anime record "${requestedId}" not found in canonical archive.`
            })
          );
          return;
        }
      }

      // If rate limited (HTTP 429) or upstream error on search or listing, provide verified canonical records from archive
      if (upstreamRes.status === 429 || upstreamRes.status >= 500 || upstreamRes.status === 422) {
        const searchQuery = parsedUrl.searchParams.get('search');
        if (searchQuery) {
          const matches = searchArchiveAnime(searchQuery);
          const seedResponse = JSON.stringify({
            data: matches,
            meta: {
              page: 1,
              size: 18,
              totalData: matches.length,
              totalPage: Math.max(1, Math.ceil(matches.length / 18))
            }
          });
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'SEED');
          res.end(seedResponse);
          return;
        }

        // General list fallback
        const allRecords = Object.values(ANIME_DB_CANONICAL_ARCHIVE);
        const seedResponse = JSON.stringify({
          data: allRecords,
          meta: { page: 1, size: 18, totalData: allRecords.length, totalPage: 1 }
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'SEED');
        res.end(seedResponse);
        return;
      }

      res.statusCode = upstreamRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Cache', 'MISS');
      res.end(body);
    } catch (err: any) {
      console.error('[Anime Server API] Error fetching upstream data:', err?.message || err);
      // Fallback to archive on network exception
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;
        let requestedId = '';
        if (pathname.startsWith('/api/anime/by-id/')) {
          requestedId = pathname.substring('/api/anime/by-id/'.length).trim();
        } else if (pathname.startsWith('/api/anime/')) {
          requestedId = pathname.substring('/api/anime/'.length).trim();
        }

        if (requestedId) {
          const match = getArchiveAnimeByIdOrSlug(requestedId);
          if (match) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'SEED');
            res.end(JSON.stringify(match));
            return;
          }
        }

        const searchQuery = parsedUrl.searchParams.get('search');
        if (searchQuery) {
          const matches = searchArchiveAnime(searchQuery);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'SEED');
          res.end(
            JSON.stringify({
              data: matches,
              meta: { page: 1, size: 18, totalData: matches.length, totalPage: 1 }
            })
          );
          return;
        }
      } catch {}

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

/**
 * Server-side API middleware plugin for Hianime API
 * Proxies /api/hianime requests to the reachable Hianime API instance
 * keeping HIANIME_API_URL configured on the server.
 */
function hianimeApiPlugin(apiUrl?: string): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    if (!req.url || !req.url.startsWith('/api/hianime')) {
      return next();
    }

    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      let subPath = parsedUrl.pathname.replace(/^\/api\/hianime/, '');
      if (!subPath.startsWith('/')) {
        subPath = '/' + subPath;
      }
      const search = parsedUrl.search;
      const targetBase = (apiUrl || process.env.HIANIME_API_URL || 'http://localhost:3030').replace(/\/$/, '');
      const upstreamUrl = `${targetBase}${subPath}${search}`;

      // Check cache for GET requests
      if (req.method === 'GET' || !req.method) {
        const cached = hianimeCache.get(upstreamUrl);
        if (cached && Date.now() - cached.timestamp < HIANIME_CACHE_TTL) {
          res.statusCode = cached.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'HIT');
          res.end(cached.body);
          return;
        }
      }

      const upstreamRes = await fetch(upstreamUrl, {
        method: req.method || 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      const body = await upstreamRes.text();

      if (upstreamRes.status === 200 && (req.method === 'GET' || !req.method)) {
        hianimeCache.set(upstreamUrl, {
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
      console.error('[Hianime Server API] Error proxying request:', err?.message || err);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'HIANIME_SERVICE_UNAVAILABLE',
          message: 'Failed to communicate with Hianime API service.'
        })
      );
    }
  };

  return {
    name: 'hianime-api-proxy',
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
  const hianimeUrl = env.HIANIME_API_URL || process.env.HIANIME_API_URL || 'http://localhost:3030';

  return {
    plugins: [react(), animeApiPlugin(apiKey, apiHost), hianimeApiPlugin(hianimeUrl)],
    server: {
      port: 3001,
    },
  };
});

