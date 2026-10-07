/**
 * VidLink Playback URL Builder
 * 
 * Movie playback MUST use:
 * https://vidlink.pro/movie/{tmdbId}
 * 
 * TV playback MUST use:
 * https://vidlink.pro/tv/{tmdbId}/{season}/{episode}
 */

export function getVidLinkMovieUrl(tmdbId: string | number): string {
  const cleanId = String(tmdbId).trim();
  const url = `https://vidlink.pro/movie/${cleanId}`;
  if (import.meta.env.DEV) {
    console.log('[VidLink] Generated Movie URL:', url);
  }
  return url;
}

export function getVidLinkTvUrl(tmdbId: string | number, season: number, episode: number): string {
  const cleanId = String(tmdbId).trim();
  const cleanSeason = Number(season);
  const cleanEpisode = Number(episode);
  const url = `https://vidlink.pro/tv/${cleanId}/${cleanSeason}/${cleanEpisode}`;
  if (import.meta.env.DEV) {
    console.log('[VidLink] Generated TV URL:', url);
  }
  return url;
}

/**
 * Checks whether a movie is eligible for playback (must be released).
 */
export function isMoviePlayable(movie: { status?: string; releaseDate?: string; id?: string } | null | undefined): boolean {
  if (!movie || !movie.id) return false;

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
 * Checks whether a TV episode is eligible for playback (must be an actual episode that has aired).
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

