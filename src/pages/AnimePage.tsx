import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Flame, Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHianimeHome, getHianimeList } from '../services/hianime';
import {
  adaptHianimeCard,
  adaptHianimeSpotlight,
  UnifiedAnimeCardItem,
} from '../services/animeBridge';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import { HeroBanner, GenericHeroItem } from '../components/HeroBanner';
import { IndexHeroSkeleton, EndOfContentState } from '../components/StateViews';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const POPULAR_CATEGORIES = [
  { id: 'top-airing', label: 'TOP AIRING', icon: Flame },
  { id: 'most-popular', label: 'MOST POPULAR', icon: Trophy },
  { id: 'top-upcoming', label: 'TOP UPCOMING', icon: Calendar },
  { id: 'completed', label: 'COMPLETED', icon: CheckCircle2 },
];

export const AnimePage: React.FC = () => {
  const { markAppReady } = useApp();
  const navigate = useNavigate();

  const [animeItems, setAnimeItems] = useState<UnifiedAnimeCardItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('top-airing');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [heroAnime, setHeroAnime] = useState<UnifiedAnimeCardItem | null>(null);
  const [heroSynopsis, setHeroSynopsis] = useState<string>('');
  const [heroLoading, setHeroLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Initial load: Fetch Hianime home data (spotlight hero, categories, genres)
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setHeroLoading(true);
    setApiError(null);

    try {
      const home = await getHianimeHome();

      // 1. Set Genres
      if (home.genres && home.genres.length > 0) {
        setGenres(home.genres);
      }

      // 2. Set Dynamic Hero from Hianime Spotlight
      if (home.spotlight && home.spotlight.length > 0) {
        // Choose one spotlight anime (prevent immediately repeating previous session)
        const LAST_HERO_KEY = 'cinemura_prev_hianime_hero';
        const prevId = sessionStorage.getItem(LAST_HERO_KEY);
        let pool = home.spotlight.filter((s) => s.id !== prevId);
        if (pool.length === 0) pool = home.spotlight;

        const selected = pool[Math.floor(Math.random() * pool.length)];
        const adaptedHero = adaptHianimeSpotlight(selected);
        setHeroAnime(adaptedHero);
        setHeroSynopsis(selected.synopsis || '');
        sessionStorage.setItem(LAST_HERO_KEY, selected.id);

        // Preload hero artwork
        if (selected.poster) {
          const img = new Image();
          img.src = selected.poster;
        }
      }

      // 3. Set Initial Catalog from Top Airing
      const topAiringItems = (home.topAiring || []).map(adaptHianimeCard);
      setAnimeItems(topAiringItems);
      setActiveCategory('top-airing');
      setSelectedGenre('All');
      setPage(1);
      setHasMore(topAiringItems.length >= 10);
    } catch (err: any) {
      console.error('Failed to load anime from Hianime API:', err);
      setApiError(err?.message || 'Anime data service is currently unavailable.');
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

  // Handle switching categories (e.g. top-airing, most-popular, top-upcoming, completed)
  const handleSelectCategory = async (catId: string) => {
    if (activeCategory === catId && selectedGenre === 'All') return;
    setActiveCategory(catId);
    setSelectedGenre('All');
    setLoading(true);
    setApiError(null);

    try {
      const res = await getHianimeList(catId, 1);
      const adapted = (res.response || []).map(adaptHianimeCard);
      setAnimeItems(adapted);
      setPage(1);
      setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : adapted.length >= 18);
    } catch (err: any) {
      console.error(`Failed to load ${catId}:`, err);
      setApiError(err?.message || 'Failed to load category.');
    } finally {
      setLoading(false);
    }
  };

  // Handle genre filter selection
  const handleSelectGenre = async (genre: string) => {
    if (selectedGenre === genre) return;
    setSelectedGenre(genre);
    setLoading(true);
    setApiError(null);

    try {
      if (genre === 'All') {
        // Return to active category page 1
        const res = await getHianimeList(activeCategory, 1);
        const adapted = (res.response || []).map(adaptHianimeCard);
        setAnimeItems(adapted);
        setPage(1);
        setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : adapted.length >= 18);
      } else {
        // Query genre
        const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');
        const res = await getHianimeList(`genre/${genreSlug}`, 1);
        const adapted = (res.response || []).map(adaptHianimeCard);
        setAnimeItems(adapted);
        setPage(1);
        setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : adapted.length >= 18);
      }
    } catch (err: any) {
      console.error(`Failed to load genre ${genre}:`, err);
      setApiError(err?.message || `Failed to load ${genre} anime.`);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll pagination loader
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      let res;
      if (selectedGenre !== 'All') {
        const genreSlug = selectedGenre.toLowerCase().replace(/\s+/g, '-');
        res = await getHianimeList(`genre/${genreSlug}`, nextPage);
      } else {
        res = await getHianimeList(activeCategory, nextPage);
      }

      const rawItems = res.response || [];
      if (rawItems.length === 0) {
        setHasMore(false);
      } else {
        const adapted = rawItems.map(adaptHianimeCard);
        setAnimeItems((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = adapted.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.pageInfo ? res.pageInfo.hasNextPage : rawItems.length >= 18);
      }
    } catch (err: any) {
      console.error('Failed to load more anime:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, selectedGenre, activeCategory]);

  const { triggerIndex, triggerRef } = useInfiniteScroll({
    totalItems: animeItems.length,
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    resetDeps: [activeCategory, selectedGenre],
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
        synopsis: heroSynopsis,
        genres: genres.slice(0, 3),
        detailUrl: `/anime/${encodeURIComponent(heroAnime.id)}?title=${encodeURIComponent(heroAnime.title)}`,
        episodesCount: heroAnime.episodes,
        certification: heroAnime.type,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      {/* Featured Anime Hero Banner (Spotlight) */}
      {selectedGenre === 'All' && (
        heroBannerItem ? (
          <HeroBanner
            item={heroBannerItem}
            badgeLabel={heroAnime?.rank ? `SPOTLIGHT #${heroAnime.rank}` : 'FEATURED ANIME'}
          />
        ) : (
          heroLoading && !apiError && <IndexHeroSkeleton />
        )
      )}

      {/* Main Catalog Viewport */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-10 mt-8 sm:mt-12">
        {/* Search Bar + Heading Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#E43D3D]" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-bold">
                HIANIME PROVIDER DISCOVERY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white mt-1">
              {selectedGenre !== 'All'
                ? `${selectedGenre.toUpperCase()} TITLES`
                : activeCategory.replace('-', ' ').toUpperCase()}
            </h2>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime catalog..."
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

        {/* Category Rails Tabs */}
        {!apiError && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id && selectedGenre === 'All';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`min-h-[44px] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase inline-flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-[#E43D3D] text-white shadow-lg shadow-[#E43D3D]/20'
                      : 'bg-[#111114] border border-white/10 text-[#8E8E93] hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Genre Filter Control */}
        {!apiError && genres.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8E8E93] uppercase font-bold text-[11px] tracking-wider">
                GENRES
              </span>
              {selectedGenre !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleSelectGenre('All')}
                  className="text-[#E43D3D] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET TO {activeCategory.replace('-', ' ').toUpperCase()}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectGenre('All')}
                className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all ${
                  selectedGenre === 'All'
                    ? 'bg-[#E43D3D] text-white font-bold'
                    : 'bg-[#111114] border border-white/10 text-[#8E8E93] hover:text-white'
                }`}
              >
                ALL
              </button>

              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelectGenre(g)}
                  className={`text-xs px-3 py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 flex items-center font-mono font-semibold uppercase transition-all ${
                    selectedGenre === g
                      ? 'bg-[#E43D3D] text-white font-bold'
                      : 'bg-[#111114] border border-white/10 text-[#8E8E93] hover:text-white'
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
              {apiError}
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
            <p className="text-xs font-sans text-[#8E8E93]">No entries match your current selection.</p>
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
                    key={`${item.id}-${index}`}
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
