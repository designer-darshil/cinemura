import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X } from 'lucide-react';
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'MOVIES', path: '/movie' },
    { name: 'DISCOVER', path: '/discover' },
    { name: 'GENRES', path: '/discover?genre=All' },
    { name: 'WATCHLIST', path: '/watchlist', badge: watchlist.length },
  ];

  const handleGenreClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      const genreEl = document.getElementById('genre-discovery-section');
      if (genreEl) {
        e.preventDefault();
        genreEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10 shadow-2xl h-14'
          : 'bg-gradient-to-b from-[#0B0B0D]/90 via-[#0B0B0D]/40 to-transparent h-16'
      }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display font-bold text-xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest uppercase">
            CINEMURA
          </span>
          <span className="w-1.5 h-1.5 bg-[#E43D3D] inline-block" />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            const isGenreLink = link.name === 'GENRES';

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={isGenreLink ? handleGenreClick : undefined}
                className={`type-label transition-colors relative py-1 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#E43D3D]'
                    : 'text-[#8E8E93] hover:text-[#F2F0EC]'
                }`}
              >
                <span>{link.name}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#E43D3D] text-white font-bold leading-none">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E43D3D]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls: Search & VIP Cinema Pass Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Focused Search Trigger */}
          <button
            id="header-search-trigger"
            onClick={openSearch}
            aria-label="Open cinema search"
            className="p-2 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xl:inline text-[11px] font-mono text-[#8E8E93] tracking-widest">
              SEARCH
            </span>
          </button>

          {/* Profile / Cinema Pass Button */}
          <button
            onClick={openProfile}
            aria-label="Open Cinema Pass profile"
            className="p-2 text-[#8E8E93] hover:text-[#F2F0EC] transition-colors flex items-center gap-2 border border-transparent hover:border-white/10"
            title="VIP Cinema Pass"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#E43D3D]" />
            <span className="hidden lg:inline text-[10px] font-mono tracking-widest text-[#F2F0EC] uppercase">
              PASS
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#F2F0EC] hover:text-[#E43D3D] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Fullscreen Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#0B0B0D]/98 backdrop-blur-2xl z-40 border-t border-white/10 flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex flex-col gap-5 pt-4">
            <span className="type-label text-[#E43D3D] border-b border-white/10 pb-2">
              AUDITORIUM NAVIGATION
            </span>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-display font-bold text-2xl uppercase transition-colors flex items-center justify-between ${
                    isActive ? 'text-[#E43D3D] pl-2 border-l-2 border-[#E43D3D]' : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 bg-[#E43D3D] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
              aria-label="Open search"
              className="w-full btn-secondary text-xs uppercase flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-[#E43D3D]" />
              <span>SEARCH CATALOG</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openProfile();
              }}
              aria-label="Open Cinema Pass"
              className="w-full btn-primary text-xs uppercase flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>VIEW CINEMA PASS</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
