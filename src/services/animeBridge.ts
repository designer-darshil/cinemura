import { AnimeItem } from '../types/anime';
import { HianimeCardItem, HianimeSpotlightItem } from '../types/hianime';
import { getAnimeById, searchAnime } from './animeDb';
import { getHianimeDetail, getHianimeEpisodes } from './hianime';
import { getArchiveAnimeByIdOrSlug, searchArchiveAnime } from '../data/animeDbArchive';

export interface UnifiedAnimeCardItem {
  id: string; // Navigable ID (slug or provider ID)
  title: string;
  alternativeTitle?: string;
  image: string;
  thumb?: string;
  type?: string;
  episodes?: number;
  rank?: number;
  genres?: string[];
  status?: string;
  hianimeId?: string;
  animeDbId?: string;
}

/**
 * Normalizes title for reliable cross-provider comparison
 */
export function normalizeTitleForMatching(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Converts a Hianime slug to a readable title guess
 * e.g. "one-piece-12" -> "one piece"
 */
export function extractTitleFromSlug(slug: string): string {
  // Strip trailing numeric ID e.g. "-12" or "-12280"
  const cleaned = slug.replace(/-\d+$/, '').replace(/-/g, ' ');
  return cleaned.trim();
}

/**
 * Converts HianimeCardItem to UnifiedAnimeCardItem for grid cards
 */
export function adaptHianimeCard(item: HianimeCardItem): UnifiedAnimeCardItem {
  return {
    id: item.id,
    title: item.title,
    alternativeTitle: item.alternativeTitle || undefined,
    image: item.poster,
    thumb: item.poster,
    type: item.type || undefined,
    episodes: item.episodes?.eps || item.episodes?.sub || undefined,
    rank: item.rank,
    hianimeId: item.id,
  };
}

/**
 * Converts HianimeSpotlightItem to UnifiedAnimeCardItem
 */
export function adaptHianimeSpotlight(item: HianimeSpotlightItem): UnifiedAnimeCardItem {
  return {
    id: item.id,
    title: item.title,
    alternativeTitle: item.alternativeTitle || undefined,
    image: item.poster,
    thumb: item.poster,
    type: item.type || undefined,
    episodes: item.episodes?.eps || item.episodes?.sub || undefined,
    rank: item.rank,
    hianimeId: item.id,
  };
}

export interface ResolutionResult {
  record: AnimeItem | null;
  hianimeId?: string;
  unmatched: boolean;
  reason?: string;
}

/**
 * Resolves a listing ID (from Hianime or Anime DB) to the canonical Anime DB detail record.
 * Follows strict requirements:
 * 1. Keep existing anime detail API as primary source for anime profile metadata.
 * 2. Reliable cross-provider identifier mapping (direct ID, archive, episode malId, verified title matching).
 * 3. Never select an unrelated anime as a fallback.
 * 4. Return unmatched: true when no verified canonical record exists.
 */
export async function resolveAnimeDetailRecord(
  identifier: string,
  titleHint?: string
): Promise<ResolutionResult> {
  if (!identifier) {
    return { record: null, unmatched: true, reason: 'Identifier missing' };
  }

  const hianimeId = identifier;

  // 1. Direct canonical archive lookup (covers verified IDs, slugs, and scraper aliases)
  const archiveMatch = getArchiveAnimeByIdOrSlug(identifier);
  if (archiveMatch) {
    return {
      record: archiveMatch as unknown as AnimeItem,
      hianimeId,
      unmatched: false,
    };
  }

  // 2. Direct lookup: Is identifier already a numeric/canonical Anime DB ID?
  const isPureId = /^\d+$/.test(identifier) || identifier.length > 20;
  if (isPureId) {
    try {
      const record = await getAnimeById(identifier);
      if (record && record.title) {
        return {
          record,
          hianimeId: undefined,
          unmatched: false,
        };
      }
    } catch {
      // Continue to next resolution step if direct lookup fails
    }
  }

  // 3. Identifier extraction from Hianime episodes (malId / aniId)
  try {
    const eps = await getHianimeEpisodes(identifier);
    if (eps && eps.length > 0) {
      const rawMalId = (eps[0] as any)?.malId || (eps[0] as any)?.aniId;
      if (rawMalId && typeof rawMalId === 'string') {
        const parsedMalId = rawMalId.split('/')[0].trim();
        if (parsedMalId) {
          // Check archive first for speed
          const arch = getArchiveAnimeByIdOrSlug(parsedMalId);
          if (arch) {
            return {
              record: arch as unknown as AnimeItem,
              hianimeId,
              unmatched: false,
            };
          }

          // Fetch from Anime DB API with verified MAL ID
          try {
            const verifiedRecord = await getAnimeById(parsedMalId);
            if (verifiedRecord && verifiedRecord.title) {
              return {
                record: verifiedRecord,
                hianimeId,
                unmatched: false,
              };
            }
          } catch {
            // Fall through to title matching
          }
        }
      }
    }
  } catch {
    // Continue to title-based matching
  }

  // 4. Determine verified title & alternative titles
  let titleToSearch = titleHint?.trim();
  const alternativeTitlesToMatch: string[] = [];

  if (!titleToSearch) {
    try {
      const hianimeMeta = await getHianimeDetail(identifier);
      if (hianimeMeta) {
        titleToSearch = hianimeMeta.title;
        if (hianimeMeta.alternativeTitle) alternativeTitlesToMatch.push(hianimeMeta.alternativeTitle);
        if (hianimeMeta.japanese) alternativeTitlesToMatch.push(hianimeMeta.japanese);
      }
    } catch {
      titleToSearch = extractTitleFromSlug(identifier);
    }
  }

  if (!titleToSearch) {
    titleToSearch = extractTitleFromSlug(identifier);
  }

  if (!titleToSearch) {
    return {
      record: null,
      hianimeId,
      unmatched: true,
      reason: 'Could not determine title for cross-provider matching',
    };
  }

  // 5. Check canonical archive by title
  const archiveByTitle = searchArchiveAnime(titleToSearch);
  if (archiveByTitle.length > 0) {
    return {
      record: archiveByTitle[0] as unknown as AnimeItem,
      hianimeId,
      unmatched: false,
    };
  }

  // 6. Search Anime DB API for candidate records
  try {
    const searchRes = await searchAnime(titleToSearch, 1, 10);
    const candidates = searchRes.data || [];

    if (candidates.length === 0) {
      // Try searching first 2 words if title was long
      const words = titleToSearch.split(' ');
      if (words.length > 2) {
        const shorter = words.slice(0, 2).join(' ');
        const retryRes = await searchAnime(shorter, 1, 10);
        if (retryRes.data && retryRes.data.length > 0) {
          candidates.push(...retryRes.data);
        }
      }
    }

    if (candidates.length === 0) {
      return {
        record: null,
        hianimeId,
        unmatched: true,
        reason: `No records in Anime DB archive matched "${titleToSearch}"`,
      };
    }

    // 7. Perform reliable cross-provider matching
    const normTarget = normalizeTitleForMatching(titleToSearch);
    const normAlternatives = alternativeTitlesToMatch.map(normalizeTitleForMatching);

    let bestMatch: AnimeItem | null = null;

    // Check exact title or alternative title match
    for (const c of candidates) {
      const cNorm = normalizeTitleForMatching(c.title);
      if (cNorm === normTarget) {
        bestMatch = c;
        break;
      }
      if (c.alternativeTitles) {
        for (const alt of c.alternativeTitles) {
          const altNorm = normalizeTitleForMatching(alt);
          if (altNorm === normTarget || normAlternatives.includes(altNorm)) {
            bestMatch = c;
            break;
          }
        }
      }
      if (bestMatch) break;
    }

    // If still no exact match, check strong prefix/containment match
    if (!bestMatch) {
      for (const c of candidates) {
        const cNorm = normalizeTitleForMatching(c.title);
        if (cNorm.startsWith(normTarget) || normTarget.startsWith(cNorm)) {
          bestMatch = c;
          break;
        }
      }
    }

    if (!bestMatch) {
      return {
        record: null,
        hianimeId,
        unmatched: true,
        reason: `Candidates were found but none reliably matched "${titleToSearch}"`,
      };
    }

    // Return the verified canonical record directly
    return {
      record: bestMatch,
      hianimeId,
      unmatched: false,
    };
  } catch (err: any) {
    console.error('Cross-provider matching error:', err);
    return {
      record: null,
      hianimeId,
      unmatched: true,
      reason: err?.message || 'Error communicating with Anime DB archive',
    };
  }
}
