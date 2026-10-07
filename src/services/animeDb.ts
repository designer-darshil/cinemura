import {
  AnimeItem,
  AnimeResponse,
  AnimeFilterOptions,
  AnimeApiError,
  AnimeApiErrorCode
} from '../types/anime';

// Cache configuration to respect RapidAPI quota & prevent duplicate calls
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<string, { timestamp: number; data: any }>();

// Environment variables
const ENV_KEY =
  (import.meta.env.VITE_RAPIDAPI_KEY as string) ||
  (import.meta.env.RAPIDAPI_KEY as string) ||
  '';

const ENV_HOST =
  (import.meta.env.VITE_RAPIDAPI_ANIME_HOST as string) ||
  (import.meta.env.RAPIDAPI_ANIME_HOST as string) ||
  'anime-db.p.rapidapi.com';

const BASE_URL = `https://${ENV_HOST}`;

/**
 * Retrieve the active RapidAPI key (environment or localStorage override)
 */
export const getAnimeApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const localOverride = localStorage.getItem('RAPIDAPI_ANIME_KEY');
    if (localOverride && localOverride.trim()) {
      return localOverride.trim();
    }
  }
  return ENV_KEY.trim();
};

/**
 * Allow runtime API key override for local testing/demo without rebuilding
 */
export const setAnimeApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('RAPIDAPI_ANIME_KEY', key.trim());
    } else {
      localStorage.removeItem('RAPIDAPI_ANIME_KEY');
    }
    responseCache.clear();
  }
};

/**
 * Fetch wrapper for RapidAPI Anime DB
 */
async function fetchAnimeDb<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const apiKey = getAnimeApiKey();

  // If no API key is provided, return structured error
  if (!apiKey) {
    const err: AnimeApiError = {
      code: 'MISSING_KEY',
      message: 'RapidAPI Key is not configured. Please set RAPIDAPI_KEY in your environment or provide a key.'
    };
    throw err;
  }

  // Construct URL with query parameters
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const cacheKey = url.toString();
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const headers: Record<string, string> = {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': ENV_HOST,
    Accept: 'application/json'
  };

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });
  } catch (netErr: any) {
    const err: AnimeApiError = {
      code: 'NETWORK_ERROR',
      message: `Failed to connect to Anime DB API: ${netErr.message || 'Network error'}`
    };
    throw err;
  }

  if (!response.ok) {
    let errorCode: AnimeApiErrorCode = 'UNKNOWN';
    let errorMessage = `API request failed with status ${response.status} (${response.statusText})`;

    if (response.status === 401 || response.status === 403) {
      errorCode = 'AUTH_FAILED';
      errorMessage = 'RapidAPI authentication failed. Check your API key and subscription to Anime DB.';
    } else if (response.status === 429) {
      errorCode = 'RATE_LIMITED';
      errorMessage = 'RapidAPI rate limit or quota exceeded for Anime DB.';
    } else if (response.status === 404) {
      errorCode = 'NOT_FOUND';
      errorMessage = 'Requested Anime resource was not found.';
    }

    const err: AnimeApiError = {
      code: errorCode,
      message: errorMessage,
      status: response.status
    };
    throw err;
  }

  const data = await response.json();
  responseCache.set(cacheKey, { timestamp: Date.now(), data });
  return data as T;
}

/**
 * Normalizes raw API Anime object into strict AnimeItem
 */
const normalizeAnimeItem = (raw: any): AnimeItem => {
  return {
    id: String(raw.id || raw._id || ''),
    title: raw.title || 'Untitled Anime',
    synopsis: raw.synopsis || raw.description || undefined,
    rank: typeof raw.rank === 'number' ? raw.rank : typeof raw.ranking === 'number' ? raw.ranking : undefined,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    episodes: typeof raw.episodes === 'number' ? raw.episodes : undefined,
    image: raw.image || raw.thumb || undefined,
    type: raw.type || undefined,
    status: raw.status || undefined
  };
};

/**
 * Get paginated list of anime with optional filters
 * Endpoint: GET /anime
 */
export const getAnimeList = async (options: AnimeFilterOptions = {}): Promise<AnimeResponse> => {
  const page = options.page || 1;
  const size = options.size || 18;

  const params: Record<string, any> = {
    page,
    size
  };

  if (options.search) params.search = options.search;
  if (options.genres) params.genres = options.genres;
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.sortOrder) params.sortOrder = options.sortOrder;

  const raw = await fetchAnimeDb<any>('/anime', params);

  // The endpoint returns { data: [...], meta: {...} } or [...]
  const rawList = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const normalizedList = rawList.map(normalizeAnimeItem);

  return {
    data: normalizedList,
    meta: raw.meta || {
      page,
      size,
      totalData: normalizedList.length,
      totalPage: Math.ceil(normalizedList.length / size)
    }
  };
};

/**
 * Fetch detailed anime by ID
 * Endpoint: GET /anime/{id}
 */
export const getAnimeById = async (id: string): Promise<AnimeItem> => {
  if (!id) {
    throw {
      code: 'NOT_FOUND',
      message: 'Anime ID is required.'
    } as AnimeApiError;
  }

  const raw = await fetchAnimeDb<any>(`/anime/${encodeURIComponent(id)}`);
  return normalizeAnimeItem(raw);
};

/**
 * Search anime by title
 * Endpoint: GET /anime?search={query}
 */
export const searchAnime = async (
  query: string,
  page: number = 1,
  size: number = 18
): Promise<AnimeResponse> => {
  if (!query.trim()) {
    return { data: [], meta: { page: 1, size } };
  }

  return getAnimeList({
    search: query.trim(),
    page,
    size
  });
};

/**
 * Fetch top-ranked anime
 * Endpoint: GET /anime?sortBy=ranking&sortOrder=asc
 */
export const getAnimeRankings = async (
  page: number = 1,
  size: number = 18
): Promise<AnimeResponse> => {
  return getAnimeList({
    page,
    size,
    sortBy: 'ranking',
    sortOrder: 'asc'
  });
};

/**
 * Get available Anime genres list
 * Endpoint: GET /genres
 */
export const getAnimeGenres = async (): Promise<string[]> => {
  try {
    const raw = await fetchAnimeDb<any>('/genres');
    if (Array.isArray(raw)) {
      return raw.map((g: any) => (typeof g === 'string' ? g : g.name || String(g)));
    }
    if (Array.isArray(raw?.data)) {
      return raw.data.map((g: any) => (typeof g === 'string' ? g : g.name || String(g)));
    }
    return [];
  } catch (err) {
    console.warn('Anime genres endpoint unavailable or failed:', err);
    return [];
  }
};
