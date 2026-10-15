import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, ArrowRight, Globe, Bookmark } from 'lucide-react';
import { getMovieDetail, formatCurrency } from '../services/tmdb';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { isMoviePlayable } from '../utils/cinesrc';
import { MediaCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { MovieDetailPageSkeleton, ErrorState } from '../components/StateViews';
import { CastCarousel } from '../components/CastCarousel';
import { DetailMediaNav } from '../components/DetailMediaNav';
import { MediaVideosSection } from '../components/MediaVideosSection';
import { MediaPhotosSection } from '../components/MediaPhotosSection';
import { AwardsSection } from '../components/AwardsSection';
import { WatchProvidersSection } from '../components/WatchProvidersSection';
import { getMovieAwards } from '../services/awardsService';
import { EntityAwardsData } from '../types';

export const MovieDetailPage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const movieId = id || slug;
  const { openVideoPlayer, markAppReady, toggleWatchlist, isInWatchlist } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [awards, setAwards] = useState<EntityAwardsData | null>(null);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeIdRef = React.useRef<string | undefined>(movieId);

  const fetchDetail = async () => {
    if (!movieId) return;
    activeIdRef.current = movieId;
    setLoading(true);
    setError(false);
    setAwardsLoading(true);

    getMovieAwards(movieId)
      .then((res) => {
        if (activeIdRef.current === movieId) setAwards(res);
      })
      .catch(() => {
        if (activeIdRef.current === movieId) setAwards(null);
      })
      .finally(() => {
        if (activeIdRef.current === movieId) setAwardsLoading(false);
      });

    try {
      const data = await getMovieDetail(movieId);
      if (activeIdRef.current !== movieId) return; // Stale request guard

      if (!data) {
        setError(true);
      } else {
        // Pre-verify hero backdrop is loaded before transitioning
        if (data.backdrop) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = data.backdrop;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve();
          });
        }
        if (activeIdRef.current !== movieId) return;
        setMovie(data);
      }
    } catch (err) {
      console.error('Failed to load movie detail', err);
      if (activeIdRef.current === movieId) setError(true);
    } finally {
      if (activeIdRef.current === movieId) {
        setLoading(false);
        markAppReady();
      }
    }
  };

  useEffect(() => {
    activeIdRef.current = movieId;
    fetchDetail();
    window.scrollTo(0, 0);
  }, [movieId]);

  if (loading) {
    return <MovieDetailPageSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="MOVIE PROFILE UNRESOLVED"
          message="Could not load the requested feature film profile from the database."
          onRetry={fetchDetail}
        />
      </div>
    );
  }

  const formattedBudget = formatCurrency(movie.budget);
  const formattedRevenue = formatCurrency(movie.revenue);
  const relatedMovies = movie.recommendations?.length ? movie.recommendations : (movie.similar || []);
  
  // Real TMDb media items and prioritized video playlist
  const playableVideos = sortVideosWithPrimaryFirst(movie.videos, movie.language);
  const primaryVideo = selectPrimaryVideo(movie.videos, movie.language) || movie.primaryVideo || null;
  const primaryVideoLabel = getVideoButtonLabel(primaryVideo);

  // Photos split from real TMDb data
  const backdropImages = movie.backdrops && movie.backdrops.length > 0
    ? movie.backdrops
    : (movie.backdrop ? [movie.backdrop] : []);
  const posterImages = movie.posters && movie.posters.length > 0
    ? movie.posters
    : (movie.poster ? [movie.poster] : []);
  const totalPhotosCount = backdropImages.length + posterImages.length;

  // Compact sub-navigation anchor items
  const navSections = [
    { id: 'overview-section', label: 'OVERVIEW' },
    ...(movie.cast && movie.cast.length > 0 ? [{ id: 'cast-section', label: 'CAST', count: movie.cast.length }] : []),
    ...(playableVideos.length > 0 ? [{ id: 'videos-section', label: 'VIDEOS', count: playableVideos.length }] : []),
    ...(totalPhotosCount > 0 ? [{ id: 'photos-section', label: 'PHOTOS', count: totalPhotosCount }] : [])
  ];

  const isSaved = isInWatchlist(movie.id);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. REDESIGNED EDITORIAL CINEMATIC HERO
         ================================================== */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-between pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden bg-[#0B0B0D]">
        {/* Large Cinematic Backdrop Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {movie.backdrop ? (
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover object-[60%_35%] filter grayscale contrast-125 opacity-35 sm:opacity-50 lg:opacity-70 scale-100 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-[#111114]" />
          )}
          {/* Filmic Multi-Directional Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 via-45% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/60 via-20% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0D]/90 via-transparent to-transparent h-24" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
        </div>

        {/* Thin Structural Grid Lines (Asymmetric Architectural Grid) */}
        <div className="absolute top-[46%] left-0 right-0 h-[1px] bg-white/[0.08] pointer-events-none hidden lg:block" />
        <div className="absolute top-0 bottom-0 right-[22%] xl:right-[18%] w-[1px] bg-white/[0.08] pointer-events-none hidden lg:block" />

        {/* Top Kicker Row with Red Line Accent */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[2px] bg-[#E43D3D] inline-block" />
            <span className="text-[10px] sm:text-xs font-mono font-medium tracking-[0.25em] text-[#8E8E93] uppercase">
              THE ART OF CINEMA
            </span>
          </div>

          <Link
            to="/movies"
            className="group flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase"
          >
            <span>MOVIES DIRECTORY</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mid Row: Minimal Editorial Micro-Columns + Asymmetric Metric Block */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto pt-8 pb-4 items-start">
          {/* Left Columns */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-wrap gap-8 sm:gap-14">
            {/* Column 1: DIRECTED BY */}
            {movie.director && movie.director !== 'N/A' && (
              <div className="space-y-1.5 min-w-[140px] max-w-[200px]">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  DIRECTED BY
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] truncate">
                  {movie.director}
                </p>
                {movie.runtime && movie.runtime !== 'N/A' && (
                  <p className="text-[11px] font-mono text-[#8E8E93]">{movie.runtime}</p>
                )}
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}

            {/* Column 2: RELEASE */}
            <div className="space-y-1.5 min-w-[140px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                RELEASE
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#F2F0EC]">
                {movie.year || 'Unknown'}
              </p>
              {movie.certification && (
                <p className="text-[11px] font-mono text-[#8E8E93] uppercase">
                  CERT. {movie.certification}
                </p>
              )}
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 3: GENRES */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="space-y-1.5 min-w-[140px] max-w-[220px] hidden sm:block">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  GENRES
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] truncate">
                  {movie.genres.slice(0, 2).join(' • ')}
                </p>
                {movie.tagline && (
                  <p className="text-[11px] font-serif italic text-[#8E8E93] truncate">
                    "{movie.tagline}"
                  </p>
                )}
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}
          </div>

          {/* Right Asymmetric Metric Block */}
          <div className="lg:col-span-4 xl:col-span-3 lg:pl-8 space-y-1.5">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
              SCORE
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display font-light text-white tracking-tight">
                {typeof movie.rating === 'number' && movie.rating > 0 ? movie.rating.toFixed(1) : '—'}
              </span>
              {movie.voteCount > 0 && (
                <span className="text-xs font-mono text-[#8E8E93]">
                  ({movie.voteCount.toLocaleString()} votes)
                </span>
              )}
            </div>
            <div className="w-6 h-[2px] bg-[#E43D3D] mt-2.5" />
          </div>
        </div>

        {/* Bottom Row: Oversized Title, Actions & Thumbnail Card */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
          {/* Oversized Title & Navigation Actions */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold text-[#F2F0EC] tracking-tight leading-[0.88] uppercase">
              {movie.title}
            </h1>

            {/* Restrained Navigation / Playback Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Watch Action */}
              {isMoviePlayable(movie) && (
                <Link
                  to={`/watch/movie/${movie.id}`}
                  className="bg-[#E43D3D] hover:bg-[#c93535] text-white min-h-[44px] px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#E43D3D]/30"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>WATCH MOVIE</span>
                </Link>
              )}

              {/* Watch Trailer CTA */}
              {primaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(playableVideos, 0, movie.title)}
                  className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                >
                  <Play className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>{primaryVideoLabel}</span>
                </button>
              )}

              {/* Watchlist Toggle */}
              <button
                type="button"
                onClick={() => toggleWatchlist(movie)}
                aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                  isSaved
                    ? 'bg-[#E43D3D] border-[#E43D3D] text-white'
                    : 'border-white/20 hover:border-white/50 text-[#8E8E93] hover:text-white bg-[#0B0B0D]/50 backdrop-blur-sm'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Bottom Anchor: Poster Artwork Thumbnail & Numeric Index */}
          <div className="flex items-end gap-5 lg:ml-auto">
            {/* Small Artwork Thumbnail */}
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 border border-white/15 bg-[#111114] shadow-2xl overflow-hidden flex-shrink-0 group">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#8E8E93]">
                  POSTER
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Pagination / Year / Navigation Arrows */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono tracking-widest text-[#8E8E93]">
                {movie.year ? `FILM / ${movie.year}` : '01 / 01'}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/movies"
                  title="Back to Movies"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#overview-section"
                  title="Overview"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          COMPACT DETAIL MEDIA SUB-NAV
         ================================================== */}
      <DetailMediaNav sections={navSections} />

      {/* ==================================================
          2. MOVIE INFORMATION — OVERVIEW
         ================================================== */}
      <section id="overview-section" className="w-full mt-10 sm:mt-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-t border-white/5 pt-8">
          
          {/* LEFT: ABOUT THE MOVIE */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-[#F2F0EC] uppercase tracking-wide">
              ABOUT THE MOVIE
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#F2F0EC]/90 font-light">
              {movie.synopsis || 'Full narrative overview pending archive update.'}
            </p>

            {/* Keywords */}
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {movie.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs font-mono bg-white/5 text-[#8E8E93]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: COMPACT KEY PRODUCTION FACTS */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/5 p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase font-semibold">
              SPECIFICATIONS
            </h3>

            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs font-mono">
              <div>
                <dt className="text-[#8E8E93] uppercase">STATUS</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{movie.status || 'Released'}</dd>
              </div>

              <div>
                <dt className="text-[#8E8E93] uppercase">ORIGINAL AUDIO</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{movie.language}</dd>
              </div>

              <div>
                <dt className="text-[#8E8E93] uppercase">PREMIERE DATE</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{movie.releaseDate}</dd>
              </div>

              <div>
                <dt className="text-[#8E8E93] uppercase">RUNTIME</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{movie.runtime}</dd>
              </div>

              <div>
                <dt className="text-[#8E8E93] uppercase">PRODUCTION BUDGET</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{formattedBudget}</dd>
              </div>

              <div>
                <dt className="text-[#8E8E93] uppercase">WORLDWIDE GROSS</dt>
                <dd className="text-[#F2F0EC] font-semibold mt-0.5">{formattedRevenue}</dd>
              </div>
            </dl>

            {/* External Links */}
            {(movie.homepage || movie.imdbId) && (
              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>HOMEPAGE</span>
                  </a>
                )}
                {movie.imdbId && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
                  >
                    <span className="font-bold bg-[#E43D3D] text-white px-1.5 py-0.5 text-[10px]">IMDb</span>
                    <span>VIEW ON IMDB</span>
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

      </section>

      {/* ==================================================
          3. CAST — HORIZONTAL CONTENT CAROUSEL
         ================================================== */}
      {movie.cast && movie.cast.length > 0 && (
        <section id="cast-section" className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-24">
          <CastCarousel cast={movie.cast} title="CAST" />
        </section>
      )}

      {/* ==================================================
          4. VIDEOS — REAL TMDB MEDIA GRID + TYPE FILTER
         ================================================== */}
      {playableVideos.length > 0 && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaVideosSection id="videos-section" videos={playableVideos} parentTitle={movie.title} />
        </div>
      )}

      {/* ==================================================
          5. PHOTOS — BACKDROPS & POSTERS GALLERIES
         ================================================== */}
      {totalPhotosCount > 0 && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaPhotosSection
            id="photos-section"
            backdrops={backdropImages}
            posters={posterImages}
            parentTitle={movie.title}
          />
        </div>
      )}

      {/* ==================================================
          6. MOVIE COLLECTION / FRANCHISE
         ================================================== */}
      {movie.collection && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-4">
          
          <SectionHeader
            title="COLLECTION"
          />

          <div className="relative bg-[#111114] border border-white/5 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
            {movie.collection.backdrop && (
              <img
                src={movie.collection.backdrop}
                alt={movie.collection.name}
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-50"
              />
            )}
            <div className="relative z-10 w-24 h-36 flex-shrink-0 bg-black border border-white/10">
              <img
                src={movie.collection.poster || movie.poster}
                alt={movie.collection.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-[#F2F0EC] uppercase">
                {movie.collection.name}
              </h3>
              {movie.collection.overview && (
                <p className="text-xs font-mono text-[#8E8E93] max-w-2xl line-clamp-3">
                  {movie.collection.overview}
                </p>
              )}
            </div>
          </div>

          {/* All Collection Titles using shared Movie card component */}
          {movie.collection.parts && movie.collection.parts.length > 0 && (
            <div className="space-y-3 pt-4">
              <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold block">
                TITLES IN THIS COLLECTION ({movie.collection.parts.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {movie.collection.parts.map(part => (
                  <MediaCard key={part.id} item={part} variant="poster" />
                ))}
              </div>
            </div>
          )}

        </section>
      )}

      {/* ==================================================
          WHERE TO WATCH — REAL TMDB / JUSTWATCH PROVIDERS
         ================================================== */}
      {movie.watchProviders && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <WatchProvidersSection watchProviders={movie.watchProviders} />
        </div>
      )}

      {/* ==================================================
          AWARDS — REAL AUTHORIZED DATA ONLY (HIDDEN IF UNAVAILABLE)
         ================================================== */}
      <div className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <AwardsSection awards={awards} loading={awardsLoading} />
      </div>

      {/* ==================================================
          7. RELATED MOVIES
         ================================================== */}
      {relatedMovies.length > 0 && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
          
          <SectionHeader
            label="RECOMMENDATIONS"
            title="MORE LIKE THIS"
            description="Curated feature films sharing thematic tone and style."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedMovies.slice(0, 6).map(item => (
              <MediaCard key={item.id} item={item} variant="poster" />
            ))}
          </div>

        </section>
      )}

    </div>
  );
};

export default MovieDetailPage;
