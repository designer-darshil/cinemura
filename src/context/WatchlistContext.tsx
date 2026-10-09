import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MediaItem } from '../types';

const WATCHLIST_STORAGE_KEY = 'cinemura_watchlist_v1';

interface WatchlistContextType {
  watchlist: MediaItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: (id: string) => boolean;
  clearWatchlist: () => void;
  statusMessage: string | null;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

function loadWatchlistFromStorage(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Validate items have at least id and title
      return parsed.filter(item => item && item.id && item.title);
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse watchlist from localStorage, resetting:', err);
    return [];
  }
}

function saveWatchlistToStorage(items: MediaItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save watchlist to localStorage:', err);
  }
}

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize from storage on client mount
  useEffect(() => {
    setWatchlist(loadWatchlistFromStorage());
  }, []);

  const announce = useCallback((msg: string) => {
    setStatusMessage(msg);
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const addToWatchlist = useCallback((item: MediaItem) => {
    setWatchlist(prev => {
      if (prev.some(i => String(i.id) === String(item.id))) {
        return prev;
      }
      const updated = [item, ...prev];
      saveWatchlistToStorage(updated);
      return updated;
    });
    announce(`Added ${item.title} to your watchlist.`);
  }, [announce]);

  const removeFromWatchlist = useCallback((id: string) => {
    let removedTitle = '';
    setWatchlist(prev => {
      const target = prev.find(i => String(i.id) === String(id));
      if (target) removedTitle = target.title;
      const updated = prev.filter(i => String(i.id) !== String(id));
      saveWatchlistToStorage(updated);
      return updated;
    });
    if (removedTitle) {
      announce(`Removed ${removedTitle} from your watchlist.`);
    }
  }, [announce]);

  const toggleWatchlist = useCallback((item: MediaItem) => {
    const exists = watchlist.some(i => String(i.id) === String(item.id));
    if (exists) {
      removeFromWatchlist(String(item.id));
    } else {
      addToWatchlist(item);
    }
  }, [watchlist, addToWatchlist, removeFromWatchlist]);

  const isInWatchlist = useCallback((id: string): boolean => {
    return watchlist.some(i => String(i.id) === String(id));
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    saveWatchlistToStorage([]);
    announce('Cleared your entire watchlist.');
  }, [announce]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist,
        statusMessage,
      }}
    >
      {children}
      {/* Accessible live region announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </div>
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return ctx;
};
