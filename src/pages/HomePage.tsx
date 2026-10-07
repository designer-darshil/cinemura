import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star } from 'lucide-react';
import {
  getTrendingMovies,
  getTrendingTv,
  getMovieDetail,
  getTvDetail,
  getMoviesList,
  getTvList
} from '../services/tmdb';
import { MediaItem, Movie, Series } from '../types';
import { MediaCard } from '../components/MediaCard';
import { HorizontalRail } from '../components/HorizontalRail';
import { SectionHeader } from '../components/SectionHeader';
import { GenreDiscovery } from '../components/GenreDiscovery';
import { useApp } from '../context/AppContext';
import { HomePageSkeleton, ErrorState } from '../components/StateViews';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';

const LAST_HERO_SESSION_KEY = 'cinemura_last_hero_id';

export const HomePage: React.FC = () => {
  const { openVideoPlayer, markAppReady } = useApp();

  const [heroItem, setHeroItem] = useState<Movie | Series | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadLiveData = async () => {
    setLoading(true);
    setError(false);
    let isMounted = true;
    try {
      // 1 & 2. Fetch real TMDb Trending Movies and Trending TV results in parallel
      const [tMovies, tSeries, popMovies, popSeries] = await Promise.all([
        getTrendingMovies('day'),
        getTrendingTv('day'),
        getMoviesList(),
        getTvList()
      ]);

      const validMovies = tMovies || [];
      const validSeries = tSeries || [];

      // 3. Combine both result sets into one candidate collection
      const combinedCandidates: MediaItem[] = [...validMovies, ...validSeries];

      if (combinedCandidates.length === 0 && !popMovies && !popSeries) {
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

      // 4. Randomly select ONE candidate on this fresh page load
      const selectedCandidate = candidatePool.length > 0
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : (validMovies[0] || popMovies?.[0] || null);

      // 5 & 6. Determine whether Movie or TV Show and fetch full detail data
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

        // Fallback to candidate if detail call returned null
        if (!fullHeroDetail) {
          fullHeroDetail = selectedCandidate;
        }

        // Verify required image is preloaded before transition
        if (fullHeroDetail?.backdrop) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = fullHeroDetail!.backdrop;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve(); // proceed gracefully
          });
        }

        // Remember selected hero ID for the session to prevent immediate repeats
        if (fullHeroDetail?.id) {
          sessionStorage.setItem(LAST_HERO_SESSION_KEY, fullHeroDetail.id);
        }
      }

      if (!isMounted) return;

      // 7. Store states; render happens once with full detail
      setHeroItem(fullHeroDetail);
      setTrendingMovies(validMovies);
      setTrendingSeries(validSeries);
      setPopularMovies(popMovies || []);
      setPopularSeries(popSeries || []);
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

  // Pick an editorial feature item distinct from the hero
  const editorialCandidateList = [...trendingMovies, ...trendingSeries, ...popularMovies];
  const editorialFeatureItem = editorialCandidateList.find(item => item.id !== heroItem.id) || editorialCandidateList[1];

  // Resolve official trailer using prioritized trailer-selection algorithm
  const heroPrimaryVideo = selectPrimaryVideo(heroItem.videos, heroItem.language) || heroItem.primaryVideo || null;
  const heroTrailerLabel = getVideoButtonLabel(heroPrimaryVideo);
  const heroPlayableVideos = sortVideosWithPrimaryFirst(heroItem.videos, heroItem.language);

  // Runtime or season count display
  const heroDurationOrSeasons = heroItem.type === 'movie'
    ? (heroItem.runtime && heroItem.runtime !== 'N/A' ? heroItem.runtime : null)
    : ((heroItem as Series).seasonsCount ? `${(heroItem as Series).seasonsCount} ${(heroItem as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}` : null);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-16 lg:space-y-24 pb-16 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          SECTION 01 — DYNAMIC CINEMATIC HERO (REFRESH-DRIVEN)
         ================================================== */}
      <section className="relative min-h-[70vh] lg:min-h-[75vh] flex flex-col justify-end pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10">
        
        {/* Real Backdrop Background Field */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroItem.backdrop}
            alt={heroItem.title}
            className="w-full h-full object-cover opacity-45 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
        </div>

        {/* Hero Content Canvas */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
          <div className="lg:col-span-8 space-y-4">
            
            {/* Type & Certification Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
                FEATURED
              </span>
              <span className="type-label text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
                {heroItem.type === 'tv' ? 'TELEVISION' : 'FEATURE FILM'}
              </span>
              {heroItem.certification && (
                <span className="type-label text-[#8E8E93] border border-white/15 px-1.5 py-0.5">
                  {heroItem.certification}
                </span>
              )}
            </div>

            {/* Real Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight uppercase leading-none">
              {heroItem.title}
            </h1>

            {/* Essential Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93]">
              <span>{heroItem.year}</span>
              {heroDurationOrSeasons && (
                <>
                  <span>•</span>
                  <span className="text-[#F2F0EC]">{heroDurationOrSeasons}</span>
                </>
              )}
              {heroItem.genres.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#F2F0EC] uppercase">{heroItem.genres.slice(0, 3).join(' / ')}</span>
                </>
              )}
              {heroItem.rating > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#E43D3D] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                    {heroItem.rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {/* Synopsis Excerpt */}
            {heroItem.synopsis && (
              <p className="type-body text-sm sm:text-base text-[#F2F0EC]/85 max-w-2xl line-clamp-3 font-light leading-relaxed">
                {heroItem.synopsis}
              </p>
            )}

            {/* Actions: Watch Trailer CTA & Explore Title Link */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {heroPrimaryVideo && (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(
                    heroPlayableVideos.length > 0 ? heroPlayableVideos : [heroPrimaryVideo],
                    0,
                    heroItem.title
                  )}
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{heroTrailerLabel}</span>
                </button>
              )}

              <Link
                to={heroItem.type === 'movie' ? `/movie/${heroItem.id}` : `/tv/${heroItem.id}`}
                className="btn-link inline-flex items-center gap-2 text-white text-sm font-mono font-bold tracking-wider uppercase hover:text-[#E43D3D] transition-colors"
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
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
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
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <MediaCard item={editorialFeatureItem} variant="editorial" />
        </section>
      )}

      {/* ==================================================
          SECTION 05 — POPULAR MOVIES (GRID)
         ================================================== */}
      {popularMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
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
          SECTION 06 — POPULAR TV SHOWS (GRID)
         ================================================== */}
      {popularSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
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
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <GenreDiscovery />
      </section>

    </div>
  );
};
