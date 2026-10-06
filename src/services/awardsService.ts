import { EntityAwardsData } from '../types';

/**
 * Awards Service
 * 
 * CRITICAL DATA INTEGRITY:
 * TMDb public API does not provide an official/documented awards endpoint.
 * Per data integrity requirements:
 * - NO web scraping of themoviedb.org
 * - NO reverse-engineering of private web endpoints
 * - NO inferring awards from ratings, cast, or popularity
 * - NO fabricated / placeholder award records
 * 
 * An authorized awards data provider is used ONLY if explicitly configured
 * via environment variables (e.g. VITE_AWARDS_API_URL).
 * If no authorized source is configured, returns null to gracefully omit the UI.
 */

const AWARDS_API_BASE = import.meta.env.VITE_AWARDS_API_URL;
const AWARDS_API_KEY = import.meta.env.VITE_AWARDS_API_KEY;

export async function getMovieAwards(movieId: string | number): Promise<EntityAwardsData | null> {
  if (!AWARDS_API_BASE || !movieId) {
    return null;
  }

  try {
    const url = new URL(`${AWARDS_API_BASE}/movie/${movieId}/awards`);
    if (AWARDS_API_KEY) {
      url.searchParams.append('api_key', AWARDS_API_KEY);
    }
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data: EntityAwardsData = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch authorized movie awards:', err);
    return null;
  }
}

export async function getTvAwards(tvId: string | number): Promise<EntityAwardsData | null> {
  if (!AWARDS_API_BASE || !tvId) {
    return null;
  }

  try {
    const url = new URL(`${AWARDS_API_BASE}/tv/${tvId}/awards`);
    if (AWARDS_API_KEY) {
      url.searchParams.append('api_key', AWARDS_API_KEY);
    }
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data: EntityAwardsData = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch authorized TV awards:', err);
    return null;
  }
}

export async function getPersonAwards(personId: string | number): Promise<EntityAwardsData | null> {
  if (!AWARDS_API_BASE || !personId) {
    return null;
  }

  try {
    const url = new URL(`${AWARDS_API_BASE}/person/${personId}/awards`);
    if (AWARDS_API_KEY) {
      url.searchParams.append('api_key', AWARDS_API_KEY);
    }
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data: EntityAwardsData = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch authorized person awards:', err);
    return null;
  }
}
