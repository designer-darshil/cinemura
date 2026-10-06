import { VideoItem } from '../types';

/**
 * Priority rank calculator based on the official trailer selection specification:
 * 1. official === true && type === "Trailer"
 * 2. official === true && type === "Teaser"
 * 3. type === "Trailer"
 * 4. type === "Teaser"
 * 5. type === "Clip"
 * 6. Other video types (Featurette, Behind the Scenes, etc.)
 */
export function getVideoTier(video: VideoItem): number {
  const isOfficial = Boolean(video.official);
  const type = (video.type || '').trim().toLowerCase();

  if (isOfficial && type === 'trailer') return 1;
  if (isOfficial && type === 'teaser') return 2;
  if (type === 'trailer') return 3;
  if (type === 'teaser') return 4;
  if (type === 'clip') return 5;
  return 6;
}

/**
 * Compare two videos within the same priority tier:
 * - prefer site === "YouTube"
 * - prefer preferred language (defaults to 'en')
 * - prefer more recent publication date
 */
export function compareVideosSameTier(a: VideoItem, b: VideoItem, preferredLang: string = 'en'): number {
  // 1. Prefer site === "YouTube"
  const aIsYt = (a.site || '').toLowerCase() === 'youtube' ? 1 : 0;
  const bIsYt = (b.site || '').toLowerCase() === 'youtube' ? 1 : 0;
  if (aIsYt !== bIsYt) return bIsYt - aIsYt;

  // 2. Prefer preferred language
  const aLang = (a.language || '').toLowerCase() === preferredLang.toLowerCase() ? 1 : 0;
  const bLang = (b.language || '').toLowerCase() === preferredLang.toLowerCase() ? 1 : 0;
  if (aLang !== bLang) return bLang - aLang;

  // 3. Prefer more recent publishedAt date
  if (a.publishedAt && b.publishedAt) {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    if (!isNaN(timeA) && !isNaN(timeB)) {
      return timeB - timeA;
    }
  }

  return 0;
}

/**
 * Select the primary video for a movie or TV show adhering strictly
 * to the 5-tier priority rules and tie-breaking specifications.
 */
export function selectPrimaryVideo(videos?: VideoItem[], preferredLang: string = 'en'): VideoItem | null {
  if (!videos || !Array.isArray(videos) || videos.length === 0) return null;

  // Filter playable video items (must have a valid key)
  const playable = videos.filter(v => typeof v.key === 'string' && v.key.trim().length > 0);
  if (playable.length === 0) return null;

  const sorted = [...playable].sort((a, b) => {
    const tierA = getVideoTier(a);
    const tierB = getVideoTier(b);
    if (tierA !== tierB) return tierA - tierB;
    return compareVideosSameTier(a, b, preferredLang);
  });

  return sorted[0] || null;
}

/**
 * Sorts all playable videos with the selected primary video at index 0,
 * followed by remaining videos ordered by priority and relevance.
 */
export function sortVideosWithPrimaryFirst(videos?: VideoItem[], preferredLang: string = 'en'): VideoItem[] {
  if (!videos || !Array.isArray(videos) || videos.length === 0) return [];
  const playable = videos.filter(v => typeof v.key === 'string' && v.key.trim().length > 0);
  if (playable.length === 0) return [];

  return [...playable].sort((a, b) => {
    const tierA = getVideoTier(a);
    const tierB = getVideoTier(b);
    if (tierA !== tierB) return tierA - tierB;
    return compareVideosSameTier(a, b, preferredLang);
  });
}

/**
 * Returns the proper YouTube embed URL with autoplay and clean parameters.
 */
export function getVideoEmbedUrl(video: VideoItem): string {
  if (!video?.key) return '';
  if (video.site?.toLowerCase() === 'youtube') {
    return `https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  return `https://www.youtube.com/embed/${video.key}?autoplay=1`;
}

/**
 * Returns the high-resolution YouTube thumbnail URL.
 */
export function getVideoThumbnailUrl(video: VideoItem): string {
  if (!video?.key) return '';
  return `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
}

/**
 * Returns the exact CTA button label matching the real API type:
 * - "WATCH TRAILER" if type === "Trailer"
 * - "WATCH TEASER" if type === "Teaser"
 * - "WATCH CLIP" if type === "Clip"
 * - "WATCH {TYPE}" for other types
 */
export function getVideoButtonLabel(video: VideoItem | null | undefined): string {
  if (!video) return '';
  const type = (video.type || '').trim().toLowerCase();
  if (type === 'trailer') return 'WATCH TRAILER';
  if (type === 'teaser') return 'WATCH TEASER';
  if (type === 'clip') return 'WATCH CLIP';
  return `WATCH ${video.type.trim().toUpperCase()}`;
}

/**
 * Formats video publication date for editorial metadata presentation.
 */
export function formatVideoDate(publishedAt?: string): string | null {
  if (!publishedAt) return null;
  try {
    const d = new Date(publishedAt);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}
