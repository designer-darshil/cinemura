import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface HorizontalRailProps {
  items: MediaItem[];
  variant?: 'poster' | 'horizontal';
}

export const HorizontalRail: React.FC<HorizontalRailProps> = ({ items, variant = 'poster' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/rail">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity hover:bg-[#E43D3D] hover:border-[#E43D3D]"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Rail Items Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {items.map(item => (
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
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-[#0B0B0D]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity hover:bg-[#E43D3D] hover:border-[#E43D3D]"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
