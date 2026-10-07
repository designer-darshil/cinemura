import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Building2, Globe, Bookmark } from 'lucide-react';
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
          1. TV SERIES HERO — INFORMATION-DENSE IMMERSIVE COVER
         ================================================== */}
      <section className="relative min-h-[85vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden">
        
        {/* Backdrop Background Field */}
        <div className="absolute inset-0 z-0">
          <img
            src={series.backdrop}
            alt={series.title}
            className="w-full h-full object-cover filter brightness-50 contrast-110 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </div>

        {/* Top Nav Row */}
        <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/tv"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>TV SHOWS</span>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-10">
          
          <div className="lg:col-span-9 space-y-6">
            
            {/* Editorial Type Label & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
                TV SERIES
              </span>
              {series.status && (
                <span className="text-[10px] font-mono font-semibold tracking-widest px-2.5 py-1 bg-white/10 text-white border border-white/20 uppercase">
                  {series.status}
                </span>
              )}
              {series.certification && (
                <span className="text-[10px] font-mono font-semibold tracking-widest px-2 py-0.5 border border-white/20 text-[#F2F0EC]">
                  {series.certification}
                </span>
              )}
              {series.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 text-xs font-mono text-[#F2F0EC]">
                  <Star className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                  <span className="font-bold text-white">{series.rating.toFixed(1)}</span>
                  <span className="text-[#8E8E93] text-[10px]">/ 10</span>
                </div>
              )}
            </div>

            {/* Tagline if available */}
            {series.tagline && (
              <p className="text-xs sm:text-sm font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold">
                "{series.tagline}"
              </p>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#F2F0EC] tracking-tight uppercase leading-none">
              {series.title}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-mono text-[#8E8E93]">
              <span className="text-[#F2F0EC] font-semibold">{series.year}</span>
              {series.seasonsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#F2F0EC] font-semibold">{series.seasonsCount} {series.seasonsCount === 1 ? 'Season' : 'Seasons'}</span>
                </>
              )}
              {series.totalEpisodes > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#F2F0EC]">{series.totalEpisodes} Episodes</span>
                </>
              )}
              {series.genres.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#F2F0EC] uppercase">{series.genres.join(' / ')}</span>
                </>
              )}
            </div>

            {/* Overview Excerpt */}
            <p className="text-sm sm:text-base font-light text-[#F2F0EC]/85 max-w-3xl line-clamp-3 leading-relaxed">
              {series.synopsis}
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {primaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(playableVideos, 0, series.title)}
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-7 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{primaryVideoLabel}</span>
                </button>
              )}

              {/* Watchlist Toggle CTA */}
              <button
                type="button"
                onClick={() => toggleWatchlist(series)}
                className={`px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 transition-all border ${
                  isSaved
                    ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                    : 'bg-transparent hover:bg-white/5 border-white/20 text-[#F2F0EC]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'SAVED TO WATCHLIST' : 'ADD TO WATCHLIST'}</span>
              </button>

              {series.seasons && series.seasons.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('episodes-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  <span>VIEW EPISODES</span>
                </button>
              )}

              {series.cast && series.cast.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('cast-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#8E8E93] hover:text-white px-5 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  <span>CAST ({series.cast.length})</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Poster Anchor */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="relative aspect-[2/3] max-w-[260px] ml-auto border border-white/20 bg-[#111114] shadow-2xl overflow-hidden group/poster">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono text-[#8E8E93] uppercase flex justify-between">
                <span>POSTER ART</span>
                <span className="text-[#E43D3D] font-bold">{series.language}</span>
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
      <section id="overview-section" className="w-full mt-12 sm:mt-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-white/10 pt-10">
          
          {/* LEFT: SYNOPSIS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                NARRATIVE ARC
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase">
                SERIES OVERVIEW
              </h2>
            </div>

            <p className="text-base sm:text-lg font-light text-[#F2F0EC]/90 leading-relaxed">
              {series.synopsis}
            </p>

            {series.spokenLanguages && series.spokenLanguages.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono text-[#8E8E93]">
                <Globe className="w-4 h-4 text-[#E43D3D]" />
                <span>SPOKEN LANGUAGES:</span>
                <span className="text-[#F2F0EC] font-semibold">{series.spokenLanguages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* RIGHT: SERIES SPECIFICATIONS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                PRODUCTION DATA
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC] uppercase">
                SERIES DETAILS
              </h2>
            </div>

            <div className="divide-y divide-white/10 text-xs font-mono">
              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">FIRST AIR DATE</span>
                <span className="text-[#F2F0EC] font-bold">{series.firstAirDate || 'N/A'}</span>
              </div>

              {series.lastAirDate && (
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#8E8E93]">LAST AIR DATE</span>
                  <span className="text-[#F2F0EC] font-bold">{series.lastAirDate}</span>
                </div>
              )}

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">STATUS</span>
                <span className="text-[#E43D3D] font-bold uppercase">{series.status || 'Ended'}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">EPISODE RUNTIME</span>
                <span className="text-[#F2F0EC] font-bold">{series.episodeRuntime || 'N/A'}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">SEASONS COUNT</span>
                <span className="text-[#F2F0EC] font-bold">{series.seasonsCount} Seasons</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">TOTAL EPISODES</span>
                <span className="text-[#F2F0EC] font-bold">{series.totalEpisodes} Episodes</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-[#8E8E93]">ORIGINAL LANGUAGE</span>
                <span className="text-[#F2F0EC] font-bold uppercase">{series.language}</span>
              </div>

              {series.certification && (
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#8E8E93]">CONTENT RATING</span>
                  <span className="text-[#F2F0EC] border border-white/20 px-2 py-0.5 text-[10px]">
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
        <section className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="SHOWRUNNERS"
            title="CREATED BY"
            description="Visionary showrunners and series creators behind the show."
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
                  <span className="text-[9px] font-mono tracking-widest text-[#E43D3D] uppercase block">CREATOR</span>
                  <h4 className="font-serif font-bold text-sm text-[#F2F0EC] truncate">{name}</h4>
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
        <section id="cast-section" className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-28">
          <CastCarousel cast={series.cast} title="CAST" />
        </section>
      )}

      {/* ==================================================
          5. TV EPISODES — SEASON SELECTOR & DENSE GRID
         ================================================== */}
      {series.seasons && series.seasons.length > 0 && (
        <div className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
        <div className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaVideosSection id="videos-section" videos={playableVideos} parentTitle={series.title} />
        </div>
      )}

      {/* ==================================================
          7. TV PHOTOS — BACKDROPS & POSTERS GALLERIES
         ================================================== */}
      {totalPhotosCount > 0 && (
        <div className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
        <section className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
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
        <section className="w-full mt-20 sm:mt-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
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
