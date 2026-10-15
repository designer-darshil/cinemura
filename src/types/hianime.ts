export interface HianimeEpisodesCount {
  sub?: number | null;
  dub?: number | null;
  eps?: number | null;
}

export interface HianimeCardItem {
  id: string; // e.g. "one-piece-12"
  title: string;
  alternativeTitle?: string | null;
  poster: string;
  type?: string;
  duration?: string;
  episodes?: HianimeEpisodesCount;
  rank?: number;
}

export interface HianimeSpotlightItem {
  id: string;
  title: string;
  alternativeTitle?: string | null;
  poster: string;
  rank: number;
  type?: string;
  quality?: string;
  duration?: string;
  aired?: string;
  synopsis?: string;
  episodes?: HianimeEpisodesCount;
}

export interface HianimeTrendingItem {
  id: string;
  title: string;
  alternativeTitle?: string | null;
  poster: string;
  rank: number;
}

export interface HianimeHomeData {
  spotlight: HianimeSpotlightItem[];
  trending: HianimeTrendingItem[];
  topAiring: HianimeCardItem[];
  mostPopular: HianimeCardItem[];
  mostFavorite: HianimeCardItem[];
  latestCompleted: HianimeCardItem[];
  topUpcoming: HianimeCardItem[];
  genres: string[];
}

export interface HianimePageInfo {
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface HianimeListResponse {
  pageInfo: HianimePageInfo;
  response: HianimeCardItem[];
}

export interface HianimeSuggestionItem {
  id: string;
  title: string;
  alternativeTitle?: string | null;
  poster: string;
  aired?: string;
  type?: string;
  duration?: string;
}

export interface HianimeEpisode {
  id: string; // episode id or number string e.g. "1"
  title: string;
  alternativeTitle?: string;
  episodeNumber: number;
  isFiller: boolean;
  sub: boolean;
  dub: boolean;
  embedId?: string;
}

export interface HianimeServerItem {
  serverId: number;
  serverName: string;
  iframe?: string;
}

export interface HianimeServersResponse {
  episodeId: string;
  episodeNo: number;
  sub?: HianimeServerItem[];
  dub?: HianimeServerItem[];
  raw?: HianimeServerItem[];
  servers?: Array<{ serverName: string; iframe: string }>;
}
