import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Tv, Trash2, ArrowRight } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MediaCard } from '../components/MediaCard';
import { Seo } from '../seo/Seo';

export const WatchlistPage: React.FC = () => {
  const { watchlist, clearWatchlist, removeFromWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series'>('all');

  const movies = watchlist.filter(item => item.type === 'movie');
  const series = watchlist.filter(item => item.type === 'tv');

  const displayedItems = activeTab === 'movies'
    ? movies
    : activeTab === 'series'
      ? series
      : watchlist;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-24 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Your Watchlist"
        description="Your saved films and television series, stored locally in your personal Cinemura vault."
      />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-10">
        
        {/* Header & Title */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-condensed tracking-widest text-[#E43D3D] uppercase font-bold">
              <Bookmark className="w-4 h-4 fill-[#E43D3D]" />
              <span>PERSONAL CINEMATIC VAULT</span>
            </div>
            <h1 className="type-display-xl text-white tracking-tight uppercase">
              WATCHLIST
            </h1>
            <p className="type-body text-sm sm:text-base max-w-xl text-[#8E8E93]">
              Curated titles saved locally in your browser storage. Zero accounts, zero tracking.
            </p>
          </div>

          {watchlist.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={clearWatchlist}
                className="btn-secondary text-xs py-2.5 px-4 text-[#8E8E93] hover:text-[#E43D3D] hover:border-[#E43D3D] flex items-center gap-2"
                aria-label="Clear all watchlist items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR ALL ({watchlist.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`type-label px-4 py-2 border transition-all ${
                activeTab === 'all'
                  ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                  : 'bg-white/5 text-[#8E8E93] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              ALL TITLES ({watchlist.length})
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`type-label px-4 py-2 border transition-all flex items-center gap-2 ${
                activeTab === 'movies'
                  ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                  : 'bg-white/5 text-[#8E8E93] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>MOVIES ({movies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`type-label px-4 py-2 border transition-all flex items-center gap-2 ${
                activeTab === 'series'
                  ? 'bg-[#E43D3D] text-white border-[#E43D3D]'
                  : 'bg-white/5 text-[#8E8E93] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>SERIES ({series.length})</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="py-24 px-6 text-center max-w-xl mx-auto space-y-6 border border-white/10 bg-[#111114]/60 p-8 sm:p-12">
            <div className="w-16 h-16 bg-[#E43D3D]/10 text-[#E43D3D] flex items-center justify-center mx-auto border border-[#E43D3D]/30">
              <Bookmark className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="type-h2 text-white uppercase tracking-tight">
                YOUR WATCHLIST IS EMPTY
              </h2>
              <p className="type-body text-sm text-[#8E8E93] leading-relaxed">
                You haven’t bookmarked any films or television series yet. Explore our curated catalog and click the bookmark action on any title to save it for later.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link to="/movies" className="btn-primary text-xs flex items-center gap-2">
                <span>EXPLORE MOVIES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/series" className="btn-secondary text-xs flex items-center gap-2">
                <span>EXPLORE SERIES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-16 text-center space-y-4 border border-white/10 bg-[#111114] p-8">
            <p className="text-sm text-[#8E8E93] font-mono uppercase tracking-widest">
              No saved {activeTab === 'movies' ? 'movies' : 'series'} found in your watchlist.
            </p>
            <button
              onClick={() => setActiveTab('all')}
              className="btn-secondary text-xs uppercase"
            >
              VIEW ALL SAVED TITLES
            </button>
          </div>
        ) : (
          /* Watchlist Grid with Direct Quick Actions */
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {displayedItems.map(item => (
                <div key={item.id} className="relative group/watchcard flex flex-col justify-between">
                  <MediaCard item={item} variant="poster" />
                  
                  {/* Remove action button pinned to card corner */}
                  <button
                    onClick={() => removeFromWatchlist(String(item.id))}
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="absolute top-2 right-2 z-30 p-2 bg-[#0B0B0D]/90 text-[#8E8E93] hover:text-[#E43D3D] hover:bg-black border border-white/10 transition-colors shadow-lg"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WatchlistPage;
