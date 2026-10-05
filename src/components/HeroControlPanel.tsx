import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Star, Info, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { useApp } from '../context/AppContext';

interface HeroControlPanelProps {
  featuredItems: MediaItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const HeroControlPanel: React.FC<HeroControlPanelProps> = ({
  featuredItems,
  currentIndex,
  onSelectIndex,
}) => {
  const { openTrailer } = useApp();
  const [progress, setProgress] = useState(0);

  const currentItem = featuredItems[currentIndex] || featuredItems[0];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onSelectIndex((currentIndex + 1) % featuredItems.length);
          return 0;
        }
        return prev + 1.25;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, featuredItems.length, onSelectIndex]);

  if (!currentItem) return null;

  const handlePrev = () => {
    onSelectIndex((currentIndex - 1 + featuredItems.length) % featuredItems.length);
  };

  const handleNext = () => {
    onSelectIndex((currentIndex + 1) % featuredItems.length);
  };

  return (
    <div className="w-full bg-[#0B0B0D]/95 backdrop-blur-xl border border-white/12 p-4 sm:p-6 relative overflow-hidden group/hero">
      
      {/* Progress visual scrubber line at top of strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-[#E43D3D] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-14 h-20 sm:w-16 sm:h-24 flex-shrink-0 bg-black border border-white/15 overflow-hidden group-hover/hero:border-[#E43D3D] transition-colors">
            <img
              src={currentItem.poster}
              alt={currentItem.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-1 left-1 text-[8px] font-extrabold bg-[#E43D3D] text-white px-1 uppercase tracking-widest">
              {currentItem.type}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-[0.15em] text-[#8E8E93]">
              <span className="flex items-center gap-1 text-[#E43D3D] font-bold">
                <Sparkles className="w-3 h-3 text-[#E43D3D]" /> FEATURED #{currentIndex + 1}
              </span>
              <span>•</span>
              <span>{currentItem.year}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-white font-bold">
                <Star className="w-3 h-3 text-[#E43D3D] fill-[#E43D3D]" />
                {currentItem.rating.toFixed(1)}
              </span>
            </div>

            <Link
              to={currentItem.type === 'movie' ? `/movie/${currentItem.id}` : `/tv/${currentItem.id}`}
            >
              <h4 className="font-editorial-heading text-2xl sm:text-3xl text-[#F2F0EC] hover:text-[#E43D3D] transition-colors leading-none uppercase tracking-wider line-clamp-1">
                {currentItem.title}
              </h4>
            </Link>

            <p className="text-[11px] text-[#8E8E93] line-clamp-1 font-light uppercase tracking-wider">
              {currentItem.genres.join(' / ')} — {currentItem.synopsis}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
          
          {currentItem.trailerUrl && (
            <button
              onClick={() => openTrailer(currentItem.trailerUrl!, currentItem.title)}
              className="flex items-center gap-2 bg-[#E43D3D] hover:bg-[#F04545] text-white font-extrabold text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">TRAILER</span>
            </button>
          )}

          <Link
            to={currentItem.type === 'movie' ? `/movie/${currentItem.id}` : `/tv/${currentItem.id}`}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/15 text-white border border-white/15 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#E43D3D]" />
            <span className="hidden sm:inline">DETAILS</span>
          </Link>

          <div className="flex items-center gap-1 pl-2 border-l border-white/15">
            <button
              onClick={handlePrev}
              className="p-2 bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              aria-label="Previous featured item"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#8E8E93] px-2">
              0{currentIndex + 1} / 0{featuredItems.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors"
              aria-label="Next featured item"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
