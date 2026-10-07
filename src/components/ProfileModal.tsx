import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, closeProfile, watchlist, clearWatchlist } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen, closeProfile]);

  if (!isProfileOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0D]/90 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfile();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#111114] border border-white/10 p-6 space-y-6 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-display font-bold text-xl text-[#F2F0EC] tracking-wider uppercase">
            PROFILE
          </h2>

          <button
            onClick={closeProfile}
            aria-label="Close profile"
            className="p-1.5 text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watchlist Summary */}
        <div className="p-5 bg-[#17171B] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-[#E43D3D]" />
              <span className="font-display font-semibold text-base text-[#F2F0EC] uppercase">
                SAVED WATCHLIST
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#E43D3D]">
              {watchlist.length} {watchlist.length === 1 ? 'TITLE' : 'TITLES'}
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/watchlist"
              onClick={closeProfile}
              className="btn-primary flex-1 h-10 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <span>VIEW WATCHLIST</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {watchlist.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all titles from your watchlist?')) {
                    clearWatchlist();
                  }
                }}
                className="h-10 px-3 text-[#8E8E93] hover:text-[#E43D3D] border border-white/10 hover:border-[#E43D3D] transition-colors"
                title="Clear Watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;
