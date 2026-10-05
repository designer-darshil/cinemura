import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Grid, List as ListIcon, RotateCcw } from 'lucide-react';
import { getTvList, getTvGenres, GenreItem } from '../services/tmdb';
import { Series } from '../types';
import { MediaCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  CardGridSkeleton,
  ErrorState,
  EmptyState,
  InfiniteLoadingSkeleton,
  InfiniteErrorState,
  EndOfContentState
} from '../components/StateViews';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const SeriesPage: React.FC = () => {
  const { id: genreIdParam } = useParams<{ id?: string }>();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(genreIdParam || 'All');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (genreIdParam) {
      setSelectedGenre(genreIdParam);
    }
  }, [genreIdParam]);

  const fetchSeries = async (targetPage: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
      setErrorMore(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      const [tvData, genreData] = await Promise.all([
        getTvList(selectedGenre !== 'All' ? selectedGenre : undefined, sortBy, targetPage),
        genres.length === 0 ? getTvGenres() : Promise.resolve(genres)
      ]);

      if (!tvData || tvData.length === 0) {
        if (!append) setError(true);
        setHasMore(false);
      } else {
        if (append) {
          setSeriesList(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = tvData.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setSeriesList(tvData);
        }
        setHasMore(tvData.length >= 10);
        if (genres.length === 0 && genreData) {
          setGenres(genreData);
        }
      }
    } catch (err) {
      console.error('Failed to load TV series', err);
      if (append) {
        setErrorMore(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchSeries(1, false);
  }, [selectedGenre, sortBy]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSeries(nextPage, true);
  }, [page, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore
  });

  const filteredSeries = seriesList.filter(series =>
    series.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSortBy('popularity.desc');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 max-w-site mx-auto space-y-8">
      
      <SectionHeader
        label="CATALOG"
        title="TV SHOWS"
        description="Real-time paginated archive of television series, multi-season broadcasts, and prestige epics."
      />

      <div className="bg-[#111114] border border-white/10 p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E43D3D]" />
            <input
              type="text"
              placeholder="Filter TV shows by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0B0D] border border-white/15 focus:border-[#E43D3D] text-xs text-white pl-9 pr-4 py-2 outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="type-label text-[#929298]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0B0B0D] border border-white/15 text-white text-xs px-3 py-1.5 outline-none focus:border-[#E43D3D] font-mono"
              >
                <option value="popularity.desc">MOST POPULAR</option>
                <option value="vote_average.desc">HIGHEST RATED</option>
                <option value="first_air_date.desc">NEWEST AIR DATE</option>
                <option value="name.asc">TITLE A-Z</option>
              </select>
            </div>

            <div className="flex items-center gap-1 border border-white/15 p-1 bg-[#0B0B0D]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 transition-colors ${viewMode === 'grid' ? 'bg-[#E43D3D] text-white' : 'text-[#929298] hover:text-white'}`}
                aria-label="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 transition-colors ${viewMode === 'list' ? 'bg-[#E43D3D] text-white' : 'text-[#929298] hover:text-white'}`}
                aria-label="List view"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="type-label text-[#929298] mr-2">GENRE:</span>
              <button
                onClick={() => setSelectedGenre('All')}
                className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                  selectedGenre === 'All'
                    ? 'bg-[#E43D3D] text-white'
                    : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
                }`}
              >
                ALL
              </button>
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id.toString())}
                  className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                    selectedGenre === genre.id.toString()
                      ? 'bg-[#E43D3D] text-white'
                      : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <button
              onClick={resetFilters}
              className="btn-link text-[#929298] hover:text-[#E43D3D] text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="UNABLE TO LOAD TV SHOWS"
          message="Could not connect to live television catalog database."
          onRetry={() => fetchSeries(1, false)}
        />
      ) : filteredSeries.length === 0 ? (
        <EmptyState
          variant={searchTerm ? 'search' : 'genre'}
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="type-label text-[#929298] border-b border-white/10 pb-2">
            DISPLAYING {filteredSeries.length} TV SHOWS
          </div>

          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }>
            {filteredSeries.map(series => (
              <MediaCard key={series.id} item={series} variant={viewMode === 'grid' ? 'poster' : 'horizontal'} />
            ))}
          </div>

          {/* Sentinel Element for Preloading */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchSeries(page, true)} />
          )}

          {!hasMore && seriesList.length > 0 && (
            <EndOfContentState />
          )}
        </div>
      )}

    </div>
  );
};
