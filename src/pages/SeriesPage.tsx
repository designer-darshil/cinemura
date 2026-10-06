import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  getTvList,
  getTvGenres,
  getTrendingTv,
  GenreItem,
  TvFilterOptions
} from '../services/tmdb';
import { Series } from '../types';
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
  { label: 'NEWEST PREMIERE', value: 'first_air_date.desc' },
  { label: 'SERIES TITLE A–Z', value: 'name.asc' }
];

const LANGUAGE_OPTIONS = [
  { label: 'ALL LANGUAGES', value: 'All' },
  { label: 'ENGLISH', value: 'en' },
  { label: 'JAPANESE (ANIME)', value: 'ja' },
  { label: 'KOREAN (K-DRAMA)', value: 'ko' },
  { label: 'SPANISH', value: 'es' },
  { label: 'FRENCH', value: 'fr' },
  { label: 'GERMAN', value: 'de' }
];

export const SeriesPage: React.FC = () => {
  const { id: genreIdParam, name: categoryNameParam } = useParams<{ id?: string; name?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State synchronization
  const initialGenre = genreIdParam || searchParams.get('genre') || 'All';
  const initialYear = searchParams.get('year') || 'All';
  const initialRating = searchParams.get('rating') || 'All';
  const initialSort = searchParams.get('sort') || 'popularity.desc';
  const initialLanguage = searchParams.get('lang') || 'All';

  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);

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

  // Load TV genres and Trending TV rail once on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([getTvGenres(), getTrendingTv('day')])
      .then(([genreList, trendingList]) => {
        if (!mounted) return;
        if (genreList) setGenres(genreList);
        if (trendingList) setTrendingSeries(trendingList);
      })
      .catch((err) => console.error('Error fetching initial TV meta:', err));

    return () => {
      mounted = false;
    };
  }, []);

  // Sync state to URL searchParams
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

  // Fetch TV series with active filters
  const fetchTvData = useCallback(
    async (
      targetPage: number = 1,
      append: boolean = false,
      filterOverride?: Partial<TvFilterOptions>
    ) => {
      const currentReqId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
        setErrorMore(false);
      } else {
        setLoading(true);
        setError(false);
      }

      const activeFilters: TvFilterOptions = {
        genreId: filterOverride?.genreId ?? selectedGenre,
        year: filterOverride?.year ?? selectedYear,
        minRating: filterOverride?.minRating ?? selectedRating,
        sortBy: filterOverride?.sortBy ?? sortBy,
        language: filterOverride?.language ?? selectedLanguage,
        page: targetPage
      };

      try {
        const results = await getTvList(activeFilters);

        if (currentReqId !== requestIdRef.current) return;

        if (!results || results.length === 0) {
          if (!append) {
            setSeriesList([]);
          }
          setHasMore(false);
        } else {
          if (append) {
            setSeriesList((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const uniqueIncoming = results.filter((s) => !existingIds.has(s.id));
              return [...prev, ...uniqueIncoming];
            });
          } else {
            setSeriesList(results);
          }
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

  // Trigger fetch when any filter changes
  useEffect(() => {
    setPage(1);
    fetchTvData(1, false);
    updateUrlParams(selectedGenre, selectedYear, selectedRating, sortBy, selectedLanguage);
  }, [selectedGenre, selectedYear, selectedRating, sortBy, selectedLanguage]);

  // Infinite scroll trigger
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTvData(nextPage, true);
  }, [page, loading, loadingMore, hasMore, fetchTvData]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '600px 0px'
  });

  // Reset filters
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
          1. EDITORIAL HEADER
         ================================================== */}
      <header className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
              TELEVISION ARCHIVE
            </span>
            {activeGenreName && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-2 py-0.5">
                {activeGenreName.toUpperCase()}
              </span>
            )}
            {categoryNameParam && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-2 py-0.5">
                {categoryNameParam.toUpperCase()}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-[#8E8E93] tracking-widest uppercase">
            EPISODIC MEDIA DIRECTORY
          </span>
        </div>

        <h1 className="type-display-l text-white tracking-tight uppercase leading-none">
          TV SHOWS
        </h1>
      </header>

      {/* ==================================================
          2. TRENDING TV (DISTINCTIVE RHYTHM BEFORE CONTROLS)
         ================================================== */}
      {trendingSeries.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            label="TRENDING"
            title="TRENDING TV SHOWS"
          />
          <HorizontalRail items={trendingSeries} variant="poster" />
        </section>
      )}

      {/* ==================================================
          3. DISCOVERY CONTROLS BAR
         ================================================== */}
      <section className="bg-[#111114] border border-white/10 p-3 sm:p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E43D3D]" />
            <span className="uppercase font-bold tracking-wider text-white">SERIES DISCOVERY FILTERS</span>
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

          {/* Premiere Year */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8E8E93] block">PREMIERE YEAR</label>
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

          {/* Min Rating */}
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
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Original Language */}
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
          4. ALL TV SHOWS (EXACTLY 6 CARDS PER ROW ON DESKTOP)
         ================================================== */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex items-baseline justify-between">
          <SectionHeader
            label="EXPLORE"
            title={activeGenreName ? `${activeGenreName.toUpperCase()} SERIES` : 'ALL TV SHOWS'}
          />

          {!loading && seriesList.length > 0 && (
            <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
              PAGE {page} • {seriesList.length} SHOWS
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
            title="FAILED TO LOAD TV SHOWS"
            message="Could not connect to the live TV catalog database. Please verify your connection and retry."
            onRetry={() => fetchTvData(1, false)}
          />
        )}

        {/* Empty State */}
        {!loading && !error && seriesList.length === 0 && (
          <EmptyState
            title="NO TV SHOWS FOUND"
            message="No television series match the selected filter combination."
            actionText="RESET FILTERS"
            onAction={handleResetFilters}
          />
        )}

        {/* Dense Responsive Grid (2 Mobile, 4 Tablet, 6 Desktop) */}
        {!loading && !error && seriesList.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {seriesList.map((series) => (
                <MediaCard key={series.id} item={series} variant="poster" />
              ))}
            </div>

            {/* Next Page Skeleton Loading */}
            {loadingMore && (
              <InfiniteLoadingSkeleton count={6} />
            )}

            {/* Next Page Error State with Retry Button */}
            {errorMore && (
              <InfiniteErrorState onRetry={() => fetchTvData(page + 1, true)} />
            )}

            {/* End of content indicator */}
            {!hasMore && seriesList.length > 0 && (
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

export default SeriesPage;
