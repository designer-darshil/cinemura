import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Calendar, Building2, Tv, ExternalLink, Layers } from 'lucide-react';
import { getTvDetail, getTvSeasonDetail } from '../services/tmdb';
import { Series, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { MediaCard, CastCard, PersonCard } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import { DetailHeroSkeleton, ErrorState } from '../components/StateViews';

export const SeriesDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openTrailer } = useApp();

  const [series, setSeries] = useState<Series | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [error, setError] = useState(false);

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
          title="TV SHOW NOT FOUND"
          message="Unable to retrieve the requested TV series record from the live database."
          onRetry={fetchSeriesDetail}
        />
      </div>
    );
  }

  const relatedSeries = series.recommendations?.length ? series.recommendations : (series.similar || []);
  const activeSeasonObj = series.seasons?.find(s => s.seasonNumber === selectedSeasonNumber);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-16 lg:space-y-20">
      
      {/* ==================================================
          SECTION 01 — SERIES IDENTITY HERO
         ================================================== */}
      <section className="relative min-h-[75vh] flex flex-col justify-end pt-28 pb-12 px-4 sm:px-8 mx-auto overflow-hidden border-b border-white/10">
        
        {/* Background Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={series.backdrop}
            alt={series.title}
            className="w-full h-full object-cover opacity-45 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/80 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent" />
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </div>

        {/* Back Link */}
        <div className="relative z-10 w-full mb-6">
          <Link to="/tv" className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase text-[#929298] hover:text-[#E43D3D] text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO TV SHOWS DIRECTORY</span>
          </Link>
        </div>

        {/* Balanced 2-Column Hero Structure */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* LEFT: Poster Image (2:3 Aspect Ratio) */}
          <div className="lg:col-span-4 max-w-[280px] sm:max-w-[320px] lg:max-w-none">
            <div className="aspect-[2/3] bg-black border border-white/15 overflow-hidden shadow-2xl relative group/poster">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              {series.status && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] font-mono font-extrabold uppercase">
                  <span className="bg-[#E43D3D] text-white px-2 py-0.5 tracking-wider">
                    {series.status}
                  </span>
                  <span className="bg-black/80 border border-white/20 text-white px-2 py-0.5">
                    {series.seasonsCount} S / {series.totalEpisodes} EP
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Essential Series Metadata */}
          <div className="lg:col-span-8 space-y-5">
            
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="type-label bg-[#E43D3D] text-white px-2.5 py-1">
                TV SERIES
              </span>
              {series.certification && (
                <span className="type-label border border-white/20 text-white px-2 py-0.5 font-mono">
                  {series.certification}
                </span>
              )}
              {series.status && (
                <span className="type-label bg-white/10 text-white px-2.5 py-0.5 font-mono border border-white/15">
                  {series.status.toUpperCase()}
                </span>
              )}
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 text-xs text-[#E43D3D] font-bold border border-white/15">
                <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                <span>{series.rating.toFixed(1)}</span>
                {series.voteCount > 0 && (
                  <span className="text-[10px] text-[#929298] font-mono">({series.voteCount.toLocaleString()})</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="type-display-l text-white leading-none">
                {series.title}
              </h1>
              {series.originalName && (
                <p className="text-xs font-mono text-[#929298]">
                  Original Name: {series.originalName}
                </p>
              )}
            </div>

            {series.tagline && (
              <p className="type-h3 text-[#E43D3D] font-serif italic text-lg sm:text-xl">
                "{series.tagline}"
              </p>
            )}

            {/* Prioritized Key Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#929298] font-mono border-y border-white/10 py-3">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Calendar className="w-4 h-4 text-[#E43D3D]" /> FIRST AIR: {series.firstAirDate || series.year}
              </span>
              <span>•</span>
              <span className="text-white font-bold">{series.seasonsCount} SEASONS</span>
              <span>•</span>
              <span className="text-white font-bold">{series.totalEpisodes} EPISODES</span>
              {series.episodeRuntime && (
                <>
                  <span>•</span>
                  <span>{series.episodeRuntime}</span>
                </>
              )}
            </div>

            {/* Short Synopsis Overview */}
            <p className="type-body text-sm text-[#F2F0EC]/85 max-w-3xl line-clamp-3 font-light leading-relaxed">
              {series.synopsis}
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {series.trailerUrl && (
                <button
                  onClick={() => openTrailer(series.trailerUrl!, series.title)}
                  className="btn-primary"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH TRAILER</span>
                </button>
              )}

              <button
                onClick={scrollToSeasons}
                className="btn-secondary flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[#E43D3D]" />
                <span>EXPLORE SEASONS</span>
              </button>

              {series.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${series.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase text-xs text-[#929298] hover:text-white ml-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDB PROFILE</span>
                </a>
              )}
            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SECTION 02 — OVERVIEW & SERIES DETAILS
         ================================================== */}
      <section className="mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Overview */}
          <div className="lg:col-span-7 space-y-4">
            <SectionHeader
              label="SYNPOSIS"
              title="OVERVIEW"
            />
            <p className="type-body-l text-[#F2F0EC]/90 leading-relaxed font-light">
              {series.synopsis}
            </p>

            {series.spokenLanguages && series.spokenLanguages.length > 0 && (
              <div className="pt-2 text-xs font-mono text-[#929298]">
                Spoken Languages: <span className="text-white">{series.spokenLanguages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* RIGHT: Series Details Specification Sheet */}
          <div className="lg:col-span-5 bg-[#111114] border border-white/10 p-6 space-y-4">
            <SectionHeader
              label="SPECIFICATIONS"
              title="SERIES DETAILS"
            />

            <div className="divide-y divide-white/10 text-xs font-mono">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">FIRST AIR DATE</span>
                <span className="text-white font-bold">{series.firstAirDate || 'N/A'}</span>
              </div>

              {series.lastAirDate && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#929298]">LAST AIR DATE</span>
                  <span className="text-white font-bold">{series.lastAirDate}</span>
                </div>
              )}

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">STATUS</span>
                <span className="text-[#E43D3D] font-extrabold uppercase">{series.status || 'Ended'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">EPISODE RUNTIME</span>
                <span className="text-white font-bold">{series.episodeRuntime || 'N/A'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">SEASONS COUNT</span>
                <span className="text-white font-bold">{series.seasonsCount} Seasons</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">TOTAL EPISODES</span>
                <span className="text-white font-bold">{series.totalEpisodes} Episodes</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#929298]">ORIGINAL LANGUAGE</span>
                <span className="text-white uppercase font-bold">{series.language}</span>
              </div>

              {series.certification && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#929298]">CONTENT RATING</span>
                  <span className="text-white font-bold bg-white/10 px-2 py-0.5 border border-white/15">
                    {series.certification}
                  </span>
                </div>
              )}

              {series.genres.length > 0 && (
                <div className="py-2.5 flex items-start justify-between gap-4">
                  <span className="text-[#929298]">GENRES</span>
                  <span className="text-white font-bold text-right">{series.genres.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          SECTION 03 — CREATORS (CREATED BY)
         ================================================== */}
      {((series.creatorDetails && series.creatorDetails.length > 0) || (series.creators && series.creators.length > 0)) && (
        <section className="mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="SHOWRUNNERS"
            title="CREATED BY"
            description="Visionary creators and executive showrunners behind the series."
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
                  <span className="type-label text-[#E43D3D]">CREATOR</span>
                  <h4 className="type-h3 text-sm text-white truncate">{name}</h4>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 04 — CAST
         ================================================== */}
      {series.cast && series.cast.length > 0 && (
        <section className="mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="ENSEMBLE"
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
          SECTION 05 — SEASONS (PRIMARY TV EXPERIENCE)
         ================================================== */}
      {series.seasons && series.seasons.length > 0 && (
        <section id="seasons-section" className="mx-auto px-4 sm:px-8 space-y-8 scroll-mt-24">
          
          <SectionHeader
            label="SEASON ARCHIVE"
            title="SEASONS & EPISODES"
            description="Browse episode breakdowns, air dates, and stills season by season."
          />

          {/* Refined Horizontal Visual Season Selector */}
          <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-1">
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
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 ${
                        isSelected ? 'bg-[#E43D3D] text-white' : 'bg-black/80 text-white border border-white/20'
                      }`}>
                        S0{season.seasonNumber}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className={`type-h3 text-xs sm:text-sm truncate transition-colors ${
                      isSelected ? 'text-[#E43D3D]' : 'text-white group-hover/season:text-[#E43D3D]'
                    }`}>
                      {season.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#929298]">
                      <span>{season.year || 'N/A'}</span>
                      <span className="text-white font-bold">{season.episodeCount} EP</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Season Info Header */}
          {activeSeasonObj && (
            <div className="bg-[#111114] border border-white/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="type-label text-[#E43D3D] block mb-1">
                  CURRENTLY INSPECTING
                </span>
                <h3 className="type-h2 text-white">
                  {activeSeasonObj.title}
                </h3>
                {activeSeasonObj.overview && (
                  <p className="type-small font-light text-[#929298] max-w-3xl mt-1">
                    {activeSeasonObj.overview}
                  </p>
                )}
              </div>
              <div className="text-xs font-mono text-[#929298] flex items-center gap-3">
                <span className="bg-white/5 border border-white/10 px-3 py-1 text-white font-bold">
                  {episodes.length} EPISODES LOADED
                </span>
              </div>
            </div>
          )}

          {/* Season Episode Rows */}
          {seasonLoading ? (
            <div className="p-12 text-center text-[#929298] font-mono text-xs uppercase animate-pulse border border-white/10 bg-[#111114]">
              LOADING EPISODES FOR SEASON {selectedSeasonNumber}...
            </div>
          ) : episodes.length === 0 ? (
            <div className="p-12 bg-[#111114] border border-white/10 text-center text-[#929298] font-mono text-xs uppercase">
              NO EPISODE DATA AVAILABLE FOR THIS SEASON.
            </div>
          ) : (
            <div className="space-y-3">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="bg-[#111114] border border-white/10 hover:border-[#E43D3D] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group/ep"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0 w-full md:w-auto">
                    
                    {/* Desktop/Mobile Episode Still Image */}
                    <div className="w-full sm:w-36 md:w-40 aspect-[16/9] bg-black flex-shrink-0 border border-white/10 overflow-hidden relative">
                      <img
                        src={ep.stillImage}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform duration-300"
                      />
                      {ep.runtime && ep.runtime !== 'N/A' && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5">
                          {ep.runtime}
                        </span>
                      )}
                    </div>

                    {/* Episode Meta & Synopsis */}
                    <div className="space-y-1.5 min-w-0 flex-grow">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#929298]">
                        <span className="text-[#E43D3D] font-bold">EPISODE {ep.episodeNumber}</span>
                        {ep.airDate && <span>• {ep.airDate}</span>}
                        {ep.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#E43D3D] font-bold">★ {ep.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>

                      <h4 className="type-h3 text-base text-white group-hover/ep:text-[#E43D3D] transition-colors truncate">
                        {ep.title}
                      </h4>

                      <p className="type-small font-light text-[#929298] line-clamp-2 max-w-2xl leading-relaxed">
                        {ep.synopsis}
                      </p>

                      {ep.guestStars && ep.guestStars.length > 0 && (
                        <div className="text-[10px] font-mono text-[#626269] pt-0.5">
                          Guest Stars: <span className="text-[#929298]">{ep.guestStars.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {series.trailerUrl && (
                    <button
                      onClick={() => openTrailer(series.trailerUrl!, `${series.title} - S${ep.seasonNumber}E${ep.episodeNumber}: ${ep.title}`)}
                      className="btn-secondary text-[10px] h-9 px-4 self-end md:self-center flex-shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#E43D3D]" />
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
          SECTION 06 — OFFICIAL TRAILER / VIDEO
         ================================================== */}
      {series.trailerUrl && (
        <section className="mx-auto px-4 sm:px-8 space-y-4">
          <SectionHeader
            label="PREVIEW"
            title="OFFICIAL TRAILER"
            description="Watch official series trailers and promotional teasers."
          />

          <div
            onClick={() => openTrailer(series.trailerUrl!, series.title)}
            className="relative aspect-video w-full bg-[#111114] border border-white/10 overflow-hidden group/trailer cursor-pointer"
          >
            <img
              src={series.backdrop}
              alt={series.title}
              className="w-full h-full object-cover filter brightness-75 group-hover/trailer:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover/trailer:bg-black/20 transition-colors" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-[#E43D3D] text-white flex items-center justify-center shadow-lg group-hover/trailer:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white pl-1" />
              </div>
              <span className="type-label text-white tracking-widest bg-black/60 px-3 py-1 border border-white/20">
                PLAY OFFICIAL TRAILER IN ULTRA HD
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 07 — NETWORKS & PRODUCTION
         ================================================== */}
      {((series.networks && series.networks.length > 0) || (series.productionCompanies && series.productionCompanies.length > 0)) && (
        <section className="mx-auto px-4 sm:px-8 space-y-4">
          <SectionHeader
            label="NETWORKS & STUDIOS"
            title="BROADCAST NETWORKS & PRODUCTION"
            description="Broadcasters, streaming networks, and production companies behind the show."
          />

          <div className="flex flex-wrap gap-4">
            {series.networks?.map(network => (
              <div
                key={network.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Tv className="w-5 h-5 text-[#E43D3D]" />
                <div>
                  <span className="block font-bold text-white">{network.name}</span>
                  <span className="text-[10px] text-[#E43D3D] uppercase">BROADCAST NETWORK</span>
                </div>
              </div>
            ))}
            {series.productionCompanies?.map(company => (
              <div
                key={company.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Building2 className="w-5 h-5 text-[#929298]" />
                <div>
                  <span className="block font-bold text-white">{company.name}</span>
                  {company.country && <span className="text-[10px] text-[#929298]">{company.country}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KEYWORDS */}
      {series.keywords && series.keywords.length > 0 && (
        <section className="mx-auto px-4 sm:px-8 space-y-3">
          <SectionHeader
            label="TAGS"
            title="KEYWORDS & THEMES"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {series.keywords.map(keyword => (
              <span
                key={keyword}
                className="text-xs font-mono px-3 py-1 bg-[#111114] border border-white/10 text-[#929298] uppercase"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION 08 — RELATED TV SHOWS
         ================================================== */}
      {relatedSeries.length > 0 && (
        <section className="mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="RECOMMENDATIONS"
            title="RELATED SHOWS"
            description="Recommended television series with similar thematic tone or genre."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {relatedSeries.slice(0, 12).map(item => (
              <MediaCard key={item.id} item={item} variant="poster" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
