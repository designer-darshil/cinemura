import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchTmdb, getTrendingMovies } from '../services/tmdb';
import { Movie, Series, Person } from '../types';
import { MediaCard, PersonCard } from './MediaCard';
import { CardGridSkeleton } from './StateViews';

const TRENDING_SEARCH_TAGS = [
  'Dune',
  'Oppenheimer',
  'Interstellar',
  'Blade Runner 2049',
  'The Batman',
  'Severance',
  'Succession',
  'Christopher Nolan'
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useApp();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [results, setResults] = useState<{ movies: Movie[]; series: Series[]; people: Person[] }>({
    movies: [],
    series: [],
    people: []
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number>(0);

  // Load curated suggestions once
  useEffect(() => {
    if (isSearchOpen && suggestions.length === 0) {
      getTrendingMovies('week')
        .then(movies => {
          if (movies && movies.length > 0) {
            setSuggestions(movies.slice(0, 6));
          }
        })
        .catch(() => {});
    }
  }, [isSearchOpen, suggestions.length]);

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
        // Ignore stale requests
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
      
      <div className="w-full space-y-8 sm:space-y-12">
        
        {/* Top Minimal Controls Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] text-[#E43D3D] uppercase">
              SEARCH
            </span>
            <kbd className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 text-[#8E8E93]">
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
          <div className="relative border-b-2 border-white/20 focus-within:border-[#E43D3D] transition-colors pb-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows or people..."
              className="w-full bg-transparent font-display font-semibold text-2xl sm:text-4xl lg:text-5xl text-[#F2F0EC] placeholder:text-[#8E8E93]/40 outline-none tracking-tight pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#8E8E93] hover:text-[#F2F0EC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Initial Prompt with Trending Searches & Suggestions */}
        {!query.trim() && (
          <div className="space-y-10 pt-2">
            {/* Trending Search Keywords */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#E43D3D]" />
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E93] uppercase">
                  TRENDING SEARCHES
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 bg-[#17171B] hover:bg-[#E43D3D] text-[#F2F0EC] hover:text-white border border-white/10 hover:border-[#E43D3D] text-xs font-mono tracking-wider uppercase transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Cinema Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E43D3D]" />
                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#F2F0EC] uppercase">
                      CURATED CINEMA SUGGESTIONS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {suggestions.map((movie) => (
                    <div key={movie.id} onClick={closeSearch}>
                      <MediaCard item={movie} variant="poster" />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        {!searching && query.trim() > '' && (
          <div className="space-y-12 pt-2">
            
            {/* Zero Results State */}
            {totalResults === 0 && (
              <div className="py-16 text-center space-y-2 border border-white/10 bg-[#111114] p-8">
                <h3 className="font-display font-bold text-xl text-[#F2F0EC] uppercase">
                  NO RESULTS
                </h3>
                <p className="text-xs font-mono text-[#8E8E93]">
                  Nothing matched your search query "{query}".
                </p>
              </div>
            )}

            {/* Movies Group */}
            {results.movies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    MOVIES ({results.movies.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.movies.map(movie => (
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
                  <span className="text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    TV SHOWS ({results.series.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.series.map(show => (
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
                  <span className="text-xs font-mono font-bold tracking-widest text-[#E43D3D] uppercase">
                    PEOPLE ({results.people.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.people.map(person => (
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
