import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Bookmark, ArrowRight } from 'lucide-react';
import { MediaItem, Movie, Series } from '../types';
import { useApp } from '../context/AppContext';
import { selectPrimaryVideo, sortVideosWithPrimaryFirst, getVideoButtonLabel } from '../utils/trailer';
import { isMoviePlayable } from '../utils/vidlink';

interface TonightsPickSectionProps {
  item: MediaItem;
}

export const TonightsPickSection: React.FC<TonightsPickSectionProps> = ({ item }) => {
  const { openVideoPlayer, openVidLinkMovie, toggleWatchlist, isInWatchlist } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const detailPath = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const isSaved = isInWatchlist(item.id);

  // IntersectionObserver for smooth entrance transition
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const primaryVideo = selectPrimaryVideo(item.videos, item.language) || item.primaryVideo || null;
  const playableVideos = sortVideosWithPrimaryFirst(item.videos, item.language);
  const trailerLabel = getVideoButtonLabel(primaryVideo);

  const durationOrSeasons = item.type === 'movie'
    ? (item.runtime && item.runtime !== 'N/A' ? item.runtime : null)
    : ((item as Series).seasonsCount ? `${(item as Series).seasonsCount} ${(item as Series).seasonsCount === 1 ? 'SEASON' : 'SEASONS'}` : null);

  const artworkImage = item.backdrop || item.poster;

  return (
    <section
      ref={sectionRef}
      className={`relative w-full transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Section Header Label */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[#E43D3D] inline-block animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#E43D3D] uppercase">
            TONIGHT'S CURATED PICK
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
          AUDITORIUM FEATURE 01
        </span>
      </div>

      {/* Dominant Showcase Card with Atmospheric Light Glow */}
      <div className="relative bg-[#111114] border border-white/15 overflow-hidden group">
        
        {/* Atmospheric Artwork-Derived Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={artworkImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover filter blur-3xl opacity-20 scale-125 transform group-hover:scale-130 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-[#0B0B0D]/75" />
          <div className="absolute inset-0 film-grain opacity-25" />
        </div>

        {/* Content Grid: Artwork (Left) + Information (Right) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Large Artwork Side */}
          <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[420px] lg:min-h-[480px] overflow-hidden bg-[#141418]">
            <img
              src={artworkImage}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-95 contrast-105"
            />
            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:via-[#111114]/40 lg:to-[#111114]" />
            <div className="absolute inset-0 film-grain opacity-30 pointer-events-none" />

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
                className="absolute inset-0 m-auto w-14 h-14 bg-[#E43D3D] text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-2xl cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white pl-0.5" />
              </button>
            )}

            {/* Type badge on artwork */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#E43D3D] text-white uppercase shadow-md">
                FEATURED
              </span>
              <span className="text-[10px] font-mono tracking-wider px-2 py-1 bg-black/60 backdrop-blur-md text-[#F2F0EC] border border-white/10 uppercase">
                {item.type === 'movie' ? 'CINEMA EXCLUSIVE' : 'EPISODIC SERIES'}
              </span>
            </div>
          </div>

          {/* Movie Information Side */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-[#111114]/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-white/10">
            
            <div className="space-y-4">
              
              {/* Metadata Badges Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93]">
                <span className="text-white font-bold">{item.year}</span>
                {durationOrSeasons && (
                  <>
                    <span>•</span>
                    <span className="text-[#F2F0EC]">{durationOrSeasons}</span>
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

              {/* Title */}
              <Link to={detailPath} className="block group/title">
                <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#F2F0EC] group-hover/title:text-[#E43D3D] transition-colors leading-[1.05] uppercase tracking-tight">
                  {item.title}
                </h2>
              </Link>

              {/* Genres */}
              {item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/10"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {item.synopsis && (
                <p className="type-body text-sm sm:text-base text-[#F2F0EC]/80 font-light leading-relaxed line-clamp-4 pt-1">
                  {item.synopsis}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
              {item.type === 'movie' && isMoviePlayable(item as Movie) ? (
                <button
                  type="button"
                  onClick={() => openVidLinkMovie(item.id, item.title)}
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg"
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
                  className="bg-[#E43D3D] hover:bg-[#c02e2e] text-white px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{trailerLabel}</span>
                </button>
              ) : null}

              <Link
                to={detailPath}
                className="btn-secondary px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase inline-flex items-center gap-2"
              >
                <span>EXPLORE TITLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E43D3D]" />
              </Link>

              <button
                type="button"
                onClick={() => toggleWatchlist(item)}
                aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                className={`p-3 border transition-colors ${
                  isSaved
                    ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                    : 'bg-transparent text-[#8E8E93] hover:text-white border-white/15 hover:border-white/40'
                }`}
                title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default TonightsPickSection;
