import React, { useState, useEffect } from 'react';
import { Play, Compass } from 'lucide-react';
import {
  getTrendingMovies,
  getTrendingTv,
  getMovieDetail,
  getTvDetail,
  getMovieCategory,
} from '../services/tmdb';
import { MediaItem, Movie, Series } from '../types';
import { HeroBanner } from '../components/HeroBanner';
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

  const [heroItem, setHeroItem] = useState<Movie | Series | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [criticsPicks, setCriticsPicks] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadLiveData = async () => {
    setLoading(true);
    setError(false);
    let isMounted = true;
    try {
      // Parallel fetch of catalog categories
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

      // Select ONE candidate on fresh page load
      const selectedCandidate = candidatePool.length > 0
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : (validMovies[0] || null);

      let fullHeroDetail: Movie | Series | null = null;
      if (selectedCandidate) {
        try {
          if (selectedCandidate.type === 'movie') {
            fullHeroDetail = await getMovieDetail(selectedCandidate.id);
          } else {
            fullHeroDetail = await getTvDetail(selectedCandidate.id);
          }
        } catch (detailErr) {
          console.warn('Could not fetch detail for hero candidate', detailErr);
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
          message="Unable to fetch media catalog. Please check your network connection."
          onRetry={loadLiveData}
        />
      </div>
    );
  }

  // Pick distinct item for Tonight's Pick
  const editorialCandidateList = [...criticsPicks, ...trendingMovies, ...newReleases];
  const editorialFeatureItem = editorialCandidateList.find(item => item.id !== heroItem.id) || editorialCandidateList[1] || heroItem;

  // Resolve trailer
  const heroPrimaryVideo = selectPrimaryVideo(heroItem.videos, heroItem.language) || heroItem.primaryVideo || null;
  const heroTrailerLabel = getVideoButtonLabel(heroPrimaryVideo);
  const heroPlayableVideos = sortVideosWithPrimaryFirst(heroItem.videos, heroItem.language);

// Runtime or seasons display
  const scrollToDiscovery = () => {
    const el = document.getElementById('browse-discovery-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-12 sm:space-y-16 lg:space-y-20 pb-24 selection:bg-[#E43D3D] selection:text-white overflow-hidden">
      {/* SECTION 01 — HERO */}
      <HeroBanner
        item={heroItem}
        badgeLabel={heroItem.type === 'movie' ? 'FEATURE FILM' : 'TELEVISION'}
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={scrollToDiscovery}
              className="btn-primary min-h-[40px] px-6 text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Compass className="w-3.5 h-3.5" />
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
                className="btn-secondary min-h-[40px] px-5 text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Play className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                <span>{heroTrailerLabel || 'WATCH TRAILER'}</span>
              </button>
            )}
          </div>
        }
      />

      {/* Anchor for Smooth Exploration */}
      <div id="browse-discovery-section" className="scroll-mt-20" />

      {/* ==================================================
          SECTION 02 — TRENDING NOW
         ================================================== */}
      {trendingMovies.length > 0 && (
        <section id="trending-rail" className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="TRENDING NOW"
            viewAllLink="/movie"
            viewAllText="VIEW ALL"
          />
          <HorizontalRail items={trendingMovies} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 03 — CRITICS' PICKS
         ================================================== */}
      {criticsPicks.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="CRITICS' PICKS"
            viewAllLink="/movie"
            viewAllText="VIEW ALL"
          />
          <HorizontalRail items={criticsPicks} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 04 — TONIGHT'S PICK
         ================================================== */}
      {editorialFeatureItem && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <TonightsPickSection item={editorialFeatureItem} />
        </section>
      )}

      {/* ==================================================
          SECTION 05 — NEW RELEASES
         ================================================== */}
      {newReleases.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="NEW RELEASES"
            viewAllLink="/movie"
            viewAllText="VIEW ALL"
          />
          <HorizontalRail items={newReleases} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 06 — TRENDING SERIES
         ================================================== */}
      {trendingSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="TRENDING SERIES"
            viewAllLink="/tv"
            viewAllText="VIEW ALL"
          />
          <HorizontalRail items={trendingSeries} variant="poster" />
        </section>
      )}

      {/* ==================================================
          SECTION 07 — COMING SOON
         ================================================== */}
      {comingSoon.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            title="COMING SOON"
            viewAllLink="/movie"
            viewAllText="VIEW ALL"
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
