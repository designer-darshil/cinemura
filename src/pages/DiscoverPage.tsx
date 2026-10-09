import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMoviesList, getTvList, getMovieGenres, searchTmdb, GenreItem } from '../services/tmdb';
import { MediaItem, Movie, Series, Person } from '../types';
import { MediaCard, PersonCard } from '../components/MediaCard';
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
import { DiscoveryFilters, FilterState } from '../components/DiscoveryFilters';
import { useApp } from '../context/AppContext';

export const DiscoverPage: React.FC = () => {
  const { markAppReady } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [searchResults, setSearchResults] = useState<{ movies: Movie[]; series: Series[]; people: Person[] } | null>(null);

  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'popularity.desc',
    year: 'All',
    minRating: 'All',
    voteCountGte: 'All',
    language: 'All',
    certification: 'All'
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Search pagination states
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(false);

  const requestIdRef = React.useRef<number>(0);

  // Perform search query when q searchParam is present, or discover filtering
  useEffect(() => {
    const currentReqId = ++requestIdRef.current;
    if (queryParam.trim()) {
      setLoading(true);
      setError(false);
      setSearchPage(1);
      searchTmdb(queryParam.trim(), 1)
        .then(res => {
          if (currentReqId !== requestIdRef.current) return;
          setSearchResults(res);
          setSearchHasMore((res?.totalPages || 1) > 1);
        })
        .catch(err => {
          if (currentReqId !== requestIdRef.current) return;
          console.error('Dedicated search failed', err);
          setError(true);
        })
        .finally(() => {
          if (currentReqId === requestIdRef.current) {
            setLoading(false);
          }
        });
    } else {
      setSearchResults(null);
      setSearchHasMore(false);
      setPage(1);
      fetchDiscoveryData(1, false, currentReqId);
    }
  }, [queryParam, genreParam, filterState]);

  const handleSearchLoadMore = useCallback(async () => {
    if (loading || searchLoadingMore || !searchHasMore || !queryParam.trim()) return;
    const nextPage = searchPage + 1;
    const currentReqId = requestIdRef.current;
    setSearchLoadingMore(true);
    try {
      const res = await searchTmdb(queryParam.trim(), nextPage);
      if (currentReqId !== requestIdRef.current) return;
      if (!res) {
        setSearchHasMore(false);
      } else {
        setSearchResults(prev => {
          if (!prev) return res;
          const existingMovieIds = new Set(prev.movies.map(m => m.id));
          const newMovies = res.movies.filter(m => !existingMovieIds.has(m.id));

          const existingSeriesIds = new Set(prev.series.map(s => s.id));
          const newSeries = res.series.filter(s => !existingSeriesIds.has(s.id));

          const existingPeopleIds = new Set(prev.people.map(p => p.id));
          const newPeople = res.people.filter(p => !existingPeopleIds.has(p.id));

          return {
            movies: [...prev.movies, ...newMovies],
            series: [...prev.series, ...newSeries],
            people: [...prev.people, ...newPeople],
            totalPages: res.totalPages
          };
        });
        setSearchPage(nextPage);
        setSearchHasMore(nextPage < (res.totalPages || 1));
      }
    } catch (err) {
      console.error('Dedicated search load more failed', err);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setSearchLoadingMore(false);
      }
    }
  }, [loading, searchLoadingMore, searchHasMore, queryParam, searchPage]);

  const fetchDiscoveryData = async (targetPage: number = 1, append: boolean = false, existingReqId?: number) => {
    if (queryParam.trim()) return;

    const currentReqId = existingReqId || ++requestIdRef.current;

    if (append) {
      setLoadingMore(true);
      setErrorMore(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      const movieOptions = {
        genreId: genreParam !== 'All' ? genreParam : undefined,
        sortBy: filterState.sortBy,
        year: filterState.year !== 'All' ? filterState.year : undefined,
        minRating: filterState.minRating !== 'All' ? filterState.minRating : undefined,
        voteCountGte: filterState.voteCountGte !== 'All' ? filterState.voteCountGte : undefined,
        language: filterState.language !== 'All' ? filterState.language : undefined,
        certification: filterState.certification !== 'All' ? filterState.certification : undefined,
        page: targetPage
      };

      const tvOptions = {
        genreId: genreParam !== 'All' ? genreParam : undefined,
        sortBy: filterState.sortBy,
        year: filterState.year !== 'All' ? filterState.year : undefined,
        minRating: filterState.minRating !== 'All' ? filterState.minRating : undefined,
        voteCountGte: filterState.voteCountGte !== 'All' ? filterState.voteCountGte : undefined,
        language: filterState.language !== 'All' ? filterState.language : undefined,
        page: targetPage
      };

      const [movies, tvShows, genreList] = await Promise.all([
        getMoviesList(movieOptions),
        getTvList(tvOptions),
        genres.length === 0 ? getMovieGenres() : Promise.resolve(genres)
      ]);

      if (currentReqId !== requestIdRef.current) return; // Discard stale response

      if (!movies && !tvShows) {
        if (!append) setError(true);
        setHasMore(false);
      } else {
        const combined: MediaItem[] = [
          ...(movies || []),
          ...(tvShows || [])
        ];

        if (append) {
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const uniqueNew = combined.filter(item => !existingIds.has(item.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setItems(combined);
        }

        setHasMore(combined.length >= 10);
        if (genres.length === 0 && genreList) {
          setGenres(genreList);
        }
      }
    } catch (err) {
      if (currentReqId !== requestIdRef.current) return;
      console.error('Failed to load discovery page data', err);
      if (append) {
        setErrorMore(true);
      } else {
        setError(true);
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        markAppReady();
      }
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || queryParam.trim()) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscoveryData(nextPage, true);
  }, [page, loading, loadingMore, hasMore, queryParam]);

  // Last non-empty section in search mode to host the second-last row trigger
  const lastSearchSection = useMemo(() => {
    if (!searchResults) return null;
    if (searchResults.people.length > 0) return { type: 'people' as const, count: searchResults.people.length };
    if (searchResults.series.length > 0) return { type: 'series' as const, count: searchResults.series.length };
    if (searchResults.movies.length > 0) return { type: 'movies' as const, count: searchResults.movies.length };
    return null;
  }, [searchResults]);

  const { triggerIndex: searchTriggerIndex, triggerRef: searchTriggerRef } = useInfiniteScroll({
    totalItems: lastSearchSection?.count || 0,
    loading: loading || searchLoadingMore,
    hasMore: searchHasMore && Boolean(queryParam.trim()),
    onLoadMore: handleSearchLoadMore,
    resetDeps: [queryParam]
  });

  const { triggerIndex: discoverTriggerIndex, triggerRef: discoverTriggerRef } = useInfiniteScroll({
    totalItems: items.length,
    loading: loading || loadingMore,
    hasMore: hasMore && !queryParam.trim(),
    onLoadMore: handleLoadMore,
    resetDeps: [queryParam, genreParam, activeTab, filterState]
  });

  const filteredItems = items.filter(item => {
    if (activeTab === 'movie') return item.type === 'movie';
    if (activeTab === 'tv') return item.type === 'tv';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-8">
      
      <SectionHeader
        title={queryParam ? `SEARCH FOR "${queryParam.toUpperCase()}"` : 'DISCOVER'}
      />

      {/* Discovery Genre Controls (When Not Searching) */}
      {!queryParam && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs font-mono text-[#8E8E93]">MEDIA TYPE:</span>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'movie', 'tv'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 flex items-center font-mono font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-[#E43D3D] text-white' : 'text-[#8E8E93] hover:text-white border border-white/10'
                  }`}
                >
                  {tab === 'tv' ? 'TV SHOWS' : tab === 'movie' ? 'MOVIES' : 'ALL MEDIA'}
                </button>
              ))}
            </div>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setSearchParams({})}
                className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all ${
                  genreParam === 'All'
                    ? 'bg-[#E43D3D] text-white'
                    : 'bg-[#111114] text-[#8E8E93] hover:text-white border border-white/10'
                }`}
              >
                ALL GENRES
              </button>
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSearchParams({ genre: g.id.toString() })}
                  className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all ${
                    genreParam === g.id.toString()
                      ? 'bg-[#E43D3D] text-white'
                      : 'bg-[#111114] text-[#8E8E93] hover:text-white border border-white/10'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Real TMDb Discovery Filters */}
          <DiscoveryFilters
            filters={filterState}
            onChange={(updated) => setFilterState(prev => ({ ...prev, ...updated }))}
            onReset={() =>
              setFilterState({
                sortBy: 'popularity.desc',
                year: 'All',
                minRating: 'All',
                voteCountGte: 'All',
                language: 'All',
                certification: 'All'
              })
            }
          />
        </div>
      )}

      {/* Content Results Display */}
      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="SEARCH UNAVAILABLE"
          message="Could not connect to the database catalog."
          onRetry={() => queryParam ? searchTmdb(queryParam) : fetchDiscoveryData(1, false)}
        />
      ) : searchResults ? (
        /* Dedicated Search Results View */
        <div className="space-y-12">
          {searchResults.movies.length === 0 && searchResults.series.length === 0 && searchResults.people.length === 0 ? (
            <EmptyState
              variant="search"
              onAction={() => setSearchParams({})}
            />
          ) : (
            <>
              {searchResults.movies.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-2 text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    MOVIES ({searchResults.movies.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {searchResults.movies.map((movie, index) => (
                      <MediaCard
                        key={movie.id}
                        item={movie}
                        variant="poster"
                        ref={lastSearchSection?.type === 'movies' && index === searchTriggerIndex ? searchTriggerRef : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.series.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-2 text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    TV SHOWS ({searchResults.series.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {searchResults.series.map((show, index) => (
                      <MediaCard
                        key={show.id}
                        item={show}
                        variant="poster"
                        ref={lastSearchSection?.type === 'series' && index === searchTriggerIndex ? searchTriggerRef : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.people.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-2 text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    PEOPLE ({searchResults.people.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {searchResults.people.map((person, index) => (
                      <PersonCard
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        role={person.role}
                        knownFor={person.knownFor}
                        portrait={person.portrait}
                        slug={person.slug}
                        ref={lastSearchSection?.type === 'people' && index === searchTriggerIndex ? searchTriggerRef : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchLoadingMore && <InfiniteLoadingSkeleton count={6} />}
              {!searchHasMore && lastSearchSection && <EndOfContentState />}
            </>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          variant="genre"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <div className="space-y-6">
          <div className="text-xs font-mono text-[#8E8E93] border-b border-white/10 pb-2">
            DISPLAYING {filteredItems.length} TITLES
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredItems.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                variant="poster"
                ref={index === discoverTriggerIndex ? discoverTriggerRef : undefined}
              />
            ))}
          </div>

          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchDiscoveryData(page, true)} />
          )}

          {!hasMore && items.length > 0 && (
            <EndOfContentState />
          )}
        </div>
      )}

    </div>
  );
};

export default DiscoverPage;
