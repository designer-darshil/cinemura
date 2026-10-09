import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchTmdb } from '../services/tmdb';
import { Movie, Series, Person } from '../types';
import { MediaCard, PersonCard } from './MediaCard';
import { CardGridSkeleton } from './StateViews';

const RECENT_SEARCHES_KEY = 'cinemura_recent_searches_v1';

export const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const { isSearchOpen, closeSearch } = useApp();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<{ movies: Movie[]; series: Series[]; people: Person[] }>({
    movies: [],
    series: [],
    people: []
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number>(0);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6));
      }
    } catch {
      // ignore storage error
    }
  }, [isSearchOpen]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Auto-focus input and handle focus restoration
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults({ movies: [], series: [], people: [] });
      setSearching(false);
      
      // Restore focus to original header trigger
      const trigger = document.getElementById('header-search-trigger');
      if (trigger) {
        trigger.focus();
      }
    }
  }, [isSearchOpen]);

  // Handle focus trap & Escape key
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Debounced search logic with request cancellation
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ movies: [], series: [], people: [] });
      setSearching(false);
      return;
    }

    setSearching(true);
    setResults({ movies: [], series: [], people: [] });
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const data = await searchTmdb(trimmed);
        if (currentRequestId === requestIdRef.current) {
          if (data) {
            setResults(data);
          } else {
            setResults({ movies: [], series: [], people: [] });
          }
        }
      } catch (err) {
        console.error('Search query failed:', err);
        if (currentRequestId === requestIdRef.current) {
          setResults({ movies: [], series: [], people: [] });
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleViewAllResults = () => {
    if (!query.trim()) return;
    saveRecentSearch(query);
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      handleViewAllResults();
    }
  };

  if (!isSearchOpen) return null;

  const totalResults = results.movies.length + results.series.length + results.people.length;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      className="fixed inset-0 z-50 bg-[#0B0B0D] overflow-y-auto text-[#F2F0EC] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 animate-fadeIn selection:bg-[#E43D3D] selection:text-white"
    >
      
      <div className="w-full space-y-8 sm:space-y-12 max-w-7xl mx-auto">
        
        {/* Top Minimal Controls Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="type-label text-[#E43D3D] font-bold">
              SEARCH CATALOG
            </span>
            <kbd className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 text-[#8E8E93]">
              ESC
            </kbd>
          </div>

          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="p-2 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Large Editorial Search Field */}
        <div className="space-y-3">
          <div className="relative border-b-2 border-white/20 focus-within:border-[#E43D3D] transition-colors pb-2 flex items-center">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#8E8E93] mr-4 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDownInput}
              placeholder="Search movies, TV series or people..."
              className="w-full bg-transparent font-display font-semibold text-2xl sm:text-4xl lg:text-5xl text-[#F2F0EC] placeholder:text-[#8E8E93]/40 outline-none tracking-tight pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="p-2 text-[#8E8E93] hover:text-[#F2F0EC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Initial Prompt / Recent Searches (When Query is Empty) */}
        {!query.trim() && (
          <div className="space-y-8 pt-4">
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="type-label text-xs text-[#8E8E93] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>RECENT SEARCHES</span>
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] font-mono text-[#8E8E93] hover:text-[#E43D3D] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>CLEAR</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-[#17171B] border border-white/10 hover:border-[#E43D3D] text-xs font-mono text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Curated Searches */}
            <div className="space-y-3">
              <span className="type-label text-xs text-[#8E8E93] block border-b border-white/10 pb-2">
                TRENDING INQUIRIES
              </span>
              <div className="flex flex-wrap gap-2">
                {['Dune', 'Oppenheimer', 'Interstellar', 'Shogun', 'Succession', 'Blade Runner', 'Denis Villeneuve', 'Christopher Nolan'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-[#E43D3D] hover:text-white text-xs font-mono text-[#8E8E93] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeletons State */}
        {searching && (
          <div className="space-y-4 pt-4">
            <div className="text-xs font-mono text-[#8E8E93] uppercase animate-pulse">
              SEARCHING LIVE CATALOG...
            </div>
            <CardGridSkeleton count={12} />
          </div>
        )}

        {/* Search Results Display */}
        {!searching && query.trim() !== '' && (
          <div className="space-y-12 pt-2">
            
            {/* View Full Results Button Banner */}
            {totalResults > 0 && (
              <div className="flex items-center justify-between p-4 bg-[#111114] border border-white/10">
                <span className="text-xs font-mono text-[#8E8E93]">
                  Showing instant preview for "{query}".
                </span>
                <button
                  onClick={handleViewAllResults}
                  className="btn-primary text-xs flex items-center gap-2 py-2 px-4"
                >
                  <span>VIEW ALL RESULTS ({totalResults})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zero Results State */}
            {totalResults === 0 && (
              <div className="py-16 text-center space-y-2 border border-white/10 bg-[#111114] p-8">
                <h3 className="type-h3 text-xl text-[#F2F0EC] uppercase">
                  NO RESULTS FOUND
                </h3>
                <p className="type-body text-xs text-[#8E8E93]">
                  Nothing matched your query "{query}". Try checking the spelling or searching by director or genre.
                </p>
              </div>
            )}

            {/* Movies Group */}
            {results.movies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="type-label text-xs font-bold text-[#E43D3D]">
                    FEATURE FILMS ({results.movies.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.movies.slice(0, 12).map(movie => (
                    <div key={movie.id} onClick={closeSearch}>
                      <MediaCard item={movie} variant="poster" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TV Shows Group */}
            {results.series.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="type-label text-xs font-bold text-[#E43D3D]">
                    TELEVISION SERIES ({results.series.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.series.slice(0, 12).map(show => (
                    <div key={show.id} onClick={closeSearch}>
                      <MediaCard item={show} variant="poster" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People Group */}
            {results.people.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="type-label text-xs font-bold text-[#E43D3D]">
                    CAST & CREATORS ({results.people.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.people.slice(0, 6).map(person => (
                    <div key={person.id} onClick={closeSearch}>
                      <PersonCard
                        id={person.id}
                        name={person.name}
                        role={person.role}
                        knownFor={person.knownFor}
                        portrait={person.portrait}
                        slug={person.slug}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SearchModal;
