import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem, AnimeApiError } from '../types/anime';
import { searchAnime } from '../services/animeDb';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { SectionHeader } from '../components/SectionHeader';

export const AnimeSearchPage: React.FC = () => {
  const { markAppReady } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<AnimeApiError | null>(null);

  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markAppReady();
    inputRef.current?.focus();
  }, [markAppReady]);

  // Perform search when query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasMore(false);
      setLoading(false);
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ q: trimmed }, { replace: true });
    setLoading(true);
    setApiError(null);
    setPage(1);

    const reqId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const res = await searchAnime(trimmed, 1, 18);
        if (reqId !== requestIdRef.current) return;
        setResults(res.data);
        setHasMore(res.data.length >= 18);
      } catch (err: any) {
        if (reqId !== requestIdRef.current) return;
        console.error('Anime search failed:', err);
        setApiError(err as AnimeApiError);
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Load next search page
  const handleLoadMore = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await searchAnime(trimmed, nextPage, 18);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setResults((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = res.data.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data.length >= 18);
      }
    } catch (err: any) {
      console.error('Failed to load more anime search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Top Header */}
      <header className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 border-b border-white/10 bg-[#111114]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/anime"
              className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>BACK TO ANIME DIRECTORY</span>
            </Link>

            <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
              ANIME SEARCH
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-white leading-none">
              SEARCH ANIME
            </h1>
            <p className="text-xs sm:text-sm font-sans text-[#8E8E93]">
              Query titles across the RapidAPI Anime DB database.
            </p>
          </div>

          {/* Search Input Field */}
          <div className="relative max-w-2xl">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type an anime title (e.g. Naruto, Attack on Titan, One Piece)..."
              className="w-full bg-black/80 border-2 border-white/20 focus:border-[#E43D3D] text-[#F2F0EC] text-sm sm:text-base font-sans pl-11 pr-10 py-3 outline-none min-h-[48px]"
            />
            <Search className="w-5 h-5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear query"
                className="w-10 h-10 flex items-center justify-center text-[#8E8E93] hover:text-white absolute right-1 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-8 sm:mt-12 space-y-8">
        {/* API Error state (clean fallback, no config forms or keys) */}
        {apiError && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-2.5 h-2.5 bg-[#E43D3D] mx-auto" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              ANIME DATA UNAVAILABLE
            </h3>
            <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
              {apiError.message || 'Unable to complete search at this time.'}
            </p>
            <button
              type="button"
              onClick={() => {
                const trimmed = query.trim();
                if (trimmed) {
                  setLoading(true);
                  setApiError(null);
                  searchAnime(trimmed, 1, 18)
                    .then((r) => setResults(r.data))
                    .catch((err) => setApiError(err))
                    .finally(() => setLoading(false));
                }
              }}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase inline-flex items-center gap-2"
            >
              <span>RETRY SEARCH</span>
            </button>
          </div>
        )}

        {/* Section Header */}
        {!apiError && query.trim() && (
          <SectionHeader
            label="SEARCH RESULTS"
            title={`RESULTS FOR "${query.toUpperCase()}"`}
            description={
              loading
                ? 'Searching anime catalog...'
                : `Found ${results.length} titles matching your keyword.`
            }
          />
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !apiError && query.trim() && results.length === 0 && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-3">
            <h3 className="font-display font-bold text-lg text-white uppercase">NO RESULTS FOUND</h3>
            <p className="text-xs font-sans text-[#8E8E93]">
              No anime titles matched your search query "{query}". Try checking your spelling or searching for another title.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !apiError && results.length > 0 && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {results.map((item) => (
                <AnimeCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-primary min-h-[44px] px-8 text-xs font-mono font-bold tracking-widest uppercase"
                >
                  <span>{loadingMore ? 'SEARCHING NEXT PAGE...' : 'LOAD MORE RESULTS'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimeSearchPage;
