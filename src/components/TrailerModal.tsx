import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getVideoEmbedUrl, formatVideoDate } from '../utils/trailer';

export const TrailerModal: React.FC = () => {
  const {
    videoSession,
    trailerUrl,
    trailerTitle,
    closeTrailer,
    nextVideo,
    prevVideo,
    selectVideoIndex
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Derive active video and playlist
  const videos = videoSession?.videos || (trailerUrl ? [{
    id: 'single',
    key: trailerUrl.includes('embed/') ? trailerUrl.split('embed/')[1]?.split('?')[0] : trailerUrl,
    name: trailerTitle || 'Official Preview',
    type: 'Trailer',
    site: 'YouTube',
    official: true
  }] : []);

  const currentIndex = videoSession ? videoSession.currentIndex : 0;
  const activeVideo = videos[currentIndex] || null;
  const parentTitle = videoSession?.parentTitle;

  // Manage focus restoration and body scroll lock
  useEffect(() => {
    if (activeVideo) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      // Auto-focus dialog container
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        triggerRef.current?.focus();
      };
    }
  }, [Boolean(activeVideo)]);

  // Reset loading and error states when active video changes
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
      } else if (e.key === 'ArrowLeft' && videos.length > 1) {
        e.preventDefault();
        prevVideo();
      } else if (e.key === 'ArrowRight' && videos.length > 1) {
        e.preventDefault();
        nextVideo();
      } else if (e.key === 'Tab' && dialogRef.current) {
        // Simple focus trap within dialog
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
  }, [activeVideo, videos.length, closeTrailer, nextVideo, prevVideo]);

  if (!activeVideo) return null;

  const embedUrl = getVideoEmbedUrl(activeVideo);
  const hasMultiple = videos.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/92 transition-opacity duration-300"
      onClick={closeTrailer}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={activeVideo.name}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl xl:max-w-6xl bg-[#0E0E11] border border-white/12 shadow-2xl flex flex-col overflow-hidden outline-none transition-transform duration-300 transform scale-100"
      >
        {/* ==================================================
            TOP BAR: Context Label, Real Video Title, Close
           ================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0B0B0D] border-b border-white/10 shrink-0">
          
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#E43D3D] uppercase font-bold">
                {parentTitle ? parentTitle : 'CINEMURA MEDIA'}
              </span>
              {activeVideo.official && (
                <span className="text-[9px] font-mono tracking-widest text-[#8E8E93] uppercase px-1.5 py-0.2 bg-white/5 border border-white/10">
                  OFFICIAL
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#F2F0EC] truncate uppercase tracking-tight mt-0.5">
              {activeVideo.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Multi-video Navigation Controls */}
            {hasMultiple && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1">
                <button
                  type="button"
                  onClick={prevVideo}
                  disabled={currentIndex === 0}
                  aria-label="Previous video"
                  className="p-1 text-[#8E8E93] hover:text-[#F2F0EC] disabled:opacity-30 disabled:hover:text-[#8E8E93] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-[#8E8E93] px-1 tracking-wider">
                  {currentIndex + 1} / {videos.length}
                </span>
                <button
                  type="button"
                  onClick={nextVideo}
                  disabled={currentIndex === videos.length - 1}
                  aria-label="Next video"
                  className="p-1 text-[#8E8E93] hover:text-[#F2F0EC] disabled:opacity-30 disabled:hover:text-[#8E8E93] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Close Control */}
            <button
              type="button"
              onClick={closeTrailer}
              aria-label="Close video player"
              className="p-1.5 text-[#8E8E93] hover:text-[#E43D3D] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================
            CENTER: 16:9 Cinematic Video Player Canvas
           ================================================== */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          
          {/* Player Skeleton / Loading State */}
          {isLoading && !isError && (
            <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="w-7 h-7 border-2 border-[#E43D3D] border-t-transparent animate-spin mb-3" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#8E8E93] uppercase">
                INITIALIZING CINEMATIC STREAM
              </span>
            </div>
          )}

          {/* Player Error State */}
          {isError ? (
            <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center text-center p-6 z-20">
              <AlertCircle className="w-8 h-8 text-[#E43D3D] mb-3" />
              <span className="text-sm font-mono tracking-widest text-[#F2F0EC] uppercase font-bold">
                VIDEO UNAVAILABLE
              </span>
              <p className="text-xs text-[#8E8E93] mt-1.5 max-w-sm">
                The requested video stream cannot be embedded or has been restricted by its provider.
              </p>
              <button
                type="button"
                onClick={closeTrailer}
                className="mt-5 px-4 py-2 border border-white/20 text-xs font-mono tracking-wider hover:border-[#E43D3D] hover:text-[#E43D3D] transition-colors"
              >
                CLOSE VIEWER
              </button>
            </div>
          ) : (
            <iframe
              key={activeVideo.key}
              src={embedUrl}
              title={activeVideo.name}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIsError(true);
              }}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* ==================================================
            BOTTOM BAR: Video Type, Metadata, Playlist Strip
           ================================================== */}
        <div className="px-4 sm:px-6 py-3 bg-[#0B0B0D] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Left Metadata: Real Type & Site & Date */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] px-2.5 py-0.5 uppercase bg-[#E43D3D] text-white">
              {activeVideo.type ? activeVideo.type.toUpperCase() : 'VIDEO'}
            </span>

            {activeVideo.site && (
              <span className="font-mono text-[11px] text-[#8E8E93] uppercase">
                SOURCE: <strong className="text-[#F2F0EC]">{activeVideo.site}</strong>
              </span>
            )}

            {activeVideo.publishedAt && (
              <span className="hidden sm:inline font-mono text-[11px] text-[#8E8E93]">
                RELEASED: <strong className="text-[#F2F0EC]">{formatVideoDate(activeVideo.publishedAt)}</strong>
              </span>
            )}
          </div>

          {/* Right Navigation / Keyboard Shortcuts */}
          <div className="flex items-center gap-4 text-[#8E8E93] font-mono text-[11px]">
            {hasMultiple && (
              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-sm">
                {videos.map((v, idx) => (
                  <button
                    key={v.id || idx}
                    type="button"
                    onClick={() => selectVideoIndex(idx)}
                    title={v.name}
                    aria-label={`Switch to video ${idx + 1}: ${v.name}`}
                    className={`px-2 py-0.5 text-[10px] font-mono border transition-colors truncate max-w-[100px] ${
                      idx === currentIndex
                        ? 'border-[#E43D3D] text-[#E43D3D] bg-[#E43D3D]/10'
                        : 'border-white/10 text-[#8E8E93] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {v.type || `CLIP ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-[#636366] tracking-wider uppercase">
              ESC TO CLOSE
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
