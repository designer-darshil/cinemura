import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { getCineSrcMovieUrl, getCineSrcTvUrl, validateTmdbId, CINESRC_ORIGIN } from '../utils/cinesrc';
import { getMovieDetail, getTvDetail, getTvSeasonDetail } from '../services/tmdb';

type PlayerStatus = 'loading' | 'ready' | 'error';

export const WatchPage: React.FC = () => {
  const { type: paramType, id } = useParams<{ type?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Content type resolution:
  const pathname = location.pathname;
  const isMovieRoute = pathname.startsWith('/watch/movie/');
  const isTvRoute = pathname.startsWith('/watch/tv/');
  const mediaType: 'movie' | 'tv' = isMovieRoute ? 'movie' : isTvRoute ? 'tv' : (paramType === 'tv' ? 'tv' : 'movie');

  // TV Season and Episode resolution:
  const seasonParam = searchParams.get('s') || searchParams.get('season') || '1';
  const episodeParam = searchParams.get('e') || searchParams.get('episode') || '1';
  const [currentSeason, setCurrentSeason] = useState<number>(() => Math.max(1, parseInt(seasonParam, 10) || 1));
  const [currentEpisode, setCurrentEpisode] = useState<number>(() => Math.max(1, parseInt(episodeParam, 10) || 1));

  // Sync state if search params change externally
  useEffect(() => {
    const s = Math.max(1, parseInt(searchParams.get('s') || searchParams.get('season') || '1', 10) || 1);
    const e = Math.max(1, parseInt(searchParams.get('e') || searchParams.get('episode') || '1', 10) || 1);
    setCurrentSeason(s);
    setCurrentEpisode(e);
  }, [searchParams]);

  // Player state:
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('loading');
  const [retryKey, setRetryKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [titleInfo, setTitleInfo] = useState<{
    title: string;
    episodeTitle?: string;
    year?: number;
  }>({ title: '' });

  // URL & Validation
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Generate verified CineSrc embed URL
  useEffect(() => {
    if (!id) {
      setUrlError('TMDb identifier is missing.');
      setPlayerStatus('error');
      return;
    }

    try {
      validateTmdbId(id);
      const url = mediaType === 'movie'
        ? getCineSrcMovieUrl(id)
        : getCineSrcTvUrl(id, currentSeason, currentEpisode);
      setEmbedUrl(url);
      setUrlError(null);
    } catch (err: any) {
      console.error('[CineSrc WatchPage] Failed to construct embed URL:', err);
      setUrlError(err?.message || 'Invalid TMDb identifier for CineSrc player.');
      setPlayerStatus('error');
    }
  }, [id, mediaType, currentSeason, currentEpisode, retryKey]);

  // Fetch title metadata for the top navigation bar
  useEffect(() => {
    if (!id) return;

    let active = true;

    if (mediaType === 'movie') {
      getMovieDetail(id).then((movie) => {
        if (!active || !movie) return;
        setTitleInfo({
          title: movie.title,
          year: movie.year
        });
        document.title = `Watch ${movie.title} | Cinemura`;
      }).catch(() => {});
    } else {
      getTvDetail(id).then(async (series) => {
        if (!active || !series) return;
        let epTitle = `Episode ${currentEpisode}`;

        // Attempt to fetch specific episode name from season detail
        try {
          const seasonData = await getTvSeasonDetail(id, currentSeason);
          const foundEp = seasonData?.episodes?.find((ep) => ep.episodeNumber === currentEpisode);
          if (foundEp?.title) {
            epTitle = foundEp.title;
          }
        } catch {}

        if (!active) return;
        setTitleInfo({
          title: series.title,
          episodeTitle: epTitle,
          year: series.year
        });
        document.title = `Watch ${series.title} S${currentSeason}:E${currentEpisode} | Cinemura`;
      }).catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [id, mediaType, currentSeason, currentEpisode]);

  // Fullscreen change synchronization
  useEffect(() => {
    const handleFsChange = () => {
      const fsElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(Boolean(fsElement));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Failsafe timeout: if cinesrc:ready is never received within 15 seconds, show error state
  useEffect(() => {
    if (!embedUrl || urlError) return;

    setPlayerStatus('loading');

    const timer = setTimeout(() => {
      setPlayerStatus((current) => (current === 'loading' ? 'error' : current));
    }, 15000);

    return () => {
      clearTimeout(timer);
    };
  }, [embedUrl, retryKey, urlError]);

  // Navigation: return cleanly to detail page or previous history
  const handleBack = useCallback(() => {
    // Unlock orientation if previously locked
    if (typeof window !== 'undefined' && window.screen?.orientation && typeof (window.screen.orientation as any).unlock === 'function') {
      try {
        (window.screen.orientation as any).unlock();
      } catch {}
    }

    // Exit fullscreen if active
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen().catch(() => {});
      }
    }

    // Return to previous page in history if within app, or fallback to the title detail page
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const fallback = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`;
      navigate(fallback, { replace: true });
    }
  }, [navigate, mediaType, id]);

  // Fullscreen and landscape toggle (Phase 3)
  const toggleFullscreen = async () => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        }

        // Screen Orientation API: On devices where supported (e.g. Android Chrome), lock to landscape
        if (typeof window !== 'undefined' && window.screen?.orientation && typeof (window.screen.orientation as any).lock === 'function') {
          try {
            await (window.screen.orientation as any).lock('landscape');
          } catch (orientationErr) {
            // Devices like iOS Safari do not permit programmatic orientation lock; graceful fallback
            console.debug('[CineSrc Watch] Screen orientation lock skipped/unsupported:', orientationErr);
          }
        }
      } catch (err) {
        console.debug('[CineSrc Watch] Fullscreen request rejected or unsupported:', err);
      }
    } else {
      try {
        if (typeof window !== 'undefined' && window.screen?.orientation && typeof (window.screen.orientation as any).unlock === 'function') {
          try {
            (window.screen.orientation as any).unlock();
          } catch {}
        }

        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.debug('[CineSrc Watch] Exit fullscreen error:', err);
      }
    }
  };

  // Listen for documented CineSrc postMessage events (Phase 4)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin strictly matches CineSrc
      if (event.origin !== CINESRC_ORIGIN) return;

      let data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object') {
            data = parsed;
          }
        } catch {
          // Plain string message
        }
      }

      const eventName =
        typeof data === 'string'
          ? data
          : data?.type || data?.event || data?.name || '';

      if (eventName === 'cinesrc:ready') {
        setPlayerStatus('ready');
      } else if (eventName === 'cinesrc:play') {
        setPlayerStatus('ready');
      } else if (eventName === 'cinesrc:close') {
        handleBack();
      } else if (eventName === 'cinesrc:nextepisode') {
        // When CineSrc internally advances episodes, update URL history without unmounting iframe
        const nextSeason = Number(data.season) || currentSeason;
        const nextEpisode = Number(data.episode) || (currentEpisode + 1);

        setCurrentSeason(nextSeason);
        setCurrentEpisode(nextEpisode);

        // Update URL query string without reloading the page or tearing down the iframe
        window.history.replaceState(window.history.state, '', `/watch/tv/${id}?s=${nextSeason}&e=${nextEpisode}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [id, currentSeason, currentEpisode, handleBack]);

  // Inactivity fade timer for player controls (Netflix-style auto-fade after 3.5 seconds)
  const resetControlsTimeout = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      // Only auto-hide if player is active and not showing error
      setIsControlsVisible(false);
    }, 3500);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // Keyboard accessibility: Escape to back, F to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.key === 'Escape' && !document.fullscreenElement) {
        handleBack();
      } else if (e.key.toLowerCase() === 'f' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, resetControlsTimeout]);

  // Clean up orientation lock on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.screen?.orientation && typeof (window.screen.orientation as any).unlock === 'function') {
        try {
          (window.screen.orientation as any).unlock();
        } catch {}
      }
    };
  }, []);

  const handleRetry = () => {
    setPlayerStatus('loading');
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      className="fixed inset-0 w-screen h-screen min-h-[100dvh] max-h-[100dvh] bg-black text-[#F2F0EC] overflow-hidden select-none z-50 flex items-center justify-center"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Edge-to-Edge Responsive CineSrc Iframe */}
      {embedUrl && !urlError && (
        <iframe
          key={`${embedUrl}-${retryKey}`}
          src={embedUrl}
          title={titleInfo.title ? `Watching ${titleInfo.title}` : 'CineSrc Video Player'}
          width="100%"
          height="100%"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute inset-0 w-full h-full border-0 block bg-black"
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

      {/* Floating Netflix-Inspired Top Control Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          isControlsVisible || playerStatus !== 'ready'
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0'
        }`}
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))'
        }}
      >
        {/* Back Button & Title Badge */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to details"
            className="group flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-black/60 hover:bg-[#E43D3D] text-[#F2F0EC] hover:text-white border border-white/10 hover:border-[#E43D3D] rounded-full sm:rounded-md transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E43D3D]"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline text-xs font-mono font-bold tracking-widest uppercase">
              BACK
            </span>
          </button>

          {titleInfo.title && (
            <div className="space-y-0.5 max-w-[50vw] sm:max-w-md truncate">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E43D3D] uppercase font-bold block">
                {mediaType === 'tv' ? `SEASON ${currentSeason} • EPISODE ${currentEpisode}` : 'FEATURE FILM'}
              </span>
              <h1 className="text-sm sm:text-base font-display font-bold text-[#F2F0EC] tracking-tight truncate uppercase leading-tight">
                {titleInfo.title}
                {titleInfo.episodeTitle && (
                  <span className="text-[#8E8E93] font-normal font-sans ml-2 text-xs sm:text-sm">
                    — {titleInfo.episodeTitle}
                  </span>
                )}
              </h1>
            </div>
          )}
        </div>

        {/* Action Controls on Right (Fullscreen Toggle) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="p-2 sm:px-3 sm:py-2 bg-black/60 hover:bg-white/15 text-[#F2F0EC] hover:text-white border border-white/10 rounded-full sm:rounded-md transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E43D3D]"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Initializing Loading State */}
      {playerStatus === 'loading' && !urlError && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 pointer-events-none transition-opacity duration-300">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#E43D3D] rounded-full animate-spin mb-4" />
          <span className="text-xs font-mono text-[#8E8E93] tracking-widest uppercase opacity-0 absolute">
            CONNECTING TO CINESRC...
          </span>
        </div>
      )}

      {/* Error State with Retry & Back Actions */}
      {(playerStatus === 'error' || urlError) && (
        <div className="absolute inset-0 bg-[#0B0B0D] flex flex-col items-center justify-center text-center p-6 z-40 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#E43D3D]/10 border border-[#E43D3D]/30 flex items-center justify-center text-[#E43D3D] mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#F2F0EC] uppercase tracking-wide">
              PLAYBACK UNAVAILABLE
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#8E8E93] leading-relaxed">
              {urlError || 'The video stream could not be loaded or timed out. Please retry or return to the details page.'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2.5 bg-[#E43D3D] hover:bg-[#c02e2e] text-white text-xs font-mono font-bold tracking-wider uppercase inline-flex items-center gap-2 transition-colors shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 border border-white/20 hover:border-white/40 text-[#F2F0EC] hover:bg-white/10 text-xs font-mono tracking-wider uppercase transition-colors"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;
