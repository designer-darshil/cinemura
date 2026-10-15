import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CastMember } from '../types';
import { CastRailSkeleton } from './StateViews';

interface CastCarouselProps {
  cast: CastMember[];
  title?: string;
  loading?: boolean;
}

export const CastCarousel: React.FC<CastCarouselProps> = ({
  cast,
  title = 'CAST',
  loading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    if (loading) return;
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [cast, loading]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <CastRailSkeleton title={title} count={7} />;
  }

  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header with Title, Count & Restrained Circular Controls */}
      <div className="flex items-end justify-between border-b border-white/10 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-[2px] bg-[#E43D3D] inline-block" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase font-medium">
              ENSEMBLE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F2F0EC] tracking-tight uppercase">
            {title} ({cast.length})
          </h2>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            aria-label="Previous cast"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0B0B0D]/50 border border-white/20 text-[#8E8E93] hover:text-white hover:border-white/50 disabled:opacity-20 disabled:hover:text-[#8E8E93] disabled:hover:border-white/20 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            aria-label="Next cast"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0B0B0D]/50 border border-white/20 text-[#8E8E93] hover:text-white hover:border-white/50 disabled:opacity-20 disabled:hover:text-[#8E8E93] disabled:hover:border-white/20 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Editorial Rail Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1"
      >
        {cast.map((member) => (
          <Link
            key={member.id}
            to={`/person/${member.slug || member.id}`}
            className="group relative flex-shrink-0 w-[125px] sm:w-[145px] md:w-[160px] bg-[#111114] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
          >
            {/* Portrait Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
            </div>

            {/* Actor & Character Metadata */}
            <div className="p-3 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-tight line-clamp-1 flex items-center justify-between gap-1">
                  <span className="truncate">{member.name}</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#E43D3D] transition-opacity" />
                </h3>
                {member.character && (
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E93] truncate mt-1">
                    {member.character}
                  </p>
                )}
              </div>
              <div className="w-3 h-[2px] bg-[#E43D3D] opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
