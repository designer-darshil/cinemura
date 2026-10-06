import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoLightboxModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-fadeIn text-[#F2F0EC]"
    >
      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 bg-[#0B0B0D]/80">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#E43D3D] text-white flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-semibold text-sm sm:text-base tracking-wider text-[#F2F0EC] uppercase truncate max-w-xs sm:max-w-md">
            {title ? `PHOTOS — ${title}` : 'CINEMATIC PHOTO GALLERY'}
          </span>
          <span className="text-xs font-mono text-[#8E8E93] bg-white/5 border border-white/10 px-2 py-0.5">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close photo viewer"
          className="p-2 text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0 overflow-hidden">
        {/* Navigation Previous */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 z-20 p-3 bg-black/70 hover:bg-[#E43D3D] text-white border border-white/20 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Image */}
        <div className="relative w-full max-h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <img
            key={currentImage}
            src={currentImage}
            alt={title ? `${title} photo ${currentIndex + 1}` : `Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain shadow-2xl border border-white/10 animate-fadeIn"
          />
        </div>

        {/* Navigation Next */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 z-20 p-3 bg-black/70 hover:bg-[#E43D3D] text-white border border-white/20 transition-all hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="relative z-10 px-4 py-3 border-t border-white/10 bg-[#0B0B0D]/90 overflow-x-auto no-scrollbar flex items-center gap-2 justify-center">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
              className={`flex-shrink-0 w-16 h-10 sm:w-20 sm:h-12 overflow-hidden border transition-all ${
                idx === currentIndex
                  ? 'border-[#E43D3D] scale-105 opacity-100 ring-1 ring-[#E43D3D]'
                  : 'border-white/20 opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
