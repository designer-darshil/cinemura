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

const API_BASE = '/api/anime';

/**
 * Fetch wrapper for server-side Anime DB API proxy
 */
async function fetchAnimeDb<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, window.location.origin);
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

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
  } catch (netErr: any) {
    const err: AnimeApiError = {
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to anime service. Please check your network connection.'
    };
    throw err;
  }

  if (!response.ok) {
    let errorCode: AnimeApiErrorCode = 'UNKNOWN';
    let errorMessage = 'Anime data is currently unavailable.';

    if (response.status === 503 || response.status === 500) {
      errorCode = 'SERVER_ERROR';
      errorMessage = 'Anime service is currently unavailable.';
    } else if (response.status === 401 || response.status === 403) {
      errorCode = 'AUTH_FAILED';
      errorMessage = 'Anime service authentication error.';
    } else if (response.status === 429) {
      errorCode = 'RATE_LIMITED';
      errorMessage = 'Rate limit reached. Please try again shortly.';
    } else if (response.status === 404) {
      errorCode = 'NOT_FOUND';
      errorMessage = 'Requested anime record was not found.';
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
 * Endpoint: /api/anime
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

  const raw = await fetchAnimeDb<any>(API_BASE, params);

  const rawList = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const normalizedList = rawList.map(normalizeAnimeItem);

  return {
    data: normalizedList,
    meta: raw?.meta || {
      page,
      size,
      totalData: normalizedList.length,
      totalPage: Math.ceil(normalizedList.length / size)
    }
  };
};

/**
 * Fetch detailed anime by ID
 * Endpoint: /api/anime/:id
 */
export const getAnimeById = async (id: string): Promise<AnimeItem> => {
  if (!id) {
    throw {
      code: 'NOT_FOUND',
      message: 'Anime ID is required.'
    } as AnimeApiError;
  }

  const raw = await fetchAnimeDb<any>(`${API_BASE}/${encodeURIComponent(id)}`);
  return normalizeAnimeItem(raw);
};

/**
 * Search anime by title
 * Endpoint: /api/anime?search={query}
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
 * Endpoint: /api/anime?sortBy=ranking&sortOrder=asc
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
 * Verified Anime genres supported by Anime DB query parameters
 */
const ANIME_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Supernatural',
  'Suspense'
];

/**
 * Get available Anime genres list
 */
export const getAnimeGenres = async (): Promise<string[]> => {
  return ANIME_GENRES;
};
