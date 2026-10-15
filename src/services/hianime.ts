import {
  HianimeHomeData,
  HianimeListResponse,
  HianimeSuggestionItem,
  HianimeEpisode,
  HianimeServersResponse,
} from '../types/hianime';


const API_BASE = '/api/hianime/api/v2';
const CLIENT_CACHE_TTL = 3 * 60 * 1000; // 3 minutes
const cache = new Map<string, { timestamp: number; data: any }>();

async function fetchHianime<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data as T;
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Hianime API request failed with status ${res.status}`);
  }

  const json = await res.json();
  if (json.success === false) {
    throw new Error(json.message || 'Hianime API returned error status');
  }

  const data = json.data;
  cache.set(cacheKey, { timestamp: Date.now(), data });
  return data as T;
}

/**
 * Fetch Hianime Homepage data (Spotlight, Trending, Top Airing, Most Popular, etc.)
 * Endpoint: /api/v2/home
 */
export const getHianimeHome = async (): Promise<HianimeHomeData> => {
  return fetchHianime<HianimeHomeData>(`${API_BASE}/home`);
};

/**
 * Fetch Hianime Category / List page
 * Endpoint: /api/v2/animes/:category?page=:page
 */
export const getHianimeList = async (
  category: string,
  page: number = 1
): Promise<HianimeListResponse> => {
  // If category is a genre (e.g. genre/action)
  if (category.startsWith('genre/')) {
    const genreName = category.replace('genre/', '');
    return fetchHianime<HianimeListResponse>(
      `${API_BASE}/animes/genre/${encodeURIComponent(genreName)}`,
      { page }
    );
  }

  return fetchHianime<HianimeListResponse>(
    `${API_BASE}/animes/${encodeURIComponent(category)}`,
    { page }
  );
};

/**
 * Search Hianime catalog with pagination
 * Endpoint: /api/v2/search?keyword=:keyword&page=:page
 */
export const searchHianime = async (
  keyword: string,
  page: number = 1
): Promise<HianimeListResponse> => {
  if (!keyword.trim()) {
    return {
      pageInfo: { totalPages: 0, currentPage: 1, hasNextPage: false },
      response: [],
    };
  }

  return fetchHianime<HianimeListResponse>(`${API_BASE}/search`, {
    keyword: keyword.trim(),
    page,
  });
};

/**
 * Autocomplete search suggestions
 * Endpoint: /api/v2/suggestion?keyword=:keyword
 */
export const getHianimeSuggestions = async (
  keyword: string
): Promise<HianimeSuggestionItem[]> => {
  if (!keyword.trim()) return [];
  try {
    return await fetchHianime<HianimeSuggestionItem[]>(`${API_BASE}/suggestion`, {
      keyword: keyword.trim(),
    });
  } catch (err) {
    console.warn('Failed to fetch suggestions:', err);
    return [];
  }
};

/**
 * Fetch episodes for an anime by Hianime ID
 * Endpoint: /api/v2/episodes/:id
 */
export const getHianimeEpisodes = async (
  animeId: string
): Promise<HianimeEpisode[]> => {
  if (!animeId) return [];
  try {
    return await fetchHianime<HianimeEpisode[]>(
      `${API_BASE}/episodes/${encodeURIComponent(animeId)}`
    );
  } catch (err) {
    console.warn(`Failed to fetch episodes for ${animeId}:`, err);
    return [];
  }
};

/**
 * Fetch streaming servers and iframe embed for an episode
 * Endpoint: /api/v2/servers/:episodeId?type=:type
 */
export const getHianimeServers = async (
  episodeId: string,
  type: 'sub' | 'dub' = 'sub'
): Promise<HianimeServersResponse | null> => {
  if (!episodeId) return null;
  try {
    return await fetchHianime<HianimeServersResponse>(
      `${API_BASE}/servers/${encodeURIComponent(episodeId)}`,
      { type }
    );
  } catch (err) {
    console.warn(`Failed to fetch servers for episode ${episodeId}:`, err);
    return null;
  }
};

/**
 * Fetch Hianime Detail record (used for secondary provider matching)
 * Endpoint: /api/v2/anime/:id
 */
export const getHianimeDetail = async (id: string): Promise<any> => {
  if (!id) return null;
  try {
    return await fetchHianime<any>(`${API_BASE}/anime/${encodeURIComponent(id)}`);
  } catch (err) {
    console.warn(`Failed to fetch Hianime detail for ${id}:`, err);
    return null;
  }
};
