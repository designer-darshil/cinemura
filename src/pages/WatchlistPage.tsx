import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MediaCard } from '../components/MediaCard';
import { MediaItem } from '../types';

export const WatchlistPage: React.FC = () => {
  const { watchlist, clearWatchlist, markAppReady } = useApp();
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    markAppReady();
    window.scrollTo(0, 0);
  }, [markAppReady]);

  const filteredItems = watchlist.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-24 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 selection:bg-[#E43D3D] selection:text-white space-y-10">
      
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#E43D3D]" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#E43D3D] uppercase">
              PERSONAL CURATION ARCHIVE
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none">
            SAVED WATCHLIST
          </h1>

          <p className="type-body text-sm sm:text-base text-[#8E8E93] max-w-xl">
            Your personal digital cinema queue. Titles saved for your upcoming screening sessions.
          </p>
        </div>

        {/* Filter Controls & Clear Button */}
        {watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#111114] border border-white/10 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === 'all' ? 'bg-[#E43D3D] text-white font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                ALL ({watchlist.length})
              </button>
              <button
                onClick={() => setFilter('movie')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === 'movie' ? 'bg-[#E43D3D] text-white font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                MOVIES ({watchlist.filter(i => i.type === 'movie').length})
              </button>
              <button
                onClick={() => setFilter('tv')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === 'tv' ? 'bg-[#E43D3D] text-white font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                TV ({watchlist.filter(i => i.type === 'tv').length})
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Clear all titles from your watchlist?')) {
                  clearWatchlist();
                }
              }}
              className="p-2.5 text-[#8E8E93] hover:text-[#E43D3D] border border-white/10 hover:border-[#E43D3D] transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {watchlist.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 border border-white/10 bg-[#111114]/60 p-8 sm:p-12">
          <div className="w-16 h-16 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[#E43D3D]">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="font-display font-bold text-2xl text-[#F2F0EC] uppercase tracking-tight">
              YOUR WATCHLIST IS EMPTY
            </h3>
            <p className="text-xs font-mono text-[#8E8E93] leading-relaxed">
              Explore our curated cinema catalogue and bookmark titles to build your personal viewing lineup.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/movie"
              className="btn-primary text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
            >
              <span>EXPLORE MOVIES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/tv"
              className="btn-secondary text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
            >
              <span>DISCOVER TV SHOWS</span>
            </Link>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-[#8E8E93] font-mono text-xs">
          NO {filter.toUpperCase()} TITLES IN YOUR WATCHLIST.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map(item => {
            const mediaItem: MediaItem = item.type === 'movie'
              ? {
                  id: item.id,
                  type: 'movie',
                  title: item.title,
                  slug: item.id,
                  poster: item.poster,
                  backdrop: item.backdrop || item.poster,
                  rating: item.rating,
                  year: item.year,
                  genres: item.genres || [],
                  synopsis: '',
                  releaseDate: item.year.toString(),
                  language: 'en',
                  voteCount: 0,
                  runtime: 'N/A',
                  director: '',
                  writers: [],
                  cast: []
                }
              : {
                  id: item.id,
                  type: 'tv',
                  title: item.title,
                  slug: item.id,
                  poster: item.poster,
                  backdrop: item.backdrop || item.poster,
                  rating: item.rating,
                  year: item.year,
                  genres: item.genres || [],
                  synopsis: '',
                  firstAirDate: item.year.toString(),
                  language: 'en',
                  voteCount: 0,
                  creators: [],
                  cast: [],
                  seasons: [],
                  seasonsCount: 1,
                  totalEpisodes: 1
                };

            return (
              <div key={item.id} className="relative group/saved">
                <MediaCard item={mediaItem} variant="poster" />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default WatchlistPage;
