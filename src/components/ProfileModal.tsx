import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Bookmark, Film, Sparkles, Volume2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, closeProfile, watchlist } = useApp();
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
      aria-label="Cinemura Cinema Pass Profile"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0D]/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfile();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#111114] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#E43D3D] inline-block" />
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#E43D3D] uppercase">
              CINEMA PASS • VIP PATRON
            </span>
          </div>

          <button
            onClick={closeProfile}
            aria-label="Close profile"
            className="p-1.5 text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Membership Ticket Card */}
        <div className="relative p-5 bg-[#17171B] border border-white/10 space-y-4 overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#E43D3D]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">MEMBER TIER</p>
              <h3 className="font-display font-bold text-2xl text-[#F2F0EC] tracking-tight uppercase">
                DIRECTOR'S CIRCLE
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E43D3D]/20 border border-[#E43D3D]/40 text-[#E43D3D] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs font-mono">
            <div>
              <span className="text-[#8E8E93] block text-[10px]">PATRON PASS NO.</span>
              <span className="text-[#F2F0EC] font-semibold tracking-wider">CIN-8829-X</span>
            </div>
            <div>
              <span className="text-[#8E8E93] block text-[10px]">SAVED TO WATCHLIST</span>
              <span className="text-[#E43D3D] font-bold">{watchlist.length} TITLES</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation to Watchlist */}
        <div className="space-y-3">
          <Link
            to="/watchlist"
            onClick={closeProfile}
            className="w-full flex items-center justify-between p-3.5 bg-[#17171B] hover:bg-[#1f1f25] border border-white/10 hover:border-[#E43D3D] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-[#E43D3D]" />
              <div>
                <p className="font-display font-semibold text-sm text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors uppercase">
                  MY PERSONAL WATCHLIST
                </p>
                <p className="text-[11px] font-mono text-[#8E8E93]">
                  {watchlist.length} {watchlist.length === 1 ? 'title curated' : 'titles curated for tonight'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#E43D3D] tracking-wider uppercase font-bold">
              VIEW →
            </span>
          </Link>
        </div>

        {/* Cinema Experience Preferences */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <p className="text-[10px] font-mono text-[#8E8E93] tracking-widest uppercase">
            AUDITORIUM PREFERENCES
          </p>

          <div className="space-y-2 text-xs font-mono text-[#F2F0EC]">
            <div className="flex items-center justify-between p-2.5 bg-[#141418] border border-white/5">
              <span className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#E43D3D]" />
                <span>ULTRA HD 4K MASTER PREFERENCE</span>
              </span>
              <span className="text-[#E43D3D] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ENABLED
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#141418] border border-white/5">
              <span className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>SPATIAL CINEMA AUDIO PASSTHROUGH</span>
              </span>
              <span className="text-[#8E8E93]">AUTO</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] font-mono text-[#8E8E93] border-t border-white/10">
          CINEMURA DIGITAL CINEMA EXPERIENCE • V2.4 ARCHITECTURE
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
