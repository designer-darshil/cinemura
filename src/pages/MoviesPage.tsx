import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  getMoviesList,
  getMovieGenres,
  getTrendingMovies,
  GenreItem,
  MovieFilterOptions
} from '../services/tmdb';
import { Movie } from '../types';
import { MediaCard } from '../components/MediaCard';
import { HorizontalRail } from '../components/HorizontalRail';
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

const YEAR_OPTIONS = [
  { label: 'ALL YEARS', value: 'All' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
  { label: '2010s', value: '2015' }
];

const RATING_OPTIONS = [
  { label: 'ANY RATING', value: 'All' },
  { label: '★ 8.0+', value: '8.0' },
  { label: '★ 7.0+', value: '7.0' },
  { label: '★ 6.0+', value: '6.0' }
];

const SORT_OPTIONS = [
  { label: 'MOST POPULAR', value: 'popularity.desc' },
  { label: 'HIGHEST RATED', value: 'vote_average.desc' },
  { label: 'NEWEST RELEASE', value: 'primary_release_date.desc' },
  { label: 'TITLE A–Z', value: 'title.asc' }
];

const LANGUAGE_OPTIONS = [
  { label: 'ALL LANGUAGES', value: 'All' },
  { label: 'ENGLISH', value: 'en' },
  { label: 'JAPANESE', value: 'ja' },
  { label: 'KOREAN', value: 'ko' },
  { label: 'FRENCH', value: 'fr' },
  { label: 'SPANISH', value: 'es' }
];

export const MoviesPage: React.FC = () => {
  const { id: genreIdParam } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialGenre = genreIdParam || searchParams.get('genre') || 'All';
  const initialYear = searchParams.get('year') || 'All';
  const initialRating = searchParams.get('rating') || 'All';
  const initialSort = searchParams.get('sort') || 'popularity.desc';
  const initialLanguage = searchParams.get('lang') || 'All';

  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedRating, setSelectedRating] = useState<string>(initialRating);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);

  // Pagination & Loading
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const requestIdRef = useRef<number>(0);

  // Synchronize route param change
  useEffect(() => {
    if (genreIdParam && genreIdParam !== selectedGenre) {
      setSelectedGenre(genreIdParam);
    }
  }, [genreIdParam]);

  // Load genres and trending rail once on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([getMovieGenres(), getTrendingMovies('day')])
      .then(([genreList, trendingList]) => {
        if (!mounted) return;
        if (genreList) setGenres(genreList);
        if (trendingList) setTrendingMovies(trendingList);
      })
      .catch((err) => console.error('Error fetching initial movie meta:', err));

    return () => {
      mounted = false;
    };
  }, []);

  // Update searchParams when filters change
  const updateUrlParams = (
    genre: string,
    year: string,
    rating: string,
    sort: string,
    lang: string
  ) => {
    const params = new URLSearchParams();
    if (genre !== 'All') params.set('genre', genre);
    if (year !== 'All') params.set('year', year);
    if (rating !== 'All') params.set('rating', rating);
    if (sort !== 'popularity.desc') params.set('sort', sort);
    if (lang !== 'All') params.set('lang', lang);
    setSearchParams(params, { replace: true });
  };

  // Fetch movies for current filters
  const fetchMoviesData = useCallback(
    async (
      targetPage: number = 1,
      append: boolean = false,
      filterOverride?: Partial<MovieFilterOptions>
    ) => {
      const currentReqId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
        setErrorMore(false);
      } else {
        setLoading(true);
        setError(false);
      }

      const activeFilters: MovieFilterOptions = {
        genreId: filterOverride?.genreId ?? selectedGenre,
        year: filterOverride?.year ?? selectedYear,
        minRating: filterOverride?.minRating ?? selectedRating,
        sortBy: filterOverride?.sortBy ?? sortBy,
        language: filterOverride?.language ?? selectedLanguage,
        page: targetPage
      };

      try {
        const results = await getMoviesList(activeFilters);

        if (currentReqId !== requestIdRef.current) return;

        if (!results || results.length === 0) {
          if (!append) {
            setMovies([]);
          }
          setHasMore(false);
        } else {
          if (append) {
            setMovies((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const uniqueIncoming = results.filter((m) => !existingIds.has(m.id));
              return [...prev, ...uniqueIncoming];
            });
          } else {
            setMovies(results);
          }
          // Real TMDB pagination continues until empty or page 500 cap
          setHasMore(results.length >= 10 && targetPage < 500);
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
    [selectedGenre, selectedYear, selectedRating, sortBy, selectedLanguage]
  );

  // Trigger initial fetch & refetch on filter change
  useEffect(() => {
    setPage(1);
    fetchMoviesData(1, false);
    updateUrlParams(selectedGenre, selectedYear, selectedRating, sortBy, selectedLanguage);
  }, [selectedGenre, selectedYear, selectedRating, sortBy, selectedLanguage]);

  // Infinite scroll trigger
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMoviesData(nextPage, true);
  }, [page, loading, loadingMore, hasMore, fetchMoviesData]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '600px 0px'
  });

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedRating('All');
    setSortBy('popularity.desc');
    setSelectedLanguage('All');
  };

  const hasActiveFilters =
    selectedGenre !== 'All' ||
    selectedYear !== 'All' ||
    selectedRating !== 'All' ||
    sortBy !== 'popularity.desc' ||
    selectedLanguage !== 'All';

  const activeGenreName = genres.find((g) => g.id.toString() === selectedGenre)?.name;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12">
      
      {/* ==================================================
          1. EDITORIAL PAGE HEADER
         ================================================== */}
      <header className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
              CINEMA CATALOG
            </span>
            {activeGenreName && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-2 py-0.5">
                {activeGenreName.toUpperCase()}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-[#8E8E93] tracking-widest uppercase">
            CANONICAL TMDB ARCHIVE
          </span>
        </div>

        <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
          MOVIES
        </h1>
      </header>

      {/* ==================================================
          2. COMPACT DISCOVERY CONTROLS BAR
         ================================================== */}
      <section className="bg-[#111114] border border-white/10 p-3 sm:p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E43D3D]" />
            <span className="uppercase font-bold tracking-wider text-white">DISCOVERY CONTROLS</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET CONTROLS</span>
            </button>
          )}
        </div>

        {/* Compact Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Genre Control */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">GENRE</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                selectedGenre !== 'All'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              <option value="All">ALL GENRES</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id.toString()}>
                  {g.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Year Control */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">YEAR</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                selectedYear !== 'All'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Control */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">MIN RATING</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                selectedRating !== 'All'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
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
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Control */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">ORIGINAL LANGUAGE</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`w-full bg-[#0B0B0D] border text-xs px-2.5 py-1.5 outline-none font-mono transition-colors ${
                selectedLanguage !== 'All'
                  ? 'border-[#E43D3D] text-[#E43D3D] font-bold'
                  : 'border-white/15 text-white focus:border-white/40'
              }`}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. FEATURED / TRENDING MOVIES (HORIZONTAL RAIL)
         ================================================== */}
      {trendingMovies.length > 0 && (
        <section className="space-y-4 pt-2">
          <SectionHeader
            label="DISCOVERY"
            title="TRENDING MOVIES"
          />
          <HorizontalRail items={trendingMovies} variant="poster" />
        </section>
      )}

      {/* ==================================================
          4. ALL MOVIES RESULT GRID (EXACTLY 6 COLS ON DESKTOP)
         ================================================== */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex items-baseline justify-between">
          <SectionHeader
            label="ARCHIVE"
            title={activeGenreName ? `${activeGenreName.toUpperCase()} MOVIES` : 'ALL MOVIES'}
          />

          {!loading && movies.length > 0 && (
            <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
              PAGE {page} • {movies.length} TITLES
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
            title="FAILED TO LOAD MOVIES"
            message="Could not connect to the live TMDB database. Please check your connection and retry."
            onRetry={() => fetchMoviesData(1, false)}
          />
        )}

        {/* Empty State */}
        {!loading && !error && movies.length === 0 && (
          <EmptyState
            title="NO MOVIES FOUND"
            message="No feature films match the selected combination of genre, year, rating, or language."
            actionText="RESET CONTROLS"
            onAction={handleResetFilters}
          />
        )}

        {/* Dense Responsive Grid (2 Mobile, 4 Tablet, 6 Desktop) */}
        {!loading && !error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {movies.map((movie) => (
                <MediaCard key={movie.id} item={movie} variant="poster" />
              ))}
            </div>

            {/* Next Page Skeleton Loading */}
            {loadingMore && (
              <InfiniteLoadingSkeleton count={6} />
            )}

            {/* Next Page Error State with Retry Button */}
            {errorMore && (
              <InfiniteErrorState onRetry={() => fetchMoviesData(page + 1, true)} />
            )}

            {/* End of results indicator */}
            {!hasMore && movies.length > 0 && (
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

export default MoviesPage;
