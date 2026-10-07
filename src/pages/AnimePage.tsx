import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem, AnimeApiError } from '../types/anime';
import { getAnimeList, getAnimeRankings, getAnimeGenres } from '../services/animeDb';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { SectionHeader } from '../components/SectionHeader';

export const AnimePage: React.FC = () => {
  const { markAppReady } = useApp();
  const navigate = useNavigate();

  const [animeItems, setAnimeItems] = useState<AnimeItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [apiError, setApiError] = useState<AnimeApiError | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data: genres and top ranked/popular anime
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      // 1. Fetch genres in parallel
      getAnimeGenres()
        .then((gList) => {
          if (Array.isArray(gList)) setGenres(gList);
        })
        .catch(() => {});

      // 2. Fetch anime list (by rank or default)
      const res = await getAnimeRankings(1, 18);
      setAnimeItems(res.data);
      setPage(1);
      setHasMore(res.data.length >= 18);
    } catch (err: any) {
      console.error('Failed to load anime from Anime DB:', err);
      setApiError(err as AnimeApiError);
    } finally {
      setLoading(false);
      markAppReady();
    }
  }, [markAppReady]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadInitialData();
  }, [loadInitialData]);

  // Handle genre filter selection
  const handleSelectGenre = async (genre: string) => {
    setSelectedGenre(genre);
    setLoading(true);
    setApiError(null);

    try {
      if (genre === 'All') {
        const res = await getAnimeRankings(1, 18);
        setAnimeItems(res.data);
      } else {
        const res = await getAnimeList({
          genres: genre,
          sortBy: 'ranking',
          sortOrder: 'asc',
          page: 1,
          size: 18
        });
        setAnimeItems(res.data);
      }
      setPage(1);
    } catch (err: any) {
      setApiError(err as AnimeApiError);
    } finally {
      setLoading(false);
    }
  };

  // Load next page
  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res =
        selectedGenre === 'All'
          ? await getAnimeRankings(nextPage, 18)
          : await getAnimeList({
              genres: selectedGenre,
              sortBy: 'ranking',
              sortOrder: 'asc',
              page: nextPage,
              size: 18
            });

      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setAnimeItems((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = res.data.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data.length >= 18);
      }
    } catch (err: any) {
      console.error('Failed to load more anime:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Header Banner */}
      <header className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 border-b border-white/10 bg-[#111114]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#E43D3D] inline-block" />
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
                ANIMATION
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-white leading-none">
              ANIME CATALOG
            </h1>

            <p className="text-xs sm:text-sm font-sans text-[#8E8E93] max-w-2xl leading-relaxed">
              Explore live rankings, series, and features from our curated anime directory.
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime titles..."
                className="w-full bg-black/60 border border-white/15 focus:border-[#E43D3D] text-[#F2F0EC] pl-3.5 pr-10 py-2.5 text-xs font-mono outline-none min-h-[44px]"
              />
              <button
                type="submit"
                aria-label="Search anime"
                className="absolute right-0 top-0 bottom-0 px-3 text-[#8E8E93] hover:text-[#E43D3D] flex items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10 sm:space-y-12 mt-8 sm:mt-12">
        {/* API Error State (clean fallback, no config forms or keys) */}
        {apiError && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-2.5 h-2.5 bg-[#E43D3D] mx-auto" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              ANIME DATA UNAVAILABLE
            </h3>
            <p className="text-xs font-sans text-[#8E8E93] leading-relaxed">
              {apiError.message || 'Anime data service is currently unavailable.'}
            </p>
            <button
              type="button"
              onClick={loadInitialData}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>
          </div>
        )}

        {/* Genre Filter Control */}
        {!apiError && genres.length > 0 && (
          <section className="bg-[#111114] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8E8E93] uppercase font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E43D3D]" />
                <span>GENRE FILTER</span>
              </span>
              {selectedGenre !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleSelectGenre('All')}
                  className="text-[#E43D3D] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET TO ALL</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleSelectGenre('All')}
                className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all border ${
                  selectedGenre === 'All'
                    ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                    : 'bg-[#0B0B0D] border-white/10 text-[#8E8E93] hover:text-white'
                }`}
              >
                ALL TITLES
              </button>

              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelectGenre(g)}
                  className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all border ${
                    selectedGenre === g
                      ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                      : 'bg-[#0B0B0D] border-white/10 text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section Header */}
        {!apiError && (
          <SectionHeader
            label="REAL ANIME DB METADATA"
            title={selectedGenre === 'All' ? 'TOP RANKED ANIME' : `${selectedGenre.toUpperCase()} TITLES`}
            description={`Viewing live Anime DB records${selectedGenre !== 'All' ? ` filtered by ${selectedGenre}` : ' sorted by popularity and rating rank'}.`}
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
        {!loading && !apiError && animeItems.length === 0 && (
          <div className="bg-[#111114] border border-white/10 p-12 text-center max-w-md mx-auto space-y-3">
            <h3 className="font-display font-bold text-lg text-white uppercase">NO ANIME FOUND</h3>
            <p className="text-xs font-sans text-[#8E8E93]">No entries match your current genre selection.</p>
            <button
              type="button"
              onClick={() => handleSelectGenre('All')}
              className="btn-primary min-h-[44px] px-6 text-xs uppercase mt-2"
            >
              <span>RESET FILTERS</span>
            </button>
          </div>
        )}

        {/* Anime Cards Grid */}
        {!loading && !apiError && animeItems.length > 0 && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {animeItems.map((item) => (
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
                  <span>{loadingMore ? 'LOADING NEXT PAGE...' : 'LOAD MORE ANIME'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimePage;
