export type ContentType = 'movie' | 'tv';

export interface CastMember {
  id: string;
  name: string;
  role: string;
  character?: string;
  image: string;
  slug: string;
}

export interface CrewMember {
  id: string;
  name: string;
  job: string;
  image: string;
  slug: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo?: string;
  country?: string;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official?: boolean;
  publishedAt?: string;
  language?: string;
  size?: number;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  runtime: string;
  airDate: string;
  stillImage: string;
  synopsis: string;
  rating: number;
  voteCount?: number;
  guestStars?: string[];
  crew?: string[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodeCount: number;
  year: number;
  episodes: Episode[];
  poster?: string;
  overview?: string;
}

export interface MovieCollection {
  id: number;
  name: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  parts?: Movie[];
}

export interface WatchProviderItem {
  providerId: number;
  providerName: string;
  logo: string;
  displayPriority: number;
}

export interface RegionWatchProviders {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
}

export interface WatchProvidersData {
  results: Record<string, RegionWatchProviders>;
}

export interface Movie {
  id: string;
  type: 'movie';
  title: string;
  originalTitle?: string;
  slug: string;
  tagline?: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  year: number;
  runtime: string;
  genres: string[];
  rating: number;
  voteCount: number;
  popularity?: number;
  certification?: string;
  synopsis: string;
  language: string;
  spokenLanguages?: string[];
  status?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdbId?: string;
  director: string;
  writers: string[];
  cast: CastMember[];
  crew?: CrewMember[];
  productionCompanies?: ProductionCompany[];
  productionCountries?: string[];
  keywords?: string[];
  collection?: MovieCollection;
  videos?: VideoItem[];
  images?: string[];
  backdrops?: string[];
  posters?: string[];
  recommendations?: Movie[];
  similar?: Movie[];
  watchProviders?: RegionWatchProviders;
  trailerUrl?: string;
  primaryVideo?: VideoItem;
  featured?: boolean;
  trendingRank?: number;
}

export interface Series {
  id: string;
  type: 'tv';
  title: string;
  originalName?: string;
  slug: string;
  tagline?: string;
  poster: string;
  backdrop: string;
  firstAirDate: string;
  lastAirDate?: string;
  year: number;
  showType?: string;
  episodeRuntime?: string;
  seasonsCount: number;
  totalEpisodes: number;
  genres: string[];
  rating: number;
  voteCount: number;
  popularity?: number;
  certification?: string;
  synopsis: string;
  language: string;
  spokenLanguages?: string[];
  status?: string;
  homepage?: string;
  imdbId?: string;
  network?: string;
  networks?: ProductionCompany[];
  creators: string[];
  creatorDetails?: { id: string; name: string; portrait: string; slug: string }[];
  cast: CastMember[];
  crew?: CrewMember[];
  productionCompanies?: ProductionCompany[];
  productionCountries?: string[];
  keywords?: string[];
  videos?: VideoItem[];
  images?: string[];
  backdrops?: string[];
  posters?: string[];
  recommendations?: Series[];
  similar?: Series[];
  watchProviders?: RegionWatchProviders;
  seasons: Season[];
  trailerUrl?: string;
  primaryVideo?: VideoItem;
  featured?: boolean;
  trendingRank?: number;
}

export type MediaItem = Movie | Series;

export interface Person {
  id: string;
  name: string;
  slug: string;
  role: 'Actor' | 'Director' | 'Writer' | 'Producer' | 'Creator';
  portrait: string;
  biography: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  popularity?: number;
  imdbId?: string;
  alsoKnownAs?: string[];
  knownFor: string[];
  filmography: {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    role: string;
    year: number;
    poster: string;
    rating?: number;
  }[];
}

export interface Genre {
  id: string;
  name: string;
  count: number;
  image: string;
  description: string;
}

export interface AwardItem {
  id: string;
  category: string;
  year: number | string;
  status: 'Winner' | 'Nominee';
  recipients?: string[];
  relatedTitle?: string;
}

export interface AwardOrganization {
  id: string;
  name: string;
  awards: AwardItem[];
}

export interface EntityAwardsData {
  wins: number;
  nominations: number;
  organizations: AwardOrganization[];
}

