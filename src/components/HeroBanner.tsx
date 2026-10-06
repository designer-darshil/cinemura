import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star } from 'lucide-react';
import { Movie, Series } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';

interface HeroBannerProps {
  item: Movie | Series;
  badgeLabel?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, badgeLabel }) => {
  const { openVideoPlayer } = useApp();

  const isMovie = item.type === 'movie';
  const detailPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

  const heroVideos = item.videos || [];
  const primaryVideo = selectPrimaryVideo(heroVideos, item.language || 'en') || item.primaryVideo;
  const playableVideos = sortVideosWithPrimaryFirst(heroVideos, item.language || 'en');
  const trailerLabel = getVideoButtonLabel(primaryVideo);

  const durationOrSeasons = isMovie
    ? (item as Movie).runtime
    : (item as Series).seasonsCount
    ? `${(item as Series).seasonsCount} ${(item as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}`
    : undefined;

  return (
    <section className="relative min-h-[65vh] lg:min-h-[72vh] flex flex-col justify-end pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full overflow-hidden border-b border-white/10">
      {/* Real Backdrop Background Field */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.backdrop}
          alt={item.title}
          className="w-full h-full object-cover opacity-45 filter brightness-90 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent" />
        <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />
      </div>

      {/* Hero Content Canvas */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
        <div className="lg:col-span-8 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label bg-[#E43D3D] text-white px-2 py-0.5 font-bold">
              {badgeLabel || (isMovie ? 'FEATURE FILM' : 'TELEVISION')}
            </span>
            {item.certification && (
              <span className="type-label text-[#8E8E93] border border-white/15 px-1.5 py-0.5">
                {item.certification}
              </span>
            )}
          </div>

          {/* Real Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight uppercase leading-none">
            {item.title}
          </h1>

          {/* Essential Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93]">
            <span>{item.year}</span>
            {durationOrSeasons && (
              <>
                <span>•</span>
                <span className="text-[#F2F0EC]">{durationOrSeasons}</span>
              </>
            )}
            {item.genres && item.genres.length > 0 && (
              <>
                <span>•</span>
                <span className="text-[#F2F0EC] uppercase">{item.genres.slice(0, 3).join(' / ')}</span>
              </>
            )}
            {item.rating > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#E43D3D] font-bold">
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

          {/* Actions: Watch Trailer CTA & Explore Title Link */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
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
                className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{trailerLabel}</span>
              </button>
            )}

            <Link
              to={detailPath}
              className="btn-link inline-flex items-center gap-2 text-white text-sm font-mono font-bold tracking-wider uppercase hover:text-[#E43D3D] transition-colors"
            >
              <span>EXPLORE TITLE</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
