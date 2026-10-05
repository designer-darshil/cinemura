import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMoviesList, getTvList, getMovieGenres, GenreItem } from '../services/tmdb';
import { MediaItem } from '../types';
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

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre') || 'All';
  const queryParam = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');

  const [items, setItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiscoveryData = async (targetPage: number = 1, append: boolean = false) => {
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
      console.error('Failed to load discovery page data', err);
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
    fetchDiscoveryData(1, false);
  }, [genreParam]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscoveryData(nextPage, true);
  }, [page, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore
  });

  const filteredItems = items.filter(item => {
    if (queryParam && !item.title.toLowerCase().includes(queryParam.toLowerCase())) {
      return false;
    }
    if (activeTab === 'movie') return item.type === 'movie';
    if (activeTab === 'tv') return item.type === 'tv';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 max-w-site mx-auto space-y-8">
      
      <SectionHeader
        label="DISCOVERY"
        title="DISCOVER TITLES"
        description="Explore curated genres, live categories, and award-winning titles across the CINEMURA catalog."
      />

      {/* Selector Control Bar */}
      <div className="bg-[#111114] border border-white/10 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="type-label text-[#929298]">MEDIA TYPE:</span>
          <div className="flex items-center gap-2">
            {(['all', 'movie', 'tv'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-3 py-1 font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-[#E43D3D] text-white' : 'text-[#929298] hover:text-white border border-white/10'
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
              className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                genreParam === 'All'
                  ? 'bg-[#E43D3D] text-white'
                  : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
              }`}
            >
              ALL GENRES
            </button>
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => setSearchParams({ genre: g.id.toString() })}
                className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                  genreParam === g.id.toString()
                    ? 'bg-[#E43D3D] text-white'
                    : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Results */}
      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="DISCOVERY ENGINE OFFLINE"
          message="Could not connect to live media discovery catalog database."
          onRetry={() => fetchDiscoveryData(1, false)}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          variant={queryParam ? 'search' : 'genre'}
          onAction={() => setSearchParams({})}
        />
      ) : (
        <div className="space-y-6">
          <div className="type-label text-[#929298] border-b border-white/10 pb-2">
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
