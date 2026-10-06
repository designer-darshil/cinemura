import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Tv, Building2, Layers, Globe, Film, Image as ImageIcon } from 'lucide-react';
import { getTvDetail, getTvSeasonDetail } from '../services/tmdb';
import { Series, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { MediaCard, CastCard, PersonCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { DetailHeroSkeleton, ErrorState } from '../components/StateViews';
import { PhotoLightboxModal } from '../components/PhotoLightboxModal';

export const SeriesDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openTrailer } = useApp();

  const [series, setSeries] = useState<Series | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [error, setError] = useState(false);

  // Photo Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchSeriesDetail = async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getTvDetail(slug);
      if (!data) {
        setError(true);
      } else {
        setSeries(data);
        const firstSeason = data.seasons && data.seasons.length > 0 ? data.seasons[0].seasonNumber : 1;
        setSelectedSeasonNumber(firstSeason);
        loadSeasonEpisodes(data.id, firstSeason);
      }
    } catch (err) {
      console.error('Failed to load series detail', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonEpisodes = async (tvId: string, seasonNum: number) => {
    setSeasonLoading(true);
    try {
      const seasonData = await getTvSeasonDetail(tvId, seasonNum);
      if (seasonData && seasonData.episodes) {
        setEpisodes(seasonData.episodes);
      } else {
        setEpisodes([]);
      }
    } catch (err) {
      console.error('Failed to load season episodes', err);
      setEpisodes([]);
    } finally {
      setSeasonLoading(false);
    }
  };

  useEffect(() => {
    fetchSeriesDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
    if (series) {
      loadSeasonEpisodes(series.id, seasonNum);
    }
  };

  const scrollToSeasons = () => {
    const el = document.getElementById('seasons-section');
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
  const activeSeasonObj = series.seasons?.find(s => s.seasonNumber === selectedSeasonNumber);

  // Real TMDb media items
  const validVideos = (series.videos || []).filter(v => v.key && v.site === 'YouTube');
  const photos = series.images && series.images.length > 0 ? series.images : (series.backdrop ? [series.backdrop] : []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 selection:bg-[#E43D3D] selection:text-white">
      
      {/* ==================================================
          1. TV SERIES HERO — INFORMATION-DENSE IMMERSIVE COVER
         ================================================== */}
      <section className="relative min-h-[85vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-8 md:px-12 mx-auto overflow-hidden">
        
        {/* Backdrop Background Field */}
        <div className="absolute inset-0 z-0">
          <img
            src={series.backdrop}
            alt={series.title}
            className="w-full h-full object-cover filter brightness-50 contrast-110 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/80 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/70 to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </div>

        {/* Top Editorial Nav Row */}
        <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/tv"
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>TV SERIES DIRECTORY</span>
          </Link>

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase">
            SERIES GUIDE PROFILE
          </span>
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
                  {series.voteCount > 0 && (
                    <span className="text-[#8E8E93] text-[10px] border-l border-white/15 pl-1.5 ml-1">
                      {series.voteCount.toLocaleString()} VOTES
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3 max-w-5xl">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold tracking-tight text-[#F2F0EC] leading-none uppercase">
                {series.title}
              </h1>
              {series.tagline && (
                <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-[#E43D3D]/90 max-w-3xl leading-snug">
                  "{series.tagline}"
                </p>
              )}
            </div>

            {/* Multi-Parameter Series Metadata Line */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-mono text-[#8E8E93] pt-1 border-y border-white/10 py-3">
              <span className="text-[#F2F0EC] font-bold">FIRST AIR: {series.firstAirDate || series.year}</span>
              <span>•</span>
              <span className="text-[#F2F0EC] font-bold">{series.seasonsCount} SEASONS</span>
              <span>•</span>
              <span className="text-[#F2F0EC] font-bold">{series.totalEpisodes} EPISODES</span>
              {series.episodeRuntime && (
                <>
                  <span>•</span>
                  <span className="text-[#8E8E93]">{series.episodeRuntime} / EP</span>
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
              {series.trailerUrl && (
                <button
                  onClick={() => openTrailer(series.trailerUrl!, series.title)}
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-7 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH TRAILER</span>
                </button>
              )}

              <button
                onClick={scrollToSeasons}
                className="bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F0EC] px-6 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-[#E43D3D]" />
                <span>EXPLORE SEASONS</span>
              </button>

              {validVideos.length > 0 && (
                <a
                  href="#videos-section"
                  className="bg-transparent hover:bg-white/5 border border-white/20 text-[#8E8E93] hover:text-white px-5 py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  <Film className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>VIDEOS ({validVideos.length})</span>
                </a>
              )}
            </div>

          </div>

          {/* Secondary Poster Anchor */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="relative group/anchor aspect-[2/3] max-w-[260px] ml-auto border border-white/20 bg-[#111114] shadow-2xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover group-hover/anchor:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider flex justify-between">
                <span>SERIES ANCHOR</span>
                <span className="text-[#E43D3D] font-bold">{series.language}</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ==================================================
          2. TV SERIES OVERVIEW & SPECIFICATIONS
         ================================================== */}
      <section className="mt-16 sm:mt-24 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-white/10 pt-12">
          
          {/* LEFT: THE SERIES OVERVIEW */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                SERIES STATEMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase">
                THE SERIES
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
          3. TV CREATORS
         ================================================== */}
      {((series.creatorDetails && series.creatorDetails.length > 0) || (series.creators && series.creators.length > 0)) && (
        <section className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-8">
          
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

      {/* CAST SECTION */}
      {series.cast && series.cast.length > 0 && (
        <section className="mt-16 sm:mt-20 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6">
          
          <SectionHeader
            label="ENSEMBLE CAST"
            title="CAST"
            description="Principal cast members and starring roles across series seasons."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {series.cast.map(person => (
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

        </section>
      )}

      {/* ==================================================
          4. TV SEASONS — CORE NAVIGATION EXPERIENCE
         ================================================== */}
      {series.seasons && series.seasons.length > 0 && (
        <section id="seasons-section" className="mt-24 sm:mt-32 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-8 scroll-mt-24">
          
          <SectionHeader
            label="SEASON ARCHIVE"
            title="SEASONS"
            description="Select a season to inspect full episode listings, air dates, and stills."
          />

          {/* Clean Horizontal Season Selector Bar */}
          <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-3 pt-1">
            {series.seasons.map((season) => {
              const isSelected = selectedSeasonNumber === season.seasonNumber;
              return (
                <button
                  key={season.seasonNumber}
                  onClick={() => handleSeasonChange(season.seasonNumber)}
                  className={`flex-shrink-0 w-[140px] sm:w-[170px] text-left border transition-all duration-300 group/season overflow-hidden ${
                    isSelected
                      ? 'bg-[#17171B] border-[#E43D3D] shadow-lg scale-[1.02]'
                      : 'bg-[#111114] border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="relative w-full aspect-[2/3] bg-black overflow-hidden">
                    <img
                      src={season.poster || series.poster}
                      alt={season.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/season:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-70" />
                    
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 ${
                        isSelected ? 'bg-[#E43D3D] text-white' : 'bg-black/80 text-white border border-white/20'
                      }`}>
                        S0{season.seasonNumber}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className={`font-serif font-bold text-xs sm:text-sm truncate transition-colors ${
                      isSelected ? 'text-[#E43D3D]' : 'text-[#F2F0EC] group-hover/season:text-[#E43D3D]'
                    }`}>
                      {season.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E93]">
                      <span>{season.year || 'N/A'}</span>
                      <span className="text-[#F2F0EC] font-bold">{season.episodeCount} EP</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Season Overview Header */}
          {activeSeasonObj && (
            <div className="bg-[#111114] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase block">
                  SELECTED SEASON
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC]">
                  {activeSeasonObj.title}
                </h3>
                {activeSeasonObj.overview && (
                  <p className="text-xs font-light text-[#8E8E93] max-w-3xl pt-1">
                    {activeSeasonObj.overview}
                  </p>
                )}
              </div>
              <div className="text-xs font-mono text-[#8E8E93]">
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 text-[#F2F0EC] font-bold inline-block">
                  {episodes.length} EPISODES LOADED
                </span>
              </div>
            </div>
          )}

          {/* ==================================================
              5. TV EPISODES — CORE EDITORIAL LIST
             ================================================== */}
          {seasonLoading ? (
            <div className="p-12 text-center text-[#8E8E93] font-mono text-xs uppercase animate-pulse border border-white/10 bg-[#111114]">
              FETCHING SEASON {selectedSeasonNumber} EPISODE ARCHIVE...
            </div>
          ) : episodes.length === 0 ? (
            <div className="p-12 bg-[#111114] border border-white/10 text-center text-[#8E8E93] font-mono text-xs uppercase">
              NO EPISODE DATA RECORDED FOR THIS SEASON.
            </div>
          ) : (
            <div className="space-y-3">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="bg-[#111114] border border-white/10 hover:border-[#E43D3D] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group/ep"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0 w-full md:w-auto">
                    
                    {/* Episode Still Container */}
                    <div className="w-full sm:w-40 md:w-44 aspect-[16/9] bg-black flex-shrink-0 border border-white/10 overflow-hidden relative">
                      <img
                        src={ep.stillImage}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {ep.runtime && ep.runtime !== 'N/A' && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5">
                          {ep.runtime}
                        </span>
                      )}
                    </div>

                    {/* Episode Meta & Synopsis */}
                    <div className="space-y-1.5 min-w-0 flex-grow">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#8E8E93]">
                        <span className="text-[#E43D3D] font-bold">EPISODE {ep.episodeNumber}</span>
                        {ep.airDate && <span>• {ep.airDate}</span>}
                        {ep.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#E43D3D] font-bold">★ {ep.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#F2F0EC] group-hover/ep:text-[#E43D3D] transition-colors truncate">
                        {ep.title}
                      </h4>

                      <p className="text-xs font-light text-[#8E8E93] line-clamp-2 max-w-3xl leading-relaxed">
                        {ep.synopsis}
                      </p>

                      {ep.guestStars && ep.guestStars.length > 0 && (
                        <div className="text-[10px] font-mono text-[#8E8E93]/70 pt-0.5">
                          Guest Stars: <span className="text-[#8E8E93]">{ep.guestStars.join(', ')}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {series.trailerUrl && (
                    <button
                      onClick={() => openTrailer(series.trailerUrl!, `${series.title} - S${ep.seasonNumber}E${ep.episodeNumber}: ${ep.title}`)}
                      className="bg-white/5 hover:bg-[#E43D3D] border border-white/10 text-[#F2F0EC] hover:text-white text-[10px] font-mono tracking-widest px-4 py-2 self-end md:self-center flex-shrink-0 transition-colors"
                    >
                      <span>PREVIEW</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </section>
      )}

      {/* ==================================================
          6. TV VIDEOS (REAL TMDB VIDEOS SECTION)
         ================================================== */}
      {validVideos.length > 0 && (
        <section id="videos-section" className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6 scroll-mt-24">
          <SectionHeader
            label="OFFICIAL MEDIA"
            title="VIDEOS"
            description="Official series trailers, promos, teasers, and featurettes."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {validVideos.map(video => {
              const youtubeThumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
              const embedUrl = `https://www.youtube.com/embed/${video.key}?autoplay=1`;

              return (
                <div
                  key={video.id}
                  onClick={() => openTrailer(embedUrl, `${series.title} — ${video.name}`)}
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
                      <div className="w-12 h-12 bg-[#E43D3D] text-white flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white pl-0.5" />
                      </div>
                    </div>

                    {/* Video Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 bg-black/80 text-white border border-white/20">
                        {video.type}
                      </span>
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
          7. TV PHOTOS (EDITORIAL GALLERY + LIGHTBOX)
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
                alt={`${series.title} photo 1`}
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
                    alt={`${series.title} photo ${idx + 2}`}
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
                    alt={`${series.title} gallery ${idx + 4}`}
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
          8. TV NETWORK / PRODUCTION SUPPORTING SECTION
         ================================================== */}
      {((series.networks && series.networks.length > 0) || (series.productionCompanies && series.productionCompanies.length > 0)) && (
        <section className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-6">
          
          <SectionHeader
            label="NETWORKS & STUDIOS"
            title="BROADCASTERS & PRODUCTION"
            description="Broadcast networks and production entities behind the show."
          />

          <div className="flex flex-wrap gap-4">
            {series.networks?.map(network => (
              <div
                key={network.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Tv className="w-4 h-4 text-[#E43D3D]" />
                <div>
                  <span className="block font-bold text-[#F2F0EC]">{network.name}</span>
                  <span className="text-[10px] text-[#E43D3D] uppercase">BROADCAST NETWORK</span>
                </div>
              </div>
            ))}
            {series.productionCompanies?.map(company => (
              <div
                key={company.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Building2 className="w-4 h-4 text-[#8E8E93]" />
                <div>
                  <span className="block font-bold text-[#F2F0EC]">{company.name}</span>
                  {company.country && <span className="text-[10px] text-[#8E8E93]">{company.country}</span>}
                </div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* ==================================================
          9. TV RELATED SHOWS
         ================================================== */}
      {relatedSeries.length > 0 && (
        <section className="mt-20 sm:mt-28 px-4 sm:px-8 md:px-12 mx-auto max-w-7xl space-y-8">
          
          <SectionHeader
            label="RECOMMENDATIONS"
            title="RELATED SHOWS"
            description="Television series sharing similar genre or narrative scope."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedSeries.slice(0, 6).map(item => (
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
        title={series.title}
      />

    </div>
  );
};

export default SeriesDetailPage;
