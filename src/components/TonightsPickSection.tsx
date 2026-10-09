import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Bookmark, ArrowRight } from 'lucide-react';
import { MediaItem, Movie, Series } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { isMoviePlayable } from '../utils/cinesrc';

interface TonightsPickSectionProps {
  item: MediaItem;
}

export const TonightsPickSection: React.FC<TonightsPickSectionProps> = ({ item }) => {
  const { openVideoPlayer, openCineSrcMovie, toggleWatchlist, isInWatchlist } = useApp();

  const detailPath = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const isSaved = isInWatchlist(item.id);

  const primaryVideo = selectPrimaryVideo(item.videos, item.language) || item.primaryVideo || null;
  const playableVideos = sortVideosWithPrimaryFirst(item.videos, item.language);
  const trailerLabel = getVideoButtonLabel(primaryVideo);

  const durationOrSeasons = item.type === 'movie'
    ? (item.runtime && item.runtime !== 'N/A' ? item.runtime : null)
    : ((item as Series).seasonsCount ? `${(item as Series).seasonsCount} ${(item as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}` : null);

  const artworkImage = item.backdrop || item.poster;

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#E43D3D] uppercase block">
            CURATED SPOTLIGHT
          </span>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#F2F0EC] uppercase">
            TONIGHT'S SELECTION
          </h2>
        </div>
      </div>

      {/* Presentation Card */}
      <div className="relative bg-[#111114] border border-white/5 overflow-hidden group">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Artwork Side */}
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[360px] lg:min-h-[420px] overflow-hidden bg-[#121215]">
            <img
              src={artworkImage}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] filter brightness-95 contrast-105"
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#111114]/30 lg:to-[#111114]" />

            {/* Quick Play Trigger Overlay */}
            {primaryVideo && (
              <button
                type="button"
                onClick={() => openVideoPlayer(
                  playableVideos.length > 0 ? playableVideos : [primaryVideo],
                  0,
                  item.title
                )}
                aria-label={`Play trailer for ${item.title}`}
                className="absolute inset-0 m-auto w-12 h-12 bg-black/70 hover:bg-[#E43D3D] text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white pl-0.5" />
              </button>
            )}
          </div>

          {/* Information Side */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#111114]">
            <div className="space-y-3">
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#8E8E93]">
                <span className="text-[#F2F0EC]">{item.year}</span>
                {durationOrSeasons && (
                  <>
                    <span className="text-white/20">•</span>
                    <span>{durationOrSeasons}</span>
                  </>
                )}
                {item.rating > 0 && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1 text-[#F2F0EC]">
                      <Star className="w-3.5 h-3.5 fill-[#E43D3D] text-[#E43D3D]" />
                      {item.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <Link to={detailPath} className="block group/title">
                <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#F2F0EC] group-hover/title:text-white transition-colors leading-tight uppercase tracking-tight">
                  {item.title}
                </h3>
              </Link>

              {/* Genres */}
              {item.genres.length > 0 && (
                <p className="text-xs font-mono text-[#8E8E93] uppercase tracking-wider">
                  {item.genres.slice(0, 3).join(' / ')}
                </p>
              )}

              {/* Synopsis */}
              {item.synopsis && (
                <p className="text-sm text-[#8E8E93] font-light leading-relaxed line-clamp-4 pt-1">
                  {item.synopsis}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
              {item.type === 'movie' && isMoviePlayable(item as Movie) ? (
                <button
                  type="button"
                  onClick={() => openCineSrcMovie(item.id, item.title)}
                  className="btn-primary min-h-[40px] px-5 text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>WATCH MOVIE</span>
                </button>
              ) : primaryVideo ? (
                <button
                  type="button"
                  onClick={() => openVideoPlayer(
                    playableVideos.length > 0 ? playableVideos : [primaryVideo],
                    0,
                    item.title
                  )}
                  className="btn-primary min-h-[40px] px-5 text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{trailerLabel}</span>
                </button>
              ) : null}

              <Link
                to={detailPath}
                className="btn-secondary min-h-[40px] px-5 text-xs font-mono font-semibold tracking-wider uppercase inline-flex items-center gap-2"
              >
                <span>EXPLORE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8E8E93]" />
              </Link>

              <button
                type="button"
                onClick={() => toggleWatchlist(item)}
                aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                className={`p-2.5 border transition-colors ${
                  isSaved
                    ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                    : 'bg-transparent text-[#8E8E93] hover:text-white border-white/15'
                }`}
                title={isSaved ? 'In Watchlist' : 'Save to Watchlist'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TonightsPickSection;
