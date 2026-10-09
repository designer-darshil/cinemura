import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import { useWatchlist } from '../context/WatchlistContext';
import { HomePageSkeleton, ErrorState } from '../components/StateViews';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { editorialCategories } from '../content/categories';
import { editorialArticles } from '../content/editorial';
import { catalogMetrics, platformSteps, platformFeatures } from '../content/about';
import { Seo } from '../seo/Seo';

const LAST_HERO_SESSION_KEY = 'cinemura_last_hero_id';

export const HomePage: React.FC = () => {
  const { openVideoPlayer, markAppReady } = useApp();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [heroItem, setHeroItem] = useState<Movie | Series | null>(null);
  const [heroStripCandidates, setHeroStripCandidates] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [switchingHero, setSwitchingHero] = useState(false);

  // Trending rail scroll container refs
  const trendingRailRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTrendingScroll = () => {
    if (!trendingRailRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trendingRailRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollTrending = (direction: 'left' | 'right') => {
    if (!trendingRailRef.current) return;
    const scrollAmount = Math.max(trendingRailRef.current.clientWidth * 0.75, 300);
    trendingRailRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const loadLiveData = async () => {
    setLoading(true);
    setError(false);
    let isMounted = true;
    try {
      // 1. Fetch live TMDB Trending Movies, Trending TV, Popular Movies, Popular TV in parallel
      const [tMovies, tSeries, popMovies, popSeries] = await Promise.all([
        getTrendingMovies('day'),
        getTrendingTv('day'),
        getMoviesList(),
        getTvList()
      ]);

      const validMovies = tMovies || [];
      const validSeries = tSeries || [];

      // Combine both result sets for hero candidate pool
      const combinedCandidates: MediaItem[] = [...validMovies, ...validSeries];

      if (combinedCandidates.length === 0 && !popMovies && !popSeries) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      // Filter candidates with valid backdrops, synopses and ratings
      const eligibleCandidates = combinedCandidates.filter(c =>
        c &&
        c.id &&
        c.backdrop &&
        !c.backdrop.includes('placeholder') &&
        c.title &&
        c.synopsis &&
        c.rating !== undefined
      );

      // Session-based hero memory to avoid repeating immediately on refresh
      const prevHeroId = sessionStorage.getItem(LAST_HERO_SESSION_KEY);
      let candidatePool = eligibleCandidates.filter(c => String(c.id) !== prevHeroId);
      if (candidatePool.length === 0) {
        candidatePool = eligibleCandidates.length > 0 ? eligibleCandidates : combinedCandidates;
      }

      const initialSelected = candidatePool.length > 0
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : (validMovies[0] || popMovies?.[0] || null);

      // Save top 5 candidates for the interactive featured strip
      const stripItems = eligibleCandidates.slice(0, 5);

      // Fetch full details for the selected hero
      let fullHeroDetail: Movie | Series | null = null;
      if (initialSelected) {
        try {
          if (initialSelected.type === 'movie') {
            fullHeroDetail = await getMovieDetail(initialSelected.id);
          } else {
            fullHeroDetail = await getTvDetail(initialSelected.id);
          }
        } catch (detailErr) {
          console.warn('Could not fetch full detail for hero, using candidate summary', detailErr);
        }

        if (!fullHeroDetail) {
          fullHeroDetail = initialSelected;
        }

        if (fullHeroDetail?.backdrop) {
          await new Promise<void>((resolve) => {
            const preloader = new Image();
            preloader.src = fullHeroDetail!.backdrop;
            preloader.onload = () => resolve();
            preloader.onerror = () => resolve();
          });
        }

        if (fullHeroDetail?.id) {
          sessionStorage.setItem(LAST_HERO_SESSION_KEY, String(fullHeroDetail.id));
        }
      }

      if (!isMounted) return;

      setHeroItem(fullHeroDetail);
      setHeroStripCandidates(stripItems.length > 0 ? stripItems : [fullHeroDetail!]);
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

  // Handler to switch hero immediately from the featured strip without navigating
  const selectHeroFromStrip = async (candidate: MediaItem) => {
    if (!candidate || candidate.id === heroItem?.id) return;
    setSwitchingHero(true);
    try {
      let detail: Movie | Series | null = null;
      if (candidate.type === 'movie') {
        detail = await getMovieDetail(candidate.id);
      } else {
        detail = await getTvDetail(candidate.id);
      }
      setHeroItem(detail || candidate);
    } catch {
      setHeroItem(candidate);
    } finally {
      setSwitchingHero(false);
    }
  };

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error || !heroItem) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-16 px-4 sm:px-8 mx-auto">
        <ErrorState
          title="SERVICE OFFLINE"
          message="Unable to fetch live media catalog from The Movie Database. Please check your network connection."
          onRetry={loadLiveData}
        />
      </div>
    );
  }

  // Primary trailer video resolution
  const heroPrimaryVideo = selectPrimaryVideo(heroItem.videos, heroItem.language) || heroItem.primaryVideo || null;
  const heroTrailerLabel = getVideoButtonLabel(heroPrimaryVideo);
  const heroPlayableVideos = sortVideosWithPrimaryFirst(heroItem.videos, heroItem.language);

  const heroDurationOrSeasons = heroItem.type === 'movie'
    ? (heroItem.runtime && heroItem.runtime !== 'N/A' ? heroItem.runtime : null)
    : ((heroItem as Series).seasonsCount ? `${(heroItem as Series).seasonsCount} ${(heroItem as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}` : null);

  const isHeroSaved = isInWatchlist(String(heroItem.id));

  // Combined trending rail list
  const trendingRailItems = [...trendingMovies.slice(0, 10), ...trendingSeries.slice(0, 10)];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] space-y-20 lg:space-y-28 pb-24 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Discover Movies & Series"
        description="Discover movies. Explore series. Find your next obsession. A premium cinematic entertainment discovery platform."
        image={heroItem.backdrop}
      />

      {/* ==================================================
          SECTION 01 — DYNAMIC CINEMATIC HERO WITH SELECTABLE STRIP
         ================================================== */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex flex-col justify-end pt-24 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10">
        
        {/* Dynamic Backdrop */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${switchingHero ? 'opacity-30' : 'opacity-100'}`}>
          <img
            src={heroItem.backdrop}
            alt={heroItem.title}
            className="w-full h-full object-cover filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
        </div>

        {/* Hero Content Canvas */}
        <div className="relative z-10 w-full space-y-8 pb-4">
          <div className="max-w-3xl space-y-4">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
                FEATURED SPOTLIGHT
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

            {/* Title */}
            <h1 className="type-display-xl text-white tracking-tight uppercase leading-[0.92]">
              {heroItem.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93]">
              <span className="text-[#F2F0EC] font-bold">{heroItem.year}</span>
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

            {/* Actions: Play Trailer, Explore Title, Watchlist */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center gap-2 transition-all"
              >
                <span>VIEW DETAILS</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
              </Link>

              <button
                type="button"
                onClick={() => toggleWatchlist(heroItem)}
                className={`px-5 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all border ${
                  isHeroSaved
                    ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                    : 'bg-transparent hover:bg-white/5 border-white/20 text-[#8E8E93] hover:text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isHeroSaved ? 'fill-white' : ''}`} />
                <span>{isHeroSaved ? 'IN WATCHLIST' : 'WATCHLIST'}</span>
              </button>
            </div>
          </div>

          {/* Selectable Featured-Title Strip (Updates Hero Without Navigating) */}
          {heroStripCandidates.length > 1 && (
            <div className="pt-6 border-t border-white/10">
              <span className="type-label text-[11px] text-[#8E8E93] block mb-2 font-bold tracking-wider">
                FEATURED SELECTION STRIP • CLICK TO PREVIEW
              </span>
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
                {heroStripCandidates.map((c) => {
                  const isSelected = String(c.id) === String(heroItem.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectHeroFromStrip(c)}
                      className={`flex-shrink-0 flex items-center gap-3 p-2 border transition-all text-left ${
                        isSelected
                          ? 'border-[#E43D3D] bg-[#17171B]'
                          : 'border-white/10 bg-[#111114]/80 hover:border-white/25 hover:bg-[#17171B]'
                      }`}
                    >
                      <img
                        src={c.backdrop || c.poster}
                        alt={c.title}
                        className="w-12 h-8 object-cover rounded-none flex-shrink-0"
                      />
                      <div className="pr-2 max-w-[140px] truncate">
                        <p className={`text-xs font-display font-bold uppercase truncate ${isSelected ? 'text-[#E43D3D]' : 'text-white'}`}>
                          {c.title}
                        </p>
                        <p className="text-[10px] font-mono text-[#8E8E93]">
                          {c.year} • {c.type === 'movie' ? 'FILM' : 'TV'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ==================================================
          SECTION 02 — TRENDING RAIL WITH VISIBLE ORDINALS & SCROLL CONTROLS
         ================================================== */}
      {trendingRailItems.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <span className="type-label text-[#E43D3D] block font-bold">01 • LIVE RANKINGS</span>
              <h2 className="type-h2 text-2xl sm:text-3xl text-white uppercase tracking-tight">
                TOP TRENDING WORLDWIDE
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrending('left')}
                disabled={!canScrollLeft}
                className={`p-2 border border-white/10 text-white transition-all ${
                  canScrollLeft ? 'hover:bg-[#E43D3D] hover:border-[#E43D3D]' : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Scroll trending left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrending('right')}
                disabled={!canScrollRight}
                className={`p-2 border border-white/10 text-white transition-all ${
                  canScrollRight ? 'hover:bg-[#E43D3D] hover:border-[#E43D3D]' : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Scroll trending right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scroll-Snap Rail with Visible Ordinal Numbers */}
          <div
            ref={trendingRailRef}
            onScroll={checkTrendingScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
          >
            {trendingRailItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[150px] sm:w-[180px] md:w-[210px] snap-start relative group/railcard"
              >
                {/* Visible Ordinal Number */}
                <div className="absolute -top-3 -left-2 z-20 font-display font-black text-3xl sm:text-4xl text-[#E43D3D] drop-shadow-md select-none pointer-events-none">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <MediaCard item={item} variant="poster" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 03 — DISCOVERY CATEGORIES (EDITORIAL TILES)
         ================================================== */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="border-b border-white/10 pb-4 flex items-end justify-between">
          <div>
            <span className="type-label text-[#E43D3D] block font-bold">02 • GENRE CURATION</span>
            <h2 className="type-h2 text-2xl sm:text-3xl text-white uppercase tracking-tight">
              DISCOVERY CATEGORIES
            </h2>
          </div>
          <Link to="/discover" className="btn-link text-xs uppercase hidden sm:inline-flex items-center gap-1.5">
            <span>ALL GENRES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {editorialCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/movies?genre=${cat.tmdbMovieGenreId}`}
              className="group relative h-48 sm:h-56 bg-[#111114] border border-white/10 hover:border-[#E43D3D] overflow-hidden transition-all duration-300 block p-6 flex flex-col justify-between"
            >
              {/* Category Background Photography */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover filter brightness-50 contrast-110 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/60 to-transparent" />
              </div>

              {/* Category Header */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="type-label text-[10px] text-white/80 bg-white/10 px-2 py-0.5 border border-white/10">
                  {cat.tagline}
                </span>
                <ArrowRight className="w-4 h-4 text-[#E43D3D] transform group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Category Name & Description */}
              <div className="relative z-10 space-y-1">
                <h3 className="type-h2 text-2xl sm:text-3xl text-white group-hover:text-[#E43D3D] transition-colors uppercase leading-none">
                  {cat.name}
                </h3>
                <p className="text-xs font-light text-[#8E8E93] line-clamp-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 04 — STORY / ABOUT SPLIT
         ================================================== */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/10 bg-[#111114] p-8 sm:p-12">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="type-label text-[#E43D3D] block font-bold">03 • OUR PHILOSOPHY</span>
            <h2 className="type-display-l text-white uppercase leading-[0.95]">
              CULTIVATING THE ART OF <br />
              <span className="text-[#E43D3D]">CINEMATIC DISCOVERY</span>
            </h2>
            <p className="type-body text-base text-[#8E8E93] leading-relaxed max-w-xl font-light">
              We built Cinemura for those who regard cinema not as disposable entertainment, but as a transformative art form. Zero noisy algorithms, zero intrusive ads, and zero fabricated ratings—just canonical film information designed with editorial grace.
            </p>
            <div className="pt-2">
              <Link to="/about" className="btn-primary text-xs inline-flex items-center gap-2">
                <span>OUR MISSION & VALUES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] bg-[#141418] border border-white/10 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop"
              alt="Classic cinema hall"
              loading="lazy"
              className="w-full h-full object-cover filter brightness-80 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60" />
          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 05 — FEATURE GRID (PLATFORM CAPABILITIES)
         ================================================== */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="type-label text-[#E43D3D] block font-bold">04 • PLATFORM ESSENTIALS</span>
          <h2 className="type-h2 text-2xl sm:text-3xl text-white uppercase tracking-tight">
            PLATFORM CAPABILITIES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {platformFeatures.map((feat, idx) => (
            <div key={idx} className="bg-[#111114] border border-white/10 p-6 space-y-3 hover:border-[#E43D3D] transition-colors">
              <span className="type-label text-[10px] text-[#E43D3D] bg-white/5 border border-white/10 px-2 py-0.5">
                {feat.tag}
              </span>
              <h4 className="type-h3 text-lg text-white uppercase leading-tight">{feat.title}</h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 06 — CATALOG METRICS (BARLOW CONDENSED NUMBERS)
         ================================================== */}
      <section className="bg-[#111114] border-y border-white/10 py-16">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {catalogMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-2 border-l-2 border-[#E43D3D] pl-4 sm:pl-6">
                <span className="font-display font-extrabold text-5xl sm:text-7xl text-white tracking-tight block leading-none">
                  {metric.value}
                </span>
                <span className="type-label text-xs text-[#E43D3D] block font-bold">
                  {metric.label}
                </span>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 07 — HOW IT WORKS (FOUR NUMBERED STEPS)
         ================================================== */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="type-label text-[#E43D3D] block font-bold">05 • ARCHITECTURE</span>
          <h2 className="type-h2 text-2xl sm:text-3xl text-white uppercase tracking-tight">
            HOW CINEMURA WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformSteps.map((step) => (
            <div key={step.step} className="bg-[#111114] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-display font-black text-4xl text-[#E43D3D] block">
                  {step.step}
                </span>
                <h4 className="type-h3 text-xl text-white uppercase">{step.title}</h4>
                <span className="type-label text-[10px] text-[#8E8E93] block">{step.subtitle}</span>
                <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
              <div className="aspect-[16/9] bg-[#141418] border border-white/10 overflow-hidden mt-2">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  className="w-full h-full object-cover filter brightness-75 contrast-105"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 08 — EDITORIAL PREVIEW (JOURNAL HIGHLIGHTS)
         ================================================== */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="border-b border-white/10 pb-4 flex items-end justify-between">
          <div>
            <span className="type-label text-[#E43D3D] block font-bold">06 • FILM ESSAYS</span>
            <h2 className="type-h2 text-2xl sm:text-3xl text-white uppercase tracking-tight">
              FROM THE EDITORIAL JOURNAL
            </h2>
          </div>
          <Link to="/editorial" className="btn-link text-xs uppercase hidden sm:inline-flex items-center gap-1.5">
            <span>VIEW ALL ESSAYS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {editorialArticles.slice(0, 3).map((article) => (
            <article
              key={article.slug}
              className="group flex flex-col justify-between bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 overflow-hidden"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#141418]">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="type-label bg-[#0B0B0D]/80 backdrop-blur-sm border border-white/10 text-white px-2 py-0.5 text-[11px]">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                    <span>{article.publishedDate}</span>
                    <span>•</span>
                    <span className="text-[#E43D3D]">{article.readTime}</span>
                  </div>

                  <Link to={`/editorial/${article.slug}`}>
                    <h3 className="type-h3 text-xl text-white group-hover:text-[#E43D3D] transition-colors leading-snug">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="type-body text-xs sm:text-sm text-[#8E8E93] line-clamp-3">
                    {article.dek}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
                <span className="text-xs text-[#8E8E93] pt-4">{article.author.name}</span>
                <Link
                  to={`/editorial/${article.slug}`}
                  className="btn-link text-xs pt-4 flex items-center gap-1.5"
                >
                  <span>READ ESSAY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 09 — POPULAR MOVIES & TV CATALOG SECTIONS
         ================================================== */}
      {popularMovies.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="07 • DISCOVERY"
            title="POPULAR MOVIES"
            viewAllLink="/movies"
            viewAllText="VIEW ALL MOVIES"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularMovies.slice(0, 12).map(movie => (
              <MediaCard key={movie.id} item={movie} variant="poster" />
            ))}
          </div>
        </section>
      )}

      {popularSeries.length > 0 && (
        <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-6">
          <SectionHeader
            label="08 • DISCOVERY"
            title="POPULAR TELEVISION SERIES"
            viewAllLink="/series"
            viewAllText="VIEW ALL SERIES"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularSeries.slice(0, 12).map(series => (
              <MediaCard key={series.id} item={series} variant="poster" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
