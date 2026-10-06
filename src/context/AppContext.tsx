import React, { createContext, useContext, useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { getVideoEmbedUrl } from '../utils/trailer';

export interface ActiveVideoSession {
  videos: VideoItem[];
  currentIndex: number;
  parentTitle?: string;
}

interface AppContextType {
  // Video Modal
  videoSession: ActiveVideoSession | null;
  trailerUrl: string | null;
  trailerTitle: string | null;
  openVideoPlayer: (videos: VideoItem[], startIndex?: number, parentTitle?: string) => void;
  openTrailer: (url: string, title?: string) => void;
  closeTrailer: () => void;
  nextVideo: () => void;
  prevVideo: () => void;
  selectVideoIndex: (index: number) => void;
  
  // Search Modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
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
  const [videoSession, setVideoSession] = useState<ActiveVideoSession | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

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
        setVideoSession(null);
        setTrailerUrl(null);
        setTrailerTitle(null);
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

  return (
    <AppContext.Provider
      value={{
        videoSession,
        trailerUrl,
        trailerTitle,
        openVideoPlayer,
        openTrailer,
        closeTrailer,
        nextVideo,
        prevVideo,
        selectVideoIndex,
        isSearchOpen,
        openSearch,
        closeSearch,
        toggleSearch,
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
