import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchHianime, getHianimeSuggestions } from '../services/hianime';
import { HianimeSuggestionItem } from '../types/hianime';
import { adaptHianimeCard, UnifiedAnimeCardItem } from '../services/animeBridge';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { SectionHeader } from '../components/SectionHeader';

export const AnimeSearchPage: React.FC = () => {
  const { markAppReady } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UnifiedAnimeCardItem[]>([]);
  const [suggestions, setSuggestions] = useState<HianimeSuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAppReady();
    inputRef.current?.focus();
  }, [markAppReady]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      getHianimeSuggestions(trimmed)
        .then((sList) => {
          setSuggestions(sList || []);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [query]);

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
        const res = await searchHianime(trimmed, 1);
        if (reqId !== requestIdRef.current) return;
        const adapted = (res.response || []).map(adaptHianimeCard);
        setResults(adapted);
        setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : adapted.length >= 18);
      } catch (err: any) {
        if (reqId !== requestIdRef.current) return;
        console.error('Anime search failed:', err);
        setApiError(err?.message || 'Unable to complete search at this time.');
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
      const res = await searchHianime(trimmed, nextPage);
      const rawList = res.response || [];
      if (rawList.length === 0) {
        setHasMore(false);
      } else {
        const adapted = rawList.map(adaptHianimeCard);
        setResults((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = adapted.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : rawList.length >= 18);
      }
    } catch (err: any) {
      console.error('Failed to load more anime search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSelectSuggestion = (sug: HianimeSuggestionItem) => {
    setQuery(sug.title);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Top Header */}
      <header className="pt-8 sm:pt-12 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 border-b border-white/10 bg-[#111114]">
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
              HIANIME SEARCH PROVIDER
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-white leading-none">
              SEARCH ANIME
            </h1>
            <p className="text-xs sm:text-sm font-sans text-[#8E8E93]">
              Discover anime series, movies, and specials with live search suggestions.
            </p>
          </div>

          {/* Search Input Container with Live Suggestions */}
          <div ref={searchContainerRef} className="relative max-w-2xl">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Type an anime title (e.g. Naruto, Bleach, One Piece, Attack on Titan)..."
              className="w-full bg-black/80 border-2 border-white/20 focus:border-[#E43D3D] text-[#F2F0EC] text-sm sm:text-base font-sans pl-11 pr-10 py-3 outline-none min-h-[48px]"
            />
            <Search className="w-5 h-5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                aria-label="Clear query"
                className="w-10 h-10 flex items-center justify-center text-[#8E8E93] hover:text-white absolute right-1 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#111114] border border-white/20 shadow-2xl z-50 divide-y divide-white/10 max-h-80 overflow-y-auto">
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left p-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-11 flex-shrink-0 bg-[#17171B] overflow-hidden border border-white/10">
                      {sug.poster ? (
                        <img src={sug.poster} alt={sug.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-[#8E8E93]">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-xs sm:text-sm font-display font-semibold text-white group-hover:text-[#E43D3D] transition-colors truncate">
                        {sug.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#8E8E93] flex items-center gap-2">
                        {sug.type && <span className="uppercase">{sug.type}</span>}
                        {sug.aired && <span>• {sug.aired}</span>}
                        {sug.duration && <span>• {sug.duration}</span>}
                      </div>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-[#E43D3D] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-8 sm:mt-12 space-y-8">
        {/* API Error state */}
        {apiError && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-2.5 h-2.5 bg-[#E43D3D] mx-auto" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              SEARCH SERVICE UNAVAILABLE
            </h3>
            <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
              {apiError}
            </p>
            <button
              type="button"
              onClick={() => {
                const trimmed = query.trim();
                if (trimmed) {
                  setLoading(true);
                  setApiError(null);
                  searchHianime(trimmed, 1)
                    .then((r) => setResults((r.response || []).map(adaptHianimeCard)))
                    .catch((err) => setApiError(err?.message || 'Error occurred.'))
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
                ? 'Searching Hianime catalog...'
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
              {results.map((item, index) => (
                <AnimeCard key={`${item.id}-${index}`} item={item} />
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
