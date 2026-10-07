import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VideoItem, MediaItem } from '../types';
import { getVideoEmbedUrl } from '../utils/trailer';

export interface WatchlistItem {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  poster: string;
  backdrop?: string;
  rating: number;
  year: number;
  genres?: string[];
  addedAt: number;
}

export interface ActiveVideoSession {
  videos: VideoItem[];
  currentIndex: number;
  parentTitle?: string;
}

export interface VidLinkSession {
  type: 'movie' | 'tv';
  tmdbId: string | number;
  season?: number;
  episode?: number;
  title?: string;
}

interface AppContextType {
  // Application Boot Readiness
  isAppReady: boolean;
  markAppReady: () => void;

  // Video / Trailer Modal
  videoSession: ActiveVideoSession | null;
  trailerUrl: string | null;
  trailerTitle: string | null;
  openVideoPlayer: (videos: VideoItem[], startIndex?: number, parentTitle?: string) => void;
  openTrailer: (url: string, title?: string) => void;
  closeTrailer: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  selectVideoIndex: (index: number) => void;

  // VidLink Fullscreen Playback Modal
  vidLinkSession: VidLinkSession | null;
  openVidLinkMovie: (tmdbId: string | number, title?: string) => void;
  openVidLinkTv: (tmdbId: string | number, season: number, episode: number, title?: string) => void;
  closeVidLink: () => void;
  
  // Search Modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Watchlist State & Methods
  watchlist: WatchlistItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlist: (item: MediaItem) => boolean;
  isInWatchlist: (id: string) => boolean;
  clearWatchlist: () => void;

  // Profile Modal / Cinema Pass
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  toggleProfile: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function extractYouTubeKey(url: string): string {
  if (!url) return '';
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || '';
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  if (url.includes('youtube.com/embed/')) {
    return url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  return url;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const markAppReady = useCallback(() => {
    setIsAppReady(true);
  }, []);

  // Failsafe boot readiness: wait for fonts or fallback timer
  useEffect(() => {
    let mounted = true;
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        // Document fonts ready
      }).catch(() => {});
    }

    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setIsAppReady(true);
      }
    }, 2500);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const [videoSession, setVideoSession] = useState<ActiveVideoSession | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState<string | null>(null);
  const [vidLinkSession, setVidLinkSession] = useState<VidLinkSession | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Watchlist Persistent Storage
  const WATCHLIST_STORAGE_KEY = 'cinemura_watchlist';
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((item: MediaItem) => {
    if (!item || !item.id) return;
    setWatchlist(prev => {
      if (prev.some(w => w.id === item.id)) return prev;
      const newItem: WatchlistItem = {
        id: item.id,
        type: item.type,
        title: item.title,
        poster: item.poster || '',
        backdrop: item.backdrop || '',
        rating: item.rating || 0,
        year: item.year || new Date().getFullYear(),
        genres: item.genres || [],
        addedAt: Date.now()
      };
      return [newItem, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }, []);

  const isInWatchlist = useCallback((id: string) => {
    return watchlist.some(w => w.id === id);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: MediaItem) => {
    if (!item || !item.id) return false;
    let added = false;
    setWatchlist(prev => {
      const exists = prev.some(w => w.id === item.id);
      if (exists) {
        added = false;
        return prev.filter(w => w.id !== item.id);
      } else {
        added = true;
        const newItem: WatchlistItem = {
          id: item.id,
          type: item.type,
          title: item.title,
          poster: item.poster || '',
          backdrop: item.backdrop || '',
          rating: item.rating || 0,
          year: item.year || new Date().getFullYear(),
          genres: item.genres || [],
          addedAt: Date.now()
        };
        return [newItem, ...prev];
      }
    });
    return added;
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);
  const toggleProfile = () => setIsProfileOpen(prev => !prev);

  // Keyboard shortcuts (Cmd+K or / to search, Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsProfileOpen(false);
        setVideoSession(null);
        setTrailerUrl(null);
        setTrailerTitle(null);
        setVidLinkSession(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openVideoPlayer = (videos: VideoItem[], startIndex: number = 0, parentTitle?: string) => {
    if (!videos || videos.length === 0) return;
    const validIndex = Math.max(0, Math.min(startIndex, videos.length - 1));
    const active = videos[validIndex];
    setVideoSession({
      videos,
      currentIndex: validIndex,
      parentTitle
    });
    setTrailerUrl(getVideoEmbedUrl(active));
    setTrailerTitle(active.name || parentTitle || null);
  };

  const openTrailer = (url: string, title?: string) => {
    if (!url) return;
    const key = extractYouTubeKey(url);
    const item: VideoItem = {
      id: key || 'trailer',
      key: key || url,
      name: title || 'Trailer',
      type: 'Trailer',
      site: 'YouTube',
      official: true
    };
    openVideoPlayer([item], 0, title);
  };

  const closeTrailer = () => {
    setVideoSession(null);
    setTrailerUrl(null);
    setTrailerTitle(null);
  };

  const nextVideo = () => {
    setVideoSession(prev => {
      if (!prev || prev.currentIndex >= prev.videos.length - 1) return prev;
      const nextIdx = prev.currentIndex + 1;
      const nextVid = prev.videos[nextIdx];
      setTrailerUrl(getVideoEmbedUrl(nextVid));
      setTrailerTitle(nextVid.name || prev.parentTitle || null);
      return { ...prev, currentIndex: nextIdx };
    });
  };

  const prevVideo = () => {
    setVideoSession(prev => {
      if (!prev || prev.currentIndex <= 0) return prev;
      const prevIdx = prev.currentIndex - 1;
      const prevVid = prev.videos[prevIdx];
      setTrailerUrl(getVideoEmbedUrl(prevVid));
      setTrailerTitle(prevVid.name || prev.parentTitle || null);
      return { ...prev, currentIndex: prevIdx };
    });
  };

  const selectVideoIndex = (index: number) => {
    setVideoSession(prev => {
      if (!prev || index < 0 || index >= prev.videos.length) return prev;
      const selVid = prev.videos[index];
      setTrailerUrl(getVideoEmbedUrl(selVid));
      setTrailerTitle(selVid.name || prev.parentTitle || null);
      return { ...prev, currentIndex: index };
    });
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen(prev => !prev);

  const openVidLinkMovie = (tmdbId: string | number, title?: string) => {
    if (!tmdbId) return;
    setVidLinkSession({
      type: 'movie',
      tmdbId,
      title
    });
  };

  const openVidLinkTv = (tmdbId: string | number, season: number, episode: number, title?: string) => {
    if (!tmdbId || season === undefined || episode === undefined) return;
    setVidLinkSession({
      type: 'tv',
      tmdbId,
      season,
      episode,
      title
    });
  };

  const closeVidLink = () => {
    setVidLinkSession(null);
  };

  return (
    <AppContext.Provider
      value={{
        isAppReady,
        markAppReady,
        videoSession,
        trailerUrl,
        trailerTitle,
        openVideoPlayer,
        openTrailer,
        closeTrailer,
        nextVideo,
        prevVideo,
        selectVideoIndex,
        vidLinkSession,
        openVidLinkMovie,
        openVidLinkTv,
        closeVidLink,
        isSearchOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist,
        isProfileOpen,
        openProfile,
        closeProfile,
        toggleProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
