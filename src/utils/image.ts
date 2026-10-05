// TMDB Image Helper & Fallback Utility

const TMDB_SECURE_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w300' | 'w500' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w185' | 'h632' | 'original';

export const getTmdbImageUrl = (
  path: string | null | undefined,
  size: PosterSize | BackdropSize | ProfileSize = 'w500'
): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_SECURE_IMAGE_BASE}/${size}${cleanPath}`;
};

// Fallback cinematic placeholders (SVG Data URIs) to prevent broken image icons and layout shift
export const PLACEHOLDER_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23121212'/%3E%3Crect x='1' y='1' width='498' height='748' fill='none' stroke='rgba(245,243,238,0.12)' stroke-width='2'/%3E%3Cpath d='M220 340 L280 375 L220 410 Z' fill='%23F27A21'/%3E%3Ctext x='250' y='460' font-family='sans-serif' font-size='16' font-weight='bold' fill='%238E8E93' text-anchor='middle' letter-spacing='3'%3ECINEMURA DOSSIER%3C/text%3E%3C/svg%3E";

export const PLACEHOLDER_BACKDROP = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%230A0A0A'/%3E%3Crect x='1' y='1' width='1278' height='718' fill='none' stroke='rgba(245,243,238,0.12)' stroke-width='2'/%3E%3Ctext x='640' y='360' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23F27A21' text-anchor='middle' letter-spacing='4'%3ECINEMATIC PREVIEW UNAVAILABLE%3C/text%3E%3C/svg%3E";

export const PLACEHOLDER_PROFILE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23121212'/%3E%3Ccircle cx='200' cy='220' r='70' fill='%23242426'/%3E%3Cpath d='M100 480 C100 360, 300 360, 300 480 Z' fill='%23242426'/%3E%3C/svg%3E";

export const getImageWithFallback = (
  path: string | null | undefined,
  type: 'poster' | 'backdrop' | 'profile' | 'logo' = 'poster',
  size: PosterSize | BackdropSize | ProfileSize = 'w500'
): string => {
  const url = getTmdbImageUrl(path, size);
  if (url) return url;
  
  if (type === 'backdrop') return PLACEHOLDER_BACKDROP;
  if (type === 'profile') return PLACEHOLDER_PROFILE;
  return PLACEHOLDER_POSTER;
};
