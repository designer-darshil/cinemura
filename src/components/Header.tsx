import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSearch } = useApp();
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
    { name: 'HOME', path: '/' },
    { name: 'MOVIES', path: '/movie' },
    { name: 'TV SHOWS', path: '/tv' },
    { name: 'PEOPLE', path: '/people' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10 h-14'
          : 'bg-gradient-to-b from-[#0B0B0D]/90 via-[#0B0B0D]/40 to-transparent h-16'
      }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display font-bold text-xl text-[#F2F0EC] group-hover:text-[#E43D3D] transition-colors leading-none tracking-widest">
            CINEMURA
          </span>
          <span className="w-1.5 h-1.5 bg-[#E43D3D] rounded-full inline-block" />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`type-label transition-colors relative py-1 ${
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

        {/* Right Search Action: ICON ONLY */}
        <div className="flex items-center gap-2">
          <button
            id="header-search-trigger"
            onClick={openSearch}
            aria-label="Open search"
            className="p-2 text-[#8E8E93] hover:text-[#E43D3D] focus-visible:text-[#E43D3D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E43D3D] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#F2F0EC] hover:text-[#E43D3D] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Fullscreen Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#0B0B0D]/98 backdrop-blur-2xl z-40 border-t border-white/10 flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex flex-col gap-6 pt-4">
            <span className="type-label text-[#E43D3D] border-b border-white/10 pb-2">
              NAVIGATION
            </span>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-display font-bold text-2xl uppercase transition-colors ${
                    isActive ? 'text-[#E43D3D] pl-2 border-l-2 border-[#E43D3D]' : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10">
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
