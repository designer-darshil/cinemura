import { Movie, Series, Person, MediaItem, Season, ProductionCompany, VideoItem } from '../types';
import { getImageWithFallback } from '../utils/image';
import { selectPrimaryVideo, getVideoEmbedUrl } from '../utils/trailer';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4e44d9029b1270a757cddc766a1bcb63';
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || '';

export interface GenreItem {
  id: number;
  name: string;
}

// Reusable fetch wrapper with authentication and error handling
async function fetchFromTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    if (API_KEY) {
      url.searchParams.set('api_key', API_KEY);
    }

    Object.entries(params).forEach(([key, val]) => {
      if (val) url.searchParams.set(key, val);
    });

    // Always include adult content explicitly across all endpoints
    url.searchParams.set('include_adult', 'true');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`TMDB API Error (${response.status}): ${response.statusText}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('TMDB API fetch failed:', error);
    return null;
  }
}

// Helper to format currency
export function formatCurrency(amount?: number): string | undefined {
  if (!amount || amount <= 0) return undefined;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// Transform TMDB raw movie item into Movie contract
export function transformTmdbMovie(item: any): Movie {
  const certification = item.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates[0]?.certification || (item.adult ? 'NC-17' : 'PG-13');

  const productionCompanies: ProductionCompany[] = item.production_companies?.map((c: any) => ({
    id: c.id,
    name: c.name,
    logo: c.logo_path ? getImageWithFallback(c.logo_path, 'logo', 'w185') : undefined,
    country: c.origin_country
  })) || [];

  const videos: VideoItem[] = item.videos?.results?.map((v: any) => ({
    id: v.id,
    key: v.key,
    name: v.name,
    type: v.type,
    site: v.site,
    official: Boolean(v.official),
    publishedAt: v.published_at,
    language: v.iso_639_1,
    size: v.size
  })) || [];

  const backdropImages: string[] = item.images?.backdrops?.map((img: any) =>
    getImageWithFallback(img.file_path, 'backdrop', 'w1280')
  ) || [];
  const posterImages: string[] = item.images?.posters?.map((img: any) =>
    getImageWithFallback(img.file_path, 'poster', 'w780')
  ) || [];
  const images: string[] = [...backdropImages, ...posterImages];

  const keywords: string[] = item.keywords?.keywords?.map((k: any) => k.name) ||
    item.keywords?.results?.map((k: any) => k.name) || [];

  const collection = item.belongs_to_collection ? {
    id: item.belongs_to_collection.id,
    name: item.belongs_to_collection.name,
    poster: getImageWithFallback(item.belongs_to_collection.poster_path, 'poster', 'w500'),
    backdrop: getImageWithFallback(item.belongs_to_collection.backdrop_path, 'backdrop', 'w1280')
  } : undefined;

  const recommendations = item.recommendations?.results?.map(transformTmdbMovie) || [];
  const similar = item.similar?.results?.map(transformTmdbMovie) || [];

  return {
    id: item.id?.toString() || '',
    type: 'movie',
    title: item.title || item.original_title || 'Untitled Movie',
    originalTitle: item.original_title !== item.title ? item.original_title : undefined,
    slug: item.id?.toString() || '',
    tagline: item.tagline || '',
    poster: getImageWithFallback(item.poster_path, 'poster', 'w500'),
    backdrop: getImageWithFallback(item.backdrop_path, 'backdrop', 'w1280'),
    releaseDate: item.release_date || 'TBA',
    year: item.release_date ? parseInt(item.release_date.split('-')[0]) : new Date().getFullYear(),
    runtime: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : 'N/A',
    genres: item.genres ? item.genres.map((g: any) => g.name) : (item.genre_ids ? [] : []),
    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
    voteCount: item.vote_count || 0,
    popularity: item.popularity ? parseFloat(item.popularity.toFixed(1)) : undefined,
    certification,
    synopsis: item.overview || '',
    language: item.original_language ? item.original_language.toUpperCase() : 'EN',
    spokenLanguages: item.spoken_languages?.map((l: any) => l.english_name || l.name) || [],
    status: item.status || 'Released',
    budget: item.budget || undefined,
    revenue: item.revenue || undefined,
    homepage: item.homepage || undefined,
    imdbId: item.external_ids?.imdb_id || item.imdb_id || undefined,
    director: item.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'N/A',
    writers: item.credits?.crew?.filter((c: any) => c.job === 'Screenplay' || c.job === 'Writer').map((w: any) => w.name) || [],
    cast: item.credits?.cast?.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      role: 'Actor',
      character: c.character || '',
      image: getImageWithFallback(c.profile_path, 'profile', 'h632'),
      slug: c.id.toString()
    })) || [],
    crew: item.credits?.crew?.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      job: c.job,
      image: getImageWithFallback(c.profile_path, 'profile', 'h632'),
      slug: c.id.toString()
    })) || [],
    productionCompanies,
    productionCountries: item.production_countries?.map((c: any) => c.name) || [],
    keywords,
    collection,
    videos,
    images,
    recommendations,
    similar,
    primaryVideo: selectPrimaryVideo(videos, item.original_language || 'en') || undefined,
    trailerUrl: selectPrimaryVideo(videos, item.original_language || 'en')
      ? getVideoEmbedUrl(selectPrimaryVideo(videos, item.original_language || 'en')!)
      : undefined,
    featured: true
  };
}

// Transform TMDB raw TV item into Series contract
export function transformTmdbTv(item: any): Series {
  const certification = item.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || (item.adult ? 'TV-MA' : 'TV-14');

  const productionCompanies: ProductionCompany[] = item.production_companies?.map((c: any) => ({
    id: c.id,
    name: c.name,
    logo: c.logo_path ? getImageWithFallback(c.logo_path, 'logo', 'w185') : undefined,
    country: c.origin_country
  })) || [];

  const networks: ProductionCompany[] = item.networks?.map((n: any) => ({
    id: n.id,
    name: n.name,
    logo: n.logo_path ? getImageWithFallback(n.logo_path, 'logo', 'w185') : undefined,
    country: n.origin_country
  })) || [];

  const videos: VideoItem[] = item.videos?.results?.map((v: any) => ({
    id: v.id,
    key: v.key,
    name: v.name,
    type: v.type,
    site: v.site,
    official: Boolean(v.official),
    publishedAt: v.published_at,
    language: v.iso_639_1,
    size: v.size
  })) || [];

  const backdropImages: string[] = item.images?.backdrops?.map((img: any) =>
    getImageWithFallback(img.file_path, 'backdrop', 'w1280')
  ) || [];
  const posterImages: string[] = item.images?.posters?.map((img: any) =>
    getImageWithFallback(img.file_path, 'poster', 'w780')
  ) || [];
  const images: string[] = [...backdropImages, ...posterImages];

  const keywords: string[] = item.keywords?.results?.map((k: any) => k.name) || [];

  const recommendations = item.recommendations?.results?.map(transformTmdbTv) || [];
  const similar = item.similar?.results?.map(transformTmdbTv) || [];

  return {
    id: item.id?.toString() || '',
    type: 'tv',
    title: item.name || item.original_name || 'Untitled Series',
    originalName: item.original_name !== item.name ? item.original_name : undefined,
    slug: item.id?.toString() || '',
    tagline: item.tagline || '',
    poster: getImageWithFallback(item.poster_path, 'poster', 'w500'),
    backdrop: getImageWithFallback(item.backdrop_path, 'backdrop', 'w1280'),
    firstAirDate: item.first_air_date || 'TBA',
    lastAirDate: item.last_air_date || undefined,
    year: item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : new Date().getFullYear(),
    showType: item.type || undefined,
    episodeRuntime: item.episode_run_time && item.episode_run_time[0] ? `${item.episode_run_time[0]} MIN` : undefined,
    seasonsCount: item.number_of_seasons || (item.seasons?.length || 1),
    totalEpisodes: item.number_of_episodes || 0,
    genres: item.genres ? item.genres.map((g: any) => g.name) : [],
    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
    voteCount: item.vote_count || 0,
    popularity: item.popularity ? parseFloat(item.popularity.toFixed(1)) : undefined,
    certification,
    synopsis: item.overview || '',
    language: item.original_language ? item.original_language.toUpperCase() : 'EN',
    spokenLanguages: item.spoken_languages?.map((l: any) => l.english_name || l.name) || [],
    status: item.status || 'Ended',
    homepage: item.homepage || undefined,
    imdbId: item.external_ids?.imdb_id || undefined,
    network: networks[0]?.name || '',
    networks,
    creators: item.created_by ? item.created_by.map((c: any) => c.name) : [],
    creatorDetails: item.created_by ? item.created_by.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      portrait: getImageWithFallback(c.profile_path, 'profile', 'h632'),
      slug: c.id.toString()
    })) : [],
    cast: item.credits?.cast?.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      role: 'Actor',
      character: c.character || '',
      image: getImageWithFallback(c.profile_path, 'profile', 'h632'),
      slug: c.id.toString()
    })) || [],
    crew: item.credits?.crew?.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      job: c.job,
      image: getImageWithFallback(c.profile_path, 'profile', 'h632'),
      slug: c.id.toString()
    })) || [],
    productionCompanies,
    productionCountries: item.production_countries?.map((c: any) => c.name) || [],
    keywords,
    videos,
    images,
    recommendations,
    similar,
    seasons: item.seasons ? item.seasons.map((s: any) => ({
      seasonNumber: s.season_number,
      title: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count || 0,
      year: s.air_date ? parseInt(s.air_date.split('-')[0]) : new Date().getFullYear(),
      poster: getImageWithFallback(s.poster_path, 'poster', 'w500'),
      overview: s.overview || '',
      episodes: []
    })) : [],
    primaryVideo: selectPrimaryVideo(videos, item.original_language || 'en') || undefined,
    trailerUrl: selectPrimaryVideo(videos, item.original_language || 'en')
      ? getVideoEmbedUrl(selectPrimaryVideo(videos, item.original_language || 'en')!)
      : undefined,
    featured: true
  };
}

export async function getTrendingMedia(): Promise<MediaItem[] | null> {
  const data = await fetchFromTmdb<any>('/trending/all/day');
  if (!data || !data.results) return null;
  return data.results.map((item: any) =>
    item.media_type === 'tv' ? transformTmdbTv(item) : transformTmdbMovie(item)
  );
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[] | null> {
  const data = await fetchFromTmdb<any>(`/trending/movie/${timeWindow}`);
  if (!data || !data.results) return null;
  return data.results.map(transformTmdbMovie);
}

export async function getTrendingTv(timeWindow: 'day' | 'week' = 'day'): Promise<Series[] | null> {
  const data = await fetchFromTmdb<any>(`/trending/tv/${timeWindow}`);
  if (!data || !data.results) return null;
  return data.results.map(transformTmdbTv);
}

export async function getMoviesList(genreId?: string, sortBy: string = 'popularity.desc', page: number = 1): Promise<Movie[] | null> {
  const endpoint = genreId ? `/discover/movie` : `/movie/popular`;
  const params: Record<string, string> = { page: page.toString() };
  if (genreId && genreId !== 'All') params.with_genres = genreId;
  if (sortBy) params.sort_by = sortBy;

  const data = await fetchFromTmdb<any>(endpoint, params);
  if (!data || !data.results) return null;
  return data.results.map(transformTmdbMovie);
}

export async function getMovieDetail(id: string): Promise<Movie | null> {
  if (!id) return null;
  const data = await fetchFromTmdb<any>(`/movie/${id}`, {
    append_to_response: 'credits,videos,release_dates,keywords,recommendations,similar,images,external_ids'
  });
  if (!data) return null;
  return transformTmdbMovie(data);
}

export async function getTvList(genreId?: string, sortBy: string = 'popularity.desc', page: number = 1): Promise<Series[] | null> {
  const endpoint = genreId ? `/discover/tv` : `/tv/popular`;
  const params: Record<string, string> = { page: page.toString() };
  if (genreId && genreId !== 'All') params.with_genres = genreId;
  if (sortBy) params.sort_by = sortBy;

  const data = await fetchFromTmdb<any>(endpoint, params);
  if (!data || !data.results) return null;
  return data.results.map(transformTmdbTv);
}

export async function getTvDetail(id: string): Promise<Series | null> {
  if (!id) return null;
  const data = await fetchFromTmdb<any>(`/tv/${id}`, {
    append_to_response: 'credits,videos,content_ratings,keywords,recommendations,similar,images,external_ids'
  });
  if (!data) return null;
  return transformTmdbTv(data);
}

export async function getTvSeasonDetail(tvId: string, seasonNumber: number): Promise<Season | null> {
  const data = await fetchFromTmdb<any>(`/tv/${tvId}/season/${seasonNumber}`);
  if (!data) return null;

  return {
    seasonNumber: data.season_number,
    title: data.name || `Season ${data.season_number}`,
    overview: data.overview || '',
    poster: getImageWithFallback(data.poster_path, 'poster', 'w500'),
    episodeCount: data.episodes?.length || 0,
    year: data.air_date ? parseInt(data.air_date.split('-')[0]) : new Date().getFullYear(),
    episodes: data.episodes ? data.episodes.map((ep: any) => ({
      id: ep.id.toString(),
      seasonNumber: ep.season_number,
      episodeNumber: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      runtime: ep.runtime ? `${ep.runtime} MIN` : 'N/A',
      airDate: ep.air_date || '',
      stillImage: getImageWithFallback(ep.still_path, 'backdrop', 'w780'),
      synopsis: ep.overview || 'No episode synopsis available.',
      rating: ep.vote_average ? parseFloat(ep.vote_average.toFixed(1)) : 0,
      voteCount: ep.vote_count || 0,
      guestStars: ep.guest_stars?.slice(0, 5).map((g: any) => g.name) || [],
      crew: ep.crew?.slice(0, 5).map((c: any) => `${c.name} (${c.job})`) || []
    })) : []
  };
}

export async function getPopularPeople(page: number = 1): Promise<Person[] | null> {
  const data = await fetchFromTmdb<any>('/person/popular', { page: page.toString() });
  if (!data || !data.results) return null;

  return data.results.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    slug: p.id.toString(),
    role: (p.known_for_department === 'Directing' ? 'Director' : 'Actor') as 'Actor' | 'Director',
    portrait: getImageWithFallback(p.profile_path, 'profile', 'h632'),
    biography: '',
    knownFor: p.known_for?.map((k: any) => k.title || k.name) || [],
    filmography: []
  }));
}

export async function getPersonDetail(id: string): Promise<Person | null> {
  if (!id) return null;
  const data = await fetchFromTmdb<any>(`/person/${id}`, {
    append_to_response: 'combined_credits,external_ids,images'
  });
  if (!data) return null;

  const castCredits = data.combined_credits?.cast || [];
  const crewCredits = data.combined_credits?.crew || [];
  
  // Combine cast + crew without artificial truncation
  const combined = [...castCredits, ...crewCredits]
    .filter((m: any, index: number, self: any[]) => self.findIndex((t: any) => t.id === m.id) === index)
    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

  return {
    id: data.id.toString(),
    name: data.name,
    slug: data.id.toString(),
    role: data.known_for_department === 'Directing' ? 'Director' : 'Actor',
    portrait: getImageWithFallback(data.profile_path, 'profile', 'h632'),
    biography: data.biography || 'No biography details available in database.',
    birthDate: data.birthday || undefined,
    birthPlace: data.place_of_birth || undefined,
    deathDate: data.deathday || undefined,
    popularity: data.popularity ? parseFloat(data.popularity.toFixed(1)) : undefined,
    imdbId: data.external_ids?.imdb_id || undefined,
    alsoKnownAs: data.also_known_as || [],
    knownFor: combined.slice(0, 4).map((m: any) => m.title || m.name),
    filmography: combined.map((m: any) => ({
      id: m.id.toString(),
      title: m.title || m.name,
      type: m.media_type === 'tv' ? 'tv' : 'movie',
      role: m.character || m.job || 'Cast',
      year: (m.release_date || m.first_air_date) ? parseInt((m.release_date || m.first_air_date).split('-')[0]) : new Date().getFullYear(),
      poster: getImageWithFallback(m.poster_path, 'poster', 'w300'),
      rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : undefined
    }))
  };
}

export async function getMovieGenres(): Promise<GenreItem[]> {
  const data = await fetchFromTmdb<{ genres: GenreItem[] }>('/genre/movie/list');
  return data?.genres || [];
}

export async function getTvGenres(): Promise<GenreItem[]> {
  const data = await fetchFromTmdb<{ genres: GenreItem[] }>('/genre/tv/list');
  return data?.genres || [];
}

export async function searchTmdb(query: string): Promise<{ movies: Movie[]; series: Series[]; people: Person[] } | null> {
  if (!query.trim()) return { movies: [], series: [], people: [] };

  const data = await fetchFromTmdb<any>('/search/multi', { query });
  if (!data || !data.results) return null;

  const movies = data.results.filter((r: any) => r.media_type === 'movie').map(transformTmdbMovie);
  const series = data.results.filter((r: any) => r.media_type === 'tv').map(transformTmdbTv);
  const people = data.results.filter((r: any) => r.media_type === 'person').map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    slug: p.id.toString(),
    role: (p.known_for_department === 'Directing' ? 'Director' : 'Actor') as 'Actor' | 'Director',
    portrait: getImageWithFallback(p.profile_path, 'profile', 'h632'),
    biography: p.biography || 'Known for film & TV appearances.',
    birthDate: p.birthday,
    birthPlace: p.place_of_birth,
    knownFor: p.known_for?.map((k: any) => k.title || k.name) || [],
    filmography: []
  }));

  return { movies, series, people };
}
