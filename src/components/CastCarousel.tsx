import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CastMember } from '../types';

interface CastCarouselProps {
  cast: CastMember[];
  title?: string;
}

export const CastCarousel: React.FC<CastCarouselProps> = ({
  cast,
  title = 'CAST'
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
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [cast]);

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

  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header with Title, Count & Prev/Next Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
            CREDITS
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F0EC] tracking-tight uppercase">
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
            className="w-8 h-8 flex items-center justify-center bg-[#111114] border border-white/15 text-[#F2F0EC] hover:bg-[#E43D3D] hover:border-[#E43D3D] hover:text-white disabled:opacity-25 disabled:hover:bg-[#111114] disabled:hover:border-white/15 disabled:hover:text-[#F2F0EC] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            aria-label="Next cast"
            className="w-8 h-8 flex items-center justify-center bg-[#111114] border border-white/15 text-[#F2F0EC] hover:bg-[#E43D3D] hover:border-[#E43D3D] hover:text-white disabled:opacity-25 disabled:hover:bg-[#111114] disabled:hover:border-white/15 disabled:hover:text-[#F2F0EC] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Rail Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1"
      >
        {cast.map((member) => (
          <Link
            key={member.id}
            to={`/person/${member.slug || member.id}`}
            className="group relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[165px] bg-[#111114] border border-white/10 hover:border-[#E43D3D] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
          >
            {/* Portrait Image */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Actor & Character Metadata */}
            <div className="p-3 flex flex-col justify-between flex-grow space-y-1">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-tight line-clamp-1 flex items-center justify-between gap-1">
                <span className="truncate">{member.name}</span>
                <ArrowUpRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#E43D3D] transition-opacity" />
              </h3>
              {member.character && (
                <p className="text-[11px] font-mono text-[#8E8E93] line-clamp-1">
                  as {member.character}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
