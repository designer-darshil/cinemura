import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, ArrowRight, Building2, Globe, Bookmark } from 'lucide-react';
import { getTvDetail } from '../services/tmdb';
import { Series } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { MediaCard, PersonCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { SeriesDetailPageSkeleton, ErrorState } from '../components/StateViews';
import { CastCarousel } from '../components/CastCarousel';
import { DetailMediaNav } from '../components/DetailMediaNav';
import { SeriesEpisodesSection } from '../components/SeriesEpisodesSection';
import { MediaVideosSection } from '../components/MediaVideosSection';
import { MediaPhotosSection } from '../components/MediaPhotosSection';
import { AwardsSection } from '../components/AwardsSection';
import { WatchProvidersSection } from '../components/WatchProvidersSection';
import { getTvAwards } from '../services/awardsService';
import { EntityAwardsData } from '../types';

export const SeriesDetailPage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const seriesId = id || slug;
  const { openVideoPlayer, markAppReady, toggleWatchlist, isInWatchlist } = useApp();

  const [series, setSeries] = useState<Series | null>(null);
  const [awards, setAwards] = useState<EntityAwardsData | null>(null);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeIdRef = React.useRef<string | undefined>(seriesId);

  const fetchSeriesDetail = async () => {
    if (!seriesId) return;
    activeIdRef.current = seriesId;
    setLoading(true);
    setError(false);
    setAwardsLoading(true);

    getTvAwards(seriesId)
      .then((res) => {
        if (activeIdRef.current === seriesId) setAwards(res);
      })
      .catch(() => {
        if (activeIdRef.current === seriesId) setAwards(null);
      })
      .finally(() => {
        if (activeIdRef.current === seriesId) setAwardsLoading(false);
      });

    try {
      const data = await getTvDetail(seriesId);
      if (activeIdRef.current !== seriesId) return; // Stale request guard

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
        if (activeIdRef.current !== seriesId) return;
        setSeries(data);
      }
    } catch (err) {
      console.error('Failed to load series detail', err);
      if (activeIdRef.current === seriesId) setError(true);
    } finally {
      if (activeIdRef.current === seriesId) {
        setLoading(false);
        markAppReady();
      }
    }
  };

  useEffect(() => {
    activeIdRef.current = seriesId;
    fetchSeriesDetail();
    window.scrollTo(0, 0);
  }, [seriesId]);

  if (loading) {
    return <SeriesDetailPageSkeleton />;
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="SERIES RECORD UNRESOLVED"
          message="Could not load the requested television series profile from the database."
          onRetry={fetchSeriesDetail}
        />
      </div>
    );
  }

  const relatedSeries = series.recommendations?.length ? series.recommendations : (series.similar || []);

  // Real TMDb media items and prioritized video playlist
  const playableVideos = sortVideosWithPrimaryFirst(series.videos, series.language);
  const primaryVideo = selectPrimaryVideo(series.videos, series.language) || series.primaryVideo || null;
  const primaryVideoLabel = getVideoButtonLabel(primaryVideo);

  // Photos split from real TMDb data
  const backdropImages = series.backdrops && series.backdrops.length > 0
    ? series.backdrops
    : (series.backdrop ? [series.backdrop] : []);
  const posterImages = series.posters && series.posters.length > 0
    ? series.posters
    : (series.poster ? [series.poster] : []);
  const totalPhotosCount = backdropImages.length + posterImages.length;

  // Total real episode count across all seasons
  const totalEpisodesCount = series.totalEpisodes || (series.seasons || []).reduce((acc, s) => acc + (s.episodeCount || 0), 0);

  // Compact sub-navigation anchor items for TV
  const navSections = [
    { id: 'overview-section', label: 'OVERVIEW' },
    ...(series.cast && series.cast.length > 0 ? [{ id: 'cast-section', label: 'CAST', count: series.cast.length }] : []),
    ...(series.seasons && series.seasons.length > 0 ? [{ id: 'episodes-section', label: 'EPISODES', count: totalEpisodesCount }] : []),
    ...(playableVideos.length > 0 ? [{ id: 'videos-section', label: 'VIDEOS', count: playableVideos.length }] : []),
    ...(totalPhotosCount > 0 ? [{ id: 'photos-section', label: 'PHOTOS', count: totalPhotosCount }] : [])
  ];

  const isSaved = series ? isInWatchlist(series.id) : false;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. REDESIGNED EDITORIAL TV SERIES HERO
         ================================================== */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-between pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden bg-[#0B0B0D]">
        {/* Large Cinematic Backdrop Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {series.backdrop ? (
            <img
              src={series.backdrop}
              alt={series.title}
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
              TELEVISION SERIES
            </span>
          </div>

          <Link
            to="/tv"
            className="group flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors uppercase"
          >
            <span>TV SHOWS DIRECTORY</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mid Row: Minimal Editorial Micro-Columns + Asymmetric Metric Block */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto pt-8 pb-4 items-start">
          {/* Left Columns */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-wrap gap-8 sm:gap-14">
            {/* Column 1: SERIES SPECS */}
            <div className="space-y-1.5 min-w-[140px] max-w-[200px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                SERIES SPECS
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#F2F0EC]">
                {series.seasonsCount} {series.seasonsCount === 1 ? 'Season' : 'Seasons'}
              </p>
              {series.totalEpisodes > 0 && (
                <p className="text-[11px] font-mono text-[#8E8E93]">{series.totalEpisodes} Episodes</p>
              )}
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 2: STATUS & RATING */}
            <div className="space-y-1.5 min-w-[140px]">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                STATUS
              </div>
              <p className="text-xs sm:text-sm font-sans text-[#F2F0EC]">
                {series.status || 'Active'}
              </p>
              <div className="flex items-center gap-2">
                {series.year && (
                  <span className="text-[11px] font-mono text-[#8E8E93]">{series.year}</span>
                )}
                {series.certification && (
                  <span className="text-[10px] font-mono tracking-widest px-1 py-0.2 border border-white/20 text-[#8E8E93] uppercase">
                    {series.certification}
                  </span>
                )}
              </div>
              <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
            </div>

            {/* Column 3: GENRES */}
            {series.genres && series.genres.length > 0 && (
              <div className="space-y-1.5 min-w-[140px] max-w-[220px] hidden sm:block">
                <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
                  GENRES
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#F2F0EC] truncate">
                  {series.genres.slice(0, 2).join(' • ')}
                </p>
                {series.tagline && (
                  <p className="text-[11px] font-serif italic text-[#8E8E93] truncate">
                    "{series.tagline}"
                  </p>
                )}
                <div className="w-5 h-[2px] bg-[#E43D3D] mt-2.5" />
              </div>
            )}
          </div>

          {/* Right Asymmetric Metric Block */}
          <div className="lg:col-span-4 xl:col-span-3 lg:pl-8 space-y-1.5">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8E8E93]">
              SEASONS
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display font-light text-white tracking-tight">
                {series.seasonsCount || 1}
              </span>
              {typeof series.rating === 'number' && series.rating > 0 && (
                <span className="text-xs font-mono text-[#8E8E93]">
                  (★ {series.rating.toFixed(1)})
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
              {series.title}
            </h1>

            {/* Restrained Navigation / Playback Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Watch Action */}
              <Link
                to={`/watch/tv/${series.id}?s=1&e=1`}
                className="bg-[#E43D3D] hover:bg-[#c93535] text-white min-h-[44px] px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#E43D3D]/30"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>WATCH S1 E1</span>
              </Link>

              {/* Watch Trailer CTA */}
              {primaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(playableVideos, 0, series.title)}
                  className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                >
                  <Play className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>{primaryVideoLabel}</span>
                </button>
              )}

              {/* Episodes Anchor Button */}
              {series.seasons && series.seasons.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('episodes-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                >
                  <span>EPISODES</span>
                </button>
              )}

              {/* Watchlist Toggle */}
              <button
                type="button"
                onClick={() => toggleWatchlist(series)}
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
              {series.poster ? (
                <img
                  src={series.poster}
                  alt={series.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#8E8E93]">
                  POSTER
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Pagination / Seasons / Navigation Arrows */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono tracking-widest text-[#8E8E93]">
                {series.seasonsCount ? `TV / 0${series.seasonsCount}` : '01 / 01'}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/tv"
                  title="Back to TV Shows"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#episodes-section"
                  title="Episodes"
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
          2. NARRATIVE SYNOPSIS & SPECIFICATIONS
         ================================================== */}
      <section id="overview-section" className="w-full mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
        
        {/* Section Header */}
        <div className="flex flex-col gap-1 border-b border-white/10 pb-4 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
              ARCHIVE DOSSIER & SPECIFICATIONS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F2F0EC] uppercase tracking-tight">
            SERIES OVERVIEW & SPECS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: SYNOPSIS */}
          <div className="lg:col-span-7 space-y-6">
            {series.tagline && (
              <p className="font-serif italic text-lg sm:text-xl text-[#F2F0EC]/80 border-l-2 border-[#E43D3D] pl-4 py-0.5">
                "{series.tagline}"
              </p>
            )}

            <p className="font-sans text-base sm:text-lg font-light text-[#F2F0EC]/90 leading-relaxed">
              {series.synopsis || 'Full series synopsis pending archive update.'}
            </p>

            {series.spokenLanguages && series.spokenLanguages.length > 0 && (
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono text-[#8E8E93]">
                <Globe className="w-3.5 h-3.5 text-[#E43D3D]" />
                <span className="text-[10px] uppercase tracking-wider">SPOKEN LANGUAGES:</span>
                <span className="text-[#F2F0EC] font-semibold">{series.spokenLanguages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* RIGHT: ARCHITECTURAL SERIES SPECIFICATIONS MATRIX */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/10 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 bg-[#17171B]/50 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-bold">
                SPECIFICATIONS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E43D3D]" />
            </div>

            <div className="divide-y divide-white/10 text-xs font-mono">
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">FIRST AIR DATE</span>
                <span className="text-[#F2F0EC] font-semibold">{series.firstAirDate || 'N/A'}</span>
              </div>

              {series.lastAirDate && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">LAST AIR DATE</span>
                  <span className="text-[#F2F0EC] font-semibold">{series.lastAirDate}</span>
                </div>
              )}

              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">STATUS</span>
                <span className="text-[#E43D3D] font-bold uppercase">{series.status || 'Ended'}</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">EPISODE RUNTIME</span>
                <span className="text-[#F2F0EC] font-semibold">{series.episodeRuntime || 'N/A'}</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">SEASONS COUNT</span>
                <span className="text-[#F2F0EC] font-semibold">{series.seasonsCount} Seasons</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">TOTAL EPISODES</span>
                <span className="text-[#F2F0EC] font-semibold">{series.totalEpisodes} Episodes</span>
              </div>

              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">ORIGINAL LANGUAGE</span>
                <span className="text-[#F2F0EC] font-semibold uppercase">{series.language}</span>
              </div>

              {series.certification && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">CONTENT RATING</span>
                  <span className="text-[#F2F0EC] border border-white/20 px-2 py-0.5 text-[10px] font-bold">
                    {series.certification}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* ==================================================
          3. TV CREATORS (SHOWRUNNERS)
         ================================================== */}
      {((series.creatorDetails && series.creatorDetails.length > 0) || (series.creators && series.creators.length > 0)) && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="SHOWRUNNERS & CREATORS"
            title="SERIES ARCHITECTS"
            description="Visionary showrunners and creators behind this television production."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {series.creatorDetails && series.creatorDetails.length > 0 ? (
              series.creatorDetails.map(creator => (
                <PersonCard
                  key={creator.id}
                  id={creator.id}
                  name={creator.name}
                  role="Creator"
                  portrait={creator.portrait}
                  slug={creator.slug}
                />
              ))
            ) : (
              series.creators.map((name, idx) => (
                <div key={idx} className="bg-[#111114] border border-white/10 p-4 space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-[#E43D3D] uppercase font-bold block">CREATOR</span>
                  <h4 className="font-sans font-bold text-sm text-[#F2F0EC] truncate">{name}</h4>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ==================================================
          4. CAST — HORIZONTAL CONTENT CAROUSEL
         ================================================== */}
      {series.cast && series.cast.length > 0 && (
        <section id="cast-section" className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
          <CastCarousel cast={series.cast} title="CAST" />
        </section>
      )}

      {/* ==================================================
          5. TV EPISODES — SEASON SELECTOR & DENSE GRID
         ================================================== */}
      {series.seasons && series.seasons.length > 0 && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SeriesEpisodesSection
            id="episodes-section"
            seriesId={series.id}
            seriesTitle={series.title}
            seasons={series.seasons}
          />
        </div>
      )}

      {/* ==================================================
          6. TV VIDEOS — REAL TMDB MEDIA GRID + TYPE FILTER
         ================================================== */}
      {playableVideos.length > 0 && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaVideosSection id="videos-section" videos={playableVideos} parentTitle={series.title} />
        </div>
      )}

      {/* ==================================================
          7. TV PHOTOS — BACKDROPS & POSTERS GALLERIES
         ================================================== */}
      {totalPhotosCount > 0 && (
        <div className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaPhotosSection
            id="photos-section"
            backdrops={backdropImages}
            posters={posterImages}
            parentTitle={series.title}
          />
        </div>
      )}

      {/* ==================================================
          8. NETWORKS & PRODUCTION COMPANIES
         ================================================== */}
      {((series.networks && series.networks.length > 0) || (series.productionCompanies && series.productionCompanies.length > 0)) && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="STUDIO DOSSIER"
            title="NETWORKS & PRODUCTION"
            description="Broadcast networks and production entities financing the title."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {(series.networks || series.productionCompanies || []).map((company, idx) => (
              <div
                key={company.id || idx}
                className="bg-[#111114] border border-white/10 p-4 flex flex-col justify-between items-center text-center gap-3"
              >
                {company.logo ? (
                  <div className="h-10 w-full flex items-center justify-center p-1">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-h-full max-w-full object-contain filter invert contrast-200 opacity-80"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-full flex items-center justify-center text-[#8E8E93]">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xs font-mono text-[#F2F0EC] line-clamp-1">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          WHERE TO WATCH — REAL TMDB / JUSTWATCH PROVIDERS
         ================================================== */}
      {series.watchProviders && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <WatchProvidersSection watchProviders={series.watchProviders} />
        </div>
      )}

      {/* ==================================================
          AWARDS — REAL AUTHORIZED DATA ONLY (HIDDEN IF UNAVAILABLE)
         ================================================== */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <AwardsSection awards={awards} loading={awardsLoading} />
      </div>

      {/* ==================================================
          9. RELATED TV SHOWS
         ================================================== */}
      {relatedSeries.length > 0 && (
        <section className="w-full mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
          <SectionHeader
            label="RECOMMENDATIONS"
            title="MORE LIKE THIS"
            description="Television series sharing narrative depth and style."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedSeries.slice(0, 6).map(item => (
              <MediaCard key={item.id} item={item} variant="poster" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default SeriesDetailPage;
