import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TrailerModal: React.FC = () => {
  const {
    videoSession,
    trailerUrl,
    trailerTitle,
    closeTrailer,
    nextVideo,
    prevVideo
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Derive active video and playlist
  const videos = videoSession?.videos || (trailerUrl ? [{
    id: 'single',
    key: trailerUrl.includes('embed/')
      ? trailerUrl.split('embed/')[1]?.split('?')[0]
      : trailerUrl.includes('watch?v=')
      ? trailerUrl.split('watch?v=')[1]?.split('&')[0]
      : trailerUrl,
    name: trailerTitle || 'Video',
    type: 'Trailer',
    site: 'YouTube',
    official: true
  }] : []);

  const currentIndex = videoSession ? videoSession.currentIndex : 0;
  const activeVideo = videos[currentIndex] || null;
  const hasMultiple = videos.length > 1;

  // Manage focus restoration and body scroll lock
  useEffect(() => {
    if (activeVideo) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        triggerRef.current?.focus();
      };
    }
  }, [Boolean(activeVideo)]);

  // Reset loading and error states when key changes
  useEffect(() => {
    if (activeVideo) {
      setIsLoading(true);
      setIsError(false);
    }
  }, [activeVideo?.key]);

  // Handle keyboard events (Escape, ArrowLeft, ArrowRight, Tab lock)
  useEffect(() => {
    if (!activeVideo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTrailer();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        e.preventDefault();
        prevVideo();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        e.preventDefault();
        nextVideo();
      } else if (e.key === 'Tab' && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, hasMultiple, closeTrailer, nextVideo, prevVideo]);

  if (!activeVideo || !activeVideo.key) return null;

  const embedUrl = `https://www.youtube.com/embed/${activeVideo.key}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`;

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Video player lightbox"
      tabIndex={-1}
      onClick={closeTrailer}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-200 select-none p-2 sm:p-6 md:p-10"
    >
      {/* ==================================================
          MINIMAL CLOSE CONTROL (UPPER-RIGHT CORNER WITH SAFE AREA)
         ================================================== */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={closeTrailer}
        aria-label="Close video"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          right: 'max(1rem, env(safe-area-inset-right, 1rem))'
        }}
        className="absolute z-50 p-2 sm:p-2.5 text-white/70 hover:text-white bg-black/70 hover:bg-black/95 border border-white/10 hover:border-white/30 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* ==================================================
          MINIMAL PREVIOUS / NEXT CONTROLS (IF MULTIPLE VIDEOS)
         ================================================== */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevVideo();
            }}
            disabled={currentIndex === 0}
            aria-label="Previous video"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 border border-white/10 hover:border-white/30 rounded-full disabled:opacity-0 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextVideo();
            }}
            disabled={currentIndex === videos.length - 1}
            aria-label="Next video"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 border border-white/10 hover:border-white/30 rounded-full disabled:opacity-0 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* ==================================================
          RESPONSIVE 16:9 CONTAINED PLAYER BOX
          Calculated based on BOTH available viewport width & height
          so neither dimension ever exceeds the viewport.
         ================================================== */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(calc(100vw - 16px), calc((100dvh - 80px) * (16 / 9)))',
          aspectRatio: '16 / 9',
          maxHeight: 'calc(100dvh - 80px)',
          maxWidth: 'min(calc(100vw - 16px), calc((100dvh - 80px) * (16 / 9)))'
        }}
        className="relative bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Exact 16:9 player skeleton while loading */}
        {isLoading && !isError && (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#E43D3D] rounded-full animate-spin mb-2" />
          </div>
        )}

        {/* Minimal error state */}
        {isError ? (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center text-center p-6 z-20">
            <AlertCircle className="w-8 h-8 text-white/50 mb-3" />
            <span className="text-xs font-mono tracking-widest text-[#F2F0EC] uppercase font-bold">
              VIDEO UNAVAILABLE
            </span>
          </div>
        ) : (
          <iframe
            key={activeVideo.key}
            src={embedUrl}
            title={activeVideo.name || 'Video Player'}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setIsError(true);
            }}
            className="w-full h-full block border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
