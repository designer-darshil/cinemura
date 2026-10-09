import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Bookmark } from 'lucide-react';
import { MediaItem } from '../types';
import { useApp } from '../context/AppContext';
import { getImageWithFallback } from '../utils/image';

interface MediaCardProps {
  item: MediaItem;
  variant?: 'poster' | 'horizontal' | 'editorial';
  aspectRatio?: 'poster' | 'backdrop';
}

export const MediaCard = React.forwardRef<any, MediaCardProps>(({
  item,
  variant = 'poster',
  aspectRatio
}, ref) => {
  const { openTrailer, toggleWatchlist, isInWatchlist } = useApp();
  const detailPath = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const effectiveRatio = aspectRatio || (variant === 'horizontal' ? 'backdrop' : 'poster');
  const isSaved = isInWatchlist(item.id);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    effectiveRatio === 'poster' ? (item.poster || item.backdrop) : (item.backdrop || item.poster)
  );

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.trailerUrl) {
      openTrailer(item.trailerUrl, item.title);
    }
  };

  const handleImageError = () => {
    const fallback = getImageWithFallback(null, effectiveRatio === 'poster' ? 'poster' : 'backdrop');
    setImgSrc(fallback);
    setImageLoaded(true);
  };

  return (
    <Link
      ref={ref}
      to={detailPath}
      tabIndex={0}
      className="group relative flex flex-col justify-between overflow-hidden bg-[#111114] border border-white/5 hover:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 ease-out"
    >
      {/* Aspect Image Container */}
      <div className={`relative w-full overflow-hidden bg-[#121215] ${effectiveRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/9]'}`}>
        {!imageLoaded && <div className="absolute inset-0 skeleton-pulse" />}
        <img
          src={imgSrc}
          alt={item.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Watchlist Action Control */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWatchlist(item);
          }}
          aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            isSaved
              ? 'bg-[#E43D3D] text-white opacity-100'
              : 'bg-black/60 text-[#8E8E93] hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isSaved ? 'In Watchlist' : 'Save to Watchlist'}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Subtle Trailer Play Icon (Desktop Hover) */}
        {item.trailerUrl && (
          <button
            onClick={handleTrailerClick}
            className="hidden md:flex absolute inset-0 m-auto w-10 h-10 bg-black/70 hover:bg-[#E43D3D] text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
            aria-label="Play Trailer"
          >
            <Play className="w-4 h-4 fill-white pl-0.5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col justify-between flex-grow space-y-1 bg-[#0F0F12]">
        <h3 className="font-sans font-medium text-sm sm:text-[15px] text-[#F2F0EC] group-hover:text-white transition-colors leading-snug line-clamp-1">
          {item.title}
        </h3>

        {/* Quiet Genre or Subtitle */}
        {item.genres && item.genres.length > 0 && (
          <p className="text-[11px] font-mono text-[#8E8E93] truncate uppercase tracking-wider">
            {item.genres.slice(0, 2).join(' / ')}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-[#8E8E93] font-mono pt-0.5">
          <span>{item.year || '—'}</span>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 text-[#8E8E93] group-hover:text-[#F2F0EC] transition-colors">
              <Star className="w-3 h-3 fill-[#E43D3D] text-[#E43D3D]" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

MediaCard.displayName = 'MediaCard';

/* Cast Card Component */
export interface CastCardProps {
  id: string;
  name: string;
  character?: string;
  image: string;
  slug: string;
}

export const CastCard: React.FC<CastCardProps> = ({ name, character, image, slug }) => {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(image);

  const handleError = () => {
    setSrc(getImageWithFallback(null, 'profile'));
    setLoaded(true);
  };

  return (
    <Link
      to={`/person/${slug}`}
      tabIndex={0}
      className="group relative flex flex-col justify-between overflow-hidden bg-[#111114] border border-white/5 hover:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 ease-out"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#121215]">
        {!loaded && <div className="absolute inset-0 skeleton-pulse" />}
        <img
          src={src}
          alt={name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-3 flex flex-col justify-between flex-grow space-y-0.5 bg-[#0F0F12]">
        <h3 className="font-sans font-medium text-sm sm:text-[15px] text-[#F2F0EC] group-hover:text-white transition-colors leading-snug line-clamp-1">
          {name}
        </h3>
        {character && (
          <p className="text-xs text-[#8E8E93] font-light line-clamp-1">
            {character}
          </p>
        )}
      </div>
    </Link>
  );
};

/* Person / Creator Card Component */
export interface PersonCardProps {
  id: string;
  name: string;
  role?: string;
  knownFor?: string[];
  portrait: string;
  slug: string;
}

export const PersonCard = React.forwardRef<HTMLAnchorElement, PersonCardProps>(({ name, role, knownFor, portrait, slug }, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(portrait);

  const handleError = () => {
    setSrc(getImageWithFallback(null, 'profile'));
    setLoaded(true);
  };

  return (
    <Link
      ref={ref}
      to={`/person/${slug}`}
      tabIndex={0}
      className="group relative flex flex-col justify-between overflow-hidden bg-[#111114] border border-white/5 hover:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 ease-out"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#121215]">
        {!loaded && <div className="absolute inset-0 skeleton-pulse" />}
        <img
          src={src}
          alt={name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-3 flex flex-col justify-between flex-grow space-y-0.5 bg-[#0F0F12]">
        <h3 className="font-sans font-medium text-sm sm:text-[15px] text-[#F2F0EC] group-hover:text-white transition-colors leading-snug line-clamp-1">
          {name}
        </h3>
        {role && (
          <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider line-clamp-1">
            {role}
          </p>
        )}
        {knownFor && knownFor.length > 0 && !role && (
          <p className="text-xs text-[#8E8E93] font-light line-clamp-1">
            {knownFor.join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
});

PersonCard.displayName = 'PersonCard';
