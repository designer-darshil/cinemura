import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Layers, RotateCcw, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem, AnimeApiError } from '../types/anime';
import { getAnimeList, getAnimeRankings, getAnimeGenres } from '../services/animeDb';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { SectionHeader } from '../components/SectionHeader';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { EndOfContentState } from '../components/StateViews';

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

  // Fetch initial data: genres and top ranked anime
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      // 1. Fetch verified genres list
      getAnimeGenres()
        .then((gList) => {
          if (Array.isArray(gList)) setGenres(gList);
        })
        .catch(() => {});

      // 2. Fetch initial top ranked anime catalog
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
    if (selectedGenre === genre) return;
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
      setHasMore(true);
    } catch (err: any) {
      setApiError(err as AnimeApiError);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll loader
  const handleLoadMore = useCallback(async () => {
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
  }, [loading, loadingMore, hasMore, page, selectedGenre]);

  const { triggerIndex, triggerRef } = useInfiniteScroll({
    totalItems: animeItems.length,
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    resetDeps: [selectedGenre]
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredHero = animeItems.length > 0 && selectedGenre === 'All' ? animeItems[0] : null;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Featured Anime Hero Banner (Top Ranked) */}
      {!loading && !apiError && featuredHero && (
        <section className="relative w-full min-h-[55vh] sm:min-h-[65vh] flex items-end pt-24 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden border-b border-white/10 bg-[#111114]">
          {/* Background Ambient Poster Art */}
          {(featuredHero.image || featuredHero.thumb) && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-105 pointer-events-none"
              style={{ backgroundImage: `url(${featuredHero.image || featuredHero.thumb})` }}
            />
          )}

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />

          {/* Hero Content Area */}
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-[#E43D3D] text-white">
                <Award className="w-3.5 h-3.5" />
                <span>#1 RANKED ANIME</span>
              </span>
              {featuredHero.type && (
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-black/60 border border-white/15 text-[#F2F0EC]">
                  {featuredHero.type}
                </span>
              )}
              {typeof featuredHero.episodes === 'number' && (
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-black/60 border border-white/15 text-[#8E8E93]">
                  {featuredHero.episodes} EPS
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-[#F2F0EC] leading-tight">
              {featuredHero.title}
            </h1>

            {featuredHero.genres && featuredHero.genres.length > 0 && (
              <p className="text-xs font-mono text-[#E43D3D] uppercase tracking-wider font-semibold">
                {featuredHero.genres.join(' • ')}
              </p>
            )}

            {featuredHero.synopsis && (
              <p className="text-xs sm:text-sm font-sans text-[#8E8E93] line-clamp-3 leading-relaxed max-w-2xl font-light">
                {featuredHero.synopsis}
              </p>
            )}

            <div className="pt-2">
              <Link
                to={`/anime/${encodeURIComponent(featuredHero.id)}`}
                className="btn-primary min-h-[44px] px-8 text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center gap-2"
              >
                <span>EXPLORE TITLE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Viewport */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-10 mt-8 sm:mt-12">
        {/* Search Bar + Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white">
              {selectedGenre === 'All' ? 'ANIME DIRECTORY' : `${selectedGenre.toUpperCase()} TITLES`}
            </h2>
            <p className="text-xs font-sans text-[#8E8E93]">
              {selectedGenre === 'All'
                ? 'Browse top-ranked anime series and features from the Anime DB catalog.'
                : `Showing anime filtered by the ${selectedGenre} genre.`}
            </p>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime titles..."
                className="w-full bg-[#111114] border border-white/15 focus:border-[#E43D3D] text-[#F2F0EC] pl-3.5 pr-10 py-2.5 text-xs font-mono outline-none min-h-[44px]"
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

        {/* Error State */}
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

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
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

        {/* Anime Cards Grid (6 desktop / 4 tablet / 2 mobile) */}
        {!loading && !apiError && animeItems.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {animeItems.map((item, index) => {
                const isTrigger = index === triggerIndex;
                return (
                  <AnimeCard
                    key={item.id}
                    item={item}
                    ref={isTrigger ? (triggerRef as any) : undefined}
                  />
                );
              })}
            </div>

            {/* Skeletons while loading more pages */}
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* End of content indicator */}
            {!hasMore && <EndOfContentState />}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimePage;
