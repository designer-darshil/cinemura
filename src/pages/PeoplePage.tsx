import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPopularPeople } from '../services/tmdb';
import { Person } from '../types';
import { PersonCard } from '../components/MediaCard';
import {
  CardGridSkeleton,
  ErrorState,
  EmptyState,
  InfiniteLoadingSkeleton,
  InfiniteErrorState,
  EndOfContentState
} from '../components/StateViews';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useApp } from '../context/AppContext';
import { Seo } from '../seo/Seo';

export const PeoplePage: React.FC = () => {
  const { markAppReady } = useApp();
  const [people, setPeople] = useState<Person[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMore, setErrorMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const requestIdRef = useRef<number>(0);

  // Fetch paginated real TMDb popular people
  const fetchPeopleList = useCallback(
    async (targetPage: number = 1, append: boolean = false) => {
      const currentReqId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
        setErrorMore(false);
      } else {
        setLoading(true);
        setError(false);
      }

      try {
        const data = await getPopularPeople(targetPage);

        if (currentReqId !== requestIdRef.current) return;

        if (!data || data.length === 0) {
          if (!append) {
            setPeople([]);
          }
          setHasMore(false);
        } else {
          if (append) {
            setPeople((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const uniqueNew = data.filter((p) => !existingIds.has(p.id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setPeople(data);
          }
          // Real TMDB pagination continues until empty or page 500 cap
          setHasMore(data.length >= 10 && targetPage < 500);
        }
      } catch (err) {
        if (currentReqId !== requestIdRef.current) return;
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
    },
    []
  );

  // Initial load
  useEffect(() => {
    setPage(1);
    fetchPeopleList(1, false);
  }, [fetchPeopleList]);

  // Infinite scroll trigger
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPeopleList(nextPage, true);
  }, [page, loading, loadingMore, hasMore, fetchPeopleList]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '600px 0px'
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Cast & Directors Directory"
        description="Explore popular actors, directors, screenwriters, and creators from the global TMDB database."
      />
      {/* 1. EDITORIAL HEADER */}
      <header className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
            PEOPLE
          </h1>

          {!loading && people.length > 0 && (
            <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
              PAGE {page} • {people.length} PROFILES
            </span>
          )}
        </div>
      </header>

      {/* 2. INITIAL LOADING SKELETON */}
      {loading && <CardGridSkeleton count={18} variant="poster" />}

      {/* 3. ERROR STATE */}
      {!loading && error && (
        <ErrorState
          title="FAILED TO LOAD PEOPLE"
          message="Could not connect to the live TMDB database for people."
          onRetry={() => fetchPeopleList(1, false)}
        />
      )}

      {/* 4. EMPTY STATE */}
      {!loading && !error && people.length === 0 && (
        <EmptyState
          title="NO PEOPLE FOUND"
          message="No actors or creators are currently listed in the directory."
        />
      )}

      {/* 5. FULL RESULT LIST (DENSE 6-COLUMN GRID) */}
      {!loading && !error && people.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                role={person.role}
                knownFor={person.knownFor}
                portrait={person.portrait}
                slug={person.slug || person.id}
              />
            ))}
          </div>

          {/* Next Page Skeleton Loading */}
          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {/* Next Page Error State with Retry Button */}
          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchPeopleList(page + 1, true)} />
          )}

          {/* End of content indicator */}
          {!hasMore && people.length > 0 && <EndOfContentState />}

          {/* Intersection Observer Sentinel for continuous prefetching */}
          <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default PeoplePage;
