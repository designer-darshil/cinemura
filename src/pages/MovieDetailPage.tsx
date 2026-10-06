import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Globe, Film, Image as ImageIcon } from 'lucide-react';
import { getMovieDetail, formatCurrency } from '../services/tmdb';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { MediaCard, CastCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { DetailHeroSkeleton, ErrorState } from '../components/StateViews';
import { PhotoLightboxModal } from '../components/PhotoLightboxModal';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openVideoPlayer } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Photo Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchDetail = async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getMovieDetail(slug);
      if (!data) {
        setError(true);
      } else {
        setMovie(data);
      }
    } catch (err) {
      console.error('Failed to load movie detail', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
        <DetailHeroSkeleton />
      </div>
    );
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
  const photos = movie.images && movie.images.length > 0 ? movie.images : (movie.backdrop ? [movie.backdrop] : []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. HERO CONCEPT — IMMERSIVE MAGAZINE COVER
         ================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-8 md:px-12 mx-auto overflow-hidden">
        
        {/* Dominant Backdrop Visual Field */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-60 contrast-110 scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Gradient Vignette & Tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/75 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/60 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </div>

        {/* Top Editorial Nav Row */}
        <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/movie"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>MOVIES CATALOG</span>
          </Link>

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase">
            CINEMURA EDITORIAL PROFILE
          </span>
        </div>

        {/* Hero Main Editorial Content Layout */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-12">
          
          {/* Asymmetric Content Column */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Editorial Label & Meta Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
                MOVIE
              </span>
              {movie.certification && (
                <span className="text-[10px] font-mono font-semibold tracking-widest px-2 py-0.5 border border-white/20 text-[#F2F0EC]">
                  {movie.certification}
                </span>
              )}
              {movie.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 text-xs font-mono text-[#F2F0EC]">
                  <Star className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                  <span className="font-bold text-white">{movie.rating.toFixed(1)}</span>
                  <span className="text-[#8E8E93] text-[10px]">/ 10</span>
                  {movie.voteCount > 0 && (
                    <span className="text-[#8E8E93] text-[10px] border-l border-white/15 pl-1.5 ml-1">
                      {movie.voteCount.toLocaleString()} VOTES
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3 max-w-5xl">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold tracking-tight text-[#F2F0EC] leading-none uppercase">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-[#E43D3D]/90 max-w-3xl leading-snug">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Quick Metadata Line */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-mono text-[#8E8E93] pt-1">
              <span className="text-[#F2F0EC] font-bold">{movie.year}</span>
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

              <button
                type="button"
                onClick={() => scrollToSection('cast-section')}
                className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
              >
                <span>VIEW CAST & CREW</span>
              </button>

              {playableVideos.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToSection('videos-section')}
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
          2. MOVIE INFORMATION — EDITORIAL SPLIT SECTION
         ================================================== */}
      <section className="mt-16 sm:mt-24 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-white/10 pt-12">
          
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

            <p className="text-base sm:text-lg font-light text-[#F2F0EC]/90 leading-relaxed space-y-4">
              {movie.synopsis}
            </p>

            {movie.spokenLanguages && movie.spokenLanguages.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono text-[#8E8E93]">
                <Globe className="w-4 h-4 text-[#E43D3D]" />
                <span>SPOKEN LANGUAGES:</span>
                <span className="text-[#F2F0EC] font-semibold">{movie.spokenLanguages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* RIGHT: COMPACT EDITORIAL SPECIFICATIONS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                TECHNICAL DATA
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC] uppercase">
                DETAILS & SPECIFICATIONS
              </h2>
            </div>

            {/* Compact Rows with Separators */}
            <div className="divide-y divide-white/10 text-xs font-mono">
              
              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">RELEASE DATE</span>
                <span className="text-[#F2F0EC] font-bold">{movie.releaseDate || movie.year}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">RUNTIME</span>
                <span className="text-[#F2F0EC] font-bold">{movie.runtime}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">VOTE RATING</span>
                <span className="text-[#E43D3D] font-bold">★ {movie.rating.toFixed(1)} / 10</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">VOTE COUNT</span>
                <span className="text-[#F2F0EC]">{movie.voteCount.toLocaleString()}</span>
              </div>

              {movie.certification && (
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#8E8E93]">CERTIFICATION</span>
                  <span className="text-[#F2F0EC] border border-white/20 px-2 py-0.5 text-[10px]">
                    {movie.certification}
                  </span>
                </div>
              )}

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">ORIGINAL LANGUAGE</span>
                <span className="text-[#F2F0EC] uppercase font-bold">{movie.language}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">STATUS</span>
                <span className="text-[#E43D3D] font-bold uppercase">{movie.status || 'Released'}</span>
              </div>

              {formattedBudget && (
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#8E8E93]">BUDGET</span>
                  <span className="text-[#F2F0EC]">{formattedBudget}</span>
                </div>
              )}

              {formattedRevenue && (
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#8E8E93]">BOX OFFICE REVENUE</span>
                  <span className="text-[#F2F0EC]">{formattedRevenue}</span>
                </div>
              )}

            </div>
          </div>

        </div>

      </section>

      {/* ==================================================
          3. MOVIE CREATORS & CAST (HIERARCHICAL)
         ================================================== */}
      <section id="cast-section" className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-10 scroll-mt-24">
        
        <SectionHeader
          label="FILM CREDITS"
          title="CAST & CREW"
          description="Key filmmaking visionaries and starring cast ensemble."
        />

        {/* CREW CREDITS (INFORMATIONAL TEXT-LED) */}
        <div className="bg-[#111114] border border-white/10 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
              DIRECTOR
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC]">
              {movie.director}
            </div>
            <p className="text-xs font-mono text-[#8E8E93]">
              Director of Photography & Creative Vision
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
              WRITERS & SCREENPLAY
            </span>
            <div className="text-lg sm:text-xl font-serif font-bold text-[#F2F0EC]">
              {movie.writers.length > 0 ? movie.writers.join(' • ') : 'N/A'}
            </div>
            <p className="text-xs font-mono text-[#8E8E93]">
              Screenplay & Original Story Authors
            </p>
          </div>

        </div>

        {/* CAST CREDITS (VISUAL CARDS) */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase block">
              STARRING CAST ENSEMBLE
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {movie.cast.map(person => (
                <CastCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  character={person.character}
                  image={person.image}
                  slug={person.slug}
                />
              ))}
            </div>
          </div>
        )}

      </section>

      {/* ==================================================
          4. VIDEOS (REAL TMDB VIDEOS SECTION)
         ================================================== */}
      {playableVideos.length > 0 && (
        <section id="videos-section" className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6 scroll-mt-24">
          <SectionHeader
            label="OFFICIAL MEDIA"
            title="VIDEOS"
            description="Trailers, teasers, featurettes, and behind-the-scenes previews."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playableVideos.map((video, idx) => {
              const youtubeThumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;

              return (
                <div
                  key={video.id || idx}
                  onClick={() => openVideoPlayer(playableVideos, idx, movie.title)}
                  className="group/video bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <img
                      src={youtubeThumb}
                      alt={video.name}
                      className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors" />

                    {/* Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-[#E43D3D] text-white flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white pl-0.5" />
                      </div>
                    </div>

                    {/* Video Type Badge & Official Status */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-black/80 text-white border border-white/20">
                        {video.type}
                      </span>
                      {video.official && (
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#E43D3D] text-white">
                          OFFICIAL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className="font-serif font-bold text-sm text-[#F2F0EC] group-hover/video:text-[#E43D3D] transition-colors line-clamp-1">
                      {video.name}
                    </h4>
                    <div className="text-[11px] font-mono text-[#8E8E93]">
                      <span>{video.site}</span> • <span className="uppercase text-[#E43D3D] font-bold">{video.type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          5. PHOTOS (EDITORIAL GALLERY + LIGHTBOX)
         ================================================== */}
      {photos.length > 0 && (
        <section id="photos-section" className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block mb-1">
                VISUAL ARCHIVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase">
                PHOTOS ({photos.length})
              </h2>
            </div>
            <button
              onClick={() => openLightboxAt(0)}
              className="text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] flex items-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-[#E43D3D]" />
              <span>OPEN FULL GALLERY</span>
            </button>
          </div>

          {/* Curated Editorial Layout: 1 Featured Large + Grid of Supporting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Large Featured Photo */}
            <div
              onClick={() => openLightboxAt(0)}
              className="lg:col-span-8 aspect-video bg-[#111114] border border-white/10 overflow-hidden relative group/img cursor-pointer"
            >
              <img
                src={photos[0]}
                alt={`${movie.title} photo 1`}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest bg-black/80 text-[#F2F0EC] px-2.5 py-1 border border-white/10">
                  FEATURED STILL 01
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93] bg-black/80 px-2 py-1 border border-white/10">
                  CLICK TO EXPAND
                </span>
              </div>
            </div>

            {/* Supporting Photos Column */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
              {photos.slice(1, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightboxAt(idx + 1)}
                  className="aspect-video bg-[#111114] border border-white/10 overflow-hidden relative group/img cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`${movie.title} photo ${idx + 2}`}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono tracking-widest bg-black/80 text-[#8E8E93] px-2 py-0.5 border border-white/10">
                    PHOTO 0{idx + 2}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Additional Supporting Stills Horizontal Grid */}
          {photos.length > 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {photos.slice(3, 9).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightboxAt(idx + 3)}
                  className="aspect-video bg-[#111114] border border-white/10 overflow-hidden relative group/img cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`${movie.title} gallery ${idx + 4}`}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover/img:bg-transparent transition-colors" />
                  <span className="absolute bottom-1.5 left-1.5 text-[8px] font-mono bg-black/80 text-[#8E8E93] px-1.5 py-0.5">
                    0{idx + 4}
                  </span>
                </div>
              ))}
            </div>
          )}

        </section>
      )}

      {/* ==================================================
          6. MOVIE COLLECTION / FRANCHISE
         ================================================== */}
      {movie.collection && (
        <section className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6">
          
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
        <section className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-8">
          
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

      {/* Photo Lightbox Modal */}
      <PhotoLightboxModal
        images={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={movie.title}
      />

    </div>
  );
};

export default MovieDetailPage;
