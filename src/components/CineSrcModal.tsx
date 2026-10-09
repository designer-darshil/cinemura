import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, AlertCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCineSrcMovieUrl, getCineSrcTvUrl, CINESRC_ORIGIN } from '../utils/cinesrc';

type PlayerStatus = 'loading' | 'ready' | 'error';

export const CineSrcModal: React.FC = () => {
  const { cineSrcSession, closeCineSrc } = useApp();

  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('loading');
  const [retryKey, setRetryKey] = useState<number>(0);
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Focus restoration & body scroll lock
  useEffect(() => {
    if (cineSrcSession) {
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
  }, [Boolean(cineSrcSession)]);

  // Generate & validate embed URL
  useEffect(() => {
    if (!cineSrcSession) {
      setEmbedUrl('');
      setUrlError(null);
      return;
    }

    try {
      const url =
        cineSrcSession.type === 'movie'
          ? getCineSrcMovieUrl(cineSrcSession.tmdbId)
          : getCineSrcTvUrl(
              cineSrcSession.tmdbId,
              cineSrcSession.season ?? 1,
              cineSrcSession.episode ?? 1
            );
      setEmbedUrl(url);
      setUrlError(null);
    } catch (err: any) {
      console.error('[CineSrc] Failed to generate embed URL:', err);
      setUrlError(err?.message || 'Invalid TMDb identifier for CineSrc player.');
      setPlayerStatus('error');
    }
  }, [
    cineSrcSession?.type,
    cineSrcSession?.tmdbId,
    cineSrcSession?.season,
    cineSrcSession?.episode,
    retryKey
  ]);

  // Initialization timeout & status reset on session change or retry
  useEffect(() => {
    if (!cineSrcSession || urlError) return;

    setPlayerStatus('loading');

    // 10-second failsafe timeout: if cinesrc:ready is not received, transition to error
    const timer = setTimeout(() => {
      setPlayerStatus((current) => (current === 'loading' ? 'error' : current));
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [embedUrl, retryKey, urlError, Boolean(cineSrcSession)]);

  // Listen for CineSrc player postMessage events (origin restricted)
  useEffect(() => {
    if (!cineSrcSession) return;

    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from CineSrc official origin
      if (event.origin !== CINESRC_ORIGIN) return;

      let data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object') {
            data = parsed;
          }
        } catch {
          // Plain text message
        }
      }

      const eventName =
        typeof data === 'string'
          ? data
          : data?.type || data?.event || data?.name || '';

      if (eventName === 'cinesrc:ready') {
        setPlayerStatus('ready');
      } else if (eventName === 'cinesrc:error') {
        setPlayerStatus('error');
      } else if (eventName === 'cinesrc:close') {
        closeCineSrc();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [cineSrcSession, closeCineSrc]);

  // Keyboard accessibility: Escape key and focus trap
  useEffect(() => {
    if (!cineSrcSession) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCineSrc();
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
  }, [cineSrcSession, closeCineSrc]);

  const handleRetry = useCallback(() => {
    setPlayerStatus('loading');
    setRetryKey((prev) => prev + 1);
  }, []);

  if (!cineSrcSession) return null;

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="CineSrc Player Lightbox"
      tabIndex={-1}
      onClick={closeCineSrc}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-200 select-none p-2 sm:p-6 md:p-10"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Upper-Right Corner Close Button */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={closeCineSrc}
        aria-label="Close playback"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          right: 'max(1rem, env(safe-area-inset-right, 1rem))'
        }}
        className="absolute z-50 p-2 sm:p-2.5 text-white/70 hover:text-white bg-black/70 hover:bg-black/95 border border-white/10 hover:border-white/30 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#E43D3D]"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* 16:9 Contained Responsive CineSrc Player Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(calc(100vw - 16px), calc((100dvh - 80px) * (16 / 9)))',
          maxWidth: 'min(calc(100vw - 16px), calc((100dvh - 80px) * (16 / 9)))',
          maxHeight: 'calc(100dvh - 80px)',
          aspectRatio: '16 / 9',
          position: 'relative'
        }}
        className="relative w-full bg-[#0B0B0D] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Responsive CineSrc iframe embed */}
        {embedUrl && !urlError && (
          <iframe
            key={`${embedUrl}-${retryKey}`}
            src={embedUrl}
            title={cineSrcSession.title || 'CineSrc Video Player'}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute inset-0 w-full h-full border-0 block"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0
            }}
          />
        )}

        {/* Loading Overlay */}
        {playerStatus === 'loading' && (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center z-10 pointer-events-none transition-opacity duration-200">
            <div className="w-9 h-9 border-2 border-white/20 border-t-[#E43D3D] rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono text-[#8E8E93] tracking-widest uppercase">
              INITIALIZING CINESRC...
            </span>
          </div>
        )}

        {/* Error State with Retry & Back Actions */}
        {playerStatus === 'error' && (
          <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center text-center p-6 z-20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#E43D3D]/10 border border-[#E43D3D]/30 flex items-center justify-center text-[#E43D3D] mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-display font-bold text-base sm:text-lg text-[#F2F0EC] uppercase tracking-wide">
                PLAYBACK UNAVAILABLE
              </h4>
              <p className="text-xs font-mono text-[#8E8E93] leading-relaxed">
                {urlError || 'The video stream could not be loaded or timed out. Please try again or return to the details page.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-2.5 bg-[#E43D3D] hover:bg-[#c02e2e] text-white text-xs font-mono font-bold tracking-wider uppercase inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETRY</span>
              </button>

              <button
                type="button"
                onClick={closeCineSrc}
                className="px-5 py-2.5 border border-white/20 hover:border-white/40 text-[#F2F0EC] hover:bg-white/10 text-xs font-mono tracking-wider uppercase transition-colors"
              >
                BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CineSrcModal;
