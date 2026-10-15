import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { Movie, Series, VideoItem } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';

export interface GenericHeroItem {
  id: string;
  title: string;
  type?: string;
  backdrop: string;
  poster?: string;
  image?: string;
  thumb?: string;
  year?: number | string;
  rating?: number;
  genres?: string[];
  synopsis?: string;
  certification?: string;
  runtime?: string;
  seasonsCount?: number;
  episodesCount?: number;
  language?: string;
  videos?: VideoItem[];
  primaryVideo?: VideoItem;
  detailUrl?: string;
}

interface HeroBannerProps {
  item: Movie | Series | GenericHeroItem;
  badgeLabel?: string;
  actions?: React.ReactNode;
}

function getItemDurationOrSeasons(item: Movie | Series | GenericHeroItem): string | undefined {
  if ('runtime' in item && item.runtime && item.runtime !== 'N/A') {
    return item.runtime;
  }
  if ('seasonsCount' in item && typeof item.seasonsCount === 'number') {
    return `${item.seasonsCount} ${item.seasonsCount === 1 ? 'SEASON' : 'SEASONS'}`;
  }
  if ('episodesCount' in item && typeof item.episodesCount === 'number') {
    return `${item.episodesCount} EPS`;
  }
  return undefined;
}

function getItemThumbnail(item: Movie | Series | GenericHeroItem): string | undefined {
  if ('poster' in item && item.poster) return item.poster;
  if ('image' in item && item.image) return item.image;
  if ('thumb' in item && item.thumb) return item.thumb;
  return item.backdrop;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, actions }) => {
  const { openVideoPlayer } = useApp();

  const isMovie = item.type === 'movie';
  const isSeries = item.type === 'tv' || item.type === 'series';
  const detailPath = (item as GenericHeroItem).detailUrl
    ? (item as GenericHeroItem).detailUrl!
    : isMovie
    ? `/movie/${item.id}`
    : isSeries
    ? `/tv/${item.id}`
    : `/movie/${item.id}`;

  const heroVideos = item.videos || [];
  const primaryVideo = selectPrimaryVideo(heroVideos, item.language || 'en') || item.primaryVideo;
  const playableVideos = sortVideosWithPrimaryFirst(heroVideos, item.language || 'en');
  const trailerLabel = getVideoButtonLabel(primaryVideo);

  const durationOrSeasons = getItemDurationOrSeasons(item);
  const artworkThumbnail = getItemThumbnail(item);

  return (
    <section className="relative min-h-[70vh] sm:min-h-[76vh] lg:min-h-[82vh] flex flex-col items-end justify-end pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10 bg-[#0B0B0D]">
      {/* Real Backdrop Background Field */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {item.backdrop && (
          <img
            src={item.backdrop}
            alt={item.title}
            className="w-full h-full object-cover filter grayscale-[15%] brightness-90 contrast-105"
          />
        )}
        {/* Editorial Gradients & Fine Grain */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent" /> */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/90 via-[#0B0B0D]/40 to-transparent" /> */}
        {/* <div className="absolute inset-0 film-grain pointer-events-none opacity-20" /> */}
      </div>

      {/* Hero Bottom Anchor Canvas: Oversized Title & Actions */}
      <div className="relative z-10 w-full pt-12 sm:pt-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
          
          {/* Left Column: Oversized Typography & Primary Actions */}
          <div className="space-y-4 sm:space-y-6 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-[#F2F0EC] tracking-tight leading-[0.88] uppercase">
              {item.title}
            </h1>

            {/* Synopsis Excerpt (Restrained) */}
            {item.synopsis && (
              <p className="text-xs sm:text-sm md:text-base text-[#8E8E93] max-w-2xl line-clamp-2 sm:line-clamp-3 font-light leading-relaxed">
                {item.synopsis}
              </p>
            )}

            {/* Playback & Explore Actions */}
            {actions ? (
              actions
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isMovie ? (
                  <Link
                    to={`/watch/movie/${item.id}`}
                    className="bg-[#E43D3D] hover:bg-[#c93535] text-white min-h-[44px] px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#E43D3D]/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>WATCH MOVIE</span>
                  </Link>
                ) : isSeries ? (
                  <Link
                    to={`/watch/tv/${item.id}?s=1&e=1`}
                    className="bg-[#E43D3D] hover:bg-[#c93535] text-white min-h-[44px] px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#E43D3D]/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>WATCH TV</span>
                  </Link>
                ) : null}

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
                    className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                    <span>{trailerLabel}</span>
                  </button>
                )}

                <Link
                  to={detailPath}
                  className="bg-[#0B0B0D]/50 hover:bg-white/10 border border-white/20 text-[#F2F0EC] min-h-[44px] px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all backdrop-blur-sm group"
                >
                  <span>EXPLORE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Bottom Anchor: Artwork Thumbnail & Restrained Controls */}
          <div className="hidden sm:flex items-end gap-5 lg:ml-auto">
            {/* Small Artwork Thumbnail */}
            <Link
              to={detailPath}
              className="relative w-20 h-28 sm:w-24 sm:h-32 border border-white/15 bg-[#111114] shadow-2xl overflow-hidden flex-shrink-0 group"
              title={`View ${item.title}`}
            >
              {artworkThumbnail ? (
                <img
                  src={artworkThumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover filter grayscale-[15%] group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#8E8E93]">
                  POSTER
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </Link>

            {/* Pagination / Section Index & Small Control Pair */}
            <div className="space-y-2">
              {durationOrSeasons && (
                <div className="text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase">
                  {durationOrSeasons}
                </div>
              )}
              <div className="text-[11px] font-mono tracking-widest text-[#8E8E93]">
                01 / 05
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={detailPath}
                  title="View Previous"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={detailPath}
                  title="Explore Title"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all bg-[#0B0B0D]/50"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
