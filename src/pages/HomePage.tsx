import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star } from 'lucide-react';
import { getTrendingMedia, getMoviesList, getTvList } from '../services/tmdb';
import { MediaItem, Movie, Series } from '../types';
import { MediaCard } from '../components/MediaCard';
import { HorizontalRail } from '../components/HorizontalRail';
import { SectionHeader } from '../components/SectionHeader';
import { GenreDiscovery } from '../components/GenreDiscovery';
import { useApp } from '../context/AppContext';
import { DetailHeroSkeleton, ErrorState } from '../components/StateViews';

export const HomePage: React.FC = () => {
  const { openTrailer } = useApp();

  const [trendingMedia, setTrendingMedia] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadLiveData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [trending, movies, series] = await Promise.all([
        getTrendingMedia(),
        getMoviesList(),
        getTvList()
      ]);

      if (!trending && !movies && !series) {
        setError(true);
      } else {
        setTrendingMedia(trending || []);
        setPopularMovies(movies || []);
        setPopularSeries(series || []);
      }
    } catch (err) {
      console.error('Failed to load homepage live data', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  const activeHero = trendingMedia[0] || popularMovies[0];
  const editorialFeatureItem = trendingMedia[3] || popularMovies[1];

  const trendingMovies = trendingMedia.filter(m => m.type === 'movie');
  const trendingSeries = trendingMedia.filter(m => m.type === 'tv');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 max-w-site mx-auto">
        <DetailHeroSkeleton />
      </div>
    );
  }

  if (error || !activeHero) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 max-w-site mx-auto">
        <ErrorState
          title="SERVICE OFFLINE"
          message="Unable to fetch live media catalog. Please check your network connection."
          onRetry={loadLiveData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-24 pb-16">
      
      {/* ==================================================
          SECTION 01 — REIMAGINED COMPACT CINEMATIC HERO (~75vh)
         ================================================== */}
      <section className="relative min-h-[70vh] lg:min-h-[75vh] flex flex-col justify-end pt-20 pb-8 px-4 sm:px-8 max-w-site mx-auto overflow-hidden border-b border-white/10">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero.backdrop}
            alt={activeHero.title}
            className="w-full h-full object-cover opacity-40 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/75 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5">
                FEATURED
              </span>
              <span className="type-label text-[#929298]">
                {activeHero.type === 'tv' ? 'TELEVISION' : 'MOVIE'}
              </span>
            </div>

            <h1 className="type-display-l text-white leading-none">
              {activeHero.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-[#929298]">
              <span>{activeHero.year}</span>
              <span>•</span>
              <span className="text-[#F2F0EC]">{activeHero.genres.slice(0, 2).join(' / ')}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#E43D3D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                {activeHero.rating.toFixed(1)}
              </span>
            </div>

            <p className="type-body text-sm text-[#F2F0EC]/80 max-w-lg line-clamp-2 font-light">
              {activeHero.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {activeHero.trailerUrl && (
                <button
                  onClick={() => openTrailer(activeHero.trailerUrl!, activeHero.title)}
                  className="btn-primary h-10 px-5 text-[10px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>WATCH TRAILER</span>
                </button>
              )}

              <Link
                to={activeHero.type === 'movie' ? `/movie/${activeHero.id}` : `/tv/${activeHero.id}`}
                className="btn-link text-xs"
              >
                <span>EXPLORE TITLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ==================================================
          SECTION 02 — TRENDING MOVIES (HORIZONTAL RAIL)
         ================================================== */}
      {trendingMovies.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8">
          <SectionHeader
            label="TRENDING"
            title="TRENDING MOVIES"
            viewAllLink="/movie"
            viewAllText="VIEW ALL MOVIES"
          />
          <HorizontalRail items={trendingMovies} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 03 — TRENDING TV SHOWS (HORIZONTAL RAIL)
         ================================================== */}
      {trendingSeries.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8">
          <SectionHeader
            label="TRENDING"
            title="TRENDING TV SHOWS"
            viewAllLink="/tv"
            viewAllText="VIEW ALL TV SHOWS"
          />
          <HorizontalRail items={trendingSeries} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 04 — EDITORIAL FEATURE CARD
         ================================================== */}
      {editorialFeatureItem && (
        <section className="max-w-site mx-auto px-4 sm:px-8">
          <MediaCard item={editorialFeatureItem} variant="editorial" />
        </section>
      )}

      {/* ==================================================
          SECTION 05 — POPULAR MOVIES (DENSER 5-6 COLUMNS GRID)
         ================================================== */}
      {popularMovies.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="DISCOVERY"
            title="POPULAR MOVIES"
            viewAllLink="/movie"
            viewAllText="VIEW ALL MOVIES"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularMovies.slice(0, 12).map(movie => (
              <MediaCard key={movie.id} item={movie} variant="poster" />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 06 — POPULAR TV SHOWS (DENSER 5-6 COLUMNS GRID)
         ================================================== */}
      {popularSeries.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="DISCOVERY"
            title="POPULAR TV SHOWS"
            viewAllLink="/tv"
            viewAllText="VIEW ALL TV SHOWS"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularSeries.slice(0, 12).map(series => (
              <MediaCard key={series.id} item={series} variant="poster" />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 07 — GENRE DISCOVERY
         ================================================== */}
      <section className="max-w-site mx-auto px-4 sm:px-8">
        <GenreDiscovery />
      </section>

    </div>
  );
};
