import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Grid, List as ListIcon, RotateCcw } from 'lucide-react';
import { getTvList, getTvGenres, getTrendingMedia, GenreItem } from '../services/tmdb';
import { Series, MediaItem } from '../types';
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

export const SeriesPage: React.FC = () => {
  const { id: genreIdParam, name: categoryNameParam } = useParams<{ id?: string; name?: string }>();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(genreIdParam || 'All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (genreIdParam) {
      setSelectedGenre(genreIdParam);
    }
  }, [genreIdParam]);

  // Load initial catalog data & trending TV rail
  const fetchSeries = async (targetPage: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
      setErrorMore(false);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      const [tvData, genreData, trendingData] = await Promise.all([
        getTvList(selectedGenre !== 'All' ? selectedGenre : undefined, sortBy, targetPage),
        genres.length === 0 ? getTvGenres() : Promise.resolve(genres),
        targetPage === 1 && trendingSeries.length === 0 ? getTrendingMedia() : Promise.resolve(null)
      ]);

      if (!tvData || tvData.length === 0) {
        if (!append) setError(true);
        setHasMore(false);
      } else {
        if (append) {
          setSeriesList(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = tvData.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setSeriesList(tvData);
        }
        setHasMore(tvData.length >= 10);
        
        if (genres.length === 0 && genreData) {
          setGenres(genreData);
        }

        if (trendingData) {
          const tvTrending = trendingData.filter(item => item.type === 'tv');
          setTrendingSeries(tvTrending);
        }
      }
    } catch (err) {
      console.error('Failed to load TV series', err);
      if (append) {
        setErrorMore(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchSeries(1, false);
  }, [selectedGenre, sortBy]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSeries(nextPage, true);
  }, [page, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore
  });

  // Client-side filtering for search, year, and rating thresholds
  const filteredSeries = seriesList.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesYear = true;
    if (selectedYear !== 'All') {
      if (selectedYear === '2020s') matchesYear = series.year >= 2020;
      else if (selectedYear === '2010s') matchesYear = series.year >= 2010 && series.year < 2020;
      else if (selectedYear === '2000s') matchesYear = series.year >= 2000 && series.year < 2010;
      else matchesYear = series.year === parseInt(selectedYear);
    }

    const matchesRating = series.rating >= minRating;

    return matchesSearch && matchesYear && matchesRating;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedYear('All');
    setMinRating(0);
    setSortBy('popularity.desc');
  };

  // Determine current active section title and subtitle context
  const activeGenreName = genres.find(g => g.id.toString() === selectedGenre)?.name;
  const pageTitle = categoryNameParam 
    ? `TV SHOWS — ${categoryNameParam.toUpperCase()}`
    : activeGenreName 
    ? `TV SHOWS — ${activeGenreName.toUpperCase()}`
    : 'TV SHOWS';

  const pageSubtitle = categoryNameParam || activeGenreName
    ? `Explore curated television series in the ${activeGenreName || categoryNameParam} catalog.`
    : 'Explore series, seasons and stories worth getting into.';

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 mx-auto space-y-12">
      
      {/* ==================================================
          SECTION 01 — EDITORIAL INTRO HEADER
         ================================================== */}
      <section className="space-y-6 border-b border-white/10 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5">
              PRESTIGE TELEVISION
            </span>
            <span className="type-label text-[#929298] font-mono">
              LIVE TMDB ARCHIVE
            </span>
          </div>

          <h1 className="type-display-l text-white">
            {pageTitle}
          </h1>

          <p className="type-body-l max-w-2xl font-light text-[#929298]">
            {pageSubtitle}
          </p>
        </div>

        {/* Compact Discovery Control Bar */}
        <div className="bg-[#111114] border border-white/10 p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E43D3D]" />
              <input
                type="text"
                placeholder="Search TV shows by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0B0D] border border-white/15 focus:border-[#E43D3D] text-xs text-white pl-9 pr-4 py-2 outline-none font-mono"
              />
            </div>

            {/* Controls & View Mode */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              
              {/* Year Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="type-label text-[#929298]">YEAR:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#0B0B0D] border border-white/15 text-white text-xs px-2.5 py-1.5 outline-none focus:border-[#E43D3D] font-mono"
                >
                  <option value="All">ALL YEARS</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2020s">2020s</option>
                  <option value="2010s">2010s</option>
                  <option value="2000s">2000s</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="type-label text-[#929298]">RATING:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="bg-[#0B0B0D] border border-white/15 text-white text-xs px-2.5 py-1.5 outline-none focus:border-[#E43D3D] font-mono"
                >
                  <option value="0">ALL RATINGS</option>
                  <option value="8">8.0+ RATED</option>
                  <option value="7">7.0+ RATED</option>
                  <option value="6">6.0+ RATED</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="type-label text-[#929298]">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0B0B0D] border border-white/15 text-white text-xs px-3 py-1.5 outline-none focus:border-[#E43D3D] font-mono"
                >
                  <option value="popularity.desc">MOST POPULAR</option>
                  <option value="vote_average.desc">HIGHEST RATED</option>
                  <option value="first_air_date.desc">NEWEST AIR DATE</option>
                  <option value="name.asc">TITLE A-Z</option>
                </select>
              </div>

              {/* Grid / List View Toggles */}
              <div className="flex items-center gap-1 border border-white/15 p-1 bg-[#0B0B0D]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 transition-colors ${viewMode === 'grid' ? 'bg-[#E43D3D] text-white' : 'text-[#929298] hover:text-white'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 transition-colors ${viewMode === 'list' ? 'bg-[#E43D3D] text-white' : 'text-[#929298] hover:text-white'}`}
                  aria-label="List view"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* Genre Strip */}
          {genres.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="type-label text-[#929298] mr-2">GENRE:</span>
                <button
                  onClick={() => setSelectedGenre('All')}
                  className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                    selectedGenre === 'All'
                      ? 'bg-[#E43D3D] text-white'
                      : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
                  }`}
                >
                  ALL
                </button>
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id.toString())}
                    className={`text-xs px-2.5 py-0.5 font-bold uppercase transition-all ${
                      selectedGenre === genre.id.toString()
                        ? 'bg-[#E43D3D] text-white'
                        : 'bg-[#0B0B0D] text-[#929298] hover:text-white border border-white/10'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              <button
                onClick={resetFilters}
                className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase text-[#929298] hover:text-[#E43D3D] text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          SECTION 02 — TRENDING TV (CURATED EDITORIAL RAIL)
         ================================================== */}
      {trendingSeries.length > 0 && !selectedGenre && !searchTerm && (
        <section className="space-y-4">
          <SectionHeader
            label="CURATED"
            title="TRENDING TV"
            description="Broadcast series and streaming hits trending across global audiences."
          />
          <HorizontalRail items={trendingSeries} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 03 — DENSE 6-COLUMN DESKTOP CATALOG GRID
         ================================================== */}
      {loading ? (
        <CardGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="UNABLE TO LOAD TV SHOWS"
          message="Could not connect to live television catalog database."
          onRetry={() => fetchSeries(1, false)}
        />
      ) : filteredSeries.length === 0 ? (
        <EmptyState
          variant={searchTerm ? 'search' : 'genre'}
          onAction={resetFilters}
        />
      ) : (
        <section className="space-y-6 pt-4">
          <SectionHeader
            label="DISCOVERY"
            title={selectedGenre !== 'All' ? `CATALOG — ${activeGenreName || 'GENRE'}` : "ALL TV SHOWS"}
            description={`Displaying ${filteredSeries.length} live television titles from the archive.`}
          />

          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }>
            {filteredSeries.map(series => (
              <MediaCard key={series.id} item={series} variant={viewMode === 'grid' ? 'poster' : 'horizontal'} />
            ))}
          </div>

          {/* Sentinel Element for Infinite Preloading (~2nd last row) */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {loadingMore && <InfiniteLoadingSkeleton count={6} />}

          {errorMore && (
            <InfiniteErrorState onRetry={() => fetchSeries(page, true)} />
          )}

          {!hasMore && seriesList.length > 0 && (
            <EndOfContentState />
          )}
        </section>
      )}

    </div>
  );
};
