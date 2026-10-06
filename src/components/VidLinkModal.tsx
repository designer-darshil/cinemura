import React, { useEffect, useRef, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getVidLinkMovieUrl, getVidLinkTvUrl } from '../utils/vidlink';

export const VidLinkModal: React.FC = () => {
  const { vidLinkSession, closeVidLink } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Focus restoration & body scroll lock
  useEffect(() => {
    if (vidLinkSession) {
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
  }, [Boolean(vidLinkSession)]);

  // Reset loading & error state on session change
  useEffect(() => {
    if (vidLinkSession) {
      setIsLoading(true);
      setIsError(false);
    }
  }, [vidLinkSession?.tmdbId, vidLinkSession?.season, vidLinkSession?.episode]);

  // Keyboard accessibility (Escape key and focus trap)
  useEffect(() => {
    if (!vidLinkSession) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeVidLink();
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
  }, [vidLinkSession, closeVidLink]);

  if (!vidLinkSession) return null;

  const embedUrl =
    vidLinkSession.type === 'movie'
      ? getVidLinkMovieUrl(vidLinkSession.tmdbId)
      : getVidLinkTvUrl(
          vidLinkSession.tmdbId,
          vidLinkSession.season ?? 1,
          vidLinkSession.episode ?? 1
        );

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="VidLink Player Lightbox"
      tabIndex={-1}
      onClick={closeVidLink}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-200 select-none p-3 sm:p-6 md:p-10"
    >
      {/* ==================================================
          MINIMAL CLOSE CONTROL (UPPER-RIGHT CORNER)
         ================================================== */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={closeVidLink}
        aria-label="Close playback"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 text-white/70 hover:text-white bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/30 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* ==================================================
          CONTAINED 16:9 VIDLINK PLAYER CONTAINER
          Calculated based on BOTH available viewport width & height
          so neither dimension ever exceeds the viewport.
         ================================================== */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(calc(100vw - 32px), calc((100dvh - 80px) * (16 / 9)))',
          aspectRatio: '16 / 9',
          maxHeight: 'calc(100dvh - 80px)',
          maxWidth: 'min(calc(100vw - 32px), calc((100dvh - 80px) * (16 / 9)))'
        }}
        className="relative bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Local 16:9 Player Skeleton while loading */}
        {isLoading && !isError && (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#E43D3D] rounded-full animate-spin mb-2" />
          </div>
        )}

        {/* Minimal Error State */}
        {isError ? (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center text-center p-6 z-20">
            <AlertCircle className="w-8 h-8 text-white/50 mb-3" />
            <span className="text-xs font-mono tracking-widest text-[#F2F0EC] uppercase font-bold">
              VIDEO UNAVAILABLE
            </span>
            <button
              type="button"
              onClick={closeVidLink}
              className="mt-4 px-4 py-2 border border-white/20 text-xs font-mono tracking-wider text-white hover:bg-white/10 transition-colors"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={vidLinkSession.title || 'VidLink Player'}
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

export default VidLinkModal;
