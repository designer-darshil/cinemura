import React, { useState, useEffect, useRef } from 'react';
import { Star, Clock, Calendar, Film, Play } from 'lucide-react';
import { Season, Episode } from '../types';
import { getTvSeasonDetail } from '../services/tmdb';
import { EpisodeCardSkeleton } from './StateViews';
import { useApp } from '../context/AppContext';
import { isEpisodePlayable } from '../utils/vidlink';

interface SeriesEpisodesSectionProps {
  seriesId: string;
  seriesTitle: string;
  seasons: Season[];
  id?: string;
}

export const SeriesEpisodesSection: React.FC<SeriesEpisodesSectionProps> = ({
  seriesId,
  seriesTitle,
  seasons,
  id = 'episodes-section'
}) => {
  const { openVidLinkTv } = useApp();
  // Client-side cache keyed by `seriesId_season_seasonNumber`
  const episodeCache = useRef<Map<string, Episode[]>>(new Map());

  // Default to Season 1 or first season with seasonNumber > 0
  const initialSeasonNum = seasons.find((s) => s.seasonNumber > 0)?.seasonNumber || seasons[0]?.seasonNumber || 1;
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(initialSeasonNum);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const activeSeasonRef = useRef<number>(initialSeasonNum);

  // Fetch season episodes with client-side caching & race-condition safety
  useEffect(() => {
    if (!seriesId) return;

    activeSeasonRef.current = selectedSeasonNumber;
    const cacheKey = `${seriesId}_season_${selectedSeasonNumber}`;

    if (episodeCache.current.has(cacheKey)) {
      setEpisodes(episodeCache.current.get(cacheKey) || []);
      setLoading(false);
      return;
    }

    const targetSeason = selectedSeasonNumber;
    setLoading(true);

    getTvSeasonDetail(seriesId, targetSeason)
      .then((data) => {
        // Discard stale responses if user clicked another season
        if (activeSeasonRef.current !== targetSeason) return;
        const eps = data?.episodes || [];
        episodeCache.current.set(cacheKey, eps);
        setEpisodes(eps);
      })
      .catch((err) => {
        console.error('Failed to load season episodes', err);
      })
      .finally(() => {
        if (activeSeasonRef.current === targetSeason) {
          setLoading(false);
        }
      });
  }, [seriesId, selectedSeasonNumber]);

  if (!seasons || seasons.length === 0) return null;

  return (
    <>
    <section id={id} className="space-y-6 scroll-mt-28">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold block mb-1">
            TELEVISION EPISODES
          </span>
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F2F0EC] uppercase tracking-tight">
              EPISODES
            </h2>
            <span className="text-xs font-mono text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
              {episodes.length} {episodes.length === 1 ? 'EPISODE' : 'EPISODES'}
            </span>
          </div>
        </div>

        {/* Compact Real Season Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {seasons.map((season) => {
            const isActive = selectedSeasonNumber === season.seasonNumber;
            return (
              <button
                key={season.seasonNumber}
                type="button"
                onClick={() => setSelectedSeasonNumber(season.seasonNumber)}
                className={`px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[36px] text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap border flex items-center shrink-0 ${
                  isActive
                    ? 'bg-[#E43D3D] border-[#E43D3D] text-white font-bold'
                    : 'bg-[#111114] border-white/15 text-[#8E8E93] hover:text-[#F2F0EC] hover:border-white/30'
                }`}
              >
                <span>{season.title || `Season ${season.seasonNumber}`}</span>
                {season.episodeCount > 0 && (
                  <span className="opacity-70 ml-1 text-[10px]">
                    ({season.episodeCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <EpisodeCardSkeleton key={`ep-skel-${i}`} />
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <div className="p-8 text-center bg-[#111114] border border-white/10">
          <p className="text-sm font-mono text-[#8E8E93] uppercase">
            No episode records found for this season.
          </p>
        </div>
      ) : (
        /* Dense Multi-Column Responsive Episode Grid for Fast Scanning */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {episodes.map((ep) => {
            const hasStill = ep.stillImage && !ep.stillImage.includes('placeholder');
            const epNumFormatted = `E${String(ep.episodeNumber).padStart(2, '0')}`;

            return (
              <div
                key={ep.id}
                className="group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md"
              >
                {/* 16:9 Episode Still */}
                <div className="relative aspect-video w-full bg-[#141418] overflow-hidden flex items-center justify-center">
                  {hasStill ? (
                    <img
                      src={ep.stillImage}
                      alt={`${seriesTitle} ${epNumFormatted}: ${ep.title}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#8E8E93] gap-1 p-4">
                      <Film className="w-6 h-6 text-white/20" />
                      <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                        STILL UNAVAILABLE
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  {/* Two-digit episode badge E01 */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 bg-[#E43D3D] text-white shadow">
                      {epNumFormatted}
                    </span>
                  </div>

                  {/* Runtime badge if available */}
                  {ep.runtime && ep.runtime !== 'N/A' && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="text-[10px] font-mono bg-black/80 text-[#F2F0EC] px-1.5 py-0.5 border border-white/15 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E43D3D]" />
                        {ep.runtime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Episode Content */}
                <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {/* Title */}
                    <h3 className="font-serif font-bold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-snug line-clamp-1">
                      {ep.title}
                    </h3>

                    {/* Metadata line: Air date and Rating */}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#8E8E93]">
                      {ep.airDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8E8E93]" />
                          {ep.airDate}
                        </span>
                      )}
                      {ep.rating > 0 && (
                        <span className="flex items-center gap-1 text-[#E43D3D] font-bold">
                          <Star className="w-3 h-3 fill-[#E43D3D]" />
                          {ep.rating.toFixed(1)}
                          {ep.voteCount ? (
                            <span className="text-[10px] text-[#8E8E93] font-normal">
                              ({ep.voteCount})
                            </span>
                          ) : null}
                        </span>
                      )}
                    </div>

                    {/* Real Synopsis / Overview (hidden if not available) */}
                    {ep.synopsis && ep.synopsis.trim() && (
                      <p className="text-xs font-sans text-[#8E8E93] line-clamp-2 leading-relaxed pt-1 font-light">
                        {ep.synopsis}
                      </p>
                    )}
                  </div>

                  {/* Playback Action */}
                  {isEpisodePlayable(ep) && (
                    <div className="pt-2.5 mt-auto border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => openVidLinkTv(seriesId, ep.seasonNumber, ep.episodeNumber, `${seriesTitle} S${ep.seasonNumber}E${ep.episodeNumber}: ${ep.title}`)}
                        className="w-full bg-[#18181D] hover:bg-[#E43D3D] text-[#F2F0EC] hover:text-white border border-white/15 hover:border-[#E43D3D] min-h-[44px] py-2 px-3 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200 group/btn"
                      >
                        <Play className="w-3 h-3 fill-current text-[#E43D3D] group-hover/btn:text-white group-hover/btn:fill-white" />
                        <span>WATCH EPISODE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
    </>
  );
};
