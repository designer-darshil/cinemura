import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface HorizontalRailProps {
  items: MediaItem[];
  variant?: 'poster' | 'horizontal';
  exploreAllLink?: string;
  exploreAllText?: string;
}

export const HorizontalRail: React.FC<HorizontalRailProps> = ({
  items,
  variant = 'poster',
  exploreAllLink,
  exploreAllText = 'EXPLORE ALL'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [items, checkScrollBounds]);

  const handleScrollLeft = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = Math.max(el.clientWidth * 0.75, 300);
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = Math.max(el.clientWidth * 0.75, 300);
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/rail">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={handleScrollLeft}
        disabled={!canScrollLeft}
        className={`hidden md:flex absolute -left-3 lg:-left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 backdrop-blur-sm border border-white/15 rounded-full text-white items-center justify-center transition-all ${
          canScrollLeft
            ? 'opacity-0 group-hover/rail:opacity-100 hover:bg-white/10 hover:border-white/40 cursor-pointer shadow-lg'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Rail Items Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex-shrink-0 ${
              variant === 'poster'
                ? 'w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]'
                : 'w-[240px] sm:w-[280px] md:w-[320px]'
            }`}
          >
            <MediaCard item={item} variant={variant} />
          </div>
        ))}

        {/* Explore All Card (matching editorial rail pattern) */}
        {exploreAllLink && (
          <div
            className={`flex-shrink-0 ${
              variant === 'poster'
                ? 'w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]'
                : 'w-[240px] sm:w-[280px] md:w-[320px]'
            }`}
          >
            <Link
              to={exploreAllLink}
              className="group/all flex flex-col items-center justify-center h-full aspect-[2/3] bg-[#111114] border border-white/10 hover:border-white/30 transition-colors duration-300 p-6 text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 group-hover/all:border-white/40 group-hover/all:bg-white/5 flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <span className="type-label text-xs tracking-wider text-white group-hover/all:text-[#E43D3D] transition-colors font-bold uppercase">
                {exploreAllText}
              </span>
              <span className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
                VIEW ALL →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={handleScrollRight}
        disabled={!canScrollRight}
        className={`hidden md:flex absolute -right-3 lg:-right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 backdrop-blur-sm border border-white/15 rounded-full text-white items-center justify-center transition-all ${
          canScrollRight
            ? 'opacity-0 group-hover/rail:opacity-100 hover:bg-white/10 hover:border-white/40 cursor-pointer shadow-lg'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HorizontalRail;
