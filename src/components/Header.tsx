import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSearch, openProfile, watchlist } = useApp();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'MOVIES', path: '/movie' },
    { name: 'TV SHOWS', path: '/tv' },
    { name: 'PEOPLE', path: '/person' },
    { name: 'SEARCH', path: '/search' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/movie') return location.pathname.startsWith('/movie');
    if (path === '/tv') return location.pathname.startsWith('/tv') || location.pathname.startsWith('/series');
    if (path === '/person') return location.pathname.startsWith('/person') || location.pathname.startsWith('/people');
    if (path === '/search') return location.pathname.startsWith('/search');
    return location.pathname === path;
  };

  return (
    <>
      {/* ==================================================
          COMPACT, SOLID CINEMATIC HEADER (DESKTOP & MOBILE)
         ================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 bg-[#0B0B0D] ${
          isScrolled
            ? 'border-b border-white/10 shadow-2xl h-14'
            : 'border-b border-white/5 h-14 sm:h-16'
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-full flex items-center justify-between">
          
          {/* Cinemura Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D]"
            aria-label="Cinemura Home"
          >
            <span className="font-display font-bold text-lg sm:text-xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest uppercase">
              CINEMURA
            </span>
            <span className="w-1.5 h-1.5 bg-[#E43D3D] inline-block" />
          </Link>

          {/* Center Navigation Links (Desktop Only: HOME, MOVIES, TV SHOWS, PEOPLE, SEARCH) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {navLinks.map(link => {
              const isActive = isLinkActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`type-label transition-colors relative py-1 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#E43D3D]'
                      : 'text-[#8E8E93] hover:text-[#F2F0EC]'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E43D3D]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Trigger */}
            <button
              id="header-search-trigger"
              onClick={openSearch}
              aria-label="Search"
              className="hidden md:flex p-2 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors items-center gap-2"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xl:inline text-[11px] font-mono text-[#8E8E93] tracking-widest uppercase">
                SEARCH
              </span>
            </button>

            {/* Desktop Watchlist Link */}
            <Link
              to="/watchlist"
              className="hidden md:flex p-2 text-[#8E8E93] hover:text-[#F2F0EC] transition-colors items-center gap-1.5"
              title="Watchlist"
              aria-label="Watchlist"
            >
              <span className="hidden xl:inline text-[11px] font-mono tracking-widest uppercase">
                WATCHLIST
              </span>
              {watchlist.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#E43D3D] text-white font-bold leading-none">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* Desktop Profile Button */}
            <button
              onClick={openProfile}
              aria-label="Profile"
              className="hidden md:flex p-2 text-[#8E8E93] hover:text-[#F2F0EC] transition-colors items-center gap-2 border border-transparent hover:border-white/10"
              title="Profile"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#E43D3D]" />
              <span className="hidden lg:inline text-[10px] font-mono tracking-widest text-[#F2F0EC] uppercase">
                PROFILE
              </span>
            </button>

            {/* Mobile-Only Search Trigger (Touch Target >= 44px) */}
            <button
              onClick={openSearch}
              className="md:hidden w-11 h-11 flex items-center justify-center text-[#F2F0EC] hover:text-[#E43D3D] active:text-[#E43D3D] border border-white/10 active:border-[#E43D3D] bg-[#111114] transition-colors"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile-Only Menu Button (Touch Target >= 44px) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 flex items-center justify-center text-[#F2F0EC] hover:text-[#E43D3D] active:text-[#E43D3D] border border-white/10 active:border-[#E43D3D] bg-[#111114] transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* ==================================================
          OPAQUE FULLSCREEN CINEMATIC MOBILE MENU (NO BLUR)
         ================================================== */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="md:hidden fixed inset-0 z-50 bg-[#0B0B0D] text-[#F2F0EC] flex flex-col justify-between overflow-y-auto animate-menuSlideIn select-none"
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
            paddingLeft: 'max(1.25rem, env(safe-area-inset-left, 1.25rem))',
            paddingRight: 'max(1.25rem, env(safe-area-inset-right, 1.25rem))',
          }}
        >
          {/* Top Header Bar: Logo + Clear Close Button */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
              aria-label="Cinemura Home"
            >
              <span className="font-display font-bold text-xl text-[#F2F0EC] tracking-widest uppercase">
                CINEMURA
              </span>
              <span className="w-1.5 h-1.5 bg-[#E43D3D] inline-block" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center text-[#F2F0EC] hover:text-[#E43D3D] border border-white/10 hover:border-[#E43D3D] bg-[#111114] transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Body */}
          <div className="py-8 flex flex-col justify-center space-y-6 flex-grow">
            
            {/* Primary Navigation Items */}
            <nav className="flex flex-col space-y-1" aria-label="Mobile Primary Navigation">
              
              {/* Home */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname === '/'
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '40ms' }}
              >
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                  HOME
                </span>
              </Link>

              {/* Movies */}
              <Link
                to="/movie"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname.startsWith('/movie')
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '80ms' }}
              >
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                  MOVIES
                </span>
              </Link>

              {/* TV Shows */}
              <Link
                to="/tv"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname.startsWith('/tv') || location.pathname.startsWith('/series')
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '120ms' }}
              >
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                  TV SHOWS
                </span>
              </Link>

              {/* People */}
              <Link
                to="/person"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname.startsWith('/person') || location.pathname.startsWith('/people')
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '160ms' }}
              >
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                  PEOPLE
                </span>
              </Link>

              {/* Search */}
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname.startsWith('/search')
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '200ms' }}
              >
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                  SEARCH
                </span>
              </Link>

              {/* Watchlist */}
              <Link
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 flex items-center justify-between transition-colors animate-menuItemFade ${
                  location.pathname === '/watchlist'
                    ? 'text-[#E43D3D] pl-3 border-l-2 border-[#E43D3D]'
                    : 'text-[#F2F0EC] hover:text-[#E43D3D]'
                }`}
                style={{ animationDelay: '240ms' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase">
                    WATCHLIST
                  </span>
                  {watchlist.length > 0 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-[#E43D3D] text-white font-bold">
                      {watchlist.length}
                    </span>
                  )}
                </div>
              </Link>

            </nav>

            {/* Core Action Buttons: Search & Profile */}
            <div className="border-t border-white/10 pt-6 space-y-3">
              {/* Search */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#111114] border border-white/10 active:border-[#E43D3D] text-[#F2F0EC] hover:text-[#E43D3D] transition-colors animate-menuItemFade"
                style={{ animationDelay: '240ms' }}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-[#E43D3D]" />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">
                    SEARCH
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
              </button>

              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfile();
                }}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#111114] border border-white/10 active:border-[#E43D3D] text-[#F2F0EC] hover:text-[#E43D3D] transition-colors animate-menuItemFade"
                style={{ animationDelay: '280ms' }}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#E43D3D]" />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">
                    PROFILE
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
              </button>
            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default Header;
