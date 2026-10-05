import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ArrowUpRight } from 'lucide-react';
import { MediaItem } from '../types';
import { useApp } from '../context/AppContext';

interface MediaCardProps {
  item: MediaItem;
  variant?: 'poster' | 'horizontal' | 'editorial';
  aspectRatio?: 'poster' | 'backdrop';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  variant = 'poster',
  aspectRatio
}) => {
  const { openTrailer } = useApp();
  const detailPath = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const effectiveRatio = aspectRatio || (variant === 'horizontal' ? 'backdrop' : 'poster');

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.trailerUrl) {
      openTrailer(item.trailerUrl, item.title);
    }
  };

  // Variant 3: Large Editorial Feature Card
  if (variant === 'editorial') {
    return (
      <div className="hidden group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 transform hover:-translate-y-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-7 relative min-h-[300px] bg-black overflow-hidden">
          <img
            src={item.backdrop || item.poster}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/40 opacity-80" />
          
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-extrabold tracking-[0.18em] px-2.5 py-1 uppercase bg-[#E43D3D] text-white">
              FEATURED EDITORIAL
            </span>
          </div>

          {item.trailerUrl && (
            <button
              onClick={handleTrailerClick}
              className="absolute inset-0 m-auto w-12 h-12 bg-[#E43D3D] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
              aria-label="Play Trailer"
            >
              <Play className="w-5 h-5 fill-white pl-0.5" />
            </button>
          )}
        </div>

        <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#929298] font-mono">
              <span className="uppercase">{item.type === 'movie' ? 'FEATURE FILM' : 'SERIES'} • {item.year}</span>
              <div className="flex items-center gap-1 text-[#E43D3D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#E43D3D]" />
                <span>{item.rating.toFixed(1)}</span>
              </div>
            </div>

            <Link to={detailPath}>
              <h3 className="type-h3 text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-tight flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#E43D3D]" />
              </h3>
            </Link>

            {item.genres.length > 0 && (
              <p className="type-label text-[#626269]">
                {item.genres.join(' • ')}
              </p>
            )}

            <p className="type-small line-clamp-3 font-light text-[#929298]">
              {item.synopsis}
            </p>
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link to={detailPath} className="btn-link inline-flex items-center gap-2 text-white text-md fw-bold uppercase">
              <span>EXPLORE TITLE →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Universal Standard Card (ENTIRE CARD IS A SINGLE FULLY CLICKABLE TARGET)
  return (
    <Link
      to={detailPath}
      tabIndex={0}
      className="group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      
      {/* 2:3 Aspect Image Container */}
      <div className={`relative w-full overflow-hidden bg-black ${effectiveRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/9]'}`}>
        <img
          src={effectiveRatio === 'poster' ? item.poster : item.backdrop}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`text-[8px] font-extrabold tracking-[0.15em] px-1.5 py-0.5 uppercase ${
            item.type === 'movie' ? 'bg-[#E43D3D] text-white' : 'bg-white text-black'
          }`}>
            {item.type === 'movie' ? 'MOVIE' : 'TV'}
          </span>
        </div>

        {/* Optional Play Button Overlay */}
        {item.trailerUrl && (
          <button
            onClick={handleTrailerClick}
            className="absolute inset-0 m-auto w-10 h-10 bg-[#E43D3D] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
            aria-label="Play Trailer"
          >
            <Play className="w-4 h-4 fill-white pl-0.5" />
          </button>
        )}
      </div>

      {/* Content Area (TITLE -> METADATA) */}
      <div className="p-3 flex flex-col justify-between flex-grow space-y-1">
        <h3 className="type-h3 text-xs sm:text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-snug line-clamp-1 flex items-center justify-between gap-1">
          <span className="truncate">{item.title}</span>
          <ArrowUpRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#E43D3D]" />
        </h3>

        <div className="flex items-center justify-between text-[11px] text-[#929298] font-mono pt-1">
          <span>{item.year || 'N/A'}</span>
          <div className="flex items-center gap-1 text-[#E43D3D] font-bold">
            <Star className="w-3 h-3 fill-[#E43D3D]" />
            <span>{item.rating ? item.rating.toFixed(1) : 'NR'}</span>
          </div>
        </div>
      </div>

    </Link>
  );
};

/* Unified Cast Card Component (ENTIRE CARD CLICKABLE) */
export interface CastCardProps {
  id: string;
  name: string;
  character?: string;
  image: string;
  slug: string;
}

export const CastCard: React.FC<CastCardProps> = ({ name, character, image, slug }) => {
  return (
    <Link
      to={`/person/${slug}`}
      tabIndex={0}
      className="group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-black">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />
      </div>

      <div className="p-3 flex flex-col justify-between flex-grow space-y-1">
        <h3 className="type-h3 text-xs sm:text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-snug line-clamp-1 flex items-center justify-between gap-1">
          <span className="truncate">{name}</span>
          <ArrowUpRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#E43D3D]" />
        </h3>
        {character && (
          <p className="text-[11px] text-[#929298] font-mono line-clamp-1">
            as {character}
          </p>
        )}
      </div>
    </Link>
  );
};

/* Unified Person / Director Card Component (ENTIRE CARD CLICKABLE) */
export interface PersonCardProps {
  id: string;
  name: string;
  role?: string;
  knownFor?: string[];
  portrait: string;
  slug: string;
}

export const PersonCard: React.FC<PersonCardProps> = ({ name, role, knownFor, portrait, slug }) => {
  return (
    <Link
      to={`/person/${slug}`}
      tabIndex={0}
      className="group relative bg-[#111114] border border-white/10 hover:border-[#E43D3D] focus:outline-none focus:ring-1 focus:ring-[#E43D3D] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-black">
        <img
          src={portrait}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />
        {role && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[8px] font-extrabold tracking-[0.15em] px-1.5 py-0.5 uppercase bg-[#E43D3D] text-white">
              {role}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col justify-between flex-grow space-y-1">
        <h3 className="type-h3 text-xs sm:text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-snug line-clamp-1 flex items-center justify-between gap-1">
          <span className="truncate">{name}</span>
          <ArrowUpRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#E43D3D]" />
        </h3>
        {knownFor && knownFor.length > 0 && (
          <p className="text-[11px] text-[#929298] font-mono line-clamp-1">
            {knownFor.join(' • ')}
          </p>
        )}
      </div>
    </Link>
  );
};
