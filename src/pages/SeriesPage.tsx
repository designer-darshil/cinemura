import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getTvCategory,
  getTvDetail,
  getTvList,
  getTvGenres
} from '../services/tmdb';
import { Series } from '../types';
import { MediaCard } from '../components/MediaCard';
import { HorizontalRail } from '../components/HorizontalRail';
import { SectionHeader } from '../components/SectionHeader';
import { HeroBanner } from '../components/HeroBanner';
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

// Map URL category slug to friendly display title
const CATEGORY_TITLES: Record<string, string> = {
  popular: 'POPULAR TV SHOWS',
  top_rated: 'TOP RATED TV SHOWS',
  on_the_air: 'ON THE AIR TV SHOWS',
  airing_today: 'AIRING TODAY TV SHOWS'
};

export const SeriesPage: React.FC = () => {
  const { markAppReady } = useApp();
  const { id: genreIdParam, name: categoryNameParam } = useParams<{ id?: string; name?: string }>();

  // Determine if this is a Category Listing View or the Main TV Shows Index
  const isCategoryView = Boolean(categoryNameParam || genreIdParam);

  /* ----------------------------------------------------
     STATE FOR TV SHOWS INDEX (HERO + 4 CATEGORY CAROUSELS)
     ---------------------------------------------------- */
  const [heroSeries, setHeroSeries] = useState<Series | null>(null);
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);
  const [topRatedSeries, setTopRatedSeries] = useState<Series[]>([]);
  const [onTheAirSeries, setOnTheAirSeries] = useState<Series[]>([]);
  const [airingTodaySeries, setAiringTodaySeries] = useState<Series[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  /* ----------------------------------------------------
     STATE FOR FULL CATEGORY / LIST VIEW
     ---------------------------------------------------- */
  const [categoryItems, setCategoryItems] = useState<Series[]>([]);
  const [genreName, setGenreName] = useState<string>('');
  const [catPage, setCatPage] = useState(1);
  const [catLoading, setCatLoading] = useState(true);
  const [catLoadingMore, setCatLoadingMore] = useState(false);
  const [catError, setCatError] = useState(false);
  const [catErrorMore, setCatErrorMore] = useState(false);
  const [catHasMore, setCatHasMore] = useState(true);

  const catRequestIdRef = useRef<number>(0);

  /* ====================================================
     EFFECT: LOAD MAIN TV INDEX SECTIONS (JASON PATTERN)
     Hero + Popular + Top Rated + On The Air + Airing Today
     ==================================================== */
  useEffect(() => {
    if (isCategoryView) return;

    let mounted = true;
    setIndexLoading(true);
    setIndexError(false);

    Promise.all([
      getTvCategory('popular', 1),
      getTvCategory('top_rated', 1),
      getTvCategory('on_the_air', 1),
      getTvCategory('airing_today', 1)
    ])
      .then(async ([pop, top, onAir, airing]) => {
        if (!mounted) return;

        if (!pop && !top && !onAir && !airing) {
          setIndexError(true);
          setIndexLoading(false);
          return;
        }

        const validPopular = pop || [];
        setPopularSeries(validPopular);
        setTopRatedSeries(top || []);
        setOnTheAirSeries(onAir || []);
        setAiringTodaySeries(airing || []);

        // Pick top popular TV series with full details for Hero
        if (validPopular.length > 0) {
          try {
            const fullHero = await getTvDetail(validPopular[0].id);
            if (mounted) {
              setHeroSeries(fullHero || validPopular[0]);
            }
          } catch {
            if (mounted) setHeroSeries(validPopular[0]);
          }
        }

        setIndexLoading(false);
        markAppReady();
      })
      .catch((err) => {
        console.error('Failed to load TV categories:', err);
        if (mounted) {
          setIndexError(true);
          setIndexLoading(false);
          markAppReady();
        }
      });

    return () => {
      mounted = false;
    };
  }, [isCategoryView]);

  /* ====================================================
     EFFECT: LOAD FULL CATEGORY LIST (PAGINATED)
     ==================================================== */
  const fetchCategoryData = useCallback(
    async (targetPage: number = 1, append: boolean = false) => {
      if (!isCategoryView) return;

      const currentReqId = ++catRequestIdRef.current;

      if (append) {
        setCatLoadingMore(true);
        setCatErrorMore(false);
      } else {
        setCatLoading(true);
        setCatError(false);
      }

      try {
        let results: Series[] | null = null;

        if (genreIdParam) {
          results = await getTvList(genreIdParam, 'popularity.desc', targetPage);
        } else if (categoryNameParam) {
          results = await getTvCategory(categoryNameParam, targetPage);
        }

        if (currentReqId !== catRequestIdRef.current) return;

        if (!results || results.length === 0) {
          if (!append) {
            setCategoryItems([]);
          }
          setCatHasMore(false);
        } else {
          if (append) {
            setCategoryItems((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const uniqueNew = results.filter((s) => !existingIds.has(s.id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setCategoryItems(results);
          }
          setCatHasMore(results.length >= 10 && targetPage < 500);
        }
      } catch (err) {
        if (currentReqId !== catRequestIdRef.current) return;
        if (append) {
          setCatErrorMore(true);
        } else {
          setCatError(true);
        }
      } finally {
        if (currentReqId === catRequestIdRef.current) {
          setCatLoading(false);
          setCatLoadingMore(false);
          markAppReady();
        }
      }
    },
    [isCategoryView, genreIdParam, categoryNameParam]
  );

  // Fetch initial category page when route params change
  useEffect(() => {
    if (!isCategoryView) return;

    setCatPage(1);
    fetchCategoryData(1, false);

    // Resolve genre title if filtering by genre
    if (genreIdParam) {
      getTvGenres().then((genres) => {
        const found = genres.find((g) => g.id.toString() === genreIdParam);
        if (found) setGenreName(found.name);
      });
    }
  }, [isCategoryView, genreIdParam, categoryNameParam, fetchCategoryData]);

  // Infinite scroll trigger for Category view
  const handleCatLoadMore = useCallback(() => {
    if (catLoading || catLoadingMore || !catHasMore) return;
    const nextPage = catPage + 1;
    setCatPage(nextPage);
    fetchCategoryData(nextPage, true);
  }, [catPage, catLoading, catLoadingMore, catHasMore, fetchCategoryData]);

  const sentinelRef = useInfiniteScroll({
    loading: catLoading || catLoadingMore,
    hasMore: catHasMore,
    onLoadMore: handleCatLoadMore,
    rootMargin: '600px 0px'
  });

  /* ====================================================
     RENDER A: FULL CATEGORY / LIST VIEW
     ==================================================== */
  if (isCategoryView) {
    const rawCategoryKey = categoryNameParam?.toLowerCase().replace('-', '_') || '';
    const pageTitle = genreIdParam
      ? `${(genreName || 'GENRE').toUpperCase()} SERIES`
      : CATEGORY_TITLES[rawCategoryKey] || `${(categoryNameParam || 'TV SHOWS').toUpperCase()}`;

    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10">
        {/* Top Back Nav & Heading */}
        <header className="border-b border-white/10 pb-6 space-y-4">
          <Link
            to="/tv"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TV SHOWS INDEX</span>
          </Link>

          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
              {pageTitle}
            </h1>

            {!catLoading && categoryItems.length > 0 && (
              <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
                PAGE {catPage} • {categoryItems.length} SHOWS
              </span>
            )}
          </div>
        </header>

        {/* Initial Loading Skeleton */}
        {catLoading && <CardGridSkeleton count={18} variant="poster" />}

        {/* Initial Error State */}
        {!catLoading && catError && (
          <ErrorState
            title="FAILED TO LOAD TV SHOWS"
            message="Could not connect to the TMDB database for this television category."
            onRetry={() => fetchCategoryData(1, false)}
          />
        )}

        {/* Empty State */}
        {!catLoading && !catError && categoryItems.length === 0 && (
          <EmptyState
            title="NO TV SHOWS FOUND"
            message="No television shows are currently listed under this category."
          />
        )}

        {/* Dense 6-Column Result Grid (Desktop 6, Tablet 4, Mobile 2) */}
        {!catLoading && !catError && categoryItems.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categoryItems.map((series) => (
                <MediaCard key={series.id} item={series} variant="poster" />
              ))}
            </div>

            {/* Next Page Skeleton Loading */}
            {catLoadingMore && <InfiniteLoadingSkeleton count={6} />}

            {/* Next Page Error State with Retry Button */}
            {catErrorMore && (
              <InfiniteErrorState onRetry={() => fetchCategoryData(catPage + 1, true)} />
            )}

            {/* End of content indicator */}
            {!catHasMore && categoryItems.length > 0 && <EndOfContentState />}

            {/* Intersection Observer Sentinel for continuous prefetching */}
            <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
          </div>
        )}
      </div>
    );
  }

  /* ====================================================
     RENDER B: MAIN TV INDEX (SAME JASON PATTERN)
     Hero -> Popular -> Top Rated -> On The Air -> Airing Today
     ==================================================== */
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-20 pb-20 selection:bg-[#E43D3D] selection:text-white">
      {/* 1. HERO BANNER */}
      {heroSeries && <HeroBanner item={heroSeries} badgeLabel="TELEVISION" />}

      {/* Loading Skeletons when initial data is arriving */}
      {indexLoading && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-16">
          <div className="space-y-4">
            <div className="h-8 w-48 skeleton-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] skeleton-pulse" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state if index fetch completely failed */}
      {!indexLoading && indexError && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-12">
          <ErrorState
            title="FAILED TO LOAD TV SHOWS"
            message="Could not load live television catalog categories from TMDB."
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* 2. POPULAR TV SHOWS CAROUSEL */}
      {popularSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="POPULAR"
            viewAllLink="/tv/category/popular"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={popularSeries}
            variant="poster"
            exploreAllLink="/tv/category/popular"
            exploreAllText="POPULAR"
          />
        </section>
      )}

      {/* 3. TOP RATED TV SHOWS CAROUSEL */}
      {topRatedSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="TOP RATED"
            viewAllLink="/tv/category/top_rated"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={topRatedSeries}
            variant="poster"
            exploreAllLink="/tv/category/top_rated"
            exploreAllText="TOP RATED"
          />
        </section>
      )}

      {/* 4. ON THE AIR TV SHOWS CAROUSEL */}
      {onTheAirSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="ON THE AIR"
            viewAllLink="/tv/category/on_the_air"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={onTheAirSeries}
            variant="poster"
            exploreAllLink="/tv/category/on_the_air"
            exploreAllText="ON THE AIR"
          />
        </section>
      )}

      {/* 5. AIRING TODAY TV SHOWS CAROUSEL */}
      {airingTodaySeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="AIRING TODAY"
            viewAllLink="/tv/category/airing_today"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={airingTodaySeries}
            variant="poster"
            exploreAllLink="/tv/category/airing_today"
            exploreAllText="AIRING TODAY"
          />
        </section>
      )}
    </div>
  );
};

export default SeriesPage;
