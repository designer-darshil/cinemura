import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Award } from 'lucide-react';
import { AnimeItem } from '../types/anime';

interface AnimeCardProps {
  item: AnimeItem;
}

export const AnimeCard = React.forwardRef<HTMLAnchorElement, AnimeCardProps>(({ item }, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = item.image || item.thumb;

  return (
    <Link
      ref={ref}
      to={`/anime/${encodeURIComponent(item.id)}`}
      tabIndex={0}
      className="group relative bg-[#111114] border border-white/5 hover:border-white/25 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
    >
      {/* 2:3 Poster Image Viewport */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#141418]">
        {!loaded && !imgError && <div className="absolute inset-0 skeleton-pulse" />}

        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={item.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImgError(true);
              setLoaded(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#17171B] text-[#8E8E93]">
            <Tv className="w-8 h-8 text-[#8E8E93]/40 mb-2" />
            <span className="text-[10px] font-mono tracking-widest uppercase">NO POSTER</span>
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Rank Badge */}
        {typeof item.rank === 'number' && item.rank > 0 && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#E43D3D] text-white px-2 py-0.5 shadow-md">
            <Award className="w-3 h-3" />
            <span className="text-[9px] font-mono font-extrabold tracking-wider">
              #{item.rank}
            </span>
          </div>
        )}

        {/* Format / Episode Badges */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[9px] font-mono">
          {item.type && (
            <span className="px-1.5 py-0.5 bg-black/80 text-[#F2F0EC] border border-white/15 uppercase font-semibold">
              {item.type}
            </span>
          )}
          {typeof item.episodes === 'number' && item.episodes > 0 && (
            <span className="px-1.5 py-0.5 bg-black/80 text-[#8E8E93] border border-white/15 font-semibold">
              {item.episodes} EPS
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col justify-between flex-grow space-y-1.5 bg-[#111114]">
        <h3 className="font-display font-semibold text-[14px] sm:text-[15px] text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-snug line-clamp-1">
          <span className="truncate">{item.title}</span>
        </h3>

        {/* Genres or Status */}
        {item.genres && item.genres.length > 0 ? (
          <p className="text-[11px] font-mono text-[#8E8E93] truncate uppercase tracking-wider">
            {item.genres.slice(0, 2).join(' • ')}
          </p>
        ) : item.status ? (
          <p className="text-[11px] font-mono text-[#8E8E93] truncate uppercase tracking-wider">
            {item.status}
          </p>
        ) : null}
      </div>
    </Link>
  );
});

AnimeCard.displayName = 'AnimeCard';

export const AnimeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111114] border border-white/10 flex flex-col justify-between overflow-hidden shadow-lg animate-pulse">
      <div className="w-full aspect-[2/3] bg-[#18181D]" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-white/10" />
        <div className="h-3 w-1/2 bg-white/10" />
      </div>
    </div>
  );
};
