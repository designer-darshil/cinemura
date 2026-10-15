/**
 * CineSrc Playback Integration Helper
 * 
 * Embed format:
 * Movies: https://cinesrc.st/embed/movie/{tmdbId}
 * TV episodes: https://cinesrc.st/embed/tv/{tmdbId}?s={seasonNumber}&e={episodeNumber}
 */

export const CINESRC_ORIGIN = 'https://cinesrc.st';

/**
 * Validates TMDb ID format (must be a valid numeric ID)
 */
export function validateTmdbId(tmdbId: string | number | undefined | null): string {
  if (tmdbId === undefined || tmdbId === null) {
    throw new Error('TMDb ID is required for CineSrc playback.');
  }
  const clean = String(tmdbId).trim();
  if (!clean || !/^\d+$/.test(clean)) {
    throw new Error(`Invalid TMDb ID for CineSrc playback: "${clean}"`);
  }
  return clean;
}

/**
 * Constructs official CineSrc movie embed URL
 */
export function getCineSrcMovieUrl(tmdbId: string | number): string {
  const cleanId = validateTmdbId(tmdbId);
  return `${CINESRC_ORIGIN}/embed/movie/${cleanId}`;
}

/**
 * Constructs official CineSrc TV episode embed URL
 */
export function getCineSrcTvUrl(
  tmdbId: string | number,
  season: number,
  episode: number
): string {
  const cleanId = validateTmdbId(tmdbId);
  const cleanSeason = Math.max(1, Math.floor(Number(season) || 1));
  const cleanEpisode = Math.max(1, Math.floor(Number(episode) || 1));
  return `${CINESRC_ORIGIN}/embed/tv/${cleanId}?s=${cleanSeason}&e=${cleanEpisode}`;
}

/**
 * Checks whether a movie is eligible for playback (must be released).
 */
export function isMoviePlayable(movie: { status?: string; releaseDate?: string; id?: string } | null | undefined): boolean {
  if (!movie || !movie.id) return false;

  // TMDb ID must be numeric
  const cleanId = String(movie.id).trim();
  if (!/^\d+$/.test(cleanId)) return false;

  // Explicit unreleased statuses in TMDb
  const unreleasedStatuses = ['In Production', 'Post Production', 'Planned', 'Rumored'];
  if (movie.status && unreleasedStatuses.includes(movie.status)) {
    return false;
  }

  // If release date is in the future, movie has not hit theaters/VOD
  if (movie.releaseDate) {
    const releaseTime = new Date(movie.releaseDate).getTime();
    if (!isNaN(releaseTime) && releaseTime > Date.now()) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether a TV episode is eligible for playback (must have aired).
 */
export function isEpisodePlayable(episode: { seasonNumber?: number; episodeNumber?: number; airDate?: string } | null | undefined): boolean {
  if (!episode || typeof episode.episodeNumber !== 'number' || episode.episodeNumber <= 0) {
    return false;
  }

  // If air date is in the future, episode has not aired yet
  if (episode.airDate) {
    const airTime = new Date(episode.airDate).getTime();
    if (!isNaN(airTime) && airTime > Date.now()) {
      return false;
    }
  }

  return true;
}
