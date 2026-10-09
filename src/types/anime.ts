export interface AnimeItem {
  id: string;
  title: string;
  alternativeTitles?: string[];
  synopsis?: string;
  rank?: number;
  genres?: string[];
  episodes?: number;
  image?: string;
  thumb?: string;
  type?: string;
  status?: string;
  link?: string;
}

export interface AnimeMeta {
  page: number;
  size: number;
  totalData?: number;
  totalPage?: number;
}

export interface AnimeResponse {
  data: AnimeItem[];
  meta?: AnimeMeta;
}

export interface AnimeFilterOptions {
  page?: number;
  size?: number;
  search?: string;
  genres?: string;
  sortBy?: 'ranking' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export type AnimeApiErrorCode =
  | 'MISSING_KEY'
  | 'SERVER_ERROR'
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface AnimeApiError {
  code: AnimeApiErrorCode;
  message: string;
  status?: number;
}
