import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { getPopularPeople, getTrendingPeople } from '../services/tmdb';
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

/* ==================================================
   PEOPLE HORIZONTAL FEATURE RAIL COMPONENT
   Uses the exact standard PersonCard component
   ================================================== */
interface PersonRailProps {
  people: Person[];
}

const PersonRail: React.FC<PersonRailProps> = ({ people }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (!people || people.length === 0) return null;

  return (
    <div className="relative group/rail">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity hover:bg-[#E43D3D] hover:border-[#E43D3D]"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Rail Items Container */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {people.map((person) => (
          <div
            key={person.id}
            className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]"
          >
            <PersonCard
              id={person.id}
              name={person.name}
              role={person.role}
              knownFor={person.knownFor}
              portrait={person.portrait}
              slug={person.slug || person.id}
            />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity hover:bg-[#E43D3D] hover:border-[#E43D3D]"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

/* ==================================================
   PEOPLE INDEX PAGE COMPONENT
   Curated Cast & Creator Discovery Architecture
   ================================================== */
export const PeoplePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialRole = searchParams.get('role') || 'All';
  const initialSort = searchParams.get('sort') || 'popularity.desc';
  const initialSearch = searchParams.get('q') || '';

  const [featuredPeople, setFeaturedPeople] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  // Discovery Controls state
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Pagination & Loading
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMore, setErrorMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const requestIdRef = useRef<number>(0);

  // Load trending/featured people on mount
  useEffect(() => {
    let mounted = true;
    getTrendingPeople('day')
      .then((data) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setFeaturedPeople(data);
        }
      })
      .catch((err) => console.error('Error fetching trending people:', err));

    return () => {
      mounted = false;
    };
  }, []);

  // Sync state to URL searchParams
  const updateUrlParams = (role: string, sort: string, q: string) => {
    const params = new URLSearchParams();
    if (role !== 'All') params.set('role', role);
    if (sort !== 'popularity.desc') params.set('sort', sort);
    if (q.trim()) params.set('q', q.trim());
    setSearchParams(params, { replace: true });
  };

  // Fetch paginated people list
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
          // Real pagination continuing until page 500 cap
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
        }
      }
    },
    []
  );

  // Fetch initial page
  useEffect(() => {
    setPage(1);
    fetchPeopleList(1, false);
    updateUrlParams(selectedRole, sortBy, searchQuery);
  }, [fetchPeopleList]);

  // Update URL whenever controls change
  useEffect(() => {
    updateUrlParams(selectedRole, sortBy, searchQuery);
  }, [selectedRole, sortBy, searchQuery]);

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

  // Client-side filtering & sorting for smooth instant response
  const displayedPeople = useMemo(() => {
    let list = [...people];

    // Filter by role/profession
    if (selectedRole !== 'All') {
      list = list.filter((p) => p.role?.toLowerCase() === selectedRole.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.knownFor.some((k) => k.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'name.asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [people, selectedRole, sortBy, searchQuery]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedRole('All');
    setSortBy('popularity.desc');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedRole !== 'All' || sortBy !== 'popularity.desc' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12">
      
      {/* ==================================================
          1. EDITORIAL HEADER
         ================================================== */}
      <header className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
              INDUSTRY DIRECTORY
            </span>
            {selectedRole !== 'All' && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-2 py-0.5">
                {selectedRole.toUpperCase()}S
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-[#8E8E93] tracking-widest uppercase">
            CAST & CREATORS ROSTER
          </span>
        </div>

        <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
          PEOPLE
        </h1>
      </header>

      {/* ==================================================
          2. DISCOVERY / SORT CONTROLS BAR
         ================================================== */}
      <section className="bg-[#111114] border border-white/10 p-3 sm:p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E43D3D]" />
            <span className="uppercase font-bold tracking-wider text-white">DIRECTORY FILTERS</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET FILTERS</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Quick Search Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">NAME SEARCH</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Filter artists by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0B0D] border border-white/15 focus:border-[#E43D3D] text-xs text-white pl-8 pr-3 py-1.5 outline-none font-mono placeholder:text-[#626269]"
              />
            </div>
          </div>

          {/* Profession / Role */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">PROFESSION</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                selectedRole !== 'All'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              <option value="All">ALL PROFESSIONALS</option>
              <option value="Actor">ACTORS & PERFORMERS</option>
              <option value="Director">DIRECTORS & CREATORS</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">SORT ORDER</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                sortBy !== 'popularity.desc'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              <option value="popularity.desc">MOST POPULAR</option>
              <option value="name.asc">NAME A–Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. FEATURED PEOPLE (HORIZONTAL FEATURE RAIL)
         ================================================== */}
      {featuredPeople.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            label="HIGHLIGHTED"
            title="FEATURED ARTISTS"
          />
          <PersonRail people={featuredPeople} />
        </section>
      )}

      {/* ==================================================
          4. ALL PEOPLE (EXACTLY 6 CARDS PER ROW ON DESKTOP)
         ================================================== */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex items-baseline justify-between">
          <SectionHeader
            label="DIRECTORY"
            title={selectedRole !== 'All' ? `${selectedRole.toUpperCase()}S` : 'ALL PEOPLE'}
          />

          {!loading && displayedPeople.length > 0 && (
            <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
              PAGE {page} • {displayedPeople.length} PROFILES
            </span>
          )}
        </div>

        {/* Initial Loading Skeleton */}
        {loading && (
          <CardGridSkeleton count={18} variant="poster" />
        )}

        {/* Initial Error State */}
        {!loading && error && (
          <ErrorState
            title="FAILED TO LOAD DIRECTORY"
            message="Could not connect to the real-time cast & crew database. Please retry."
            onRetry={() => fetchPeopleList(1, false)}
          />
        )}

        {/* Empty State */}
        {!loading && !error && displayedPeople.length === 0 && (
          <EmptyState
            title="NO PEOPLE FOUND"
            message="No cast or creators match the search query or selected profession."
            actionText="RESET FILTERS"
            onAction={handleResetFilters}
          />
        )}

        {/* Dense Responsive Grid (2 Mobile, 4 Tablet, 6 Desktop) */}
        {!loading && !error && displayedPeople.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {displayedPeople.map((person) => (
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
            {loadingMore && (
              <InfiniteLoadingSkeleton count={6} />
            )}

            {/* Next Page Error State with Retry Button */}
            {errorMore && (
              <InfiniteErrorState onRetry={() => fetchPeopleList(page + 1, true)} />
            )}

            {/* End of content indicator */}
            {!hasMore && displayedPeople.length > 0 && (
              <EndOfContentState />
            )}

            {/* Intersection Observer Sentinel for continuous prefetching */}
            <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
          </>
        )}
      </section>

    </div>
  );
};

export default PeoplePage;
