import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Globe, Film } from 'lucide-react';
import { getMovieDetail, formatCurrency } from '../services/tmdb';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { MediaCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { MovieDetailPageSkeleton, ErrorState } from '../components/StateViews';
import { CastCarousel } from '../components/CastCarousel';
import { DetailMediaNav } from '../components/DetailMediaNav';
import { MediaVideosSection } from '../components/MediaVideosSection';
import { MediaPhotosSection } from '../components/MediaPhotosSection';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openVideoPlayer } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeSlugRef = React.useRef<string | undefined>(slug);

  const fetchDetail = async () => {
    if (!slug) return;
    activeSlugRef.current = slug;
    setLoading(true);
    setError(false);
    try {
      const data = await getMovieDetail(slug);
      if (activeSlugRef.current !== slug) return; // Stale request guard

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
        if (activeSlugRef.current !== slug) return;
        setMovie(data);
      }
    } catch (err) {
      console.error('Failed to load movie detail', err);
      if (activeSlugRef.current === slug) setError(true);
    } finally {
      if (activeSlugRef.current === slug) setLoading(false);
    }
  };

  useEffect(() => {
    activeSlugRef.current = slug;
    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. HERO CONCEPT — IMMERSIVE MAGAZINE COVER
         ================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden">
        
        {/* Dominant Backdrop Visual Field */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-60 contrast-110 scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Gradient Vignette & Tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </div>

        {/* Top Header / Breadcrumb Row */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/movie"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>FEATURE FILMS ARCHIVE</span>
          </Link>

          <div className="flex items-center gap-3">
            {movie.certification && (
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 border border-white/20 text-[#F2F0EC] uppercase">
                {movie.certification}
              </span>
            )}
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#8E8E93] uppercase">
              {movie.status || 'RELEASED'}
            </span>
          </div>
        </div>

        {/* Hero Bottom Canvas: Title & High-Level Metadata */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-20">
          
          <div className="lg:col-span-9 space-y-5">
            
            {/* Tagline or Editorial Kicker */}
            {movie.tagline && (
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
                "{movie.tagline}"
              </p>
            )}

            {/* Movie Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
              {movie.title}
            </h1>

            {/* Fast-Scannable Spec Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-mono text-[#8E8E93]">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Star className="w-4 h-4 fill-[#E43D3D] text-[#E43D3D]" />
                {movie.rating.toFixed(1)}
                <span className="text-[#8E8E93] font-normal text-[11px]">({movie.voteCount.toLocaleString()} votes)</span>
              </span>
              <span>•</span>
              <span className="text-[#F2F0EC]">{movie.year}</span>
              <span>•</span>
              <span className="text-[#F2F0EC]">{movie.runtime}</span>
              <span>•</span>
              <span className="text-[#F2F0EC] uppercase">{movie.genres.join(' / ')}</span>
              {movie.director !== 'N/A' && (
                <>
                  <span>•</span>
                  <span className="text-[#8E8E93]">DIR. <strong className="text-[#F2F0EC] font-normal">{movie.director}</strong></span>
                </>
              )}
            </div>

            {/* Short Overview Excerpt */}
            <p className="text-sm sm:text-base font-light text-[#F2F0EC]/85 max-w-3xl line-clamp-3 leading-relaxed">
              {movie.synopsis}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              {primaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(playableVideos, 0, movie.title)}
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-7 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{primaryVideoLabel}</span>
                </button>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('cast-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  <span>VIEW CAST & CREW</span>
                </button>
              )}

              {playableVideos.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#8E8E93] hover:text-white px-5 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  <Film className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>VIDEOS ({playableVideos.length})</span>
                </button>
              )}
            </div>

          </div>

          {/* Secondary Visual Anchor: Docked Poster Card */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="relative group/anchor aspect-[2/3] max-w-[260px] ml-auto border border-white/20 bg-[#111114] shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover group-hover/anchor:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider flex justify-between">
                <span>POSTER ANCHOR</span>
                <span className="text-[#E43D3D] font-bold">{movie.language}</span>
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
          2. MOVIE INFORMATION — EDITORIAL OVERVIEW
         ================================================== */}
      <section id="overview-section" className="w-full mt-12 sm:mt-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-white/10 pt-10">
          
          {/* LEFT: ABOUT THE MOVIE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                NARRATIVE OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase">
                ABOUT THE MOVIE
              </h2>
            </div>

            <p className="font-sans text-base sm:text-lg leading-relaxed text-[#F2F0EC]/90 font-light">
              {movie.synopsis || 'Full editorial narrative overview pending release archive update.'}
            </p>

            {/* Keywords */}
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase block">
                  THEMATIC INDEX
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-mono bg-white/5 border border-white/10 text-[#8E8E93] hover:text-white transition-colors"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: COMPACT KEY PRODUCTION FACTS */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                FACTSHEET
              </span>
              <h3 className="text-lg font-serif font-bold text-[#F2F0EC] uppercase">
                PRODUCTION DOSSIER
              </h3>
            </div>

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
                    <span className="font-bold bg-[#E43D3D] text-white px-1 py-0.2 rounded-xs text-[10px]">IMDb</span>
                    <span>DOSSIER</span>
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
        <section id="cast-section" className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
          <CastCarousel cast={movie.cast} title="CAST" />
        </section>
      )}

      {/* ==================================================
          4. VIDEOS — REAL TMDB MEDIA GRID + TYPE FILTER
         ================================================== */}
      {playableVideos.length > 0 && (
        <div className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaVideosSection id="videos-section" videos={playableVideos} parentTitle={movie.title} />
        </div>
      )}

      {/* ==================================================
          5. PHOTOS — BACKDROPS & POSTERS GALLERIES
         ================================================== */}
      {totalPhotosCount > 0 && (
        <div className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
        <section className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          
          <SectionHeader
            label="FRANCHISE ARCHIVE"
            title="PART OF THE COLLECTION"
          />

          <div className="relative bg-[#111114] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
            {movie.collection.backdrop && (
              <img
                src={movie.collection.backdrop}
                alt={movie.collection.name}
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-50"
              />
            )}
            <div className="relative z-10 w-24 h-36 flex-shrink-0 bg-black border border-white/20">
              <img
                src={movie.collection.poster || movie.poster}
                alt={movie.collection.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                OFFICIAL TMDb COLLECTION
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC]">
                {movie.collection.name}
              </h3>
              <p className="text-xs font-mono text-[#8E8E93]">
                Explore related titles within this cinematic universe.
              </p>
            </div>
          </div>

        </section>
      )}

      {/* ==================================================
          7. RELATED MOVIES
         ================================================== */}
      {relatedMovies.length > 0 && (
        <section className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
          
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
