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
    <section className="relative min-h-[58vh] sm:min-h-[66vh] lg:min-h-[72vh] flex flex-col justify-end pt-20 pb-8 sm:pb-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/5">
      {/* Real Backdrop Background Field */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {item.backdrop && (
          <img
            src={item.backdrop}
            alt={item.title}
            className="w-full h-full object-cover opacity-45 filter brightness-95 contrast-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0B0D]/50 via-[#0B0B0D]/50 to-transparent" />
        <div className="absolute inset-0 film-grain pointer-events-none opacity-20" />
      </div>

      {/* Hero Content Canvas */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-2">
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {/* Subtle Category Kicker */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-semibold tracking-widest text-[#E43D3D] uppercase">
              {badgeLabel || (isMovie ? 'FEATURE FILM' : isSeries ? 'TELEVISION' : 'SPOTLIGHT')}
            </span>
            {item.certification && (
              <>
                <span className="text-white/20 text-xs">•</span>
                <span className="text-[10px] font-mono tracking-wider text-[#8E8E93] border border-white/15 px-1.5 py-0.5 uppercase">
                  {item.certification}
                </span>
              </>
            )}
          </div>

          {/* Real Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight uppercase leading-[1.02]">
            {item.title}
          </h1>

          {/* Essential Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#8E8E93]">
            {item.year && <span className="text-[#F2F0EC]">{item.year}</span>}
            {durationOrSeasons && (
              <>
                <span className="text-white/20">•</span>
                <span>{durationOrSeasons}</span>
              </>
            )}
            {item.genres && item.genres.length > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="uppercase">{item.genres.slice(0, 3).join(' / ')}</span>
              </>
            )}
            {typeof item.rating === 'number' && item.rating > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1 text-[#F2F0EC]">
                  <Star className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                  {item.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          {/* Synopsis Excerpt */}
          {item.synopsis && (
            <p className="text-sm sm:text-base text-[#8E8E93] max-w-2xl line-clamp-3 font-light leading-relaxed">
              {item.synopsis}
            </p>
          )}

          {/* Actions */}
          {actions ? (
            actions
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
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
                  className="btn-primary min-h-[40px] px-5 text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{trailerLabel}</span>
                </button>
              )}

              <Link
                to={detailPath}
                className="btn-secondary min-h-[40px] px-5 inline-flex items-center justify-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase w-full sm:w-auto"
              >
                <span>EXPLORE TITLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8E8E93]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
