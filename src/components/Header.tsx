import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, Menu, X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useWatchlist } from '../context/WatchlistContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSearch } = useApp();
  const { watchlist } = useWatchlist();
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle Escape key for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'MOVIES', path: '/movies', ordinal: '01' },
    { name: 'SERIES', path: '/series', ordinal: '02' },
    { name: 'PEOPLE', path: '/people', ordinal: '03' },
    { name: 'EDITORIAL', path: '/editorial', ordinal: '04' },
    { name: 'ABOUT', path: '/about', ordinal: '05' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10 h-16'
          : 'bg-gradient-to-b from-[#0B0B0D]/95 via-[#0B0B0D]/50 to-transparent h-20'
      }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-full flex items-center justify-between">
        
        {/* Left: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="font-display font-black text-2xl sm:text-3xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest uppercase">
            CINEMURA
          </span>
          <span className="w-2 h-2 bg-[#E43D3D] rounded-full inline-block" />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`type-label transition-colors relative py-1 text-sm tracking-widest ${
                  isActive
                    ? 'text-[#E43D3D]'
                    : 'text-[#8E8E93] hover:text-[#F2F0EC]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E43D3D]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Search Trigger Button */}
          <button
            id="header-search-trigger"
            onClick={openSearch}
            aria-label="Open search dialog (Press / or Cmd+K)"
            className="p-2.5 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors"
            title="Search catalog (Cmd+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Watchlist Action */}
          <Link
            to="/watchlist"
            aria-label={`View watchlist (${watchlist.length} items)`}
            className="relative p-2.5 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors"
            title="Your Watchlist"
          >
            <Bookmark className="w-5 h-5" />
            {watchlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#E43D3D] text-white text-[9px] font-mono font-bold flex items-center justify-center rounded-full leading-none">
                {watchlist.length > 9 ? '9+' : watchlist.length}
              </span>
            )}
          </Link>

          {/* Orange/Red Explore CTA Button (Desktop) */}
          <Link
            to="/movies"
            className="hidden sm:inline-flex btn-primary text-xs py-2 px-5 font-bold tracking-widest uppercase items-center gap-2"
          >
            <span>EXPLORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#F2F0EC] hover:text-[#E43D3D] transition-colors"
            aria-label="Open mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>

      </div>

      {/* Full-Screen Mobile Navigation Dialog */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="lg:hidden fixed inset-0 bg-[#0B0B0D]/98 backdrop-blur-2xl z-50 flex flex-col justify-between p-6 sm:p-10 animate-fadeIn"
        >
          {/* Top Bar inside Dialog */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <span className="font-display font-black text-2xl text-white tracking-widest">
                CINEMURA
              </span>
              <span className="w-2 h-2 bg-[#E43D3D] rounded-full inline-block" />
            </Link>

            <button
              ref={closeButtonRef}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#8E8E93] hover:text-[#E43D3D] transition-colors"
              aria-label="Close mobile navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Oversized Numbered Links List */}
          <nav className="flex flex-col gap-6 py-8">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-baseline gap-4"
            >
              <span className="text-xs font-mono text-[#E43D3D]">00</span>
              <span className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-white group-hover:text-[#E43D3D] transition-colors">
                HOME
              </span>
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-baseline gap-4"
              >
                <span className="text-xs font-mono text-[#E43D3D]">{link.ordinal}</span>
                <span className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-white group-hover:text-[#E43D3D] transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}

            <Link
              to="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-baseline gap-4"
            >
              <span className="text-xs font-mono text-[#E43D3D]">06</span>
              <span className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-white group-hover:text-[#E43D3D] transition-colors flex items-center gap-3">
                <span>WATCHLIST</span>
                {watchlist.length > 0 && (
                  <span className="text-xs font-mono bg-[#E43D3D] text-white px-2 py-0.5">
                    {watchlist.length}
                  </span>
                )}
              </span>
            </Link>
          </nav>

          {/* Bottom Actions inside Dialog */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
              className="w-full btn-secondary text-xs uppercase flex items-center justify-center gap-2 py-3.5"
            >
              <Search className="w-4 h-4 text-[#E43D3D]" />
              <span>SEARCH CATALOG</span>
            </button>

            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-primary text-xs uppercase flex items-center justify-center gap-2 py-3.5 font-bold"
            >
              <span>EXPLORE MOVIES NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      )}
    </header>
  );
};

export default Header;
