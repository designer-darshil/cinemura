import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, ArrowLeft, Calendar, Building2, Tv, ExternalLink } from 'lucide-react';
import { getTvDetail, getTvSeasonDetail } from '../services/tmdb';
import { Series, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { MediaCard, CastCard } from '../components/MediaCard';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 max-w-site mx-auto">
        <DetailHeroSkeleton />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-20 px-4 sm:px-8 max-w-site mx-auto">
        <ErrorState
          title="TV SHOW NOT FOUND"
          message="Unable to retrieve the requested TV series record from the live database."
          onRetry={fetchSeriesDetail}
        />
      </div>
    );
  }

  const relatedSeries = series.recommendations?.length ? series.recommendations : (series.similar || []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pb-24 space-y-16">
      
      {/* Top Hero Section */}
      <section className="relative min-h-[75vh] flex flex-col justify-end pt-28 pb-12 px-4 sm:px-8 max-w-site mx-auto overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={series.backdrop}
            alt={series.title}
            className="w-full h-full object-cover filter brightness-50 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/70 to-black/80" />
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </div>

        <div className="relative z-10 w-full mb-8">
          <Link to="/tv" className="btn-link text-[#929298] hover:text-[#E43D3D]">
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO TV SHOWS DIRECTORY</span>
          </Link>
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="type-label bg-white text-black px-2.5 py-1">
                TELEVISION SERIES
              </span>
              {series.certification && (
                <span className="type-label border border-white/20 text-white px-2 py-0.5">
                  {series.certification}
                </span>
              )}
              {series.showType && (
                <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5">
                  {series.showType.toUpperCase()}
                </span>
              )}
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 text-xs text-[#E43D3D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                <span>{series.rating.toFixed(1)} / 10</span>
                {series.voteCount > 0 && <span className="text-[10px] text-[#929298]">({series.voteCount.toLocaleString()} votes)</span>}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="type-display-l text-white">
                {series.title}
              </h1>
              {series.originalName && (
                <p className="text-xs font-mono text-[#929298]">
                  Original Title: {series.originalName}
                </p>
              )}
            </div>

            {series.tagline && (
              <p className="type-h3 text-[#E43D3D]">
                "{series.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#929298] font-mono border-y border-white/10 py-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#E43D3D]" /> {series.firstAirDate || series.year}
              </span>
              <span>•</span>
              <span>{series.seasonsCount} SEASONS</span>
              <span>•</span>
              <span>{series.totalEpisodes} EPISODES</span>
              {series.genres.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-white uppercase font-bold">{series.genres.join(' • ')}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {series.trailerUrl && (
                <button
                  onClick={() => openTrailer(series.trailerUrl!, series.title)}
                  className="btn-primary"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH TRAILER →</span>
                </button>
              )}

              {series.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${series.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E43D3D]" />
                  <span>IMDB PROFILE</span>
                </a>
              )}
            </div>

          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="aspect-[2/3] bg-black border border-white/20 p-2">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info Dossier Panel */}
      <section className="max-w-site mx-auto px-4 sm:px-8">
        <div className="bg-[#111114] border border-white/10 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-xs font-mono">
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">CREATORS</span>
            <span className="type-h3 text-white block">{series.creators.join(', ') || 'N/A'}</span>
          </div>
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">NETWORK</span>
            <span className="type-h3 text-[#E43D3D] block">{series.network || 'N/A'}</span>
          </div>
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">STATUS</span>
            <span className="type-h3 text-white block">{series.status || 'Ended'}</span>
          </div>
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">EPISODE RUNTIME</span>
            <span className="type-h3 text-white block">{series.episodeRuntime || 'N/A'}</span>
          </div>
          <div className="space-y-1">
            <span className="type-label text-[#929298] block">ORIGINAL LANGUAGE</span>
            <span className="type-h3 text-white block uppercase">{series.language}</span>
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section className="max-w-site mx-auto px-4 sm:px-8 space-y-4">
        <SectionHeader
          label="OVERVIEW"
          title="SERIES SYNOPSIS"
        />
        <p className="type-body-l max-w-4xl text-[#F2F0EC]/90 leading-relaxed font-light">
          {series.synopsis}
        </p>

        {series.spokenLanguages && series.spokenLanguages.length > 0 && (
          <div className="pt-2 text-xs font-mono text-[#929298]">
            Spoken Languages: <span className="text-white">{series.spokenLanguages.join(', ')}</span>
          </div>
        )}
      </section>

      {/* Seasons & Episodes Section */}
      {series.seasons && series.seasons.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-8">
          
          <SectionHeader
            label="EPISODES"
            title="SEASONS & EPISODES"
            rightElement={
              <div className="flex flex-wrap items-center gap-2">
                {series.seasons.map((season) => (
                  <button
                    key={season.seasonNumber}
                    onClick={() => handleSeasonChange(season.seasonNumber)}
                    className={`text-xs px-3.5 py-1.5 font-bold uppercase transition-all ${
                      selectedSeasonNumber === season.seasonNumber
                        ? 'bg-[#E43D3D] text-white'
                        : 'bg-[#111114] text-[#929298] hover:text-white border border-white/10'
                    }`}
                  >
                    {season.title}
                  </button>
                ))}
              </div>
            }
          />

          {/* Episode List */}
          {seasonLoading ? (
            <div className="p-12 text-center text-[#929298] font-mono text-xs uppercase animate-pulse">
              LOADING EPISODES FOR SEASON {selectedSeasonNumber}...
            </div>
          ) : episodes.length === 0 ? (
            <div className="p-12 bg-[#111114] border border-white/10 text-center text-[#929298] font-mono text-xs uppercase">
              NO EPISODE DATA AVAILABLE FOR THIS SEASON.
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="bg-[#111114] border border-white/10 hover:border-[#E43D3D] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-28 h-20 bg-black flex-shrink-0 border border-white/10 overflow-hidden relative">
                      <img
                        src={ep.stillImage}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {ep.runtime && ep.runtime !== 'N/A' && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1">
                          {ep.runtime}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
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

                      <h4 className="type-h3 text-base text-white group-hover:text-[#E43D3D] transition-colors truncate">
                        {ep.title}
                      </h4>

                      <p className="type-small font-light text-[#929298] line-clamp-2 max-w-2xl leading-relaxed">
                        {ep.synopsis}
                      </p>

                      {ep.guestStars && ep.guestStars.length > 0 && (
                        <div className="text-[10px] font-mono text-[#626269] pt-1">
                          Guest Stars: <span className="text-[#929298]">{ep.guestStars.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {series.trailerUrl && (
                    <button
                      onClick={() => openTrailer(series.trailerUrl!, `${series.title} - ${ep.title}`)}
                      className="btn-secondary text-[10px] h-9 px-4 self-end md:self-auto flex-shrink-0"
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

      {/* Cast Section */}
      {series.cast && series.cast.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="CAST"
            title="SERIES CAST"
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

      {/* NETWORKS & PRODUCTION COMPANIES */}
      {((series.networks && series.networks.length > 0) || (series.productionCompanies && series.productionCompanies.length > 0)) && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-4">
          <SectionHeader
            label="NETWORKS & STUDIOS"
            title="BROADCAST NETWORKS & PRODUCTION"
          />
          <div className="flex flex-wrap gap-4">
            {series.networks?.map(network => (
              <div
                key={network.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Tv className="w-4 h-4 text-[#E43D3D]" />
                <div>
                  <span className="block font-bold text-white">{network.name}</span>
                  <span className="text-[10px] text-[#E43D3D]">BROADCAST NETWORK</span>
                </div>
              </div>
            ))}
            {series.productionCompanies?.map(company => (
              <div
                key={company.id}
                className="bg-[#111114] border border-white/10 p-4 flex items-center gap-3 text-xs font-mono text-[#F2F0EC]"
              >
                <Building2 className="w-4 h-4 text-[#929298]" />
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
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-3">
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

      {/* Related TV Shows Section */}
      {relatedSeries.length > 0 && (
        <section className="max-w-site mx-auto px-4 sm:px-8 space-y-6">
          <SectionHeader
            label="RECOMMENDATIONS"
            title="RELATED TV SHOWS"
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
