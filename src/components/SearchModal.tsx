import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Film, Tv, User, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchTmdb } from '../services/tmdb';
import { Movie, Series, Person } from '../types';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useApp();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series' | 'people'>('all');
  
  const [results, setResults] = useState<{ movies: Movie[]; series: Series[]; people: Person[] }>({
    movies: [],
    series: [],
    people: []
  });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ movies: [], series: [], people: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchTmdb(query);
        if (res) {
          setResults(res);
        } else {
          setResults({ movies: [], series: [], people: [] });
        }
      } catch (err) {
        console.error('Search failed', err);
        setResults({ movies: [], series: [], people: [] });
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const totalResults = results.movies.length + results.series.length + results.people.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0D]/95 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-fadeIn overflow-y-auto text-[#F2F0EC]">
      
      {/* Top Search Header */}
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/12 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-[#E43D3D] uppercase">LIVE CATALOG SEARCH</span>
            <span className="text-xs text-[#8E8E93] font-mono">PRESS ESC TO CLOSE</span>
          </div>

          <button
            onClick={closeSearch}
            className="p-2 text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Big Search Input Field */}
        <div className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#E43D3D]" />
          <input
            type="text"
            autoFocus
            placeholder="Search movies, TV shows, actors, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-[#E43D3D] text-2xl sm:text-4xl font-editorial-heading text-white pl-12 pr-12 py-4 outline-none tracking-wider placeholder:text-[#8E8E93]/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#8E8E93] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {query.trim() && (
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-xs">
            {(['all', 'movies', 'series', 'people'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-[#E43D3D] text-white'
                    : 'bg-white/5 text-[#8E8E93] hover:text-white hover:bg-white/10'
                }`}
              >
                {tab} {tab === 'all' ? `(${totalResults})` : tab === 'movies' ? `(${results.movies.length})` : tab === 'series' ? `(${results.series.length})` : `(${results.people.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Quick Suggestions */}
        {!query.trim() && (
          <div className="pt-6 space-y-4">
            <span className="text-xs text-[#8E8E93] uppercase tracking-widest font-semibold block">
              SEARCH SUGGESTIONS
            </span>
            <div className="flex flex-wrap gap-2">
              {['Avatar', 'Inception', 'Breaking Bad', 'Batman', 'Spider-Man', 'Interstellar'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-4 py-2 border border-white/12 hover:border-[#E43D3D] text-xs text-white/80 hover:text-[#E43D3D] bg-white/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        {searching ? (
          <div className="py-12 text-center text-xs font-mono text-[#8E8E93] uppercase animate-pulse">
            SEARCHING LIVE CATALOG FOR "{query.toUpperCase()}"...
          </div>
        ) : query.trim() && (
          <div className="pt-4 space-y-8">
            
            {totalResults === 0 && (
              <div className="text-center py-16 space-y-3 bg-[#121215] border border-white/12 p-8">
                <p className="font-editorial-heading text-2xl text-white">NO LIVE MATCHES FOUND</p>
                <p className="text-xs text-[#8E8E93]">No results returned from the live database for "{query}".</p>
              </div>
            )}

            {/* Movies Results */}
            {(activeTab === 'all' || activeTab === 'movies') && results.movies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E43D3D] tracking-widest border-b border-white/10 pb-2">
                  <Film className="w-4 h-4" />
                  <span>MOVIES ({results.movies.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.movies.map(movie => (
                    <Link
                      key={movie.id}
                      to={`/movie/${movie.id}`}
                      onClick={closeSearch}
                      className="flex gap-4 p-3 bg-[#121215] border border-white/12 hover:border-[#E43D3D] transition-all group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-16 h-24 object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] bg-[#E43D3D]/20 text-[#E43D3D] px-1.5 py-0.5 font-bold uppercase">MOVIE</span>
                            <span className="text-xs text-[#8E8E93]">{movie.year}</span>
                          </div>
                          <h4 className="font-editorial-heading text-lg text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                            {movie.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#E43D3D] font-bold">
                          <Star className="w-3 h-3 fill-[#E43D3D]" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Series Results */}
            {(activeTab === 'all' || activeTab === 'series') && results.series.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E43D3D] tracking-widest border-b border-white/10 pb-2">
                  <Tv className="w-4 h-4" />
                  <span>TV SHOWS ({results.series.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.series.map(series => (
                    <Link
                      key={series.id}
                      to={`/tv/${series.id}`}
                      onClick={closeSearch}
                      className="flex gap-4 p-3 bg-[#121215] border border-white/12 hover:border-[#E43D3D] transition-all group"
                    >
                      <img
                        src={series.poster}
                        alt={series.title}
                        className="w-16 h-24 object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 font-bold uppercase">TV</span>
                            <span className="text-xs text-[#8E8E93]">{series.seasonsCount} Seasons</span>
                          </div>
                          <h4 className="font-editorial-heading text-lg text-white group-hover:text-[#E43D3D] transition-colors leading-tight">
                            {series.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#E43D3D] font-bold">
                          <Star className="w-3 h-3 fill-[#E43D3D]" />
                          <span>{series.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* People Results */}
            {(activeTab === 'all' || activeTab === 'people') && results.people.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E43D3D] tracking-widest border-b border-white/10 pb-2">
                  <User className="w-4 h-4" />
                  <span>PEOPLE ({results.people.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.people.map(person => (
                    <Link
                      key={person.id}
                      to={`/person/${person.id}`}
                      onClick={closeSearch}
                      className="flex gap-4 p-3 bg-[#121215] border border-white/12 hover:border-[#E43D3D] transition-all group"
                    >
                      <img
                        src={person.portrait}
                        alt={person.name}
                        className="w-16 h-20 object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex flex-col justify-center py-1">
                        <span className="text-[9px] text-[#E43D3D] font-bold uppercase tracking-wider">{person.role}</span>
                        <h4 className="font-editorial-heading text-lg text-white group-hover:text-[#E43D3D] transition-colors">
                          {person.name}
                        </h4>
                      </div>
                    </Link>
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
