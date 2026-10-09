import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star } from 'lucide-react';
import { Movie, Series } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';

export interface GenericHeroItem {
  id: string;
  title: string;
  type?: string;
  backdrop: string;
  year?: number | string;
  rating?: number;
  genres?: string[];
  synopsis?: string;
  certification?: string;
  runtime?: string;
  seasonsCount?: number;
  episodesCount?: number;
  language?: string;
  videos?: any[];
  primaryVideo?: any;
  detailUrl?: string;
}

interface HeroBannerProps {
  item: Movie | Series | GenericHeroItem;
  badgeLabel?: string;
  actions?: React.ReactNode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, badgeLabel, actions }) => {
  const { openVideoPlayer } = useApp();

  const isMovie = item.type === 'movie';
  const isSeries = item.type === 'tv' || item.type === 'series';
  const detailPath = (item as GenericHeroItem).detailUrl
    ? (item as GenericHeroItem).detailUrl!
    : isMovie
    ? `/movie/${item.id}`
    : `/tv/${item.id}`;

  const heroVideos = item.videos || [];
  const primaryVideo = selectPrimaryVideo(heroVideos, item.language || 'en') || item.primaryVideo;
  const playableVideos = sortVideosWithPrimaryFirst(heroVideos, item.language || 'en');
  const trailerLabel = getVideoButtonLabel(primaryVideo);

  const durationOrSeasons = (item as any).runtime && (item as any).runtime !== 'N/A'
    ? (item as any).runtime
    : (item as any).seasonsCount
    ? `${(item as any).seasonsCount} ${(item as any).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}`
    : (item as any).episodesCount
    ? `${(item as any).episodesCount} EPS`
    : undefined;

  return (
    <section className="relative min-h-[58vh] sm:min-h-[66vh] lg:min-h-[72vh] flex flex-col justify-end pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10">
      {/* Real Backdrop Background Field */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {item.backdrop && (
          <img
            src={item.backdrop}
            alt={item.title}
            className="w-full h-full object-cover opacity-50 filter brightness-90 contrast-110 animate-cinemaDrift"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E43D3D]/10 rounded-full blur-3xl pointer-events-none animate-cinemaGlow" />
        <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
      </div>

      {/* Hero Content Canvas */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
        <div className="lg:col-span-9 space-y-4 sm:space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold uppercase">
              {badgeLabel || (isMovie ? 'FEATURE FILM' : isSeries ? 'TELEVISION' : 'SPOTLIGHT')}
            </span>
            {item.certification && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-1.5 py-0.5 uppercase">
                {item.certification}
              </span>
            )}
          </div>

          {/* Real Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-display font-bold text-white tracking-tight uppercase leading-[0.96]">
            {item.title}
          </h1>

          {/* Essential Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono text-[#8E8E93]">
            {item.year && <span className="text-white font-semibold">{item.year}</span>}
            {durationOrSeasons && (
              <>
                {item.year && <span className="text-white/30">•</span>}
                <span className="text-[#F2F0EC]">{durationOrSeasons}</span>
              </>
            )}
            {item.genres && item.genres.length > 0 && (
              <>
                {(item.year || durationOrSeasons) && <span className="text-white/30">•</span>}
                <span className="text-[#F2F0EC] uppercase tracking-wider">{item.genres.slice(0, 2).join(' / ')}</span>
              </>
            )}
            {typeof item.rating === 'number' && item.rating > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5 text-[#E43D3D] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                  {item.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          {/* Synopsis Excerpt */}
          {item.synopsis && (
            <p className="type-body text-sm sm:text-base text-[#F2F0EC]/85 max-w-2xl line-clamp-3 font-light leading-relaxed">
              {item.synopsis}
            </p>
          )}

          {/* Actions */}
          {actions ? (
            actions
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              {primaryVideo && (
                <button
                  type="button"
                  onClick={() =>
                    openVideoPlayer(
                      playableVideos.length > 0 ? playableVideos : [primaryVideo],
                      0,
                      item.title
                    )
                  }
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white min-h-[44px] px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{trailerLabel}</span>
                </button>
              )}

              <Link
                to={detailPath}
                className={`${
                  primaryVideo ? 'btn-secondary' : 'btn-primary'
                } min-h-[44px] inline-flex items-center justify-center gap-2 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors px-6 py-3 w-full sm:w-auto`}
              >
                <span>EXPLORE TITLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
