import React, { useState, useEffect, useCallback } from 'react';
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

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [searchResults, setSearchResults] = useState<{ movies: Movie[]; series: Series[]; people: Person[] } | null>(null);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const requestIdRef = React.useRef<number>(0);

  // Perform search query when q searchParam is present
  useEffect(() => {
    const currentReqId = ++requestIdRef.current;
    if (queryParam.trim()) {
      setLoading(true);
      setError(false);
      searchTmdb(queryParam.trim())
        .then(res => {
          if (currentReqId !== requestIdRef.current) return;
          setSearchResults(res);
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
      setPage(1);
      fetchDiscoveryData(1, false, currentReqId);
    }
  }, [queryParam, genreParam]);

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
      const [movies, tvShows, genreList] = await Promise.all([
        getMoviesList(genreParam !== 'All' ? genreParam : undefined, 'popularity.desc', targetPage),
        getTvList(genreParam !== 'All' ? genreParam : undefined, 'popularity.desc', targetPage),
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
      }
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || queryParam.trim()) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscoveryData(nextPage, true);
  }, [page, loadingMore, hasMore, queryParam]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore: hasMore && !queryParam.trim(),
    onLoadMore: handleLoadMore
  });

  const filteredItems = items.filter(item => {
    if (activeTab === 'movie') return item.type === 'movie';
    if (activeTab === 'tv') return item.type === 'tv';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-8">
      
      <SectionHeader
        label={queryParam ? 'SEARCH RESULTS' : 'DISCOVERY'}
        title={queryParam ? `SEARCH FOR "${queryParam.toUpperCase()}"` : 'DISCOVER TITLES'}
        description={queryParam ? 'Live catalog search results.' : 'Explore genres and curated media across the CINEMURA catalog.'}
      />

      {/* Discovery Genre Controls (When Not Searching) */}
      {!queryParam && (
        <div className="bg-[#111114] border border-white/10 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs font-mono text-[#8E8E93]">MEDIA TYPE:</span>
            <div className="flex items-center gap-2">
              {(['all', 'movie', 'tv'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 font-mono font-bold uppercase tracking-wider transition-all ${
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
                className={`text-xs px-3 py-1 font-mono font-semibold uppercase transition-all ${
                  genreParam === 'All'
                    ? 'bg-[#E43D3D] text-white'
                    : 'bg-[#0B0B0D] text-[#8E8E93] hover:text-white border border-white/10'
                }`}
              >
                ALL GENRES
              </button>
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSearchParams({ genre: g.id.toString() })}
                  className={`text-xs px-3 py-1 font-mono font-semibold uppercase transition-all ${
                    genreParam === g.id.toString()
                      ? 'bg-[#E43D3D] text-white'
                      : 'bg-[#0B0B0D] text-[#8E8E93] hover:text-white border border-white/10'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Results Display */}
      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="SEARCH ENGINE OFFLINE"
          message="Could not connect to live database catalog."
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
                    {searchResults.movies.map(movie => (
                      <MediaCard key={movie.id} item={movie} variant="poster" />
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
                    {searchResults.series.map(show => (
                      <MediaCard key={show.id} item={show} variant="poster" />
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
                    {searchResults.people.map(person => (
                      <PersonCard
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        role={person.role}
                        knownFor={person.knownFor}
                        portrait={person.portrait}
                        slug={person.slug}
                      />
                    ))}
                  </div>
                </div>
              )}
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
            {filteredItems.map(item => (
              <MediaCard key={item.id} item={item} variant="poster" />
            ))}
          </div>

          {/* Sentinel Element */}
          <div ref={sentinelRef} className="h-1 w-full" />

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
