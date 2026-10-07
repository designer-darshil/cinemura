import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, Compass } from 'lucide-react';
import {
  getTrendingMovies,
  getTrendingTv,
  getMovieDetail,
  getTvDetail,
  getMovieCategory,
} from '../services/tmdb';
import { MediaItem, Movie, Series } from '../types';
import { HorizontalRail } from '../components/HorizontalRail';
import { SectionHeader } from '../components/SectionHeader';
import { GenreDiscovery } from '../components/GenreDiscovery';
import { TonightsPickSection } from '../components/TonightsPickSection';
import { useApp } from '../context/AppContext';
import { HomePageSkeleton, ErrorState } from '../components/StateViews';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';

const LAST_HERO_SESSION_KEY = 'cinemura_last_hero_id';

export const HomePage: React.FC = () => {
  const { openVideoPlayer, markAppReady } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const [heroItem, setHeroItem] = useState<Movie | Series | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [criticsPicks, setCriticsPicks] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Signature Cinemura Interactive Spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const loadLiveData = async () => {
    setLoading(true);
    setError(false);
    let isMounted = true;
    try {
      // Parallel fetch of rich cinematic catalog categories
      const [tMovies, tSeries, topRated, nowPlaying, upcoming] = await Promise.all([
        getTrendingMovies('day'),
        getTrendingTv('day'),
        getMovieCategory('top_rated'),
        getMovieCategory('now_playing'),
        getMovieCategory('upcoming'),
      ]);

      const validMovies = tMovies || [];
      const validSeries = tSeries || [];

      // Combine candidates for hero selection
      const combinedCandidates: MediaItem[] = [...validMovies, ...validSeries];

      if (combinedCandidates.length === 0 && !topRated && !nowPlaying) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      // Prioritize valid candidates that have backdrop, title, overview, and rating
      const eligibleCandidates = combinedCandidates.filter(c =>
        c &&
        c.id &&
        c.backdrop &&
        !c.backdrop.includes('placeholder') &&
        c.title &&
        c.synopsis &&
        c.rating !== undefined
      );

      // Prevent selecting the immediate previous hero ID from session on refresh
      const prevHeroId = sessionStorage.getItem(LAST_HERO_SESSION_KEY);
      let candidatePool = eligibleCandidates.filter(c => c.id !== prevHeroId);
      if (candidatePool.length === 0) {
        candidatePool = eligibleCandidates.length > 0 ? eligibleCandidates : combinedCandidates;
      }

      // Randomly select ONE candidate on this fresh page load
      const selectedCandidate = candidatePool.length > 0
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : (validMovies[0] || null);

      // Fetch full detail data for high fidelity metadata & runtime
      let fullHeroDetail: Movie | Series | null = null;
      if (selectedCandidate) {
        try {
          if (selectedCandidate.type === 'movie') {
            fullHeroDetail = await getMovieDetail(selectedCandidate.id);
          } else {
            fullHeroDetail = await getTvDetail(selectedCandidate.id);
          }
        } catch (detailErr) {
          console.warn('Could not fetch full detail for hero candidate, using candidate data', detailErr);
        }

        if (!fullHeroDetail) {
          fullHeroDetail = selectedCandidate;
        }

        // Preload hero backdrop before revealing
        if (fullHeroDetail?.backdrop) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = fullHeroDetail!.backdrop;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve();
          });
        }

        if (fullHeroDetail?.id) {
          sessionStorage.setItem(LAST_HERO_SESSION_KEY, fullHeroDetail.id);
        }
      }

      if (!isMounted) return;

      setHeroItem(fullHeroDetail);
      setTrendingMovies(validMovies);
      setTrendingSeries(validSeries);
      setCriticsPicks(topRated || []);
      setNewReleases(nowPlaying || []);
      setComingSoon(upcoming || []);
    } catch (err) {
      console.error('Failed to load homepage live data', err);
      if (isMounted) setError(true);
    } finally {
      if (isMounted) {
        setLoading(false);
        markAppReady();
      }
    }
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error || !heroItem) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="SERVICE OFFLINE"
          message="Unable to fetch live media catalog. Please check your network connection."
          onRetry={loadLiveData}
        />
      </div>
    );
  }

  // Resolve distinct item for Tonight's Pick
  const editorialCandidateList = [...criticsPicks, ...trendingMovies, ...newReleases];
  const editorialFeatureItem = editorialCandidateList.find(item => item.id !== heroItem.id) || editorialCandidateList[1] || heroItem;

  // Resolve official trailer using prioritized trailer-selection algorithm
  const heroPrimaryVideo = selectPrimaryVideo(heroItem.videos, heroItem.language) || heroItem.primaryVideo || null;
  const heroTrailerLabel = getVideoButtonLabel(heroPrimaryVideo);
  const heroPlayableVideos = sortVideosWithPrimaryFirst(heroItem.videos, heroItem.language);

  // Runtime or season count display
  const heroDurationOrSeasons = heroItem.type === 'movie'
    ? (heroItem.runtime && heroItem.runtime !== 'N/A' ? heroItem.runtime : null)
    : ((heroItem as Series).seasonsCount ? `${(heroItem as Series).seasonsCount} ${(heroItem as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}` : null);

  const scrollToDiscovery = () => {
    const el = document.getElementById('browse-discovery-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-24 pb-24 selection:bg-[#E43D3D] selection:text-white overflow-hidden"
    >
      {/* Signature Cinemura Projection Spotlight Beam */}
      <div className="pointer-events-none fixed inset-0 z-10 cinema-spotlight-radial opacity-60 transition-opacity duration-300" />

      {/* ==================================================
          SECTION 01 — CINEMATIC HERO (REFRESH-DRIVEN)
         ================================================== */}
      <section className="relative min-h-[78vh] lg:min-h-[85vh] flex flex-col justify-end pt-24 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10">
        
        {/* Full-width Cinematic Movie Artwork with Subtle Ambient Movement */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroItem.backdrop}
            alt={heroItem.title}
            className="w-full h-full object-cover opacity-50 filter brightness-90 contrast-110 animate-cinemaDrift"
          />
          
          {/* Deep Dark Gradient Overlays for Contrast & Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/40 to-transparent" />
          
          {/* Subtle Warm Cinema Accent Glow */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E43D3D]/10 rounded-full blur-3xl pointer-events-none animate-cinemaGlow" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
        </div>

        {/* Hero Editorial Content Canvas */}
        <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-9 space-y-5">
            
            {/* Cinematic Kicker Badge Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-label bg-[#E43D3D] text-white px-2.5 py-0.5 font-bold tracking-widest shadow-md">
                CINEMURA EXCLUSIVE
              </span>
              <span className="type-label text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
                {heroItem.type === 'tv' ? 'TELEVISION SERIES' : 'PREMIERE FEATURE'}
              </span>
              {heroItem.certification && (
                <span className="type-label text-[#8E8E93] border border-white/15 px-2 py-0.5">
                  {heroItem.certification}
                </span>
              )}
            </div>

            {/* Massive Editorial Headline with Dramatic Typography */}
            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-white tracking-tight uppercase leading-[0.94] drop-shadow-lg">
              {heroItem.title}
            </h1>

            {/* Cinematic Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-[#8E8E93]">
              <span className="text-white font-semibold">{heroItem.year}</span>
              {heroDurationOrSeasons && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-[#F2F0EC]">{heroDurationOrSeasons}</span>
                </>
              )}
              {heroItem.genres.length > 0 && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-[#F2F0EC] uppercase tracking-wider">{heroItem.genres.slice(0, 3).join(' / ')}</span>
                </>
              )}
              {heroItem.rating > 0 && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1.5 text-[#E43D3D] font-bold">
                    <Star className="w-4 h-4 fill-[#E43D3D]" />
                    {heroItem.rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {/* Short Supporting Copy */}
            {heroItem.synopsis && (
              <p className="type-body text-sm sm:text-base text-[#F2F0EC]/85 max-w-2xl font-light leading-relaxed line-clamp-3">
                {heroItem.synopsis}
              </p>
            )}

            {/* CTAs: Primary "Explore Movies" & Secondary "Watch Trailer" */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                type="button"
                onClick={scrollToDiscovery}
                className="btn-primary px-8 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 shadow-2xl"
              >
                <Compass className="w-4 h-4" />
                <span>EXPLORE MOVIES</span>
              </button>

              {heroPrimaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(
                    heroPlayableVideos.length > 0 ? heroPlayableVideos : [heroPrimaryVideo],
                    0,
                    heroItem.title
                  )}
                  className="btn-secondary px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5"
                >
                  <Play className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                  <span>{heroTrailerLabel || 'WATCH TRAILER'}</span>
                </button>
              )}

              <Link
                to={heroItem.type === 'movie' ? `/movie/${heroItem.id}` : `/tv/${heroItem.id}`}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[#E43D3D] text-xs font-mono font-bold tracking-wider uppercase transition-colors px-2 py-3"
              >
                <span>TITLE ARCHIVE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
              </Link>
            </div>

          </div>
        </div>

      </section>

      {/* Anchor for Smooth Exploration */}
      <div id="browse-discovery-section" className="scroll-mt-20" />

      {/* ==================================================
          SECTION 02 — TRENDING NOW (HORIZONTAL RAIL)
         ================================================== */}
      {trendingMovies.length > 0 && (
        <section id="trending-rail" className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            label="CURATED SPOTLIGHT"
            title="TRENDING NOW"
            viewAllLink="/movie"
            viewAllText="VIEW ALL MOVIES"
          />
          <HorizontalRail items={trendingMovies} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 03 — CRITICS' PICKS (HORIZONTAL RAIL)
         ================================================== */}
      {criticsPicks.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            label="ACCLAIMED CINEMA"
            title="CRITICS' PICKS & MASTERWORKS"
            viewAllLink="/movie"
            viewAllText="EXPLORE ALL PICKS"
          />
          <HorizontalRail items={criticsPicks} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 04 — "TONIGHT'S PICK" DOMINANT FEATURE
         ================================================== */}
      {editorialFeatureItem && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <TonightsPickSection item={editorialFeatureItem} />
        </section>
      )}

      {/* ==================================================
          SECTION 05 — NEW RELEASES (HORIZONTAL RAIL)
         ================================================== */}
      {newReleases.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            label="NOW PLAYING"
            title="NEW RELEASES"
            viewAllLink="/movie"
            viewAllText="VIEW IN AUDITORIUM"
          />
          <HorizontalRail items={newReleases} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 06 — TRENDING TELEVISION (HORIZONTAL RAIL)
         ================================================== */}
      {trendingSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            label="PRESTIGE TELEVISION"
            title="TRENDING SERIES"
            viewAllLink="/tv"
            viewAllText="VIEW ALL SERIES"
          />
          <HorizontalRail items={trendingSeries} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 07 — COMING SOON (HORIZONTAL RAIL)
         ================================================== */}
      {comingSoon.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            label="UPCOMING SCREENINGS"
            title="COMING SOON"
            viewAllLink="/movie"
            viewAllText="VIEW FULL SLATE"
          />
          <HorizontalRail items={comingSoon} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 08 — GENRE DISCOVERY
         ================================================== */}
      <section id="genre-discovery-section" className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        <GenreDiscovery />
      </section>

    </div>
  );
};

export default HomePage;
