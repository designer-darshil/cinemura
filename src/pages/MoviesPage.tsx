import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getMovieCategory,
  getMovieDetail,
  getMoviesList,
  getMovieGenres
} from '../services/tmdb';
import { Movie } from '../types';
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
  popular: 'POPULAR MOVIES',
  top_rated: 'TOP RATED MOVIES',
  upcoming: 'UPCOMING MOVIES',
  now_playing: 'NOW PLAYING MOVIES'
};

export const MoviesPage: React.FC = () => {
  const { markAppReady } = useApp();
  const { id: genreIdParam, name: categoryNameParam } = useParams<{ id?: string; name?: string }>();

  // Determine if this is a Category Listing View or the Main Movies Index
  const isCategoryView = Boolean(categoryNameParam || genreIdParam);

  /* ----------------------------------------------------
     STATE FOR MOVIES INDEX (HERO + 4 CATEGORY CAROUSELS)
     ---------------------------------------------------- */
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  /* ----------------------------------------------------
     STATE FOR FULL CATEGORY / LIST VIEW
     ---------------------------------------------------- */
  const [categoryItems, setCategoryItems] = useState<Movie[]>([]);
  const [genreName, setGenreName] = useState<string>('');
  const [catPage, setCatPage] = useState(1);
  const [catLoading, setCatLoading] = useState(true);
  const [catLoadingMore, setCatLoadingMore] = useState(false);
  const [catError, setCatError] = useState(false);
  const [catErrorMore, setCatErrorMore] = useState(false);
  const [catHasMore, setCatHasMore] = useState(true);

  const catRequestIdRef = useRef<number>(0);

  /* ====================================================
     EFFECT: LOAD MAIN INDEX SECTIONS (JASON PATTERN)
     Hero + Popular + Top Rated + Upcoming + Now Playing
     ==================================================== */
  useEffect(() => {
    if (isCategoryView) return;

    let mounted = true;
    setIndexLoading(true);
    setIndexError(false);

    Promise.all([
      getMovieCategory('popular', 1),
      getMovieCategory('top_rated', 1),
      getMovieCategory('upcoming', 1),
      getMovieCategory('now_playing', 1)
    ])
      .then(async ([pop, top, upc, now]) => {
        if (!mounted) return;

        if (!pop && !top && !upc && !now) {
          setIndexError(true);
          setIndexLoading(false);
          return;
        }

        const validPopular = pop || [];
        setPopularMovies(validPopular);
        setTopRatedMovies(top || []);
        setUpcomingMovies(upc || []);
        setNowPlayingMovies(now || []);

        // Pick top popular item with full details for Hero
        if (validPopular.length > 0) {
          try {
            const fullHero = await getMovieDetail(validPopular[0].id);
            if (mounted) {
              setHeroMovie(fullHero || validPopular[0]);
            }
          } catch {
            if (mounted) setHeroMovie(validPopular[0]);
          }
        }

        setIndexLoading(false);
        markAppReady();
      })
      .catch((err) => {
        console.error('Failed to load movie categories:', err);
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
        let results: Movie[] | null = null;

        if (genreIdParam) {
          results = await getMoviesList(genreIdParam, 'popularity.desc', targetPage);
        } else if (categoryNameParam) {
          results = await getMovieCategory(categoryNameParam, targetPage);
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
              const existingIds = new Set(prev.map((m) => m.id));
              const uniqueNew = results.filter((m) => !existingIds.has(m.id));
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
      getMovieGenres().then((genres) => {
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

  const { triggerIndex, triggerRef } = useInfiniteScroll({
    totalItems: categoryItems.length,
    loading: catLoading || catLoadingMore,
    hasMore: catHasMore,
    onLoadMore: handleCatLoadMore,
    resetDeps: [isCategoryView, categoryNameParam, genreIdParam]
  });

  /* ====================================================
     RENDER A: FULL CATEGORY / LIST VIEW
     ==================================================== */
  if (isCategoryView) {
    const rawCategoryKey = categoryNameParam?.toLowerCase().replace('-', '_') || '';
    const pageTitle = genreIdParam
      ? `${(genreName || 'GENRE').toUpperCase()} MOVIES`
      : CATEGORY_TITLES[rawCategoryKey] || `${(categoryNameParam || 'MOVIES').toUpperCase()}`;

    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10">
        {/* Top Back Nav & Heading */}
        <header className="border-b border-white/10 pb-6 space-y-4">
          <Link
            to="/movie"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO MOVIES INDEX</span>
          </Link>

          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
              {pageTitle}
            </h1>

            {!catLoading && categoryItems.length > 0 && (
              <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
                PAGE {catPage} • {categoryItems.length} TITLES
              </span>
            )}
          </div>
        </header>

        {/* Initial Loading Skeleton */}
        {catLoading && <CardGridSkeleton count={18} variant="poster" />}

        {/* Initial Error State */}
        {!catLoading && catError && (
          <ErrorState
            title="FAILED TO LOAD MOVIES"
            message="Could not connect to the TMDB database for this category."
            onRetry={() => fetchCategoryData(1, false)}
          />
        )}

        {/* Empty State */}
        {!catLoading && !catError && categoryItems.length === 0 && (
          <EmptyState
            title="NO MOVIES FOUND"
            message="No feature films are currently listed under this category."
          />
        )}

        {/* Dense 6-Column Result Grid (Desktop 6, Tablet 4, Mobile 2) */}
        {!catLoading && !catError && categoryItems.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categoryItems.map((movie, index) => (
                <MediaCard
                  key={movie.id}
                  item={movie}
                  variant="poster"
                  ref={index === triggerIndex ? triggerRef : undefined}
                />
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
          </div>
        )}
      </div>
    );
  }

  /* ====================================================
     RENDER B: MAIN MOVIES INDEX (SAME JASON PATTERN)
     Hero -> Popular -> Top Rated -> Upcoming -> Now Playing
     ==================================================== */
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-20 pb-20 selection:bg-[#E43D3D] selection:text-white">
      {/* 1. HERO BANNER */}
      {heroMovie && <HeroBanner item={heroMovie} badgeLabel="FEATURE FILM" />}

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
            title="FAILED TO LOAD MOVIES"
            message="Could not load live movie catalog categories from TMDB."
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* 2. POPULAR MOVIES CAROUSEL */}
      {popularMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="POPULAR"
            viewAllLink="/movie/category/popular"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={popularMovies}
            variant="poster"
            exploreAllLink="/movie/category/popular"
            exploreAllText="POPULAR"
          />
        </section>
      )}

      {/* 3. TOP RATED MOVIES CAROUSEL */}
      {topRatedMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="TOP RATED"
            viewAllLink="/movie/category/top_rated"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={topRatedMovies}
            variant="poster"
            exploreAllLink="/movie/category/top_rated"
            exploreAllText="TOP RATED"
          />
        </section>
      )}

      {/* 4. UPCOMING MOVIES CAROUSEL */}
      {upcomingMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="UPCOMING"
            viewAllLink="/movie/category/upcoming"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={upcomingMovies}
            variant="poster"
            exploreAllLink="/movie/category/upcoming"
            exploreAllText="UPCOMING"
          />
        </section>
      )}

      {/* 5. NOW PLAYING MOVIES CAROUSEL */}
      {nowPlayingMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="NOW PLAYING"
            viewAllLink="/movie/category/now_playing"
            viewAllText="EXPLORE ALL"
          />
          <HorizontalRail
            items={nowPlayingMovies}
            variant="poster"
            exploreAllLink="/movie/category/now_playing"
            exploreAllText="NOW PLAYING"
          />
        </section>
      )}
    </div>
  );
};

export default MoviesPage;
