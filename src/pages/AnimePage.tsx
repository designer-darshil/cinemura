import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimeItem, AnimeApiError } from '../types/anime';
import { getAnimeList, getAnimeRankings, getAnimeGenres, getAnimeById } from '../services/animeDb';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { HeroBanner, GenericHeroItem } from '../components/HeroBanner';
import { IndexHeroSkeleton } from '../components/StateViews';
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

  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);
  const [heroLoading, setHeroLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data: genres, top ranked anime catalog, and dynamic random hero
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setHeroLoading(true);
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
      const catalog = res.data || [];
      setAnimeItems(catalog);
      setPage(1);
      setHasMore(catalog.length >= 18);

      // 3. Randomly select one eligible anime for the dynamic Hero
      const eligibleCandidates = catalog.filter(c =>
        c &&
        c.id &&
        (c.image || c.thumb) &&
        c.title &&
        c.synopsis
      );

      // Avoid selecting the immediately previous title from session on reload
      const LAST_ANIME_HERO_KEY = 'cinemura_prev_hero_anime';
      const prevHeroId = sessionStorage.getItem(LAST_ANIME_HERO_KEY);
      let pool = eligibleCandidates.filter(c => c.id !== prevHeroId);
      if (pool.length === 0) {
        pool = eligibleCandidates.length > 0 ? eligibleCandidates : catalog;
      }

      const selected = pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : null;

      if (selected) {
        let fullHero: AnimeItem | null = null;
        try {
          fullHero = await getAnimeById(selected.id);
        } catch (detailErr) {
          console.warn('Could not fetch detail for anime hero candidate:', detailErr);
        }
        if (!fullHero) {
          fullHero = selected;
        }

        // Preload hero artwork before revealing
        const heroImgUrl = fullHero.image || fullHero.thumb;
        if (heroImgUrl) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.src = heroImgUrl;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }

        setHeroAnime(fullHero);
        sessionStorage.setItem(LAST_ANIME_HERO_KEY, fullHero.id);
      }
    } catch (err: any) {
      console.error('Failed to load anime from Anime DB:', err);
      setApiError(err as AnimeApiError);
    } finally {
      setLoading(false);
      setHeroLoading(false);
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

  const heroBannerItem: GenericHeroItem | null = heroAnime
    ? {
        id: heroAnime.id,
        title: heroAnime.title,
        type: 'anime',
        backdrop: heroAnime.image || heroAnime.thumb || '',
        synopsis: heroAnime.synopsis,
        genres: heroAnime.genres,
        detailUrl: `/anime/${encodeURIComponent(heroAnime.id)}`,
        episodesCount: heroAnime.episodes,
        certification: heroAnime.type,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Dynamic Anime Hero Banner matching Home/Movies/TV dimensions */}
      {selectedGenre === 'All' && (
        heroBannerItem ? (
          <HeroBanner
            item={heroBannerItem}
            badgeLabel={heroAnime?.rank ? `#${heroAnime.rank} RANKED ANIME` : 'ANIME SPOTLIGHT'}
          />
        ) : (
          heroLoading && !apiError && <IndexHeroSkeleton />
        )
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
