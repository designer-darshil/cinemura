import React, { useState, useEffect, useCallback } from 'react';
import { getPopularPeople } from '../services/tmdb';
import { Person } from '../types';
import { PersonCard } from '../components/MediaCard';
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

export const PeoplePage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPeopleList = async (targetPage: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
      setErrorMore(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      const data = await getPopularPeople(targetPage);
      if (!data || data.length === 0) {
        if (!append) setError(true);
        setHasMore(false);
      } else {
        if (append) {
          setPeople(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = data.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setPeople(data);
        }
        setHasMore(data.length >= 10);
      }
    } catch (err) {
      console.error('Failed to load popular people', err);
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
    fetchPeopleList(1, false);
    window.scrollTo(0, 0);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPeopleList(nextPage, true);
  }, [page, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 md:px-12 mx-auto space-y-8">
      
      <SectionHeader
        label="DIRECTORY"
        title="ACTORS & DIRECTORS"
        description="Explore profiles of visionary directors, acclaimed actors, cinematographers, and creators."
      />

      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="FAILED TO LOAD PEOPLE DIRECTORY"
          message="Could not load live cast and crew directory from the database."
          onRetry={() => fetchPeopleList(1, false)}
        />
      ) : people.length === 0 ? (
        <EmptyState
          title="NO PEOPLE FOUND"
          message="No cast or crew members returned."
        />
      ) : (
        <div className="space-y-6">
          <div className="text-xs font-mono text-[#8E8E93] border-b border-white/10 pb-2">
            DISPLAYING {people.length} CREATORS & ACTORS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {people.map(person => (
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

          {/* Sentinel Element for Preloading */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchPeopleList(page, true)} />
          )}

          {!hasMore && people.length > 0 && (
            <EndOfContentState />
          )}
        </div>
      )}

    </div>
  );
};

export default PeoplePage;
